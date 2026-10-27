import { DefaultAzureCredential } from "@azure/identity";
import { TableClient } from "@azure/data-tables";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { HttpError, SYSTEM_PROMPT, RESPONSE_SCHEMA } from "./core.mjs";

const guid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function required(env, key) {
  const value = env[key]?.trim();
  if (!value) throw new Error(`Missing server setting: ${key}`);
  return value;
}
function positiveInt(value, fallback) {
  if (value === undefined) return fallback;
  if (!/^[1-9]\d*$/.test(value) || Number(value) > 10000) throw new Error("Invalid quota configuration.");
  return Number(value);
}
function httpsUrl(value) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) throw new Error("Server endpoints must be credential-free HTTPS URLs.");
  return url;
}

export function createAuthorizer({ tenant, audience, scope, presenters }, keySet) {
  const issuer = `https://login.microsoftonline.com/${tenant}/v2.0`;
  const keys = keySet || createRemoteJWKSet(new URL(`https://login.microsoftonline.com/${tenant}/discovery/v2.0/keys`), { timeoutDuration: 4000 });
  return async (header) => {
    const match = /^Bearer ([^\s]+)$/i.exec(header || "");
    if (!match) throw new HttpError(401, "sign_in_required", "A presenter access token is required.");
    let payload;
    try {
      ({ payload } = await jwtVerify(match[1], keys, { issuer, audience, algorithms: ["RS256"], requiredClaims: ["exp", "iat", "tid", "oid", "scp"] }));
    } catch {
      throw new HttpError(401, "invalid_token", "The presenter access token is invalid or expired.");
    }
    if (payload.tid !== tenant || !presenters.includes(payload.oid) || typeof payload.scp !== "string" || !payload.scp.split(" ").includes(scope)) {
      throw new HttpError(403, "presenter_denied", "This account or scope is not authorized.");
    }
    return { oid: payload.oid };
  };
}

export function createQuotaStore(table, { perMinute = 25, perDay = 700, now = () => new Date() } = {}) {
  let initialized;
  return async (oid) => {
    if (!initialized) {
      initialized = table.createTable().catch((error) => {
        if (error.statusCode !== 409) { initialized = undefined; throw error; }
      });
    }
    await initialized;
    const instant = now();
    const day = instant.toISOString().slice(0, 10);
    const minute = instant.toISOString().slice(11, 16).replace(":", "");
    const partitionKey = `${oid}-${day}`;
    for (let attempt = 0; attempt < 4; attempt++) {
      const windows = [{ rowKey: `minute-${minute}`, limit: perMinute }, { rowKey: "day", limit: perDay }];
      const entities = await Promise.all(windows.map(async ({ rowKey }) => {
        try { return await table.getEntity(partitionKey, rowKey); }
        catch (error) { if (error.statusCode === 404) return null; throw error; }
      }));
      if (entities.some((entity) => entity && (!Number.isSafeInteger(entity.count) || entity.count < 0))) {
        throw new HttpError(503, "quota_storage_invalid", "The quota service needs administrator attention.");
      }
      if (entities.some((entity, i) => entity && entity.count >= windows[i].limit)) {
        throw new HttpError(429, "quota_exceeded", "Presenter quota reached. Try Offline rules.");
      }
      const actions = windows.map(({ rowKey }, i) => {
        const entity = entities[i];
        const next = { partitionKey, rowKey, count: (entity ? Number(entity.count) : 0) + 1 };
        return entity ? ["update", next, "Replace", { etag: entity.etag }] : ["create", next];
      });
      try { await table.submitTransaction(actions); return; }
      catch (error) {
        if (![409, 412].includes(error.statusCode)) throw error;
      }
    }
    throw new HttpError(429, "quota_contention", "Too many concurrent requests. Try again shortly.");
  };
}

export function createServices(env, log) {
  const tenant = required(env, "ENTRA_TENANT_ID");
  const audience = required(env, "ENTRA_AUDIENCE");
  const scope = required(env, "ENTRA_SCOPE");
  const presenters = required(env, "PRESENTER_OBJECT_IDS").split(",").map((id) => id.trim());
  if (!guid.test(tenant) || !guid.test(audience) || presenters.some((id) => !guid.test(id))) throw new Error("Entra IDs must be GUIDs.");
  const allowedOrigins = required(env, "ALLOWED_ORIGINS").split(",").map((value) => {
    const url = new URL(value.trim());
    if (url.origin !== value.trim() || (url.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(url.hostname))) {
      throw new Error("Allowed origins must be exact HTTPS origins (HTTP loopback allowed).");
    }
    return url.origin;
  });
  const authorize = createAuthorizer({ tenant, audience, scope, presenters });
  const credential = new DefaultAzureCredential();
  const endpoint = httpsUrl(required(env, "AZURE_OPENAI_ENDPOINT"));
  const deployment = required(env, "AZURE_OPENAI_DEPLOYMENT");
  const version = env.AZURE_OPENAI_API_VERSION || "2024-10-21";
  const tableEndpoint = httpsUrl(required(env, "QUOTA_TABLE_ENDPOINT"));
  const tableName = env.QUOTA_TABLE_NAME || "ToolGameQuota";
  const table = new TableClient(tableEndpoint.href, tableName, credential, { retryOptions: { maxRetries: 2 } });
  const takeQuota = createQuotaStore(table, {
    perMinute: positiveInt(env.REQUESTS_PER_MINUTE, 25),
    perDay: positiveInt(env.REQUESTS_PER_DAY, 700)
  });
  async function recommend(prompt) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const token = await credential.getToken("https://cognitiveservices.azure.com/.default", { abortSignal: controller.signal });
      const url = new URL(`/openai/deployments/${encodeURIComponent(deployment)}/chat/completions`, endpoint);
      url.searchParams.set("api-version", version);
      const response = await fetch(url, {
        method: "POST",
        signal: controller.signal,
        headers: { Authorization: `Bearer ${token.token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: prompt }],
          response_format: { type: "json_schema", json_schema: RESPONSE_SCHEMA },
          max_completion_tokens: 700,
          temperature: 0,
          store: false
        })
      });
      if (!response.ok) throw new HttpError(502, "model_unavailable", "The configured model could not complete this request.");
      const content = await response.text();
      if (content.length > 20000) throw new HttpError(502, "model_response_size", "The model returned an oversized response.");
      const body = JSON.parse(content);
      const choice = body.choices?.[0];
      if (choice?.finish_reason !== "stop" || choice.message?.refusal || typeof choice.message?.content !== "string") {
        throw new HttpError(502, "model_incomplete", "The model declined or did not finish its recommendation.");
      }
      return JSON.parse(choice.message.content);
    } catch (error) {
      if (controller.signal.aborted) throw new HttpError(504, "model_timeout", "The model request timed out.");
      throw error;
    } finally { clearTimeout(timer); }
  }
  return { allowedOrigins, authorize, takeQuota, recommend, log };
}
