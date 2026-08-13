# Phase 2: Requirements

## Objective
Turn each selected opportunity into a testable agent specification with explicit users, boundaries, data permissions, human handoffs, and success measures.

## Microsoft implementation
1. Create a requirements page or Azure DevOps work item for each use case. Use GitHub Copilot to draft the first version from the approved discovery brief.
2. Define the user personas, supported intents, out-of-scope requests, supported channels, and expected response style. Treat identity and role as trusted context, never as prompt text.
3. Inventory every required knowledge source and action. Confirm owners, refresh frequency, source permissions, and whether the agent should retrieve, summarize, or write data.
4. Use Microsoft Purview to confirm data classifications, sensitivity labels, retention rules, and approved access groups. Document which sources are prohibited.
5. Define the agent contract in Microsoft Foundry: instructions, tools, grounding sources, citation behavior, refusal behavior, escalation path, and maximum autonomy.
6. Write acceptance tests for normal requests, ambiguous requests, unsupported requests, prompt-injection attempts, missing permissions, and stale source content.
7. Set baseline measures: task completion, grounded-answer rate, citation accuracy, escalation rate, latency, user satisfaction, and estimated manual minutes saved.
8. Review the specification with the business owner, security, privacy, and operations representatives. Use GitHub Copilot to check that each requirement has a test or an owner.

## Deliverables
- One approved requirements specification per agent.
- Data and permission matrix.
- Acceptance-test catalog.
- KPI baseline and target values.

## Working roles
- Product owner: signs off on scope, outcomes, and acceptance criteria.
- Solution architect: converts requirements into Foundry, identity, retrieval, and integration decisions.
- Privacy and security reviewers: approve data handling, access, and escalation controls.
- Test lead: owns representative examples, adversarial cases, and regression evidence.

## Minimum specification
The specification should contain the agent purpose, supported intents, persona and channel, data sources, retrieval rules, tools, write permissions, refusal language, citation requirements, human handoff, retention expectations, KPIs, and named approvers. Each requirement should map to a test, control, or operational owner.

## Decision criteria
Reject vague requirements such as “answer questions better.” Replace them with observable behavior such as “answer the five approved intents using approved sources, provide citations, and escalate when confidence or permissions are insufficient.”

## Exit gate
No build work starts until scope, data boundaries, escalation behavior, acceptance tests, and accountable owners are approved.
