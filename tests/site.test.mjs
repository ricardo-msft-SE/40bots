import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { TOOLS, SOURCES } from "../which-tool/catalog.mjs";

test("all public source links use official Microsoft hosts", () => {
  for (const source of Object.values(SOURCES)) assert.ok(new URL(source.url).hostname.endsWith(".microsoft.com"));
  TOOLS.forEach((tool) => tool.sourceIds.forEach((id) => assert.ok(Object.hasOwn(SOURCES, id))));
});
test("page exposes input limits, accessible result, motion and mode controls", async () => {
  const page = await readFile(new URL("../which-tool/index.html", import.meta.url), "utf8");
  for (const token of ['maxlength="2000"', 'aria-live="polite"', 'id="mode"', 'id="reset"', 'id="winner"', 'id="fullscreen"']) {
    assert.ok(page.includes(token));
  }
});
