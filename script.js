const deploymentStages = {
  discovery: {
    phase: "Phase 1",
    title: "Discovery",
    planPath: "deployment-plan/discovery/README.md",
    executive:
      "Discovery turns a broad AI ambition into an investment thesis. Leaders leave this phase with a small set of business problems worth solving, accountable owners, and enough evidence to decide where the first wave should begin.",
    summary:
      "Map the work, identify the highest-value opportunities, and prioritize the use cases most likely to create measurable productivity gains with manageable risk.",
    outcome: "A validated shortlist of use cases and ownership.",
    checklist: [
      "Audit business processes and repetitive tasks",
      "Interview teams about pain points and handoffs",
      "Assess workflow volume, complexity, and error rates",
      "Rank opportunities by value, feasibility, and risk"
    ],
    tools: [
      "Microsoft Foundry to map opportunity scenarios and agent personas",
      "Microsoft Purview to inventory data sources and sensitivity labels",
      "GitHub Copilot to draft discovery notes, use-case summaries, and decision memos"
    ]
  },
  requirements: {
    phase: "Phase 2",
    title: "Requirements",
    planPath: "deployment-plan/requirements/README.md",
    executive:
      "Requirements convert enthusiasm into a contract. The organization agrees what each agent may do, what it must refuse, which data it may use, how humans stay accountable, and how success will be measured.",
    summary:
      "Translate the best opportunities into clear scope, business rules, success metrics, and operational guardrails before any build starts.",
    outcome: "Well-defined requirements with measurable acceptance criteria.",
    checklist: [
      "Define user personas and business outcomes",
      "Document required data sources and permissions",
      "Capture escalation, exception, and approval rules",
      "Set success metrics for speed, quality, and cost"
    ],
    tools: [
      "Microsoft Foundry to define agent instructions, personas, and workflow boundaries",
      "Microsoft Purview to validate classification, retention, and data-access rules",
      "GitHub Copilot to generate requirement specs, acceptance criteria, and user stories"
    ]
  },
  planning: {
    phase: "Phase 3",
    title: "Planning",
    planPath: "deployment-plan/planning/README.md",
    executive:
      "Planning makes the portfolio repeatable. Instead of designing 40 one-off projects, the team establishes a common Microsoft architecture, delivery model, ownership structure, and approval path that can be reused wave after wave.",
    summary:
      "Create the rollout structure, sequence the work, and set governance practices so each agent is introduced with a clear operating model.",
    outcome: "A phased delivery plan with owners, milestones, and controls.",
    checklist: [
      "Prioritize the first 10 to 15 use cases",
      "Define architecture, integration points, and data flow",
      "Assign delivery owners for design, implementation, and support",
      "Establish review gates for quality and risk"
    ],
    tools: [
      "Microsoft Foundry to design agent architecture and deployment patterns",
      "Microsoft Purview to review compliance, sensitivity, and governance requirements",
      "GitHub Copilot to create implementation backlog, issue tracking notes, and release plans"
    ]
  },
  building: {
    phase: "Phase 4",
    title: "Building",
    planPath: "deployment-plan/building/README.md",
    executive:
      "Building is where the approved business case becomes a controlled product. Teams use Foundry to compose the agent, Purview to keep data boundaries visible, and GitHub Copilot to accelerate delivery without outsourcing engineering judgment.",
    summary:
      "Develop the agents, workflows, prompt patterns, and integrations in a way that is reusable, transparent, and easy to test in production-like conditions.",
    outcome: "Working agents with tested patterns and reusable components.",
    checklist: [
      "Build the user experience and workflow logic",
      "Connect to approved data sources and tools",
      "Define fallback responses and human handoff paths",
      "Test prompt quality, citations, and reliability"
    ],
    tools: [
      "Microsoft Foundry to build and iterate agent prompts, tools, and retrieval patterns",
      "Microsoft Purview to enforce data handling rules and detect sensitive content flows",
      "GitHub Copilot to accelerate code generation, unit tests, and documentation across the build"
    ]
  },
  deploying: {
    phase: "Phase 5",
    title: "Deploying",
    planPath: "deployment-plan/deploying/README.md",
    executive:
      "Deployment is a business decision, not a button press. A limited pilot proves that the agent is useful, accessible, supportable, and safe before the organization expands it to a larger audience.",
    summary:
      "Roll out the agents in controlled waves, start with high-confidence use cases, and validate business impact before expanding to more teams.",
    outcome: "Confident production release with operating readiness.",
    checklist: [
      "Launch in a limited pilot environment",
      "Verify access control, permissions, and routing",
      "Train users on workflows and escalation behavior",
      "Expand progressively based on actual performance"
    ],
    tools: [
      "Microsoft Foundry to stage, test, and deploy approved agent experiences",
      "Microsoft Purview to validate policy enforcement and audit readiness before rollout",
      "GitHub Copilot to support release checklists, runbooks, and deployment documentation"
    ]
  },
  maintaining: {
    phase: "Phase 6",
    title: "Maintaining",
    planPath: "deployment-plan/maintaining/README.md",
    executive:
      "Maintenance protects the value of the portfolio after launch. Each agent receives an operating rhythm for data refresh, evaluation, defect correction, cost review, and retirement when its business case no longer holds.",
    summary:
      "Keep the portfolio healthy with regular updates, performance reviews, and a repeatable playbook for improving each workflow over time.",
    outcome: "A sustainable operating rhythm for all agents and automations.",
    checklist: [
      "Review usage, quality, and business outcomes regularly",
      "Refresh prompts, templates, and knowledge sources",
      "Fix defects and edge cases as they appear",
      "Retire or redesign weak performing workflows"
    ],
    tools: [
      "Microsoft Foundry to refine prompt, retrieval, and orchestration logic over time",
      "Microsoft Purview to monitor policy drift and classify new data states",
      "GitHub Copilot to propose code changes, patch notes, and maintenance documentation"
    ]
  },
  monitoring: {
    phase: "Phase 7",
    title: "Monitoring",
    planPath: "deployment-plan/monitoring/README.md",
    executive:
      "Monitoring turns agent behavior into management information. Leaders can see whether the portfolio is delivering quality and capacity, while operators can detect failures, drift, and risk before they become expensive incidents.",
    summary:
      "Create continuous visibility into quality, latency, adoption, and error patterns so issues are detected before they become operational risk.",
    outcome: "Operational observability across the full portfolio.",
    checklist: [
      "Track completion rate, latency, and user satisfaction",
      "Capture failure modes and low-confidence responses",
      "Alert on risk signals and unusual behavior",
      "Correlate performance with business outcomes"
    ],
    tools: [
      "Microsoft Foundry to evaluate agent performance, prompt quality, and output consistency",
      "Microsoft Purview to review data-access patterns and policy exceptions over time",
      "GitHub Copilot to summarize incidents, draft remediation notes, and support issue triage"
    ]
  },
  securing: {
    phase: "Phase 8",
    title: "Securing",
    planPath: "deployment-plan/securing/README.md",
    executive:
      "Security establishes the trust boundary for every agent. Identity, data access, tools, secrets, and high-impact actions are deliberately constrained so scale does not create an uncontrolled path into organizational systems.",
    summary:
      "Protect against data leakage, misuse, and unsafe automation with strong access boundaries, sensitive-data handling, and explicit safeguards.",
    outcome: "A controlled and defensible operating model for AI usage.",
    checklist: [
      "Restrict access to approved data and tools",
      "Protect secrets, tokens, and system identities",
      "Validate prompts and output against policy constraints",
      "Implement safe fallbacks and approval checkpoints"
    ],
    tools: [
      "Microsoft Foundry to enforce safe agent behaviors and approval flows",
      "Microsoft Purview to classify sensitive data, monitor DLP, and assess governance controls",
      "GitHub Copilot to generate security checklists, guardrail notes, and code review prompts"
    ]
  },
  governing: {
    phase: "Phase 9",
    title: "Governing",
    planPath: "deployment-plan/governing/README.md",
    executive:
      "Governance converts a collection of projects into an institutional capability. The portfolio board can compare value, risk, cost, and control evidence across all 40 agents and make disciplined decisions about investment, pause, or retirement.",
    summary:
      "Institutionalize ownership, accountability, policy review, and portfolio management so the organization can scale from a handful of pilots to 40 or more agents without chaos.",
    outcome: "A governed AI portfolio with clear accountability and repeatable scale.",
    checklist: [
      "Define steering team roles and review cadences",
      "Set policy standards for quality, privacy, and risk",
      "Track ROI and business value by use case",
      "Establish a portfolio management model for future expansion"
    ],
    tools: [
      "Microsoft Foundry to manage agent lifecycle, deployment standards, and scorecards",
      "Microsoft Purview to maintain governance posture, policy oversight, and compliance reporting",
      "GitHub Copilot to draft governance docs, templates, and operating procedures for the portfolio"
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
  const stageExecutive = document.getElementById("stage-executive");
  const stageChecklist = document.getElementById("stage-checklist");
  const stageTools = document.getElementById("stage-tools");
  const stagePlanLink = document.getElementById("stage-plan-link");
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
    stageExecutive.textContent = stage.executive;
    stageOutcome.textContent = stage.outcome;
    stagePlanLink.href = stage.planPath;
    stagePlanLink.innerHTML = `Open the detailed ${stage.title} plan <span aria-hidden="true">&#8594;</span>`;
    stageChecklist.innerHTML = stage.checklist.map((item) => `<li>${item}</li>`).join("");
    stageTools.innerHTML = stage.tools.map((tool) => `<li>${tool}</li>`).join("");
  }

  stageButtons.forEach((button) => {
    button.addEventListener("click", () => renderStage(button.dataset.stage));
  });

  renderStage("discovery");
});
