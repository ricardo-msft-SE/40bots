# Phase 9: Governing

## Objective
Run 40 agents as a managed portfolio with consistent standards, accountable owners, review evidence, and a clear path to scale or retirement.

## Microsoft implementation
1. Establish an AI portfolio board with business, engineering, security, privacy, compliance, data, and operations representation. Define decision rights and meeting cadence.
2. Maintain an agent registry in a governed system such as Azure DevOps, Dataverse, or SharePoint. Track owner, purpose, users, data classes, tools, environment, version, KPIs, risks, and lifecycle state.
3. Use Microsoft Foundry standards for naming, instructions, model selection, grounding, evaluation, deployment, versioning, and approval. Publish a reusable agent onboarding template.
4. Use Microsoft Purview as the governance evidence layer for data discovery, classification, lineage, retention, DLP, audit, and policy exceptions. Require evidence before production approval.
5. Use GitHub repositories, CODEOWNERS, pull requests, Actions, environments, and issue templates to standardize change control. Require reviews appropriate to the agent's risk tier.
6. Create quarterly scorecards covering value delivered, quality, adoption, incidents, cost, policy posture, and technical debt. Use GitHub Copilot to draft summaries from approved records for board review.
7. Define lifecycle states: proposed, assessed, building, pilot, production, paused, redesign, and retired. Require an owner and exit criteria for every transition.
8. Review the portfolio at least quarterly. Fund expansion where outcomes and controls are strong; pause agents with weak value, unresolved risk, poor quality, or no accountable owner.

## Deliverables
- Agent registry and risk-tier model.
- Governance charter and approval workflow.
- Standard templates for build, release, monitoring, and retirement.
- Quarterly portfolio scorecard and decisions.

## Working roles
- Portfolio board: sets standards, resolves exceptions, and allocates investment.
- Agent owner: remains accountable for purpose, outcomes, users, and lifecycle decisions.
- Platform owner: maintains the Foundry and GitHub delivery patterns.
- Risk and data owners: maintain policy evidence, risk acceptance, and review cadence.

## Portfolio operating rhythm
Run monthly operational reviews for incidents, quality, adoption, and cost. Run quarterly business reviews for value, risk, policy posture, technical debt, and lifecycle state. Keep the registry current enough that an approver can understand an agent without searching across project channels.

## Decision criteria
Scale patterns that demonstrate value with strong control evidence. Pause agents with unresolved risk or declining quality. Retire agents when the process changes, the source of truth moves, the owner leaves, or the economics no longer justify continued operation.

## Exit gate
The organization can answer what every agent does, who owns it, what data it uses, how it is controlled, whether it creates value, and when it should be changed or retired.
