import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import assert from "node:assert/strict";
import { TOOLS } from "../which-tool/catalog.mjs";
import { selectedIndex } from "../which-tool/wheel.mjs";

const root = path.resolve(fileURLToPath(new URL("../dist/", import.meta.url)));
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".svg": "image/svg+xml" };
const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  let name = decodeURIComponent(url.pathname);
  if (name.endsWith("/")) name += "index.html";
  const file = path.resolve(root, `.${name}`);
  if (!file.startsWith(`${root}${path.sep}`)) { res.writeHead(403).end(); return; }
  try {
    res.setHeader("Content-Type", types[path.extname(file)] || "application/octet-stream");
    res.end(await readFile(file));
  } catch { res.writeHead(404).end("Not found"); }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}`;
let browser;
const errors = [];
let checks = 0;
const check = (condition, message) => { assert.ok(condition, message); checks++; };
async function configureLive(page) {
  await page.route("**/config.mjs", (route) => route.fulfill({
    contentType: "text/javascript",
    body: `export default {apiUrl:"https://api.example.test/api/recommend",tenantId:"test",clientId:"test",scope:"test"};`
  }));
  await page.route("**/auth.js", (route) => route.fulfill({
    contentType: "text/javascript",
    body: `export async function initialize(){};export async function signIn(){return "Test presenter"};export async function getAccessToken(){return "test-token"};`
  }));
}
async function submit(page, text) {
  await page.locator("#prompt").fill(text);
  await page.locator("#spin").click();
}
async function result(page) {
  await page.locator("#result").waitFor({ state: "visible" });
}
try {
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, reducedMotion: "reduce" });
  await page.route("**/config.mjs", (route) => route.fulfill({
    contentType: "text/javascript",
    body: "export default {apiUrl:'',tenantId:'',clientId:'',scope:'',redirectUri:''};"
  }));
  page.on("pageerror", (error) => errors.push(error.message));
  const initialResponse = await page.goto(`${base}/which-tool/`);
  check(initialResponse.ok(), "The built game page is served successfully");
  check(await page.locator(".segment").count() === 12, "All twelve segments are rendered");
  check(await page.locator(".wheel-label").count() === 12, "All twelve labels are rendered");
  check(await page.locator(".tool-card").count() === 12, "Readable tool legend exists");
  const sizes = await page.evaluate(() => ({
    input: parseFloat(getComputedStyle(document.getElementById("prompt")).fontSize),
    overflow: document.documentElement.scrollWidth > innerWidth
  }));
  check(sizes.input >= 36, "Projector input font is at least 36px");
  check(!sizes.overflow, "No horizontal overflow at 1920px");
  await page.getByRole("button", { name: "Outage message", exact: true }).click();
  check((await page.locator("#prompt").inputValue()).includes("Word document"), "Example fills editable input");
  await page.locator("#spin").focus();
  await page.keyboard.press("Enter");
  await result(page);
  check(await page.locator("#winner").textContent() === "Copilot in Office Apps", "Keyboard lever chooses Office Apps");
  const layout = await page.evaluate(() => ({
    bullets: parseFloat(getComputedStyle(document.querySelector("#reasons li")).fontSize),
    resultBottom: document.getElementById("sources").getBoundingClientRect().bottom
  }));
  check(layout.bullets >= 28, "Projector result bullets are at least 28px");
  check(layout.resultBottom <= 1080, `Result is on screen (${layout.resultBottom}px)`);
  await page.locator("#mode").selectOption("live");
  await submit(page, "Explain water conservation.");
  await result(page);
  check((await page.locator("#status").textContent()).includes("not configured"), "Missing live config is explicit");
  check(await page.locator("#mode-badge").textContent() === "Offline rules", "Fallback is labeled rules");
  await page.locator("#reset").click();
  check(await page.locator("#prompt").inputValue() === "", "Reset clears prompt");
  await page.locator("#prompt").fill(" ".repeat(10));
  await page.locator("#spin").click();
  check((await page.locator("#status").textContent()).includes("Describe"), "Whitespace input has visible validation");
  await page.locator("#prompt").fill("a".repeat(2000));
  check(await page.locator("#counter").textContent() === "2,000 / 2,000", "Input boundary is shown");
  await page.evaluate(() => { document.documentElement.requestFullscreen = async () => { throw new Error("Fullscreen denied for test"); }; });
  await page.locator("#fullscreen").click();
  check((await page.locator("#status").textContent()).includes("Fullscreen denied"), "Fullscreen failure is visible");
  await page.locator("#theme").click();
  check(["dark", "light"].includes(await page.locator("html").getAttribute("data-theme")), "Theme changes without losing UI");

  await configureLive(page);
  let response = { toolId: "chat", bullets: ["An interactive answer fits."], sourceIds: ["chat"] };
  let statusCode = 200;
  await page.route("https://api.example.test/**", async (route) => route.fulfill({
    status: statusCode, contentType: "application/json",
    headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response)
  }));
  await page.goto(`${base}/which-tool/`);
  await page.locator("#mode").selectOption("live");
  for (const tool of TOOLS) {
    response = { toolId: tool.id, bullets: [`${tool.label} is this test's controlled result.`], sourceIds: [tool.sourceIds[0]] };
    await submit(page, "An audience work scenario.");
    await result(page);
    check(await page.locator("#winner").textContent() === tool.label, `Winner matches ${tool.id}`);
    check(await page.locator(".segment.selected").getAttribute("data-tool") === tool.id, `Highlight matches ${tool.id}`);
    const rotation = await page.locator("#wheel").evaluate((el) => Number(/rotate\(([-.\d]+)deg\)/.exec(el.style.transform)[1]));
    check(selectedIndex(rotation, TOOLS.length) === TOOLS.indexOf(tool), `Pointer lands on ${tool.id}`);
    check(await page.locator("#mode-badge").textContent() === "Live AI", "Live result is labeled");
  }
  response = {
    toolId: "autopilot",
    bullets: Array.from({ length: 3 }, () => "This scenario needs a persistent personal teammate that can follow up across multiple work steps with appropriate permissions and clear human review. ".padEnd(160, "x").slice(0, 160)),
    sourceIds: ["autopilot", "cowork"]
  };
  await submit(page, "An ongoing digital teammate.");
  await result(page);
  const maximumResultBottom = await page.locator("#sources").evaluate((element) => element.getBoundingClientRect().bottom);
  check(maximumResultBottom <= 1080, `Maximum three-bullet projector result fits (${maximumResultBottom}px)`);
  response = { toolId: "chat", bullets: ['<img src=x onerror="window.injected=true">', "Two", "Three"], sourceIds: ["chat"] };
  await submit(page, "Explain conservation.");
  await result(page);
  check(await page.locator("#reasons li").count() === 3, "At most three valid bullets appear");
  check(await page.locator("#reasons img").count() === 0, "Model text is not interpreted as markup");
  check(!(await page.evaluate(() => window.injected)), "Model text cannot execute");
  response = { toolId: "unknown", bullets: ["bad"], sourceIds: ["chat"] };
  await submit(page, "Explain conservation.");
  await result(page);
  check((await page.locator("#status").textContent()).includes("Unknown tool"), "Malformed live result triggers explicit fallback");
  for (const code of [401, 403, 429, 503]) {
    statusCode = code;
    await submit(page, "Explain conservation.");
    await result(page);
    check(await page.locator("#mode-badge").textContent() === "Offline rules", `HTTP ${code} falls back honestly`);
    check((await page.locator("#status").textContent()).includes("not a live AI answer"), `HTTP ${code} notice remains visible`);
  }
  statusCode = 422;
  await submit(page, "Automatically control chlorine dosing.");
  await result(page);
  check(await page.locator("#winner").textContent() === "It Depends", "Operational-control fallback requires human review");
  check((await page.locator("#status").textContent()).includes("human review"), "Operational-control rejection is explicit");
  statusCode = 200;
  response = { toolId: "office", bullets: ["An editable document fits."], sourceIds: ["office"] };
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await submit(page, "Draft a Word document.");
  check(await page.locator("#spin").isDisabled(), "Lever locks during animated turn");
  await result(page);
  check(await page.locator("#winner").textContent() === "Copilot in Office Apps", "Animated spin finishes on selected tool");
  await page.unroute("https://api.example.test/**");
  let delayed;
  await page.route("https://api.example.test/**", async (route) => {
    delayed = route;
  });
  const pendingRequest = page.waitForRequest("https://api.example.test/**");
  await submit(page, "An intentionally pending live request.");
  await pendingRequest;
  await page.locator("#reset").click();
  await delayed?.fulfill({ status: 200, contentType: "application/json", headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) }).catch(() => {});
  check(await page.locator("#result").isHidden(), "Reset prevents a stale live result");
  check(await page.locator("#spin").isEnabled(), "Reset releases the lever");

  const timeoutPage = await browser.newPage({ reducedMotion: "reduce" });
  await configureLive(timeoutPage);
  await timeoutPage.addInitScript(() => {
    const original = window.setTimeout;
    window.setTimeout = (fn, ms, ...args) => original(fn, ms === 12000 ? 150 : ms, ...args);
  });
  await timeoutPage.route("https://api.example.test/**", () => {});
  await timeoutPage.goto(`${base}/which-tool/`);
  await timeoutPage.locator("#mode").selectOption("live");
  await submit(timeoutPage, "Explain water conservation.");
  await result(timeoutPage);
  check((await timeoutPage.locator("#status").textContent()).includes("12 seconds"), "Live timeout has explicit fallback");
  await timeoutPage.close();

  await page.unroute("https://api.example.test/**");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.locator("#mode").selectOption("rules");
  await submit(page, "Draft an outage notice in Word.");
  await result(page);
  await mkdir(new URL("../test-results/", import.meta.url), { recursive: true });
  await page.screenshot({ path: fileURLToPath(new URL("../test-results/projector.png", import.meta.url)) });
  for (const viewport of [{ width: 1366, height: 768 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    const overflow = await page.evaluate(() => [...document.querySelectorAll("body *")].filter((element) =>
      element.getBoundingClientRect().right > innerWidth + 1).slice(0, 8).map((element) => ({
      tag: element.tagName, id: element.id, class: element.getAttribute("class"), right: element.getBoundingClientRect().right
    })));
    check(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)), `No horizontal overflow at ${viewport.width}px: ${JSON.stringify(overflow)}`);
    check(await page.locator("#spin").isVisible(), "Lever remains visible at responsive size");
  }
  await page.locator(".wheel-frame").scrollIntoViewIfNeeded();
  await page.locator(".wheel-frame").screenshot({ path: fileURLToPath(new URL("../test-results/mobile-wheel.png", import.meta.url)) });
  await page.screenshot({ path: fileURLToPath(new URL("../test-results/mobile.png", import.meta.url)), fullPage: true });
  await page.goto(`${base}/`);
  check(await page.locator('a[href="which-tool/"]').count() >= 2, "Home page exposes game links");
  check(await page.locator("#deployment-visual").count() === 1, "Existing deployment visual remains");
  check(errors.length === 0, `No browser errors: ${errors.join("; ")}`);
  console.log(`Browser verification passed: ${checks} assertions, projector/mobile screenshots in test-results.`);
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
