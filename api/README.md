# Live recommendation API

This optional Azure Functions v4 / Node 22 API recommends a tool; it does not execute the
user's task or connect to Microsoft 365 data. The game works in Offline rules mode without it.

## Architecture

The browser signs the presenter in through MSAL and calls `POST /api/recommend` with a
delegated Entra bearer token and `{"prompt":"a fictional work scenario"}`. The API:

1. Checks the exact Origin against an allowlist.
2. Verifies the JWT signature, tenant-specific v2 issuer, audience, expiry, required
   delegated scope, and an allowlist of presenter user object IDs. Function `authLevel`
   is anonymous only because application code performs bearer validation; no anonymous
   inference is allowed.
3. Enforces a 12 KB request-body ceiling and a nonblank prompt of at most 2,000 characters.
   A conservative shared safety-intent gate rejects operational-control requests with HTTP 422
   before model inference; the page explicitly falls back to the rules-based It Depends guidance.
4. Atomically reserves both minute/day quotas in Azure Table Storage using ETags and a
   same-partition transaction. Defaults: 25 requests/minute and 700/day, per presenter.
   Failed model calls also count to prevent unlimited retries from increasing cost.
   Minute windows follow UTC clock minutes; daily windows reset at UTC midnight.
   Raising a limit preserves requests already counted in the current window.
5. Makes one bounded Azure OpenAI chat-completions request, with the shared curated
   tool catalog and a strict structured-output schema. There are no tools, browsing,
   agents, file uploads, or vector stores.
6. Validates the selected tool, 1-3 bullets of at most 160 characters, and 1-2 relevant
   source IDs. Model-provided URLs, availability, and mode are not trusted.

Successful responses are top-level `{toolId, bullets, sourceIds, availabilityNote, mode:"live"}`.
Shared result enrichment reserves the last bullet for a catalog-controlled "Why not
Microsoft 365 Copilot?" comparison whenever another choice wins, including It Depends.
It retains up to two scenario explanations and is idempotent when the browser enriches
the API result again. Microsoft 365 Copilot selections keep their original bullets.
Errors return `{error:{code,message,requestId}}` from the request handler.
The browser uses catalog URLs and displays live failures and rules fallback explicitly.

## Provisioned game environment

- API: https://func-api-s22u26y5fxeli.azurewebsites.net/api/recommend
- Resource group: `rg-which-tool-game`, eastus2.
- Hosting: Node 22 Flex Consumption, managed identity, no always-ready instances.
- Storage: public networking/shared keys disabled; private blob/table endpoints and DNS
  through the Function's isolated VNet integration. API ingress remains public HTTPS,
  but only the approved Entra presenter can request inference.
- Model: existing `gpt-4.1` deployment on `ohsupparfp-resource`; model settings were not changed.
- Repository browser configuration contains the public connection IDs. Start in Offline
  rules, open Presenter setup, then sign in to use Live AI. The blank redirect setting
  derives the page's directory; both localhost and GitHub Pages redirects are registered.
- Estimated added network baseline: about USD 15.60/month at 730 hours, excluding endpoint
  traffic, DNS queries, taxes and existing hosting/model/storage/monitoring costs.

An authenticated presenter browser request returned a real Live AI recommendation.
After a prompt-quality correction, a 48-scenario live sweep achieved 47 exact choices
and 48 accepted choices (Chat was a valid alternative for the recipe scenario).
All 44 model responses passed output/catalog validation; four operational-control
scenarios were rejected before inference. Future model responses can still vary.
During setup, the two evaluation sweeps used 88 model requests under the original
100/day limit; the current limit is 700/day. Manual spins also count; offline mode remains available.
Provisioning and publishing do not publish the static frontend to GitHub Pages:
rebuild and use the repository's normal authorized commit/push workflow separately.

## Azure setup (requires explicit deployment approval)

Use your existing Azure CLI login when inspecting resources or deploying. First confirm
the subscription, region, cost limits, and authorized presenter accounts. Reuse an existing
compatible model deployment if possible. No setup script here creates resources automatically.

Required resources/configuration:

- A Node 22 Azure Functions app with a managed identity and HTTPS. Use a supported plan;
  for Linux Consumption plan transitions, follow current Azure hosting guidance.
- A compatible Azure OpenAI chat-completions deployment in Microsoft Foundry, with strict
  JSON-schema structured outputs. This implementation uses the resource endpoint such as
  `https://RESOURCE.openai.azure.com`, **not** a Foundry project endpoint. Default API version
  is `2024-10-21`; configure a supported version for your deployment. The model must accept
  `max_completion_tokens`, `response_format: json_schema`, and `store: false`.
  The managed identity needs **Cognitive Services OpenAI User** on that model resource.
- An Azure Storage account for quota tables. The API identity needs
  **Storage Table Data Contributor** on the quota storage account. This is separate from
  Functions host-storage requirements; configure host storage according to your selected plan.
  Quota rows contain presenter object ID, UTC day/minute, and counters only. They are not prompts.
  Table Storage has no automatic TTL; use an administrator-controlled retention job to remove
  old quota partitions according to your organization's policy.
- An Entra **API app registration**, single tenant, exposing a delegated scope named
  `Recommend`. Set `api.requestedAccessTokenVersion` to `2` in its manifest. Set the API
  audience to its application client ID (GUID), not the `api://` scope URI.
- A separate **SPA app registration**, single tenant, with delegated permission
  `api://API-CLIENT-ID/Recommend` and appropriate consent. Register exact SPA redirect URIs:
  e.g. `https://ACCOUNT.github.io/40bots/which-tool/` and `http://localhost:8000/which-tool/`.
  Do not create a client secret for the SPA. Authorize only intended presenters with
  `PRESENTER_OBJECT_IDS`; do not put all audience members on that list.

Both JWT authorization and origin validation happen in code. The infrastructure also configures
platform CORS with the same exact origins and no credentialed CORS, because the platform can
intercept OPTIONS before application code. Verify proper browser preflight allows
Authorization/Content-Type, followed by application JWT validation on POST.
Do not enable wildcard credentialed CORS or require a function key in the browser.
Platform Easy Auth is not required for this code; if enabled, it must permit valid bearer requests
and anonymous preflight without redirecting the API to HTML sign-in.

Set server settings from [`local.settings.example.json`](local.settings.example.json). The example
contains placeholders only. `ALLOWED_ORIGINS` uses origins (e.g. `https://ACCOUNT.github.io`),
**not** project paths; Entra redirect URIs include the full path.

## Package and deploy

Before publishing, verify the **effective** storage network configuration, not just the
template parameters. Azure Policy can modify public network access during a successful
deployment. If public storage access is disabled, deployment blobs, Functions host storage,
and quota tables need an approved private-network path, including DNS and connectivity
from the deployment service. Flex push clients send packages to the app deployment
endpoint, not directly to storage. If app ingress is also private, the deployment runner
needs connectivity and DNS to that endpoint; private storage alone does not establish
that requirement. Blob RBAC alone does not provide network access. Do not bypass policy
or enable shared keys to resolve a package-upload 403.

For the prepared private-storage configuration, the parameter file enables the existing
VNet and blob/table endpoint modules. Private DNS zones are linked only to this isolated
VNet; existing zones in other resource groups are not modified. Function provisioning
waits for endpoint/DNS provisioning. The publish script checks effective storage access
and refuses restricted storage without Function VNet integration; this preflight is not
a substitute for verifying private DNS, endpoint approval and runtime connectivity.
Do not make API ingress private unless presenter and deployment connectivity are also
planned. Additional networking changes require validation and deployment approval.

From the repository root:

```powershell
npm ci --prefix api
npm run build:api
```

Deploy **`dist-api` as the Function app root**, not the source `api` directory:

- `host.json` and the generated `package.json` are at its root.
- `package.json` points to `api/src/index.mjs`.
- The shared `which-tool/catalog.mjs` is included at the relative path used by the API.
- Source tests, local settings, browser configuration, and secrets are excluded.

The package includes the lockfile. Install production dependencies in the package with
`npm ci --omit=dev` before a zip deployment, or use your Function deployment pipeline's
supported remote Node build. Verify the deployed `node_modules` and main entry point; packaging
alone is not deployment. Apply server environment settings separately. Never publish local settings.

Configure these public browser settings in [`../which-tool/config.mjs`](../which-tool/config.mjs):

```javascript
export default Object.freeze({
  apiUrl: "https://YOUR-FUNCTION.azurewebsites.net/api/recommend",
  tenantId: "TENANT-GUID",
  clientId: "SPA-APPLICATION-CLIENT-ID",
  scope: "api://API-APPLICATION-CLIENT-ID/Recommend",
  redirectUri: "https://ACCOUNT.github.io/40bots/which-tool/"
});
```

Rebuild/publish the static site. In Presenter setup, sign in, select Live AI, and send a fictional
prompt. Check that the reveal says **Live AI**, has at most three bullets, and cites catalog sources.
Test a denied presenter, expired token, quota rejection, timeout, and offline fallback before the event.
Run a reviewed semantic evaluation on the 48 scenarios described in the root README; mock tests
do not prove actual model quality. Availability and licensing caveats need a fresh catalog review.

## Local API

Azure Functions Core Tools v4 and Node 22 are required. Copy the settings example to
`api/local.settings.json` and replace placeholders. That file is ignored. Use Azure CLI authentication
for `DefaultAzureCredential` locally, with the same model/quota resource permissions assigned to
your development user. Local host storage additionally needs Azurite if you retain
`UseDevelopmentStorage=true`, or use an approved development storage account.

```powershell
npm ci --prefix api
npm start --prefix api
```

Serve the built static site with `npm run preview` on `http://localhost:8000`, use
`http://localhost:7071/api/recommend` as its development API URL, and register the local SPA redirect.
Never use HTTP for a remotely hosted API. Do not commit environment-specific credentials.

## Operational controls and limitations

- Model deadline: 8 seconds, including managed-identity token acquisition; browser live deadline:
  12 seconds including sign-in token retrieval, network, authorization and quota checks.
- Limit upstream concurrency/cost through Azure plan settings, deployment capacity, quotas and budget
  alerts. Application quotas are per allowed presenter, not a global spending guarantee.
- Application logs contain only request ID, outcome class, and duration; no raw prompts, bearer
  tokens, or generated text. Restrict platform telemetry and diagnostics similarly. Azure/model
  service retention and monitoring policies are separate; review them with the customer.
- No history is persisted by the browser. MSAL uses memory storage, so reloading requires sign-in.
- Provider failures return safe errors. Do not diagnose failures by logging request bodies or tokens.
- Prompt instructions and output validation reduce, but do not eliminate, LLM misclassification.
  The safety-intent gate is conservative phrase matching, not a complete safety classifier.
  Treat recommendations as educational; do not use them to approve autonomous water-system control.
