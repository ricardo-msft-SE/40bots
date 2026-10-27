import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, access } from "node:fs/promises";
import { RESPONSE_SCHEMA } from "../dist-api/api/src/core.mjs";

test("published site is an explicit static-only artifact", async () => {
  const files = await readdir(new URL("../dist/", import.meta.url));
  assert.deepEqual(files.sort(), [".nojekyll", "deployment-plan", "index.html", "script.js", "styles.css", "which-tool"].sort());
  const gameFiles = await readdir(new URL("../dist/which-tool/", import.meta.url));
  assert.ok(gameFiles.includes("auth.js"));
  assert.ok(!gameFiles.includes("auth-entry.mjs"));
  for (const name of ["index.html", "styles.css", "catalog.mjs", "app.mjs", "rules.mjs", "wheel.mjs", "config.mjs"]) {
    assert.ok(gameFiles.includes(name));
  }
});
test("API package includes shared catalog and an installable locked manifest, not local settings", async () => {
  const manifest = JSON.parse(await readFile(new URL("../dist-api/package.json", import.meta.url)));
  const lock = JSON.parse(await readFile(new URL("../dist-api/package-lock.json", import.meta.url)));
  assert.equal(manifest.main, "api/src/index.mjs");
  assert.deepEqual(manifest.dependencies, lock.packages[""].dependencies);
  await access(new URL(`../dist-api/${manifest.main}`, import.meta.url));
  await access(new URL("../dist-api/host.json", import.meta.url));
  const files = await readdir(new URL("../dist-api/", import.meta.url), { recursive: true });
  assert.ok(!files.some((file) => /local\.settings|(^|[/\\])test([/\\]|$)|config\.mjs|\.env/.test(file)));
  assert.equal(RESPONSE_SCHEMA.schema.properties.toolId.enum.length, 12);
});
