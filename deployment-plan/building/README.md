# Phase 4: Building

## Objective
Implement agents using reusable patterns for grounding, tools, safety, evaluation, and human handoff.

## Microsoft implementation
1. Create the agent in Microsoft Foundry using the approved name, owner, instructions, model deployment, and environment. Keep configuration in source control where the chosen workflow supports it.
2. Add only the knowledge sources and actions approved in the requirements matrix. Use Azure AI Search or the approved Foundry grounding pattern for indexed content.
3. Configure retrieval boundaries, citations, refusal language, and escalation. Make the agent state what it does not know instead of inventing an answer.
4. Implement Entra ID authentication and authorization. Pass trusted user and role context from the application layer; do not allow the user to select their own access scope.
5. Use GitHub Copilot to accelerate scaffolding, adapters, tests, documentation, and repetitive code. Review generated code for permissions, data handling, error paths, and licensing.
6. Create evaluation cases in Microsoft Foundry for happy paths, edge cases, groundedness, relevance, safety, and tool failures. Store the cases beside the agent specification.
7. Run tests against representative and adversarial data. Confirm citations point to approved sources and that cross-persona or cross-department queries are denied.
8. Package the agent with a runbook, support contact, known limitations, prompt/version identifier, and rollback instructions. Open a pull request for technical and business review.

## Deliverables
- Working agent and approved integrations.
- Source-controlled prompts, configuration, and tests.
- Evaluation results and defect log.
- Support runbook and rollback plan.

## Working roles
- Agent engineer: builds the Foundry configuration, orchestration, retrieval, and tools.
- Application engineer: implements the user channel, identity flow, adapters, and telemetry.
- Data steward: validates source content, permissions, freshness, and citations.
- Reviewer: checks generated code, prompt changes, tests, and operational readiness.

## Build sequence
Build the narrowest useful path first, then add one source or tool at a time. After each addition, run the targeted evaluation set and inspect traces. Keep prompts, tool schemas, test data, and expected behaviors versioned together so a regression can be reproduced and rolled back.

## Decision criteria
Do not promote an agent because it produces fluent answers. Promote it only when it is grounded in approved data, respects identity boundaries, handles uncertainty, completes the intended workflow, and has evidence that a human can support it.

## Exit gate
The agent meets acceptance thresholds, uses only approved data and tools, and has passed business, security, and operational review in a non-production environment.
