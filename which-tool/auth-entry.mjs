import { PublicClientApplication, InteractionRequiredAuthError } from "@azure/msal-browser";

let client;
let settings;
export async function initialize(config) {
  settings = config;
  client = new PublicClientApplication({
    auth: {
      clientId: config.clientId,
      authority: `https://login.microsoftonline.com/${config.tenantId}`,
      redirectUri: config.redirectUri || new URL("./", location.href).href
    },
    cache: { cacheLocation: "memoryStorage" }
  });
  await client.initialize();
}

export async function signIn() {
  const response = await client.loginPopup({ scopes: [settings.scope] });
  client.setActiveAccount(response.account);
  return response.account.name || response.account.username;
}

export async function getAccessToken() {
  const account = client.getActiveAccount();
  if (!account) throw new Error("Sign in for Live AI in Presenter setup first.");
  try {
    const response = await client.acquireTokenSilent({ account, scopes: [settings.scope] });
    return response.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) throw new Error("Your session needs attention. Sign in again in Presenter setup.");
    throw error;
  }
}
