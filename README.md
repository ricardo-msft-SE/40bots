# 40 Boring Bots

A practical proposal for identifying and prioritizing 40 AI agents, AI-powered workflows, and automation opportunities across an organization.

## Why this initiative matters

Most organizations do not need more AI hype. They need operational leverage. The 40 Boring Bots initiative is a disciplined portfolio approach to automating repetitive, costly, and error-prone work that is still being done manually.

This proposal focuses on a realistic set of opportunities that combine:

- AI chat assistants
- AI-enabled workflow automation
- document understanding and summarization
- routing and triage agents
- internal knowledge and policy access tools
- process optimization for high-volume operations

## Executive summary

The goal is not to deploy 40 chatbots for the sake of volume. The goal is to identify 40 meaningful opportunities, prioritize the best ones, and build a repeatable operating model for AI-enabled work.

This creates value through:

- lower operating cost
- faster processing cycles
- improved quality and consistency
- reduced employee burden from repetitive tasks
- better governance and accountability

## Local preview

From the repo root, run:

```bash
python -m http.server 8000
```

Then open http://localhost:8000 in a browser.

## GitHub Pages publishing

This site is set up to deploy automatically via GitHub Pages using a GitHub Actions workflow on pushes to the main branch.

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
