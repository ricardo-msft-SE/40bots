import { TOOLS, SOURCES, EXAMPLES, VERIFIED_ON, validatePrompt, enrichResult } from "./catalog.mjs";
import { classifyPrompt } from "./rules.mjs";
import { landingRotation } from "./wheel.mjs";
import config from "./config.mjs";

const $ = (id) => document.getElementById(id);
const wheel = $("wheel");
const prompt = $("prompt");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let rotation = 0;
let turn = 0;
let busy = false;
let controller;
let spinner;
let landing;
let authPromise;
const configured = Boolean(config.apiUrl && config.tenantId && config.clientId && config.scope);

function node(tag, text, className) {
  const element = document.createElement(tag);
  if (text) element.textContent = text;
  if (className) element.className = className;
  return element;
}

function sourceLink(id) {
  const anchor = node("a", SOURCES[id].title);
  anchor.href = SOURCES[id].url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  return anchor;
}

function svg(tag, attributes) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
  return element;
}

function point(angle, radius = 310) {
  const radians = angle * Math.PI / 180;
  return [320 + radius * Math.sin(radians), 320 - radius * Math.cos(radians)];
}

TOOLS.forEach((tool, i) => {
  const start = point(i * 30);
  const end = point((i + 1) * 30);
  const path = svg("path", { d: `M320 320 L${start.join(" ")} A310 310 0 0 1 ${end.join(" ")} Z`, class: "segment", "data-tool": tool.id });
  $("segments").append(path);
  const angle = (i + .5) * 30;
  const [x, y] = point(angle, 217);
  const text = svg("text", { x, y, class: "wheel-label", transform: `rotate(${angle < 180 ? angle - 90 : angle + 90} ${x} ${y})` });
  tool.wheel.forEach((line, j) => {
    const span = svg("tspan", { x, dy: j === 0 ? "-.1em" : "1.1em" });
    span.textContent = line;
    text.append(span);
  });
  $("segments").append(text);
  const card = node("article", "", "tool-card");
  card.append(node("h3", tool.label), node("p", tool.description), node("p", tool.contrast), node("p", tool.availability));
  tool.sourceIds.forEach((id) => card.append(sourceLink(id)));
  $("tool-guide").append(card);
});
$("verified").textContent = VERIFIED_ON;
for (const example of EXAMPLES) {
  const button = node("button", example.title);
  button.type = "button";
  button.addEventListener("click", () => {
    if (busy) return;
    prompt.value = example.prompt;
    updateCount();
    prompt.focus();
  });
  $("examples").append(button);
}

function updateCount() { $("counter").textContent = `${prompt.value.length.toLocaleString()} / 2,000`; }
prompt.addEventListener("input", updateCount);

function status(text, warning = false) {
  $("status").textContent = text;
  $("status").classList.toggle("warning", warning);
}

function setBusy(value) {
  busy = value;
  $("spin").disabled = value;
  $("mode").disabled = value;
  $("signin").disabled = value || !configured;
  prompt.readOnly = value;
  $("game-form").classList.toggle("is-busy", value);
  for (const button of $("examples").children) button.disabled = value;
}

function clearResult() {
  $("result").hidden = true;
  $("ready-card").hidden = false;
  document.querySelectorAll(".segment.selected").forEach((path) => path.classList.remove("selected"));
}

async function auth() {
  if (!authPromise) {
    authPromise = import("./auth.js").then(async (module) => {
      await module.initialize(config);
      return module;
    }).catch((error) => { authPromise = undefined; throw error; });
  }
  return authPromise;
}

function apiUrl() {
  const url = new URL(config.apiUrl);
  if (url.username || url.password || (url.protocol !== "https:" &&
      !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname)))) {
    throw new Error("The live API must use HTTPS.");
  }
  return url;
}

async function liveResult(text, signal) {
  if (!configured) throw new Error("Live AI is not configured. See Presenter setup.");
  const token = await (await auth()).getAccessToken();
  if (signal.aborted) throw new Error("Live request cancelled.");
  const response = await fetch(apiUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ prompt: text }),
    signal,
    cache: "no-store",
    credentials: "omit"
  });
  if (!response.ok) {
    const messages = {
      401: "Sign in again for Live AI.", 403: "Your presenter account is not authorized.",
      422: "Operational-control requests need qualified human review, not live tool selection.",
      429: "The live request quota has been reached."
    };
    throw new Error(messages[response.status] || `Live service returned HTTP ${response.status}.`);
  }
  const body = await response.text();
  if (body.length > 8000) throw new Error("Live service returned an oversized response.");
  return enrichResult(JSON.parse(body), "live");
}

function startSpinner() {
  if (reducedMotion.matches) return;
  spinner = wheel.animate([
    { transform: `rotate(${rotation}deg)` },
    { transform: `rotate(${rotation + 360}deg)` }
  ], { duration: 1100, iterations: Infinity, easing: "linear" });
}

function stopSpinner() {
  if (spinner) {
    const progress = (spinner.currentTime || 0) / 1100;
    rotation += progress * 360;
    spinner.cancel();
    spinner = undefined;
  }
  wheel.style.transform = `rotate(${rotation}deg)`;
}

async function landOn(toolId) {
  stopSpinner();
  const target = landingRotation(rotation, TOOLS.findIndex(({ id }) => id === toolId), TOOLS.length, reducedMotion.matches ? 0 : 3);
  if (reducedMotion.matches) {
    rotation = target;
    wheel.style.transform = `rotate(${rotation}deg)`;
    return;
  }
  landing = wheel.animate([
    { transform: `rotate(${rotation}deg)` },
    { transform: `rotate(${target}deg)` }
  ], { duration: 3200, easing: "cubic-bezier(.15,.55,.12,1)", fill: "forwards" });
  await landing.finished;
  rotation = target;
  wheel.style.transform = `rotate(${rotation}deg)`;
  landing.cancel();
  landing = undefined;
}

function reveal(result) {
  const tool = TOOLS.find(({ id }) => id === result.toolId);
  $("ready-card").hidden = true;
  $("result").hidden = false;
  $("winner").textContent = tool.label;
  $("result-kicker").textContent = result.mode === "live" ? "Live AI recommendation" : "Offline rules recommendation";
  $("mode-badge").textContent = result.mode === "live" ? "Live AI" : "Offline rules";
  $("reasons").replaceChildren(...result.bullets.map((text) => node("li", text)));
  $("availability").textContent = result.availabilityNote;
  $("sources").replaceChildren(...result.sourceIds.map(sourceLink));
  document.querySelector(`[data-tool="${tool.id}"]`).classList.add("selected");
}

$("game-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (busy) return;
  let text;
  try { text = validatePrompt(prompt.value); }
  catch (error) { status(error.message, true); prompt.focus(); return; }
  const currentTurn = ++turn;
  const requestedMode = $("mode").value;
  controller = new AbortController();
  const localController = controller;
  setBusy(true);
  clearResult();
  status(requestedMode === "live" ? "Considering your outcome with Live AI..." : "Matching your outcome with offline intent rules...");
  startSpinner();
  let fallback = "";
  let timer;
  try {
    let result;
    if (requestedMode === "live") {
      try {
        const timeout = new Promise((_, reject) => {
          timer = setTimeout(() => {
            reject(new Error("Live AI did not respond within 12 seconds."));
            localController.abort();
          }, 12000);
        });
        result = await Promise.race([liveResult(text, localController.signal), timeout]);
      } catch (error) {
        if (currentTurn !== turn) return;
        fallback = `${error.message} Showing an offline rules result, not a live AI answer.`;
        status(fallback, true);
        result = classifyPrompt(text);
      } finally { clearTimeout(timer); }
    } else {
      result = classifyPrompt(text);
    }
    if (currentTurn !== turn) return;
    await landOn(result.toolId);
    if (currentTurn !== turn) return;
    reveal(result);
    status(fallback || `${TOOLS.find(({ id }) => id === result.toolId).label}. ${result.mode === "rules" ? "Rules have limited understanding; review the reasoning below." : "Review the reasoning and availability below."}`, Boolean(fallback));
  } catch (error) {
    if (currentTurn === turn) status(`Unable to complete this turn: ${error.message}`, true);
  } finally {
    clearTimeout(timer);
    if (currentTurn === turn) { stopSpinner(); setBusy(false); }
  }
});

$("reset").addEventListener("click", () => {
  turn++;
  controller?.abort();
  spinner?.cancel();
  landing?.cancel();
  spinner = landing = undefined;
  rotation = 0;
  wheel.style.transform = "rotate(0deg)";
  clearResult();
  prompt.value = "";
  updateCount();
  setBusy(false);
  $("mode-badge").textContent = $("mode").value === "live" ? "Live AI selected" : "Offline rules";
  status("Ready for the next challenge.");
  prompt.focus();
});
$("mode").addEventListener("change", () => {
  $("mode-badge").textContent = $("mode").value === "live" ? "Live AI selected" : "Offline rules";
  status($("mode").value === "live" ? (configured ? "Sign in through Presenter setup before using Live AI." : "Live AI is not configured. Spins will be explicitly labeled offline fallbacks.") : "Offline rules selected. Prompts stay in this browser.");
});
$("theme").addEventListener("click", () => {
  document.documentElement.dataset.theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
});
$("fullscreen").addEventListener("click", async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
    else throw new Error("Full screen is unavailable in this browser. Use your browser's presentation mode.");
  } catch (error) { status(error.message, true); }
});
document.addEventListener("fullscreenchange", () => {
  $("fullscreen").textContent = document.fullscreenElement ? "Exit full screen" : "Full screen";
});
$("configuration-status").textContent = configured ? "Live API configured. Sign in with an allowed presenter account." : "Live API is not configured. Offline rules are ready; see the repository setup instructions to enable Live AI.";
$("signin").disabled = !configured;
$("signin").addEventListener("click", async () => {
  if (busy) return;
  $("signin").disabled = true;
  try {
    const name = await (await auth()).signIn();
    $("configuration-status").textContent = `Signed in as ${name}. Your API must also authorize this account.`;
    if (!busy) {
      $("mode").value = "live";
      $("mode").dispatchEvent(new Event("change"));
      status("Signed in. Live AI is selected.");
    }
  } catch (error) {
    $("configuration-status").textContent = `Sign-in failed: ${error.message}`;
    status("Live sign-in failed. Review Presenter setup or use Offline rules.", true);
  } finally { $("signin").disabled = busy || !configured; }
});
