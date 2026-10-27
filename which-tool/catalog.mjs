export const SOURCES = Object.freeze({
  m365: { title: "Microsoft Copilot overview", url: "https://learn.microsoft.com/en-us/microsoft-365/copilot/copilot-overview" },
  chat: { title: "Copilot Chat overview", url: "https://learn.microsoft.com/en-us/copilot/overview" },
  studio: { title: "Copilot Studio overview", url: "https://learn.microsoft.com/en-us/microsoft-copilot-studio/fundamentals-what-is-copilot-studio" },
  cowork: { title: "Copilot Cowork overview", url: "https://learn.microsoft.com/en-us/copilot/cowork/" },
  code: { title: "Copilot Code (Frontier)", url: "https://learn.microsoft.com/en-us/copilot/code/overview" },
  autopilot: { title: "Introducing Home, Code, and Autopilot", url: "https://blogs.microsoft.com/blog/2026/09/25/introducing-the-new-copilot-with-home-code-and-autopilot/" },
  builder: { title: "Agent Builder overview", url: "https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/agent-builder" },
  github: { title: "GitHub Copilot in Visual Studio", url: "https://learn.microsoft.com/en-us/visualstudio/ide/visual-studio-github-copilot-get-started?view=visualstudio" },
  foundry: { title: "What is Microsoft Foundry?", url: "https://learn.microsoft.com/en-us/azure/foundry/what-is-foundry" },
  office: { title: "Copilot in Word, Excel, and PowerPoint", url: "https://www.microsoft.com/en-us/copilot/blog/2026/04/22/copilots-agentic-capabilities-in-word-excel-and-powerpoint-are-generally-available/" },
  notebook: { title: "How Copilot Notebooks works", url: "https://support.microsoft.com/en-us/microsoft-365-copilot/how-microsoft-365-copilot-notebooks-works" }
});

export const VERIFIED_ON = "2026-10-26";
const standard = "Capabilities depend on your license, permissions, administrator settings, and regional availability.";
export const TOOLS = Object.freeze([
  {
    id: "m365", label: "Microsoft 365 Copilot", wheel: ["Microsoft 365", "Copilot"],
    description: "Work-grounded assistance across your permitted emails, meetings, chats, and documents.",
    contrast: "An umbrella offering: use a more specific experience when the work surface or delegated outcome is clear.",
    availability: standard, sourceIds: ["m365"]
  },
  {
    id: "chat", label: "Copilot Chat", wheel: ["Copilot", "Chat"],
    m365Comparison: "Why not Microsoft 365 Copilot? A conversational answer fits without requiring broad work-context grounding.",
    description: "Interactive research, questions, brainstorming, and help with supplied content.",
    contrast: "A conversational answer, not necessarily execution. Grounding varies with license and entry point; organizational context is supported in specific contexts.",
    availability: standard, sourceIds: ["chat"]
  },
  {
    id: "studio", label: "Copilot Studio", wheel: ["Copilot", "Studio"],
    m365Comparison: "Why not Microsoft 365 Copilot? This calls for building an agent with integrations, not only using a work assistant.",
    description: "Create and manage reusable business agents and workflows connected to enterprise systems and multiple channels.",
    contrast: "Prefer over Agent Builder for external service actions, connectors, workflows, or customer-facing channels.",
    availability: standard, sourceIds: ["studio", "builder"]
  },
  {
    id: "cowork", label: "Copilot Cowork", wheel: ["Copilot", "Cowork"],
    m365Comparison: "Why not Microsoft 365 Copilot? Cowork names the delegated, multistep experience more precisely than the umbrella label.",
    description: "Delegate a bounded, multistep outcome across Microsoft 365: prepare documents, coordinate meetings, and send communications.",
    contrast: "Does the delegated work rather than only explaining it. Supports recurring tasks too; persistence alone does not exclude Cowork. Actions require approval.",
    availability: "Generally available for work/school accounts; personal account preview. Access and action approvals still apply.",
    sourceIds: ["cowork"]
  },
  {
    id: "code", label: "Copilot Code", wheel: ["Copilot", "Code"],
    m365Comparison: "Why not Microsoft 365 Copilot? The goal is to create working software from a description, not work-content assistance.",
    description: "Describe a working app, dashboard, website, or script in plain language and iterate in a live preview.",
    contrast: "Outcome-first software creation, not restricted to developers. Can also work with GitHub repositories.",
    availability: "Frontier preview in the verified Learn documentation. Confirm tenant access before relying on it.",
    sourceIds: ["code"]
  },
  {
    id: "autopilot", label: "Copilot Autopilot", wheel: ["Copilot", "Autopilot"],
    m365Comparison: "Why not Microsoft 365 Copilot? The distinguishing need is a persistent proactive teammate, not an on-demand work assistant.",
    description: "A persistent proactive personal digital teammate with its own identity and memory, pursuing ongoing goals.",
    contrast: "An ongoing teammate across days and projects, rather than a single delegated deliverable or merely a scheduled prompt.",
    availability: "Private preview in Microsoft's September 2026 announcement. Confirm current access; not assumed available in your tenant.",
    sourceIds: ["autopilot", "cowork"]
  },
  {
    id: "builder", label: "Agent Builder", wheel: ["Agent", "Builder"],
    m365Comparison: "Why not Microsoft 365 Copilot? Agent Builder names the experience for creating a reusable knowledge agent, not just using one.",
    description: "Quickly create a straightforward declarative agent in Microsoft 365 using dedicated knowledge and instructions.",
    contrast: "A reusable internal knowledge agent, not a one-off notebook. External low-code actions, connectors, and workflows require Studio.",
    availability: standard, sourceIds: ["builder"]
  },
  {
    id: "github", label: "GitHub Copilot", wheel: ["GitHub", "Copilot"],
    m365Comparison: "Why not Microsoft 365 Copilot? This needs codebase-aware development and tests, rather than a work-content assistant.",
    description: "Developer-centered coding, repository changes, debugging, refactoring, code reviews, and automated tests.",
    contrast: "Assists software engineering; Foundry supplies the custom AI runtime/platform and Code offers outcome-first creation.",
    availability: "GitHub Copilot plan, editor, organization policies, and feature availability apply.",
    sourceIds: ["github"]
  },
  {
    id: "foundry", label: "Microsoft Foundry", wheel: ["Microsoft", "Foundry"],
    m365Comparison: "Why not Microsoft 365 Copilot? This needs a custom AI platform with model and deployment control, not an end-user work assistant.",
    description: "Build custom AI applications with model choice, retrieval/tools, evaluations, tracing, and engineering control.",
    contrast: "A platform for building and operating AI, rather than an end-user productivity assistant or just help writing code.",
    availability: "Azure setup, model/region availability, permissions, and consumption costs apply.",
    sourceIds: ["foundry"]
  },
  {
    id: "office", label: "Copilot in Office Apps", wheel: ["Copilot in", "Office Apps"],
    m365Comparison: "Why not Microsoft 365 Copilot? Office Apps names the app-native editing experience within it more precisely.",
    description: "Create or edit a Word document, Excel workbook, PowerPoint presentation, or another supported app artifact.",
    contrast: "Use the app-native context for one artifact; Cowork fits a delegated cross-app outcome.",
    availability: standard, sourceIds: ["office", "m365"]
  },
  {
    id: "notebook", label: "Copilot Notebook", wheel: ["Copilot", "Notebook"],
    m365Comparison: "Why not Microsoft 365 Copilot? Notebooks names the focused, selected-reference experience more precisely than the umbrella label.",
    description: "Copilot Notebooks: a scoped workspace for focused answers and synthesis using curated references.",
    contrast: "Grounded in selected notebook sources, not broad discovery across the organization or a published business agent. Not a chart builder.",
    availability: "Official name: Copilot Notebooks. Eligible Copilot access and a SharePoint/OneDrive service plan are required for work accounts.",
    sourceIds: ["notebook"]
  },
  {
    id: "depends", label: "It Depends", wheel: ["It", "Depends"],
    m365Comparison: "Why not Microsoft 365 Copilot? A work assistant is not yet a justified choice; clarify the outcome, constraints or human-review needs.",
    description: "The decision needs a missing constraint, spans competing approaches, is out of this catalog, or involves high-impact operations.",
    contrast: "Explain the decision boundary instead of inventing a winner. Never recommend autonomous control of utility infrastructure.",
    availability: "Educational starting point, not operational, engineering, safety, procurement, or licensing advice.",
    sourceIds: ["m365", "foundry"]
  }
]);

export function validatePrompt(value) {
  if (typeof value !== "string" || !value.trim()) throw new Error("Describe what you want to accomplish first.");
  if (value.length > 2000) throw new Error("Keep the prompt to 2,000 characters or fewer.");
  return value.trim();
}

export function requiresSafetyReview(text) {
  return /\b(dos(e|ing|age)|chlorine|valve|pump|pressure|treatment|scada)\b/i.test(text) &&
    /\b(autonomous(?:ly)?|automatically|directly control|operate|adjust|change|set|control)\b/i.test(text);
}

export function validateResult(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Invalid recommendation.");
  const tool = TOOLS.find(({ id }) => id === raw.toolId);
  if (!tool) throw new Error("Unknown tool in recommendation.");
  if (!Array.isArray(raw.bullets) || raw.bullets.length < 1 || raw.bullets.length > 3 ||
      raw.bullets.some((text) => typeof text !== "string" || !text.trim() || text.length > 160)) {
    throw new Error("Recommendation must have one to three short explanations.");
  }
  if (!Array.isArray(raw.sourceIds) || raw.sourceIds.length < 1 || raw.sourceIds.length > 2 ||
      new Set(raw.sourceIds).size !== raw.sourceIds.length ||
      raw.sourceIds.some((id) => !Object.hasOwn(SOURCES, id) || !tool.sourceIds.includes(id))) {
    throw new Error("Recommendation contains invalid or unrelated sources.");
  }
  return { toolId: tool.id, bullets: raw.bullets.map((text) => text.trim()), sourceIds: [...raw.sourceIds] };
}

export function enrichResult(raw, mode) {
  if (!["live", "rules"].includes(mode)) throw new Error("Invalid recommendation mode.");
  const result = validateResult(raw);
  const tool = TOOLS.find(({ id }) => id === result.toolId);
  const bullets = tool.id === "m365" ? result.bullets : [
    ...result.bullets.filter((text) => text !== tool.m365Comparison).slice(0, 2),
    tool.m365Comparison
  ];
  return { ...validateResult({ ...result, bullets }), mode, availabilityNote: tool.availability };
}

export const EXAMPLES = Object.freeze([
  { title: "Outage message", prompt: "Draft a reassuring outage notice for residents in a Word document that I can edit." },
  { title: "Customer-service agent", prompt: "Build a customer-facing agent on our website that answers billing questions and creates cases in our CRM." },
  { title: "Maintenance briefing", prompt: "Prepare a maintenance briefing from our Teams messages and SharePoint files, create a document, then email it to the supervisors." },
  { title: "Policy reference room", prompt: "Compare only these selected safety policies and inspection notes in a focused workspace, with answers grounded in those references." },
  { title: "Meter-data code", prompt: "Debug our Python meter-data parser in the repository and add unit tests for missing readings." },
  { title: "Leak tracker app", prompt: "I do not code. Build a simple interactive leak-report tracker app from my description and let me refine it in a live preview." },
  { title: "Custom AI application", prompt: "Build a custom AI application for document retrieval with model selection, evaluations, private networking, and tracing." },
  { title: "A digital teammate", prompt: "Give me a persistent digital teammate with its own identity and memory to proactively follow up on supplier reviews over several weeks." }
]);
