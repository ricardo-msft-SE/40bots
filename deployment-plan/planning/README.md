# Phase 3: Planning

## Objective
Design a repeatable delivery pattern for the portfolio, including environments, ownership, release gates, integration choices, and the sequence for the first wave.

## Microsoft implementation
1. Select a reference architecture for each agent type: Foundry agent, approved model deployment, grounded knowledge, action connectors, identity, telemetry, and human escalation.
2. Create separate development, test, and production resources or projects according to the organization's Azure landing-zone standards. Record region, network, quota, and data-residency decisions.
3. Define identity with Microsoft Entra ID. Use least-privilege groups and managed identities where supported. Map each agent to an owner, technical maintainer, and data steward.
4. Use Microsoft Purview to turn policy requirements into design controls: allowed data classes, retention, DLP expectations, audit evidence, and review frequency.
5. Create a GitHub repository structure with one folder per agent or capability, reusable prompt and evaluation templates, issue labels, pull-request reviewers, and CODEOWNERS.
6. Use GitHub Copilot to draft the implementation backlog, architecture decision records, test plans, runbooks, and release checklist. Require human review for generated artifacts.
7. Establish release gates: requirements approved, data access approved, tests passing, security review complete, operational owner assigned, and rollback plan documented.
8. Sequence wave 1 by learning value and risk. Deploy low-risk, high-volume use cases first, then reuse proven patterns for more complex agents.

## Deliverables
- Reference architecture and environment map.
- Portfolio RACI and delivery calendar.
- GitHub repository and branching/review model.
- Release-gate checklist and wave plan.

## Working roles
- Portfolio lead: owns sequencing, dependencies, and investment decisions.
- Platform team: owns Foundry resources, Entra integration, environments, and deployment paths.
- Governance lead: owns Purview evidence, policy interpretation, and risk-tier alignment.
- Engineering lead: owns reusable templates, CI/CD, test automation, and technical standards.

## Planning artifacts
Create one architecture decision record per reusable pattern, an environment matrix, a dependency map, a RACI, a wave backlog, and a release calendar. Define the minimum evidence required at discovery, build, pilot, production, and retirement so teams do not have to renegotiate the process for every agent.

## Decision criteria
Choose patterns that reduce variation across agents: shared identity, common evaluation, consistent logging, standard repository structure, and repeatable approval gates. Escalate exceptions rather than allowing every project to create its own operating model.

## Exit gate
The team can explain how an agent moves from a GitHub change to a tested Foundry deployment with documented approvals and rollback.
