const deploymentStages = {
  discovery: {
    phase: "Phase 1",
    title: "Discovery",
    summary:
      "Map the work, identify the highest-value opportunities, and prioritize the use cases most likely to create measurable productivity gains with manageable risk.",
    outcome: "A validated shortlist of use cases and ownership.",
    checklist: [
      "Audit business processes and repetitive tasks",
      "Interview teams about pain points and handoffs",
      "Assess workflow volume, complexity, and error rates",
      "Rank opportunities by value, feasibility, and risk"
    ]
  },
  requirements: {
    phase: "Phase 2",
    title: "Requirements",
    summary:
      "Translate the best opportunities into clear scope, business rules, success metrics, and operational guardrails before any build starts.",
    outcome: "Well-defined requirements with measurable acceptance criteria.",
    checklist: [
      "Define user personas and business outcomes",
      "Document required data sources and permissions",
      "Capture escalation, exception, and approval rules",
      "Set success metrics for speed, quality, and cost"
    ]
  },
  planning: {
    phase: "Phase 3",
    title: "Planning",
    summary:
      "Create the rollout structure, sequence the work, and set governance practices so each agent is introduced with a clear operating model.",
    outcome: "A phased delivery plan with owners, milestones, and controls.",
    checklist: [
      "Prioritize the first 10 to 15 use cases",
      "Define architecture, integration points, and data flow",
      "Assign delivery owners for design, implementation, and support",
      "Establish review gates for quality and risk"
    ]
  },
  building: {
    phase: "Phase 4",
    title: "Building",
    summary:
      "Develop the agents, workflows, prompt patterns, and integrations in a way that is reusable, transparent, and easy to test in production-like conditions.",
    outcome: "Working agents with tested patterns and reusable components.",
    checklist: [
      "Build the user experience and workflow logic",
      "Connect to approved data sources and tools",
      "Define fallback responses and human handoff paths",
      "Test prompt quality, citations, and reliability"
    ]
  },
  deploying: {
    phase: "Phase 5",
    title: "Deploying",
    summary:
      "Roll out the agents in controlled waves, start with high-confidence use cases, and validate business impact before expanding to more teams.",
    outcome: "Confident production release with operating readiness.",
    checklist: [
      "Launch in a limited pilot environment",
      "Verify access control, permissions, and routing",
      "Train users on workflows and escalation behavior",
      "Expand progressively based on actual performance"
    ]
  },
  maintaining: {
    phase: "Phase 6",
    title: "Maintaining",
    summary:
      "Keep the portfolio healthy with regular updates, performance reviews, and a repeatable playbook for improving each workflow over time.",
    outcome: "A sustainable operating rhythm for all agents and automations.",
    checklist: [
      "Review usage, quality, and business outcomes regularly",
      "Refresh prompts, templates, and knowledge sources",
      "Fix defects and edge cases as they appear",
      "Retire or redesign weak performing workflows"
    ]
  },
  monitoring: {
    phase: "Phase 7",
    title: "Monitoring",
    summary:
      "Create continuous visibility into quality, latency, adoption, and error patterns so issues are detected before they become operational risk.",
    outcome: "Operational observability across the full portfolio.",
    checklist: [
      "Track completion rate, latency, and user satisfaction",
      "Capture failure modes and low-confidence responses",
      "Alert on risk signals and unusual behavior",
      "Correlate performance with business outcomes"
    ]
  },
  securing: {
    phase: "Phase 8",
    title: "Securing",
    summary:
      "Protect against data leakage, misuse, and unsafe automation with strong access boundaries, sensitive-data handling, and explicit safeguards.",
    outcome: "A controlled and defensible operating model for AI usage.",
    checklist: [
      "Restrict access to approved data and tools",
      "Protect secrets, tokens, and system identities",
      "Validate prompts and output against policy constraints",
      "Implement safe fallbacks and approval checkpoints"
    ]
  },
  governing: {
    phase: "Phase 9",
    title: "Governing",
    summary:
      "Institutionalize ownership, accountability, policy review, and portfolio management so the organization can scale from a handful of pilots to 40 or more agents without chaos.",
    outcome: "A governed AI portfolio with clear accountability and repeatable scale.",
    checklist: [
      "Define steering team roles and review cadences",
      "Set policy standards for quality, privacy, and risk",
      "Track ROI and business value by use case",
      "Establish a portfolio management model for future expansion"
    ]
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const footerText = document.querySelector(".site-footer p");
  if (footerText) {
    const year = new Date().getFullYear();
    footerText.textContent = `40 Boring Bots — a practical AI transformation proposal • ${year}`;
  }

  const stageButtons = document.querySelectorAll(".stage-button");
  const stageNumber = document.getElementById("stage-number");
  const stagePhase = document.getElementById("stage-phase");
  const stageTitle = document.getElementById("stage-title");
  const stageSummary = document.getElementById("stage-summary");
  const stageChecklist = document.getElementById("stage-checklist");
  const stageOutcome = document.getElementById("stage-outcome");

  function renderStage(stageKey) {
    const stage = deploymentStages[stageKey];
    if (!stage) return;

    stageButtons.forEach((button) => {
      const isActive = button.dataset.stage === stageKey;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    stageNumber.textContent = stageKey === "discovery" ? "01" : stageKey === "requirements" ? "02" : stageKey === "planning" ? "03" : stageKey === "building" ? "04" : stageKey === "deploying" ? "05" : stageKey === "maintaining" ? "06" : stageKey === "monitoring" ? "07" : stageKey === "securing" ? "08" : "09";
    stagePhase.textContent = stage.phase;
    stageTitle.textContent = stage.title;
    stageSummary.textContent = stage.summary;
    stageOutcome.textContent = stage.outcome;
    stageChecklist.innerHTML = stage.checklist.map((item) => `<li>${item}</li>`).join("");
  }

  stageButtons.forEach((button) => {
    button.addEventListener("click", () => renderStage(button.dataset.stage));
  });

  renderStage("discovery");
});
