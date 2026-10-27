# Which Tool game: Azure configuration

Status: Deployed

## Private-network revision (approved and deployed)

The user selected planning a policy-compliant private network, with review before deployment.
The prior validation proof below applies only to the initial deployment, not this revision.
Retain the approved subscription, eastus2 region, presenter, existing model, and created resources.
The user approved preparation/validation, then explicitly approved the displayed resource
changes and added network cost before provisioning. Revision validation and deployment completed.

### Proposed architecture and boundaries

- Enable the existing template's private-network option rather than replace the backend.
  Add one isolated VNet in `rg-which-tool-game` with separate Function-integration and
  private-endpoint subnets. Existing template ranges are 10.0.0.0/16, 10.0.1.0/24 and
  10.0.2.0/24; check conflicts before use and retain no peering or on-premises connection.
  The existing `Microsoft.App/environments` delegation is correct for Flex Consumption.
- Add two storage private endpoints: blob (host and deployment package) and table (quotas).
  Add their private DNS zones, VNet links, and endpoint zone groups. Keep storage public
  networking and shared-key authentication disabled. Retain the current UAMI/RBAC.
- Integrate the existing Function with the delegated subnet, after endpoint/DNS readiness.
  Keep the Function's existing public HTTPS inbound endpoint and Entra presenter authorization:
  audience browsers need no VPN. Storage privacy does not mean making API ingress private.
- Keep existing model access and monitoring. Verify outbound access from the integrated
  Function to Entra/JWKS, the approved model endpoint and monitoring; do not assume storage
  private endpoints establish those paths.
- Use the supported Azure CLI Flex package deployment (underlying OneDeploy).
  Microsoft documents that push clients send to the app deployment endpoint, not directly
  to the storage container. Since app ingress remains public, a private build runner is
  not part of this initial scope. Verify the deployment service reaches storage through
  integration; if not, stop with diagnostics and obtain approval before adding resources.
- No VM, VPN gateway, Bastion, NAT gateway, firewall, new model, Function private endpoint,
  tenant policy exemption, or changes to unrelated networks are included.

### Cost scope

Two private endpoints incur ongoing hourly charges even when the game is idle, plus data
processing; two private DNS zones incur zone/query charges. Public USD retail rates verified:
Standard Private Endpoint (Global) USD 0.01/hour; Private DNS USD 0.50/zone/month and
USD 0.40/million queries (first tier). At 730 hours, incremental baseline is approximately
USD 15.60/month (USD 14.60 endpoints + USD 1.00 zones), excluding endpoint data processing,
DNS queries, taxes and existing Function/model/storage/monitoring charges. Actual agreement
pricing can differ. This is not a spending cap. Show pricing and actual resource changes
before provisioning; no gateway or runner without a separate scope/cost decision.

Pricing sources: [Private Link retail meters](https://prices.azure.com/api/retail/prices?$filter=productName%20eq%20%27Virtual%20Network%20Private%20Link%27),
[Private DNS retail meters](https://prices.azure.com/api/retail/prices?$filter=productName%20eq%20%27Azure%20DNS%27%20and%20skuName%20eq%20%27Private%27).

### Preparation evidence

- User approved preparation/validation only, with pricing and resource changes shown
  before provisioning. No private-network resources have been deployed.
- Microsoft.Network and Microsoft.App are Registered. eastus2 network usage:
  VNet 0/1,000; private endpoints 0/65,536. Planned addition: one VNet/two endpoints.
- Existing subscription VNet uses 10.44.0.0/16; planned 10.0.0.0/16 does not overlap.
  Existing blob/table private DNS zones are in another resource group; this revision
  creates isolated zones and does not change those existing zones or their links.
- Correct target Function identity confirmed: UAMI client ID
  5f088bd9-36a9-4922-bb13-bb704328c64c, principal bdd5dffc-1de6-472c-8c97-e2e7250452d9.
  Its VNet integration is currently null; inbound public access is Enabled.
- Local Bicep build and deployment-script parser passed. Static/API builds and two
  package-boundary tests passed sequentially. BCP318 template warnings remain.
- Isolated Publish preflight negative-path test passed: restricted storage with no
  Function integration throws the expected explicit error before npm, archiving or publishing.
- Initial ARM provider validation passed. Detailed what-if showed 11 resource creates,
  11 modifies, zero deletes and four unsupported dynamic role-assignment IDs.
  The helper's 25/20/6 summary incorrectly counted property-level changes and legend lines;
  use the actual resource summary, not those helper counts.
  Final what-if after retaining disabled Function client affinity has the same resource
  counts and no longer predicts a client-affinity change.

### Implementation todos and acceptance gates

1. Prepare private configuration in `infra/main.parameters.json` and inspect existing
   `infra/main.bicep`, `infra/app/api.bicep`, `infra/app/vnet.bicep`, and
   `infra/app/storage-PrivateEndpoint.bicep`. Change only wiring/order/settings that are needed.
   Ensure integration cannot race endpoint/DNS provisioning.
2. Update deployment preflight/documentation to detect effective network configuration
   and surface failures explicitly; do not retry an unchanged blocked package upload.
3. Revalidate Bicep, script parsing, affected package tests and ARM provider validation/what-if
   using the actual API audience. Check effective policy constraints, network capacity,
   Microsoft.Network/Microsoft.App registration, address ranges and DNS ownership.
   Existing resources may be modified; require no resource deletions/replacements.
4. Deploy the approved networking revision, confirm private endpoint approval and DNS,
   live RBAC, effective storage settings and integrated Function configuration. Verify
   storage data-plane reachability from the runtime, not the public workstation.
5. Publish code once network readiness is established; verify Function registration, CORS,
   token rejection, quota storage and real managed-identity inference. Keep frontend
   Live AI unconfigured if any required check fails.
6. Configure public browser IDs and validate presenter sign-in, actual inference and the
   reviewed semantic scenarios. Report mocked and live results separately. Rebuild static
   assets; do not commit, push or claim Pages publication without authorization.

### All validation checks pass (private-network revision)

Required checks before signoff:

- Core validation: CLI authentication, Bicep compilation, subscription provider validation
  and what-if using the actual API audience.
- Optional Bicep lint: build warnings reviewed; no errors.
- Azure Policy validation: applicable policies and effective network constraints reviewed.
- Build verification: static/API builds, package-boundary tests and script parser.
- Preflight behavior: disabled public storage without integration fails before package upload.
- Static role verification: retain UAMI blob/table/model/monitoring data-plane roles and scopes.

### Microsoft guidance

- [Secured storage with Functions](https://learn.microsoft.com/azure/azure-functions/configure-networking-how-to)
- [Flex subnet requirements](https://learn.microsoft.com/azure/azure-functions/functions-networking-options#subnets)
- [Flex package deployment and networking](https://learn.microsoft.com/azure/azure-functions/functions-deployment-technologies)
- [Private Link pricing](https://azure.microsoft.com/pricing/details/private-link/)

## 1. Scope

Configure the existing authenticated recommendation API and static game for live Azure inference.
Preserve GitHub Pages and the offline rules mode. Use the user's Azure CLI account.
No destructive actions or billable provisioning before the Azure target and cost scope are confirmed.

## 2. Current application

Existing Node 22 Azure Functions API, Entra bearer-token validation, Azure Table quotas,
managed-identity Azure OpenAI inference, and MSAL browser sign-in.

## 3. Azure context

- Subscription: ME-MngEnvMCAP535262-riwilki-1 (ee0073ce-de38-45ed-a940-4dbfd9435dc1).
- Tenant: ecb61531-f7e1-4390-9633-9213f6c9c05c.
- Region: eastus2.
- Reuse existing gpt-4.1 deployment on ohsupparfp-resource in rg-ohsupparfp; do not modify model configuration.
- Presenter: signed-in System Administrator (01400557-9d79-4eb0-939d-7034d2108ca5), the only allowed user.
- User explicitly approved this target, pay-per-use demo backend, and presenter.

## 4. Recipe and infrastructure

Standalone Bicep, adapted from the discovered Azure-Samples/functions-quickstart-javascript-azd
template at revision 12d91df. Direct ARM deployment preserves the existing static-site workflow
and custom API package layout without introducing a second build orchestrator.

- New isolated rg-which-tool-game (confirmed absent); Flex Consumption FC1, Node 22 (existing tested runtime).
- 512 MB per instance, maximum 40 instances (Flex minimum configured maximum), zero always-ready instances.
- One Standard LRS storage account for host/deployment blobs and quota tables; shared-key access disabled.
- One user-assigned managed identity with Blob Data Owner and Table Data Contributor on new storage,
  Monitoring Metrics Publisher on new Insights, and Cognitive Services OpenAI User on the reused model resource.
- Template monitoring: one workspace with 30-day retention and one AAD-authenticated Insights component.
- New single-tenant API and SPA registrations; no client secrets. Only the Recommend delegated scope,
  with user-specific consent for the approved presenter. Optional CLI verification was not configured:
  the tenant denied creation of the foreign CLI service principal. Use normal presenter browser sign-in.
- Frontend remains GitHub Pages at https://ricardo-msft-se.github.io/40bots/which-tool/.
- Quotas remain 10/minute and 100/day per presenter; budget is pay-per-use, not a guaranteed dollar cap.

Capacity evidence:

| Resource | Current | Add | Capacity/source |
|---|---:|---:|---|
| eastus2 storage accounts | 3 | 1 | Azure quota CLI: 250 limit; service usage: 3 |
| eastus2 Function apps/plans | 0 | 1 each | Flex region support and Node 22 runtime confirmed; Web quota CLI exposes no Flex memory entry |
| eastus2 managed identities | 1 | 1 | Two identities is well below documented regional/subscription service limits |
| subscription resource groups | 20 | 1 | 21 is below documented 980 resource-group limit |
| model deployments | existing | 0 | Reusing succeeded GlobalStandard gpt-4.1 with capacity 1225 |

Flex memory capacity is not exposed by the queried Web usage/quota API versions. Do not label
it provider-verified: ARM provider validation and deployment are the definitive checks.
Required Web/Storage/ManagedIdentity/Insights/OperationalInsights providers are Registered.

## 5. Preparation

Context and cost scope confirmed. Official template imported; secure identity-based settings,
model RBAC, and Entra setup script prepared. Browser configuration will receive actual public IDs
after registrations are created. Public model endpoint verified; network access Enabled/Allow.
Bicep compilation and script parsing passed. Existing 79 unit tests and static/API builds passed.
An initial packaging check raced the static build; rerun sequentially before validation signoff.

## 6. Deployment and verification

Complete azure-validate before deployment. Verify deployed authorization, quota storage,
model inference, browser sign-in, and live/offline behavior. Report actual verification limits.

### Initial deployment outcome (historical blocker, resolved below)

- Subscription deployment `which-tool-game` succeeded. Function app `func-api-s22u26y5fxeli`
  is Running; the resolved API address is
  https://func-api-s22u26y5fxeli.azurewebsites.net/api/recommend.
  This address is not a verified working API: code publication failed.
- ZIP publication failed with `BlobUploadFailedException`, HTTP 403. No successful API
  publication, authorized inference, browser authentication, or semantic evaluation is established.
- Effective storage `sts22u26y5fxeli` has `publicNetworkAccess: Disabled`, despite the
  successful deployment requesting `Enabled` with `vnetEnabled: false`. Successful
  `policies/modify` events immediately preceded the storage write. There are no private
  endpoints, so the provisioned network configuration cannot support package access.
- The exact UAMI has Storage Blob Data Owner and Storage Table Data Contributor on storage;
  missing blob RBAC is not the observed cause. Shared-key authentication remains disabled.
- Do not override policy, enable shared keys, or retry this unchanged deployment.
  A policy-compliant private-network design requires separate scope/cost approval and
  renewed validation, including blob/table private endpoints, DNS, Function VNet integration,
  and deployment-service connectivity to private storage. A private runner is required
  if app ingress is also made private, not automatically for private storage alone.
- Public browser configuration remains blank intentionally; offline rules remain available.
  No GitHub Pages publication, commit, or push was performed.

### Private-network recovery and live verification

- Approved subscription deployment `which-tool-game` completed successfully with the
  private-network revision; no resource deletions were performed.
- Blob/table private endpoints are Approved with IPs 10.0.1.4 and 10.0.1.5.
  Their private DNS A records, zone groups and VNet links succeeded. Function integration
  is configured on the delegated app subnet; API public ingress remains Enabled.
  Client affinity remains false, storage public networking Disabled and shared keys false.
- Live RBAC query confirmed the UAMI's resource-scoped storage blob/table, Insights
  Metrics Publisher and reused model OpenAI User roles. No additional inference identity,
  VM, gateway, policy exemption or client secret was introduced.
- API ZIP publication completed successfully after networking. `recommend` is registered.
  Correct allowed-origin preflight returns 204 with allow-origin/method/header values;
  missing presenter bearer returns 401 `sign_in_required`.
  Final platform CORS and application POST checks share the same explicit allowlist.
- The approved presenter completed normal browser sign-in. A real request returned
  a valid Live AI Cowork recommendation for a maintenance-briefing workflow. This exercises
  actual JWT authorization, quota-table transactions and managed-identity model inference.
  Browser showed catalog citations and at most three explanation bullets.
- Public connection identifiers saved in `which-tool/config.mjs`; redirect derives the
  current page directory for the two registered origins. Offline rules remains default.
- Final `npm test`: 79 passed; static/API builds passed; package tests: 2 passed;
  Chromium: 92 assertions passed. Browser tests explicitly isolate their unconfigured
  case from saved Azure settings and mock inference; the presenter request above is real.
- Added a MIME-safe local preview (`npm run preview`): Python's Windows MIME mapping
  served `.mjs` as text/plain and blocked execution. Verified module MIME, HEAD, method
  rejection, missing files and path traversal. Preview serves only built static assets.
- Actual 48-scenario live evaluation completed after the quality correction, as recorded
  below. No static Pages publication or commit/push has been performed.

### Live quality iteration

The initial 48-scenario sweep completed with 41 exact reviewed-choice matches.
Forty responses were valid live results; four safety scenarios correctly returned 422.
Two requests timed out and two model outputs were rejected; three valid responses
selected Chat instead of the reviewed choice. This does not meet the 90% target.
The model sometimes invented a presentation goal for terse requests.

Backend-only correction: distinguish the interface's presentation setting from the
requested work, require clarification for vague/multiple outcomes, emphasize curated-reference
Notebook boundaries, shorten bullets with validation headroom, reinforce allowed source IDs,
and set temperature to zero. Do not change quotas, authorization, deadlines or infrastructure.
Before another sweep, accept Chat as a valid alternative for the dinner-recipe scenario:
it is general conversational assistance, not outside Chat's documented capabilities.
Keep the original exact-choice score separately rather than hiding that overlap.

The corrected model was published and the full 48-scenario sweep repeated:
47/48 exact choices (97.9%), 48/48 accepted choices including the pre-reviewed recipe/Chat
alternative. All 44 model responses passed schema, bullet limits and catalog source
membership; all four operational-control cases were rejected with 422 before inference.
No timeout or invalid model output occurred in this sweep. This is measured demo evidence,
not a guarantee about future prompts or every factual statement in generated reasoning.
The two sweeps reserved 88 daily model requests in total; manual presenter spins also count
toward the unchanged 100/day quota, which resets at UTC midnight.

### Platform CORS correction

Exact external curl preflights exposed platform interception: OPTIONS returned 204
without CORS headers even though application-level POST carried the correct headers.
The earlier browser smoke test alone did not establish browser-independent preflight.
Configure platform CORS in the existing Function module with the same two explicit
origins and `supportCredentials: false`; preserve the application's JWT/origin checks.
This changes no audience, model, quota or paid-resource scope. Revalidate before updating
the deployed configuration, then verify raw OPTIONS headers, not only a browser fetch.

The validated configuration was deployed successfully. Live platform CORS now contains
exactly the two approved origins, credentials false. Raw preflight for each origin returned
204, the exact allow-origin, POST method and authorization/content-type headers.
Disallowed-origin preflight returned no allow-origin. Invalid-bearer POST returned
401 `invalid_token`; disallowed-origin POST returned 403 `origin_denied`.
After this final deployment, the signed-in presenter UI returned HTTP 200, Live AI mode,
Copilot Notebook and three bullets. No further cloud changes are pending.

## 7. Validation proof

### Private-network revision

Final platform-CORS revision validation completed 2026-10-27T03:34:32Z (UTC):
the full shared helper passed CLI/authentication, Bicep compilation, provider validation
and what-if. Actual JSON preview confirms no resource creates/deletes and a Function
`properties.siteConfig.cors` addition with exactly the two approved origins and
`supportCredentials: false`. Authorization, roles, private storage and costs are unchanged.
Workflow actions through StaticRoleVerification completed; RecordProof is populated here.
Existing local verification remains 80 unit/API tests, two package tests and 92 Chromium
assertions. Real service quality results are recorded above separately from mock tests.

Backend-only quality correction validation: `npm test` passed 80 tests (including the new
model-adapter test for stable sampling, strict schema and scenario isolation), API package
build passed, and both package tests passed. Infrastructure is unchanged from the fully
validated/deployed revision below. Republish code only, then repeat actual quality evaluation.

Actual revision checks completed 2026-10-27T02:30:28Z (UTC):

- Azure validation workflow: LoadPlan, AddValidationSteps, RunValidation,
  BuildVerification, StaticRoleVerification, RecordProof and ResolveErrors actions completed;
  final status set only after actual checks passed.
- Shared `validate-deployment.ps1 -Scope sub -Location eastus2 -Template infra/main.bicep
  -Parameters .azure/private-network.parameters.json -Subscription
  ee0073ce-de38-45ed-a940-4dbfd9435dc1` returned OVERALL PASS, including final Bicep
  compilation, provider validation and what-if. The temporary parameter file used
  the real API audience and private networking enabled.
- Final `az deployment sub what-if --no-pretty-print` JSON inspected at resource level:
  11 Create, 11 Modify, 0 Delete, 2 NoChange and 4 Unsupported dynamic role IDs.
  Creates: one VNet/two subnets, two endpoints/two zone groups, two DNS zones/two links.
  Required modifications: Function integration and storage Deny/None network ACLs.
  Other predicted changes are existing template/API default normalization on the plan,
  Insights, storage child resources, identity and presenter role IDs. App settings use
  unresolved reference/union expressions. No model deployment modifications are planned.
  What-if is incomplete for four existing UAMI role IDs because they depend on runtime
  identity references; unchanged static roles/scopes were directly reviewed.
- Known policy enforcement is honored explicitly: storage public networking Disabled,
  shared keys disabled, private blob/table connectivity planned. Policy assignment query
  succeeded (three subscription-scope records); private-link definition inspected.
  Provider validation reported no policy denial. This does not guarantee eventual
  compliance or data-plane reachability; verify effective state after approved deployment.
- Static/API builds and two package-boundary tests passed sequentially.
  PowerShell AST parse passed. Restricted-storage/no-integration mock preflight passed,
  with no npm/archive/publish reached. Bicep BCP318 inherited warnings remain.
- Static RBAC: same resource-scoped UAMI Blob Data Owner, Table Data Contributor,
  Monitoring Metrics Publisher and Cognitive Services OpenAI User. Managed-identity
  client/credential settings retained. No client secrets or storage keys introduced.
- No networking resources were created during preparation/validation. Existing backend
  remains blocked until this revision is approved/deployed. Live auth/inference and
  runtime DNS/egress are still unverified; browser configuration remains intentionally blank.
- Public retail estimate: two global Standard Private Endpoint meters at USD 0.01/hour
  plus two Private DNS zones at USD 0.50/month = approximately USD 15.60/month at 730 hours,
  excluding variable charges and existing services. Confirm actual agreement pricing.

### Initial deployment validation (historical)

Validated checks completed 2026-10-27T01:53:30Z (UTC):

- Azure CLI authentication/subscription confirmed.
- `az bicep build --file infra/main.bicep`: passed; nullable conditional-resource warnings inherited from template only.
- Azure validation helper, subscription scope/eastus2: ARM provider validation passed; what-if passed,
  14 Create / 0 Modify / 0 Delete. Existing model configuration is not changed.
- Applicable policy assignments queried successfully (3 assignments); provider validation reported no policy denial.
- PowerShell parser checks for identity and deployment scripts: passed.
- `npm test`: 79 passed.
- `npm run build`, `npm run build:api`: passed, run sequentially.
- `npm run test:packages`: 2 passed.
- `npm run test:browser`: 92 assertions passed.
- Static RBAC review: UAMI has Blob Data Owner and Table Data Contributor on the new storage;
  Metrics Publisher on new Insights; Cognitive Services OpenAI User only on reused model account.
  Host/deployment endpoints specify UAMI client ID and managedidentity credential;
  SDK uses AZURE_CLIENT_ID. No shared keys or client secrets.
- The presenter receives storage/metrics roles only on new resources and a user-specific
  Recommend consent grant for the SPA (not directory/Microsoft 365 data permissions).
  Optional CLI verification consent was not configured because tenant permission was denied.
- Remaining runtime checks are post-deployment: role propagation, live inference, token exchange and browser sign-in.

All validation checks pass:
- Core validation: CLI authentication, Bicep build, subscription-scope provider validation, and what-if.
- Azure Policy validation: inspect applicable assignments and provider validation for policy denials.
- Build verification: 79 unit tests, static build, API package build, 2 package tests, and Chromium checks.
- Static role verification: identity/storage/model/monitoring relationships and scopes.

The parameter file contains a fail-closed zero GUID only for pre-provisioning validation.
Deployment must explicitly override apiAudience with the real newly created API application client ID.
