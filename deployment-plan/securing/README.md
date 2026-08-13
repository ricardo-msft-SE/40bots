# Phase 8: Securing

## Objective
Protect data, identities, tools, and users from unauthorized access, leakage, unsafe actions, and prompt-based manipulation.

## Microsoft implementation
1. Threat-model each agent and record assets, trust boundaries, abuse cases, likely prompt-injection paths, sensitive operations, and human approval points.
2. Enforce Microsoft Entra ID authentication and least privilege. Use group-based access, managed identities, conditional access, and separate identities for deployment and runtime.
3. Restrict Foundry tools and actions to the minimum required. Require approval before high-impact writes, external communication, financial actions, or changes to system records.
4. Use Microsoft Purview sensitivity labels, DLP policies, retention, audit, and data-governance controls to keep sensitive content within approved boundaries.
5. Store secrets in an approved secret-management service such as Azure Key Vault. Never place tokens, connection strings, or production credentials in GitHub issues, prompts, or source files.
6. Add security tests for direct data requests, role confusion, cross-tenant access, malicious documents, prompt injection, tool misuse, excessive output, and unsafe fallback behavior.
7. Use GitHub Copilot for security review checklists, test-case generation, dependency review support, and documentation. Treat all generated code and recommendations as untrusted until reviewed.
8. Run pre-production security review and repeat it after material changes. Record findings, compensating controls, accepted risks, and remediation owners.

## Deliverables
- Threat model and control matrix.
- Entra ID and tool-permission evidence.
- Purview policy and audit evidence.
- Security test results and risk register.

## Exit gate
The agent has a bounded identity, bounded data and tool access, tested abuse cases, protected secrets, and an owner for every unresolved risk.
