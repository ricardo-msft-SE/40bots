# Phase 5: Deploying

## Objective
Release approved agents in controlled waves with verified identity, permissions, user readiness, and business rollback criteria.

## Microsoft implementation
1. Confirm the release checklist: approved pull request, Foundry evaluation results, Purview data review, security sign-off, owner, support route, and rollback plan.
2. Deploy the agent to a test or pilot environment using the organization's GitHub Actions workflow or approved Azure deployment process. Keep production credentials and configuration outside the repository.
3. Verify Microsoft Entra ID sign-in, group membership, managed-identity permissions, and least-privilege access with test accounts for every supported persona.
4. Run smoke tests through the intended user channel. Test grounding, citations, action execution, failure handling, escalation, rate limits, and unsupported requests.
5. Use Microsoft Purview to confirm that the production data boundary, labels, DLP rules, retention expectations, and audit evidence are in place before users are added.
6. Start with a limited pilot. Provide a short user guide, escalation route, feedback mechanism, and named support owner. Do not expand based only on technical availability.
7. Monitor the pilot against completion, quality, latency, incidents, adoption, and manual-effort measures. Use GitHub Copilot to draft release notes and summarize recurring support themes for human review.
8. Hold a go/no-go review. Expand by cohort or business unit only when quality and risk thresholds are met; otherwise pause, remediate, or roll back.

## Deliverables
- Production deployment record and smoke-test evidence.
- Pilot cohort and user communication.
- Purview control verification.
- Go/no-go decision with rollback outcome if needed.

## Working roles
- Release owner: coordinates the deployment, evidence, and go/no-go meeting.
- Business owner: confirms pilot users, expected outcomes, and adoption readiness.
- Operations owner: confirms support, incident handling, and rollback coverage.
- Security and data reviewers: confirm production access and policy controls.

## Pilot design
Use a defined cohort, a fixed observation period, and a baseline comparison. Collect user feedback alongside objective measures such as completion time, escalation, rework, citation quality, and incidents. Set expansion thresholds before the pilot begins so enthusiasm does not replace evidence.

## Decision criteria
Go forward when the agent meets quality and safety thresholds, users know when to rely on it, support can handle failures, and the business owner accepts residual risk. Pause or roll back when access is wrong, sources are unreliable, incidents exceed tolerance, or the intended outcome is not improving.

## Exit gate
The agent is live for an approved audience, support is ready, access is verified, and the pilot has evidence that the business outcome is improving without unacceptable risk.
