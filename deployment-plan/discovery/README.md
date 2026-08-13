# Phase 1: Discovery

## Objective
Create a ranked inventory of business opportunities for 40 agents. Start with work that is repetitive, measurable, bounded, and safe to assist or automate.

## Microsoft implementation
1. Create a portfolio workspace in Microsoft Planner or Azure DevOps. Add one work item per candidate process and assign a business owner.
2. Run interviews and process walk-throughs with subject-matter experts. Use GitHub Copilot to turn notes into a consistent opportunity brief with: problem, users, volume, current effort, systems, risks, and desired outcome.
3. Map data sources and owners. Use Microsoft Purview Data Map and data catalog capabilities to identify SharePoint, OneDrive, Dataverse, SQL, and file-based sources.
4. Review sensitivity labels, access groups, retention requirements, and known data-quality issues in Microsoft Purview. Record the evidence in the opportunity brief.
5. Classify each opportunity as retrieval, drafting, classification, routing, workflow automation, or decision support. Use Microsoft Foundry to validate that an agent pattern is appropriate.
6. Score each candidate from 1 to 5 for value, feasibility, data readiness, risk, adoption effort, and measurable outcome. Keep the scoring in a shared table so decisions are auditable.
7. Select the first wave of 10 to 15 opportunities. Reject or defer candidates that require unrestricted data access, fully autonomous high-impact decisions, or unavailable integrations.
8. Use GitHub Copilot to draft the discovery decision memo and a backlog of follow-up questions. Have the business owner approve the final shortlist.

## Deliverables
- Opportunity inventory with owner, users, systems, volume, value, and risk.
- Data-source and sensitivity map from Purview review.
- Scored shortlist for wave 1.
- Decision memo documenting included, deferred, and rejected use cases.

## Exit gate
Every selected use case has a named owner, a measurable business outcome, identified data sources, and an initial risk classification.
