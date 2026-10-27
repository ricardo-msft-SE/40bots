import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { TOOLS, SOURCES } from "../which-tool/catalog.mjs";

test("all public source links use official Microsoft hosts", () => {
  for (const source of Object.values(SOURCES)) assert.ok(new URL(source.url).hostname.endsWith(".microsoft.com"));
  TOOLS.forEach((tool) => tool.sourceIds.forEach((id) => assert.ok(Object.hasOwn(SOURCES, id))));
});
test("page exposes the requested header, input limits, accessible result, motion and mode controls", async () => {
  const page = await readFile(new URL("../which-tool/index.html", import.meta.url), "utf8");
  assert.ok(page.includes('<a href="../" class="home-link">Let\'s Spin the Wheel!</a>'));
  assert.ok(page.includes('<a href="https://teamworkcowbell.com/" class="brand-link" target="_blank" rel="noopener noreferrer">'));
  assert.ok(page.includes("<span>TeamworkCowbell.com</span>"));
  assert.ok(page.includes('<img src="./wheel-center.jpg" alt="" width="40" height="40" />'));
  assert.ok(page.includes('<img src="./wheel-center.jpg" alt="" width="400" height="400" />'));
  assert.ok(!page.includes("WAVES"));
  assert.ok(page.includes('<p class="eyebrow">Big ideas. Bold spins. More cowbell!</p>'));
  assert.ok(page.includes('aria-label="Try a workplace example"'));
  assert.ok(!/\b(water|utility|utilities|currents)\b/i.test(page));
  for (const token of ['maxlength="2000"', 'aria-live="polite"', 'id="mode"', 'id="reset"', 'id="winner"', 'id="fullscreen"']) {
    assert.ok(page.includes(token));
  }
});
