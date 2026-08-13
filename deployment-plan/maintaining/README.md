# Phase 6: Maintaining

## Objective
Keep each agent useful, accurate, supportable, and aligned with changing processes, data, policies, and models.

## Microsoft implementation
1. Assign a recurring service review in Planner, Azure DevOps, or the team's operating calendar. Include the business owner, technical maintainer, and data steward.
2. Review Foundry usage, evaluation results, feedback, failure modes, latency, model changes, and business KPIs at the agreed cadence.
3. Refresh knowledge sources through an owned process. Confirm that retired documents are removed or marked obsolete and that new content receives the correct Purview classification.
4. Review prompts, tools, connectors, and permissions through pull requests. Use GitHub Copilot to propose tests, update documentation, and identify affected code, but require owner approval.
5. Re-run the evaluation suite after any model, prompt, retrieval, data, policy, or integration change. Compare results with the previous approved version.
6. Track incidents and recurring edge cases. Create a defect, corrective action, or knowledge-source task rather than silently changing production behavior.
7. Review cost and usage trends. Right-size model deployments, remove unused resources, and retire agents that no longer create measurable value.
8. Re-certify each agent periodically. If a workflow cannot meet quality, safety, or ownership requirements, disable it, redesign it, or retire it through a documented change.

## Deliverables
- Service-review record and KPI trend.
- Updated knowledge and Purview classification evidence.
- Versioned change history and evaluation comparison.
- Retirement or redesign decision when applicable.

## Exit gate
Every production agent has a current owner, recent evaluation evidence, current source data, and a documented lifecycle decision.
