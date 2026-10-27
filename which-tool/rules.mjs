import { TOOLS, enrichResult, validatePrompt, requiresSafetyReview } from "./catalog.mjs";

// Each match is an intent signal, not a tool-name shortcut.
const signals = [
  ["m365", 6, /\b(find|summari[sz]e|catch (?:(?:me|us) )?up|search|what|bring together)\b.*\b(emails?|meetings?|teams|chats?|sharepoint|documents?)\b/, "Your request needs context from permitted Microsoft 365 work content."],
  ["m365", 3, /\b(across|company|organization|organisation|work context|work data)\b/, "Cross-work context is more useful here than a single selected file."],
  ["chat", 7, /\b(explain|brainstorm|ideas|research|what is|what are|compare|rewrite|draft|summari[sz]e)\b/, "You want an interactive answer, research, or a draft you can review."],
  ["chat", 4, /\b(public|web|general|pasted|provided text|plain language)\b/, "A conversational starting point fits supplied content or general information."],
  ["studio", 7, /\b(agent|chatbot|assistant|bot)\b/, "A reusable agent can answer questions and follow a defined business process."],
  ["studio", 9, /\b(customer.facing|public website|our website|external service|crm|connector|erp|dataverse|multi.channel)\b/, "Your requested channel or system integration needs business-agent capabilities."],
  ["studio", 6, /\b(workflow|approval flow|creates? cases?|create tickets?|take actions?)\b/, "Reusable actions and workflows point beyond a knowledge-only agent."],
  ["cowork", 9, /\b(then|and then)\b.*\b(email|send|schedule|post|create|prepare|organize|organise)\b/, "You are delegating several connected steps, not just asking for advice."],
  ["cowork", 7, /\b(prepare|compile|organize|organise|coordinate)\b.*\b(briefing|package|meeting|review|report)\b/, "A bounded work package can be assembled across Microsoft 365."],
  ["cowork", 5, /\b(send|email|schedule|post)\b.*\b(team|supervisor|stakeholder|meeting|colleague|manager)/, "The outcome includes coordination or communication with your colleagues."],
  ["autopilot", 13, /\b(persistent|proactive|proactively|digital teammate|own identity|own memory)\b/, "You describe an ongoing digital teammate, rather than a one-off deliverable."],
  ["autopilot", 6, /\b(over several|over weeks|over days|keeps? working|without waiting|follow up|follow.up)\b/, "Continuity and follow-through over time are central to this request."],
  ["code", 8, /\b(build|create|make|prototype)\b.*\b(app|dashboard|website|tracker|script|tool)\b/, "Your desired output is working software rather than a document or chat answer."],
  ["code", 9, /\b(do not code|don't code|no.code|non.developer|live preview|from my description|plain.language app)\b/, "Outcome-first creation lets you describe and refine software in plain language."],
  ["builder", 12, /\b(knowledge.only|knowledge agent|internal.*agent|simple.*agent|declarative agent|onboarding agent|faq agent)\b/, "A straightforward internal knowledge agent fits lightweight agent creation."],
  ["builder", 5, /\b(sharepoint|dedicated knowledge|team policies|onboarding|faq)\b/, "Dedicated knowledge and instructions can scope this reusable assistant."],
  ["github", 10, /\b(debug|refactor|unit tests?|pull request|code review|repository|codebase|bug|ide|vscode|vs code)\b/, "Your request is part of an engineering workflow in an existing codebase."],
  ["github", 6, /\b(python|typescript|javascript|c#|function|tests?|parser|api implementation)\b/, "Implementation and test context matter more than an end-user work surface."],
  ["foundry", 13, /\b(custom ai|model selection|model choice|fine.tun|rag|retrieval.augmented|agent runtime)\b/, "You need control over the AI application or model layer."],
  ["foundry", 7, /\b(evaluations?|tracing|private network|inference|model deployment|retrieval)\b/, "Evaluation, retrieval, and deployment controls are platform-level requirements."],
  ["office", 13, /\b(word|excel|powerpoint|workbook|spreadsheet|slides?|presentation|document that i can edit)\b/, "The work belongs inside an editable document, workbook, or presentation."],
  ["office", 4, /\b(formula|chart|format|pivot|in this document|in this file)\b/, "App-native editing and analysis keep the artifact in context."],
  ["notebook", 14, /\b(only these|only the selected|curated|selected.*(policies|references|sources|documents)|focused workspace|notebook)\b/, "You want focused answers grounded in a deliberately chosen set of references."],
  ["notebook", 4, /\b(compare|synthesi[sz]e|grounded|references|inspection notes)\b/, "A scoped reference workspace supports comparison and synthesis."],
];

function depends(bullets) {
  return enrichResult({ toolId: "depends", bullets, sourceIds: ["m365", "foundry"] }, "rules");
}

function withoutExclusions(text) {
  return text.replace(/\b(?:do not|don't|not|without|no need to)\s+(?:use\s+)?[^,.;!?]+/g, (clause) =>
    /\b(code|coding)\b/.test(clause) && /\b(do not code|don't code)\b/.test(clause) ||
    /^(?:not (?:actively )?using (?:my |the |a )?(?:computer|laptop|device)|not at (?:my|the) (?:computer|desk)|not (?:online|logged in)|without (?:waiting|another prompt|me\b|my\b))/.test(clause)
      ? clause : "");
}

export function classifyPrompt(value) {
  const original = validatePrompt(value).toLowerCase().replace(/[’]/g, "'");
  if (requiresSafetyReview(original)) {
    return depends([
      "Safety-critical controls need qualified engineering review, not a tool-selection game.",
      "Clarify whether you want a human-reviewed analysis or a change to an operational system.",
      "No recommendation here authorizes AI to operate infrastructure."
    ]);
  }
  const text = withoutExclusions(original);
  if (/\b(weather|recipe|football|stock price|medical diagnosis)\b/.test(text)) {
    return depends(["This request is outside the work scenarios covered by this game.", "Clarify the work outcome and the data or app you need before choosing a tool."]);
  }
  const scores = new Map(TOOLS.filter(({ id }) => id !== "depends").map(({ id }) => [id, { id, score: 0, reasons: [] }]));
  for (const [id, weight, pattern, reason] of signals) {
    if (id === "studio" && weight === 9 && !/\b(agent|chatbot|assistant|bot|workflow)\b/.test(text)) continue;
    if (pattern.test(text)) {
      scores.get(id).score += weight;
      scores.get(id).reasons.push(reason);
    }
    if (scores.get("builder").score >= 12 && scores.get("office").score >= 13 && /\band\b/.test(text)) {
      return depends([
        "An editable Office artifact and a reusable knowledge agent are different deliverables.",
        "Choose Office Apps for the file, or Agent Builder for an internal knowledge assistant.",
        "Clarify which outcome you want first; the larger solution may use both."
      ]);
    }
  }
  const workChannels = /\b(emails?|inbox|outlook|teams|chats?|channels?|threads?|projects?)\b/.test(text);
  const monitoring = /\b(monitor(?:s|ing)?|watch(?:es|ing)?|on the lookout|keep (?:an eye|tabs)|look(?:ing)? out for)\b/.test(text);
  const ongoing = /\b(always|continuous(?:ly)?|continual(?:ly)?|ongoing|in the background|as soon as|whenever|around.the.clock|24\/7|on the lookout|keep (?:watching|monitoring|an eye|tabs))\b/.test(text) ||
    /\b(while|when|even if)\b.*\b(away|asleep|offline|sleep|not (?:actively )?using|not at|not online|not logged in)\b/.test(text) ||
    /\bwithout (waiting|another prompt|me|my)\b/.test(text);
  const notifications = /\b(alert|notify|tell|inform) (me|us)\b|\blet (me|us) know\b/.test(text);
  const buildingSolution = /\b(build|create|develop|implement|configure|design)\b.*\b(workflow|connector|agent|chatbot|bot|app|script|runtime)\b/.test(text);
  if (workChannels && monitoring && (ongoing || notifications) && !buildingSolution &&
      !/\b(just once|one.off|one.time|single check)\b/.test(text)) {
    scores.get("autopilot").score += 18;
    scores.get("autopilot").reasons.unshift("You want ongoing monitoring of work signals and proactive updates, even while you are away.");
  }
  const change = (id, amount) => { scores.get(id).score += amount; };
  if (scores.get("studio").score >= 15) change("builder", -15);
  if (scores.get("builder").score >= 12 && scores.get("studio").score < 15) change("builder", 8);
  if (scores.get("cowork").score >= 14) { change("office", -8); change("m365", -4); }
  if (scores.get("autopilot").score >= 13) change("cowork", -7);
  if (scores.get("foundry").score >= 13) { change("code", -6); change("github", -4); }
  if (scores.get("github").score >= 16) change("code", -6);
  if (scores.get("notebook").score >= 14) { change("chat", -5); change("m365", -5); }
  const ranked = [...scores.values()].sort((a, b) => b.score - a.score);
  const [first, second] = ranked;
  if (first.score < 7 || first.reasons.length === 0) {
    return depends([
      "There is not enough detail to distinguish these tools reliably.",
      "Name the outcome, where the data lives, and whether you want an answer, an artifact, or a reusable agent."
    ]);
  }
  if (second.score >= 10 && first.score - second.score <= 3) {
    return depends([
      `${TOOLS.find(({ id }) => id === first.id).label} and ${TOOLS.find(({ id }) => id === second.id).label} both fit parts of this request.`,
      "Choose the primary outcome: an answer, a delegated task, a reusable solution, or developer control.",
      "Offline rules cannot resolve this trade-off confidently; try Live AI or add a constraint."
    ]);
  }
  const tool = TOOLS.find(({ id }) => id === first.id);
  const bullets = [...new Set(first.reasons)].slice(0, 2);
  const contrasts = {
    m365: "Start with broad work context; choose a specific Copilot experience once the work surface is clear.",
    chat: "Start with a conversation; you are not yet describing a reusable agent or a cross-app delegated task.",
    studio: "Unlike a knowledge-only builder, Studio supports business-system actions and multiple deployment channels.",
    cowork: "Cowork carries out a defined task; a persistent digital teammate is a different requirement.",
    code: "Choose GitHub Copilot instead when your main goal is developer-led engineering and code review.",
    autopilot: "This is a capability fit, not an access promise: the verified announcement describes private preview.",
    builder: "Move to Studio if you need external actions, connectors, workflows, or more deployment channels.",
    github: "Foundry may supply an AI runtime; GitHub Copilot helps you engineer the code itself.",
    foundry: "A coding assistant can help build it, but the AI platform supplies model and runtime controls.",
    office: "A single editable artifact is a better starting point than building a new agent.",
    notebook: "Use a reusable agent builder instead if other people need a published assistant."
  };
  bullets.push(contrasts[first.id]);
  return enrichResult({ toolId: tool.id, bullets, sourceIds: tool.sourceIds.slice(0, 2) }, "rules");
}
