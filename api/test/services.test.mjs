import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPair, SignJWT } from "jose";
import { DefaultAzureCredential } from "@azure/identity";
import { createAuthorizer, createQuotaStore, createServices } from "../src/services.mjs";

const tenant = "00000000-0000-0000-0000-000000000001";
const audience = "00000000-0000-0000-0000-000000000002";
const oid = "00000000-0000-0000-0000-000000000003";
const { privateKey, publicKey } = await generateKeyPair("RS256");
const authorize = createAuthorizer({ tenant, audience, presenters: [oid], scope: "Recommend" }, publicKey);
async function token(claims = {}, options = {}) {
  return new SignJWT({ tid: tenant, oid, scp: "Recommend", ...claims })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(options.issuer || `https://login.microsoftonline.com/${tenant}/v2.0`)
    .setAudience(options.audience || audience)
    .setIssuedAt()
    .setExpirationTime(options.expiry || "5m")
    .sign(options.key || privateKey);
}
test("valid signed delegated token authorizes presenter", async () => {
  assert.deepEqual(await authorize(`Bearer ${await token()}`), { oid });
});
test("actual JWT validation rejects wrong tenant, user, scope, audience, issuer, expiry and signature", async () => {
  const foreign = await generateKeyPair("RS256");
  for (const [claims, options, status] of [
    [{ tid: "other" }, {}, 403], [{ oid: "other" }, {}, 403], [{ scp: "Read" }, {}, 403],
    [{ scp: undefined }, {}, 401], [{}, { audience: "other" }, 401],
    [{}, { issuer: "https://evil.example" }, 401], [{}, { expiry: "1 second ago" }, 401],
    [{}, { key: foreign.privateKey }, 401]
  ]) {
    await assert.rejects(() => token(claims, options).then((value) => authorize(`Bearer ${value}`)), (error) => error.status === status);
  }
  await assert.rejects(() => authorize(""), (error) => error.status === 401);
});

function fakeTable() {
  const rows = new Map();
  let etag = 0;
  return {
    rows,
    conflicts: 0,
    async createTable() {},
    async getEntity(partition, row) {
      const entity = rows.get(`${partition}/${row}`);
      if (!entity) throw Object.assign(new Error("not found"), { statusCode: 404 });
      return { ...entity };
    },
    async submitTransaction(actions) {
      if (this.conflicts > 0) { this.conflicts--; throw Object.assign(new Error("conflict"), { statusCode: 412 }); }
      for (const [operation, entity, , options] of actions) {
        const current = rows.get(`${entity.partitionKey}/${entity.rowKey}`);
        if ((operation === "create" && current) || (operation === "update" && options.etag !== current?.etag)) {
          throw Object.assign(new Error("conflict"), { statusCode: 412 });
        }
      }
      for (const [, entity] of actions) rows.set(`${entity.partitionKey}/${entity.rowKey}`, { ...entity, etag: String(++etag) });
    }
  };
}
test("atomic quota enforces minute/day limits and persists across service instances", async () => {
  const table = fakeTable();
  let instant = new Date("2026-10-26T15:00:00Z");
  const settings = { perMinute: 2, perDay: 3, now: () => instant };
  const take = createQuotaStore(table, settings);
  await take(oid);
  await createQuotaStore(table, settings)(oid);
  await assert.rejects(() => take(oid), (error) => error.status === 429);
  instant = new Date("2026-10-26T15:01:00Z");
  await take(oid);
  await assert.rejects(() => take(oid), (error) => error.status === 429);
  instant = new Date("2026-10-27T15:01:00Z");
  await take(oid);
});
test("quota retries collisions, fails closed, and checks both windows in a transaction", async () => {
  const table = fakeTable();
  table.conflicts = 1;
  const take = createQuotaStore(table);
  await take(oid);
  assert.equal(table.rows.size, 2);
  assert.ok([...table.rows.values()].every(({ count }) => count === 1));
  table.conflicts = 5;
  await assert.rejects(() => take(oid), (error) => error.status === 429);
  assert.ok([...table.rows.values()].every(({ count }) => count === 1));
  table.conflicts = 0;
  for (const entity of table.rows.values()) entity.count = NaN;
  await assert.rejects(() => take(oid), (error) => error.status === 503);
});
test("configuration errors do not silently enable anonymous live access", () => {
  assert.throws(() => createServices({}, () => {}), /Missing server setting/);
});
test("model request preserves the scenario with stable structured-output generation", async (t) => {
  const prompt = "Answer using only the selected documents and references.";
  const expected = { toolId: "notebook", bullets: ["A focused reference workspace fits."], sourceIds: ["notebook"] };
  t.mock.method(DefaultAzureCredential.prototype, "getToken", async () => ({ token: "test-token", expiresOnTimestamp: Date.now() + 60000 }));
  let sent;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url.origin, "https://model.example");
    assert.equal(url.pathname, "/openai/deployments/test-model/chat/completions");
    assert.equal(url.searchParams.get("api-version"), "2024-10-21");
    sent = JSON.parse(options.body);
    return new Response(JSON.stringify({ choices: [{ finish_reason: "stop", message: { content: JSON.stringify(expected) } }] }));
  });
  const services = createServices({
    ENTRA_TENANT_ID: tenant, ENTRA_AUDIENCE: audience, ENTRA_SCOPE: "Recommend",
    PRESENTER_OBJECT_IDS: oid, ALLOWED_ORIGINS: "https://example.github.io",
    AZURE_OPENAI_ENDPOINT: "https://model.example", AZURE_OPENAI_DEPLOYMENT: "test-model",
    QUOTA_TABLE_ENDPOINT: "https://storage.example"
  }, () => {});
  assert.deepEqual(await services.recommend(prompt), expected);
  assert.deepEqual(sent.messages[1], { role: "user", content: prompt });
  assert.equal(sent.temperature, 0);
  assert.equal(sent.store, false);
  assert.equal(sent.response_format.type, "json_schema");
  assert.equal(sent.response_format.json_schema.strict, true);
});
