# 40 Boring Bots

A concise executive proposal for identifying, prioritizing, and scaling 40 practical AI agents and workflow automations across the organization.

## Why this initiative matters

Most organizations do not need more AI hype. They need operating leverage. The 40 Boring Bots initiative focuses on repetitive, costly, and error-prone work that is still being done manually.

This proposal targets high-value opportunities across:

- AI-assisted operations
- workflow automation
- document understanding and summarization
- routing and triage support
- internal knowledge and policy access
- process optimization for high-volume work

## Executive summary

The goal is not to deploy 40 chatbots for the sake of volume. The goal is to identify 40 meaningful opportunities, prioritize the strongest ones, and establish a repeatable operating model for AI-enabled work.

This creates value through:

- lower operating cost
- faster processing cycles
- improved quality and consistency
- reduced manual effort
- stronger governance and accountability

## Local preview

Install and build from the repo root (Node 22 or later):

```powershell
npm ci
npm run build
npm run preview
```

Then open http://localhost:8000, or http://localhost:8000/which-tool/ for the game.
The preview server binds only to this computer and serves JavaScript modules with the
correct MIME type, including on Windows. The original unbuilt landing page can also be
previewed directly (use the built preview above for the game):

```bash
python -m http.server 8000
```

Then open http://localhost:8000 in a browser.

## GitHub Pages publishing

This site is set up to deploy automatically via GitHub Pages using a GitHub Actions workflow on pushes to the main branch.
The workflow tests the recommendation/API logic, builds the browser assets, and publishes **only**
the static `dist` directory. Backend code, tests, developer dependencies, and local settings are not published.

## Which Tool Should I Use?

[`which-tool/`](which-tool/) is a water-utility-themed, projector-friendly tool-selection game.
Enter a fictional business outcome, pull the lever, and get a Microsoft AI starting point with
one to three explanations and official Microsoft source links. The wheel lands on the recommendation;
it does not select a random product.
The wheel's circular portrait stays upright while the tool segments spin.
The centered header logo reuses that portrait and links to TeamworkCowbell.com in a new tab.

Every choice other than Microsoft 365 Copilot includes a "Why not Microsoft 365 Copilot?"
bullet. The shared catalog supplies that comparison in both modes, retaining at most two
scenario explanations so the reveal never exceeds three bullets. Comparisons distinguish
specific experiences from the umbrella offering rather than claiming they are unrelated products.

The 12 choices include Microsoft 365 Copilot, Copilot Chat, Copilot Studio, Cowork, Code, Autopilot,
Agent Builder, GitHub Copilot, Microsoft Foundry, Copilot in Office Apps, Copilot Notebook
(officially Copilot Notebooks), and It Depends. These overlap: Microsoft 365 Copilot is an umbrella,
not a competing product independent of all the experiences inside it.

Autopilot is considered for ongoing monitoring of work channels and proactive updates while
the user is away, without requiring phrases such as "own identity" or "memory." One-off work
summaries, scheduled deliverables and explicitly built workflows remain distinct choices.
The same distinction is included in Live AI guidance. This is capability guidance, not a
promise of immediate notifications or tenant access; Autopilot's preview caveat still applies.

- **Offline rules** is the default and needs no backend. It uses weighted intent rules, handles
  reviewed utility examples and ambiguous cases, and keeps prompts in the browser. It has limited
  natural-language understanding; it is not an LLM.
- **Live AI** uses an authenticated Azure API and a configured model, grounded in the same curated
  Microsoft catalog. It offers more nuanced reasoning for arbitrary audience prompts. No runtime
  browsing, tenant-document access, or task execution occurs.
- If live mode is unconfigured, unavailable, invalid, or takes longer than 12 seconds, the page
  visibly explains the failure and labels its fallback as an **offline rules** result.
- Full screen, light/dark mode, keyboard controls, reset/cancellation, editable utility examples,
  reduced-motion support, and a readable product guide are included.
- Use fictional scenarios only. Do not enter personal information, credentials, or sensitive
  infrastructure details. This is educational guidance, not authority to operate utility systems.

The shared catalog in [`which-tool/catalog.mjs`](which-tool/catalog.mjs) records official source links,
product boundaries, caveats, and the verification date. Review it before each presentation:
Code is marked Frontier preview and Autopilot private preview based on the verified Microsoft sources.
No recommendation promises a feature is licensed or enabled in the customer's tenant.

### Enable Live AI

Follow [`api/README.md`](api/README.md). Live mode requires an Entra-authorized presenter,
an Azure Functions API, durable quota storage, and a compatible Azure OpenAI deployment in Microsoft Foundry.
No Azure resources are created by the site build. Keep all secrets and model configuration server-side.

Only public connection identifiers belong in [`which-tool/config.mjs`](which-tool/config.mjs).
Rebuild after changing that file. **Without this setup, only offline recommendations are available.**

The repository is now configured for the provisioned Azure API. After building and opening
the game, use Presenter setup to sign in as the authorized presenter. Offline rules remains
the default. Publishing the static frontend to GitHub Pages is a separate commit/push step.

### Validation

```powershell
npm ci
npm ci --prefix api
npm test
npm run build
npx playwright install chromium
npm run test:browser
npm run build:api
npm run test:packages
```

Node tests cover 48 reviewed recommendation scenarios, input/result contracts, wheel geometry,
JWT validation, durable quota contention, and API error paths. Chromium checks the actual wheel,
all 12 landing positions, projector font sizes, live-mode contracts using a mock API, accessibility
surfaces, fallback/reset behavior, and responsive layouts. Mocked live tests do **not** establish
real model quality or tenant access.
Package tests additionally verify that the published site excludes the API and that the
API deployment package contains its shared catalog and locked dependency manifest.

Before using a configured live model, review its choices on the same scenario set in
[`tests/core.test.mjs`](tests/core.test.mjs). Target at least 90% agreement with reviewed acceptable
choices (document valid overlapping alternatives), 100% valid output, and no unsupported product claims.
An authenticated real-service smoke test and this semantic review remain prerequisites for a live presentation.

## Detailed deployment plan

The interactive deployment visual links to a full implementation guide for each phase in [`deployment-plan/`](deployment-plan/):

- [`discovery/`](deployment-plan/discovery/README.md) — build and rank the opportunity inventory
- [`requirements/`](deployment-plan/requirements/README.md) — define scope, permissions, tests, and KPIs
- [`planning/`](deployment-plan/planning/README.md) — establish architecture, ownership, environments, and release gates
- [`building/`](deployment-plan/building/README.md) — implement grounded, tested, reusable agents
- [`deploying/`](deployment-plan/deploying/README.md) — release through a controlled pilot and go/no-go review
- [`maintaining/`](deployment-plan/maintaining/README.md) — operate, refresh, evaluate, and retire agents
- [`monitoring/`](deployment-plan/monitoring/README.md) — measure quality, reliability, adoption, and risk
- [`securing/`](deployment-plan/securing/README.md) — protect identities, data, tools, and users
- [`governing/`](deployment-plan/governing/README.md) — manage the 40-agent portfolio and lifecycle

Each guide uses Microsoft Foundry, Microsoft Purview, GitHub Copilot, and supporting Microsoft services where appropriate.

## Governance and risk posture

The proposal assumes AI governance is a first-class requirement, not a final layer.

Key controls include:

- business owner accountability for each agent
- data access boundaries and approvals
- human oversight for high-impact decisions
- logging, observability, and audit trails
- escalation paths for low-confidence outcomes
- privacy, security, and retention review
- explicit decision rules for where AI should not be used

## Governance and security story with Microsoft Agent 365, Purview, and Defender for Cloud

The Microsoft Agent 365 story is strongest when it is framed as a governed productivity platform, not simply a set of productivity features. Microsoft 365 agents can accelerate knowledge work, automate repetitive tasks, and connect employees to the systems they already rely on—but the trust model matters as much as the speed gain. The design must include explicit access controls, clear ownership, approved data sources, and review paths for any high-impact or sensitive workflow.

Examples for the 40-bots approach include:

- Use Agent 365 as the operational control plane: register each bot with an Entra Agent ID, owner, data classification, risk tier, and lifecycle state so the organization can manage 40 embedded agents as a portfolio rather than as 40 shadow AI projects; apply policy templates by class to separate low-risk knowledge bots from operational and high-risk financial or HR agents; and automate governance rules for missing owners, inactive agents, external endpoint calls, and sensitive tool changes.
- Use Purview to govern data boundaries: classify customer, employee, financial, and regulated content so each 40-bots use case knows which sources are allowed and which are prohibited; enforce retention and DLP rules so invoice, ticket, and knowledge agents cannot retain or share data beyond policy; and review unusual agent usage across the portfolio to support investigation and governance.
- Use Defender for Cloud to secure the agent platform: validate cloud configuration before each bot is deployed; harden SharePoint, Dataverse, and API connectors with least-privilege access; and prioritize the highest-risk configuration gaps across the 40-bot estate before scaling further.

Microsoft Purview provides the governance foundation. It helps organizations classify data, define retention and policy boundaries, review lineage and access patterns, and maintain evidence for compliance and risk review. That makes it easier to govern the agent estate as it grows from pilots to a broader portfolio.

Microsoft Defender for Cloud strengthens the security posture by continuously identifying risks in the cloud environment, tracking posture drift, and helping teams prioritize remediation. Together, these controls create the operating story: Microsoft 365 agents deliver value, Purview provides governance evidence, and Defender for Cloud helps keep the environment secure, resilient, and aligned to policy.

## Repo structure

- `index.html` — executive proposal landing page
- `styles.css` — visual design and responsive layout
- `script.js` — lightweight enhancement logic
- `which-tool/` — interactive Microsoft AI tool-selection game and shared evidence catalog
- `api/` — separately deployed authenticated live recommendation service
- `scripts/` — static-site build and API packaging
- `tests/` — recommendation and browser checks
- `.github/workflows/pages.yml` — GitHub Actions Pages deployment
- `.nojekyll` — prevents Jekyll processing on GitHub Pages

## Suggested use

This site is intended for leadership review, portfolio planning, and internal sponsorship discussions. The content can be updated as the opportunity list matures and as governance decisions are finalized.
