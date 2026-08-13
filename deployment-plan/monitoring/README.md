# Phase 7: Monitoring

## Objective
Detect quality, reliability, adoption, security, and business problems early enough to protect users and outcomes.

## Microsoft implementation
1. Define a monitoring contract for every agent: availability, latency, error rate, completion rate, groundedness, citation quality, escalation rate, cost, and business outcome.
2. Use Microsoft Foundry evaluation and tracing capabilities to review model responses, tool calls, retrieval quality, and regression results. Establish thresholds that trigger review.
3. Send application and workflow telemetry to Azure Monitor and Application Insights where available. Use correlation IDs so a user request can be followed across the application, agent, and tool calls.
4. Create dashboards and alerts for failed requests, latency spikes, rising escalation, low-confidence responses, unusual usage, and failed integrations.
5. Use Microsoft Purview audit and activity information to review data access, policy exceptions, sensitive-data handling, and unusual access patterns.
6. Create an incident runbook with severity levels, owner, containment action, user communication, evidence collection, and rollback path.
7. Use GitHub Copilot to summarize incident timelines, draft KQL queries, propose test cases, and prepare remediation notes. Validate all queries and conclusions before use.
8. Review the dashboard weekly and the portfolio monthly. Feed recurring findings into requirements, building, security, and governance work items.

## Deliverables
- Agent scorecard and Azure Monitor dashboard.
- Alert rules and incident runbook.
- Foundry evaluation trend and regression record.
- Monthly portfolio review with actions.

## Working roles
- Service operations: owns alerts, incident response, and availability.
- AI quality lead: reviews Foundry evaluations, groundedness, relevance, and drift.
- Data governance lead: reviews Purview activity, policy exceptions, and access anomalies.
- Business owner: interprets whether technical performance is producing business value.

## Monitoring rhythm
Review alerts continuously, service health weekly, quality and cost monthly, and portfolio trends quarterly. Separate leading indicators such as latency, failed tools, and low-confidence responses from lagging indicators such as rework, customer satisfaction, and capacity released.

## Decision criteria
An alert must have an owner, threshold, severity, and action. Avoid dashboards that only display activity. Every metric should support a decision: investigate, contain, remediate, expand, pause, or retire.

## Exit gate
The team can identify a failing agent, determine the affected request path, contain the issue, notify the right owner, and prove the corrective action.
