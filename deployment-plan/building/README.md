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

## Exit gate
The agent meets acceptance thresholds, uses only approved data and tools, and has passed business, security, and operational review in a non-production environment.
