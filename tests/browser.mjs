import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import assert from "node:assert/strict";
import { TOOLS } from "../which-tool/catalog.mjs";
import { selectedIndex } from "../which-tool/wheel.mjs";
import { TOOLS as DEMO_TOOLS, DEMOS } from "../which-tool-demo/catalog.mjs";

const root = path.resolve(fileURLToPath(new URL("../dist/", import.meta.url)));
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".svg": "image/svg+xml", ".jpg": "image/jpeg" };
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
  check(await page.locator("#examples button").count() === 15, "All fifteen workplace examples are available");
  check(await page.locator(".heading .eyebrow").textContent() === "Big ideas. Bold spins. More cowbell!", "Festive subtitle replaces the utility theme");
  const portrait = await page.locator(".hub img").evaluate((image) => ({
    loaded: image.complete && image.naturalWidth === 400 && image.naturalHeight === 400,
    fit: getComputedStyle(image).objectFit,
    clipped: getComputedStyle(image.parentElement).overflow === "hidden" && getComputedStyle(image.parentElement).borderRadius === "50%"
  }));
  check(portrait.loaded, "The supplied center portrait loads at its original resolution");
  check(portrait.fit === "cover" && portrait.clipped, "The portrait fills a circular crop");
  const brand = page.getByRole("link", { name: "TeamworkCowbell.com", exact: true });
  check(await brand.getAttribute("href") === "https://teamworkcowbell.com/", "Header branding links to TeamworkCowbell.com");
  check(await brand.getAttribute("target") === "_blank" && await brand.getAttribute("rel") === "noopener noreferrer", "Brand link opens safely without replacing the game");
  const logo = await brand.locator("img").evaluate((image) => ({
    loaded: image.complete && image.naturalWidth === 400,
    width: image.getBoundingClientRect().width,
    radius: getComputedStyle(image).borderRadius
  }));
  check(logo.loaded && logo.width === 40 && logo.radius === "50%", "Header reuses the portrait as a small circular logo");
  const brandBox = await brand.boundingBox();
  check(Math.abs(brandBox.x + brandBox.width / 2 - 960) < 1, "Branding is centered in the projector header");
  const sizes = await page.evaluate(() => ({
    input: parseFloat(getComputedStyle(document.getElementById("prompt")).fontSize),
    overflow: document.documentElement.scrollWidth > innerWidth
  }));
  check(sizes.input >= 36, "Projector input font is at least 36px");
  check(!sizes.overflow, "No horizontal overflow at 1920px");
  await page.getByRole("button", { name: "Customer update", exact: true }).click();
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
  check(await page.locator("#reasons li").filter({ hasText: /^Why not Microsoft 365 Copilot\?/ }).count() === 1, "Offline result explains why not Microsoft 365 Copilot");
  check(layout.resultBottom <= 1080, `Result is on screen (${layout.resultBottom}px)`);
  const examplesBox = await page.locator("#examples").boundingBox();
  check(examplesBox.y + examplesBox.height <= 1080, "All fifteen example buttons fit on the projector");
  await page.locator("#mode").selectOption("live");
  await submit(page, "Explain effective teamwork.");
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
  await page.locator("#mode").selectOption("rules");
  for (const title of ["Catch me up", "Find a decision", "Connect the dots", "My commitments"]) {
    await page.getByRole("button", { name: title, exact: true }).click();
    await page.locator("#spin").click();
    await result(page);
    check(await page.locator("#winner").textContent() === "Microsoft 365 Copilot", `${title} recommends Microsoft 365 Copilot`);
    check(await page.locator("#reasons li").filter({ hasText: /^Why not Microsoft 365 Copilot\?/ }).count() === 0, "Microsoft 365 Copilot examples do not contradict their recommendation");
  }
  await page.getByRole("button", { name: "Project risk lookout", exact: true }).click();
  await page.locator("#spin").click();
  await result(page);
  check(await page.locator("#winner").textContent() === "Copilot Autopilot", "Background inbox monitoring chooses Autopilot without product-specific vocabulary");
  check((await page.locator("#reasons").textContent()).includes("ongoing monitoring"), "Autopilot reasoning explains the background-monitoring intent");
  check((await page.locator("#availability").textContent()).includes("Private preview"), "Autopilot keeps its access caveat");

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
    check(await page.locator("#reasons li").filter({ hasText: /^Why not Microsoft 365 Copilot\?/ }).count() === (tool.id === "m365" ? 0 : 1), `Comparison is correct for ${tool.id}`);
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
  check(await page.locator("#reasons li").filter({ hasText: /^Why not Microsoft 365 Copilot\?/ }).count() === 1, "Safety fallback explains why not Microsoft 365 Copilot");
  check((await page.locator("#status").textContent()).includes("human review"), "Operational-control rejection is explicit");
  statusCode = 200;
  response = { toolId: "office", bullets: ["An editable document fits."], sourceIds: ["office"] };
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await submit(page, "Draft a Word document.");
  check(await page.locator("#spin").isDisabled(), "Lever locks during animated turn");
  check(await page.locator(".hub").evaluate((hub) => hub.getAnimations({ subtree: true }).length === 0), "Center portrait stays upright while the wheel spins");
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
  await submit(timeoutPage, "Explain effective teamwork.");
  await result(timeoutPage);
  check((await timeoutPage.locator("#status").textContent()).includes("12 seconds"), "Live timeout has explicit fallback");
  await timeoutPage.close();

  await page.unroute("https://api.example.test/**");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.locator("#mode").selectOption("rules");
  await submit(page, "Draft a product launch announcement in Word.");
  await result(page);
  await mkdir(new URL("../test-results/", import.meta.url), { recursive: true });
  await page.screenshot({ path: fileURLToPath(new URL("../test-results/projector.png", import.meta.url)) });
  for (const viewport of [{ width: 1366, height: 768 }, { width: 800, height: 1024 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    const overflow = await page.evaluate(() => [...document.querySelectorAll("body *")].filter((element) =>
      element.getBoundingClientRect().right > innerWidth + 1).slice(0, 8).map((element) => ({
      tag: element.tagName, id: element.id, class: element.getAttribute("class"), right: element.getBoundingClientRect().right
    })));
    check(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)), `No horizontal overflow at ${viewport.width}px: ${JSON.stringify(overflow)}`);
    check(await page.locator("#spin").isVisible(), "Lever remains visible at responsive size");
    const headerLayout = await page.locator(".topbar").evaluate((header) => {
      const brand = header.querySelector(".brand-link").getBoundingClientRect();
      const boxes = [...header.children].map((element) => element.getBoundingClientRect());
      return {
        centered: Math.abs(brand.x + brand.width / 2 - innerWidth / 2) < 1,
        overlap: boxes.some((a, i) => boxes.slice(i + 1).some((b) =>
          a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top))
      };
    });
    check(headerLayout.centered, `Header branding stays centered at ${viewport.width}px`);
    check(!headerLayout.overlap, `Header links and controls do not overlap at ${viewport.width}px`);
    const centered = await page.locator(".hub").evaluate((hub) => {
      const circle = hub.getBoundingClientRect();
      const frame = hub.parentElement.getBoundingClientRect();
      return Math.abs(circle.width - circle.height) < 1 &&
        Math.abs(circle.x + circle.width / 2 - frame.x - frame.width / 2) < 1 &&
        Math.abs(circle.y + circle.height / 2 - frame.y - frame.height / 2) < 1;
    });
    check(centered, `Portrait stays circular and centered at ${viewport.width}px`);
  }
  await page.locator(".wheel-frame").scrollIntoViewIfNeeded();
  await page.locator(".wheel-frame").screenshot({ path: fileURLToPath(new URL("../test-results/mobile-wheel.png", import.meta.url)) });
  await page.screenshot({ path: fileURLToPath(new URL("../test-results/mobile.png", import.meta.url)), fullPage: true });
  await page.goto(`${base}/`);
  check(await page.locator('a[href="which-tool/"]').count() >= 2, "Home page exposes game links");
  check(await page.locator("#deployment-visual").count() === 1, "Existing deployment visual remains");
  const demo = await browser.newPage({ viewport: { width: 1920, height: 1080 }, reducedMotion: "reduce" });
  demo.on("pageerror", (error) => errors.push(error.message));
  const demoRequests = [];
  demo.on("request", (request) => demoRequests.push({ url: request.url(), method: request.method() }));
  await page.goto(`${base}/which-tool/`);
  await page.getByText("Meet the tools & check the Microsoft guidance", { exact: true }).click();
  const demoLink = page.getByRole("link", { name: "scripted Copilot demo wheel" });
  check(await demoLink.getAttribute("href") === "../which-tool-demo/", "Original game exposes the new demo route");
  check((await demo.goto(`${base}/which-tool-demo/?scoutTheme=light`)).ok(), "Built demo page loads");
  check(await demo.locator(".segment").count() === 6 && await demo.locator(".wheel-label").count() === 6, "All six demo segments and labels render");
  check(await demo.locator("#examples button").count() === 4, "Exactly four starter demos render");
  check(await demo.locator("#spin").isDisabled() && await demo.locator("#prompt").isDisabled(), "Initial empty state requires a starter");
  check(await demo.locator("#prompt").inputValue() === "", "Initial prompt is empty");
  check(!/teamworkcowbell|cowbell/i.test(await demo.locator("body").textContent()), "New page has no cowbell branding");
  check(await demo.locator(".hub img").evaluate((image) => image.complete && image.naturalWidth === 120), "Official Copilot vector logo loads locally");
  check(await demo.locator(".hub img").getAttribute("alt") === "Microsoft Copilot", "Logo has an accessible name");
  check(await demo.locator(".hub img").evaluate((image) => {
    const style = getComputedStyle(image);
    return ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"].every((side) => style[side] === "0px") &&
      image.clientWidth === image.parentElement.clientWidth && image.clientHeight === image.parentElement.clientHeight &&
      style.objectFit === "contain";
  }), "Copilot logo fills the hub without extra padding or cropping");
  check(await demo.locator("#prompt").evaluate((input) => parseFloat(getComputedStyle(input).fontSize)) >= 36, "Demo projector input remains extra large");
  for (const scenario of DEMOS) {
    const starter = demo.getByRole("button", { name: scenario.title, exact: true });
    await starter.focus();
    await demo.keyboard.press("Enter");
    check(await demo.locator("#prompt").inputValue() === scenario.prompt, `${scenario.title}: starter preserves exact prompt`);
    check(await demo.locator("#prompt").evaluate((input) => input.scrollTop === 0 && input.selectionStart === 0), "Starter shows the beginning of a long prompt");
    check(await starter.getAttribute("aria-pressed") === "true", `${scenario.title}: selected state is accessible`);
    check(await demo.locator('#examples button[aria-pressed="true"]').count() === 1, "Only one demo is selected");
    await demo.locator("#spin").focus();
    await demo.keyboard.press("Enter");
    await result(demo);
    check(await demo.locator("#winner").textContent() === DEMO_TOOLS.find(({ id }) => id === scenario.toolId).label, `${scenario.title}: correct fixed winner`);
    check(await demo.locator(".segment.selected").getAttribute("data-tool") === scenario.toolId, "Highlighted segment matches the result");
    const rotation = await demo.locator("#wheel").evaluate((wheel) => Number(/rotate\(([-.\d]+)deg\)/.exec(wheel.style.transform)[1]));
    check(DEMO_TOOLS[selectedIndex(rotation, 6)].id === scenario.toolId, "Pointer lands on the correct one of six segments");
    const bullets = await demo.locator("#reasons li").allTextContents();
    check(bullets.length <= 3 && bullets.every((text) => text.length <= 160), "Explanation bullets respect presentation bounds");
    check(bullets.some((text) => text.startsWith("Why not Microsoft 365 Copilot?")) === (scenario.toolId !== "m365"), "Specialized outcome explains M365 comparison");
    const box = await demo.locator("#result").boundingBox();
    check(box.y + box.height <= 1080, `${scenario.title}: full result fits the projector viewport (${box.y + box.height}px)`);
    await demo.locator("#prompt").fill("A completely different task, edited for the presentation.");
    check(await demo.locator("#result").isHidden(), "Editing clears the previous result");
    await demo.locator("#spin").click();
    await result(demo);
    check(await demo.locator(".segment.selected").getAttribute("data-tool") === scenario.toolId, "Edits never change the selected demo mapping");
  }
  await demo.locator("#prompt").fill("   ");
  check(await demo.locator("#spin").isDisabled(), "Whitespace-only prompt cannot spin");
  await demo.locator("#reset").click();
  check(await demo.locator("#spin").isDisabled() && await demo.locator("#prompt").inputValue() === "", "Reset restores empty disabled state");
  check(await demo.locator('#examples button[aria-pressed="true"]').count() === 0, "Reset clears starter selection");
  await demo.getByRole("button", { name: DEMOS[0].title, exact: true }).click();
  await demo.emulateMedia({ reducedMotion: "no-preference" });
  await demo.locator("#spin").click();
  check(await demo.locator("#spin").isDisabled() && await demo.locator("#prompt").getAttribute("readonly") !== null, "Animation locks lever and prompt editing");
  check(await demo.locator("#examples button:disabled").count() === 4, "Animation locks starter switching");
  await demo.locator("#reset").click();
  await demo.waitForTimeout(3300);
  check(await demo.locator("#result").isHidden() && await demo.locator("#spin").isDisabled(), "Reset cancels animation without stale reveal");
  await demo.getByRole("button", { name: DEMOS[2].title, exact: true }).click();
  await demo.locator("#spin").click();
  await result(demo);
  check(await demo.locator(".segment.selected").getAttribute("data-tool") === "builder", "Real animation lands on Agent Builder");
  check(await demo.locator(".hub").evaluate((hub) => getComputedStyle(hub).transform === "none"), "Logo hub stays upright outside animated wheel");
  await demo.locator("#theme").click();
  check(await demo.locator("html").getAttribute("data-theme") === "dark", "Demo theme toggle works");
  await demo.locator("#fullscreen").click();
  await demo.waitForFunction(() => Boolean(document.fullscreenElement));
  check(await demo.locator("#fullscreen").textContent() === "Exit full screen", "Demo fullscreen button tracks presentation mode");
  await demo.locator("#fullscreen").click();
  await demo.waitForFunction(() => !document.fullscreenElement);
  await demo.screenshot({ path: fileURLToPath(new URL("../test-results/demo-projector.png", import.meta.url)) });
  for (const viewport of [{ width: 1366, height: 768 }, { width: 800, height: 1024 }, { width: 390, height: 844 }]) {
    await demo.setViewportSize(viewport);
    check(!await demo.evaluate(() => document.documentElement.scrollWidth > innerWidth), `Demo has no overflow at ${viewport.width}px`);
    check(await demo.locator("#spin").isVisible() && await demo.locator(".hub img").isVisible(), "Demo lever and logo remain visible");
  }
  await demo.locator(".wheel-frame").scrollIntoViewIfNeeded();
  await demo.locator(".wheel-frame").screenshot({ path: fileURLToPath(new URL("../test-results/demo-mobile-wheel.png", import.meta.url)) });
  await demo.screenshot({ path: fileURLToPath(new URL("../test-results/demo-mobile.png", import.meta.url)), fullPage: true });
  check(demoRequests.every(({ url, method }) => url.startsWith(base) && method === "GET" && !/auth|config|\/api\//.test(url)), "Demo loads only local static resources and never calls auth or AI");
  check(await demo.evaluate(() => localStorage.length === 0 && sessionStorage.length === 0), "Demo does not persist prompt text");
  await demo.reload();
  check(await demo.locator("#prompt").inputValue() === "" && await demo.locator("#spin").isDisabled(), "Reload restores the empty state");
  await demo.close();
  check(errors.length === 0, `No browser errors: ${errors.join("; ")}`);
  console.log(`Browser verification passed: ${checks} assertions, projector/mobile screenshots in test-results.`);
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
