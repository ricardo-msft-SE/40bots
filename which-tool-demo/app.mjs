import { TOOLS, DEMOS } from "./catalog.mjs";
import { landingRotation } from "../which-tool/wheel.mjs";

const $ = (id) => document.getElementById(id);
const prompt = $("prompt");
const wheel = $("wheel");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let selected;
let rotation = 0;
let busy = false;
let turn = 0;
let animation;

function node(tag, text) {
  const element = document.createElement(tag);
  element.textContent = text;
  return element;
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
  const size = 360 / TOOLS.length;
  const start = point(i * size);
  const end = point((i + 1) * size);
  $("segments").append(svg("path", {
    d: `M320 320 L${start.join(" ")} A310 310 0 0 1 ${end.join(" ")} Z`,
    class: "segment", "data-tool": tool.id
  }));
  const angle = (i + .5) * size;
  const [x, y] = point(angle, 215);
  const text = svg("text", {
    x, y, class: "wheel-label",
    transform: `rotate(${angle < 180 ? angle - 90 : angle + 90} ${x} ${y})`
  });
  tool.wheel.forEach((line, j) => {
    const span = svg("tspan", { x, dy: j === 0 ? "-.1em" : "1.1em" });
    span.textContent = line;
    text.append(span);
  });
  $("segments").append(text);
});

function status(text, warning = false) {
  $("status").textContent = text;
  $("status").classList.toggle("warning", warning);
}

function updateControls() {
  prompt.disabled = !selected;
  prompt.readOnly = busy;
  $("spin").disabled = busy || !selected || !prompt.value.trim();
  $("game-form").classList.toggle("is-busy", busy);
  $("counter").textContent = `${prompt.value.length.toLocaleString()} / 2,000`;
  for (const button of $("examples").children) {
    button.disabled = busy;
    button.setAttribute("aria-pressed", String(button.dataset.demo === selected?.id));
  }
}

function clearResult() {
  $("result").hidden = true;
  $("ready-card").hidden = false;
  document.querySelectorAll(".segment.selected").forEach((path) => path.classList.remove("selected"));
}

for (const demo of DEMOS) {
  const button = node("button", demo.title);
  button.type = "button";
  button.dataset.demo = demo.id;
  button.addEventListener("click", () => {
    if (busy) return;
    selected = demo;
    prompt.value = demo.prompt;
    clearResult();
    updateControls();
    status(`${demo.title} selected. Its scripted outcome stays fixed if you edit the prompt.`);
    prompt.focus();
    prompt.setSelectionRange(0, 0);
    prompt.scrollTop = 0;
  });
  $("examples").append(button);
}

prompt.addEventListener("input", () => {
  clearResult();
  updateControls();
  status(prompt.value.trim() ? "Prompt edited. The selected demo's scripted outcome is unchanged." : "Enter prompt text or choose a starter again.", !prompt.value.trim());
});

$("game-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (busy) return;
  if (!selected || !prompt.value.trim() || prompt.value.length > 2000) {
    status("Choose a starter and enter a prompt of 1 to 2,000 characters.", true);
    return;
  }
  const demo = selected;
  const currentTurn = ++turn;
  busy = true;
  clearResult();
  updateControls();
  status(`Spinning the scripted ${demo.title} demo...`);
  const index = TOOLS.findIndex(({ id }) => id === demo.toolId);
  const target = landingRotation(rotation, index, TOOLS.length, reducedMotion.matches ? 0 : 4);
  try {
    if (!reducedMotion.matches) {
      animation = wheel.animate([
        { transform: `rotate(${rotation}deg)` },
        { transform: `rotate(${target}deg)` }
      ], { duration: 3200, easing: "cubic-bezier(.15,.55,.12,1)", fill: "forwards" });
      await animation.finished;
    }
    if (currentTurn !== turn) return;
    rotation = target;
    wheel.style.transform = `rotate(${rotation}deg)`;
    animation?.cancel();
    animation = undefined;
    $("winner").textContent = TOOLS[index].label;
    $("reasons").replaceChildren(...demo.bullets.map((text) => node("li", text)));
    $("ready-card").hidden = true;
    $("result").hidden = false;
    document.querySelector(`[data-tool="${demo.toolId}"]`).classList.add("selected");
    status(`${TOOLS[index].label}. Scripted demo outcome, not analysis of your edited prompt.`);
  } catch (error) {
    if (currentTurn !== turn && error.name === "AbortError") return;
    animation?.cancel();
    animation = undefined;
    status(`The demo could not finish: ${error.message}. Reset and try again.`, true);
  } finally {
    if (currentTurn === turn) {
      busy = false;
      updateControls();
    }
  }
});

$("reset").addEventListener("click", () => {
  turn++;
  animation?.cancel();
  animation = undefined;
  selected = undefined;
  busy = false;
  rotation = 0;
  wheel.style.transform = "rotate(0deg)";
  prompt.value = "";
  clearResult();
  updateControls();
  status("Choose one of the four starter demos to begin.");
  $("examples").firstElementChild.focus();
});

$("theme").addEventListener("click", () => {
  document.documentElement.dataset.theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
});
$("fullscreen").addEventListener("click", async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
    else throw new Error("Full screen is unavailable. Use your browser's presentation mode.");
  } catch (error) { status(error.message, true); }
});
document.addEventListener("fullscreenchange", () => {
  $("fullscreen").textContent = document.fullscreenElement ? "Exit full screen" : "Full screen";
});
updateControls();
