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

From the repo root, run:

```bash
python -m http.server 8000
```

Then open http://localhost:8000 in a browser.

## GitHub Pages publishing

This site is set up to deploy automatically via GitHub Pages using a GitHub Actions workflow on pushes to the main branch.

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

## Repo structure

- `index.html` — executive proposal landing page
- `styles.css` — visual design and responsive layout
- `script.js` — lightweight enhancement logic
- `.github/workflows/pages.yml` — GitHub Actions Pages deployment
- `.nojekyll` — prevents Jekyll processing on GitHub Pages

## Suggested use

This site is intended for leadership review, portfolio planning, and internal sponsorship discussions. The content can be updated as the opportunity list matures and as governance decisions are finalized.
