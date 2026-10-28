import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { TOOLS, DEMOS } from "../which-tool-demo/catalog.mjs";
import { landingRotation, selectedIndex } from "../which-tool/wheel.mjs";

test("demo catalog has exactly six requested choices and four fixed outcomes", () => {
  assert.deepEqual(TOOLS.map(({ label }) => label), [
    "M365 Copilot", "Copilot in Excel", "Copilot in PowerPoint",
    "Copilot in Outlook", "Outlook & Teams", "Agent Builder"
  ]);
  assert.equal(new Set(TOOLS.map(({ id }) => id)).size, 6);
  assert.equal(new Set(DEMOS.map(({ id }) => id)).size, 4);
  assert.deepEqual(DEMOS.map(({ toolId }) => toolId), ["m365", "excel", "builder", "powerpoint"]);
  for (const demo of DEMOS) {
    assert.ok(demo.prompt.length > 100 && demo.prompt.length <= 2000);
    assert.ok(demo.bullets.length > 0 && demo.bullets.length <= 3);
    assert.ok(demo.bullets.every((bullet) => bullet.length <= 160));
    assert.equal(demo.bullets.filter((bullet) => bullet.startsWith("Why not Microsoft 365 Copilot?")).length, demo.toolId === "m365" ? 0 : 1);
  }
});

test("six-choice geometry works for every segment after repeated rotations", () => {
  for (const current of [0, 1530, -37, 9999]) {
    for (let i = 0; i < TOOLS.length; i++) {
      assert.equal(selectedIndex(landingRotation(current, i, TOOLS.length), TOOLS.length), i);
    }
  }
});

test("demo is isolated from live AI and includes explicit scripted and safety disclosures", async () => {
  const html = await readFile(new URL("../which-tool-demo/index.html", import.meta.url), "utf8");
  const app = await readFile(new URL("../which-tool-demo/app.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(html, /teamworkcowbell|wheel-center\.jpg/i);
  assert.match(html, /electrical work requires approved procedures and qualified review/);
  assert.match(html, /fixed winner, even if you edit/);
  assert.doesNotMatch(app, /fetch\(|localStorage|sessionStorage|auth\.|config\.|rules\.|api\//);
  assert.match(app, /import \{ landingRotation \} from "\.\.\/which-tool\/wheel\.mjs"/);
});
