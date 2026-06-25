/* ============================================================
   TRAINER LAUNCH — Anthropic Managed Agents vault helper

   Pure utility module. No HTTP endpoint of its own — imported by
   the OAuth callback edge function (and any other server-side
   flow that needs to manage credentials).

   Architecture (Option C):
     - One vault per Trainer Launch user (vlt_...)
     - Multiple credentials per vault, one per connected platform
     - Tokens NEVER touch Supabase — only the vault_id +
       credential_id pointers are stored in platform_connections
     - Anthropic auto-refreshes OAuth tokens via the standard
       refresh_token grant

   Beta header required: managed-agents-2026-04-01
   ============================================================ */

const API_BASE = 'https://api.anthropic.com';
const ANTHROPIC_VERSION = '2023-06-01';
const MANAGED_AGENTS_BETA = 'managed-agents-2026-04-01';

/**
 * Build the standard headers for a Managed Agents request.
 * @param {string} apiKey - Anthropic API key (server-side only)
 */
function headers(apiKey) {
  return {
    'x-api-key': apiKey,
    'anthropic-version': ANTHROPIC_VERSION,
    'anthropic-beta': MANAGED_AGENTS_BETA,
    'content-type': 'application/json'
  };
}

/**
 * Parse a response body, returning JSON or raising a structured error.
 * The Anthropic API returns error envelopes shaped { type, error: { type, message }, request_id }.
 */
async function parseOrThrow(response, operation) {
  const text = await response.text();
  let body;
  try { body = text ? JSON.parse(text) : {}; }
  catch { body = { _raw: text }; }

  if (!response.ok) {
    const detail = body?.error?.message || body?._raw || response.statusText;
    const err = new Error(`Anthropic vault ${operation} failed (${response.status}): ${detail}`);
    err.status = response.status;
    err.requestId = body?.request_id || null;
    err.body = body;
    throw err;
  }
  return body;
}

// ============================================================
// Vault lifecycle
// ============================================================

/**
 * Create a vault. Call this once per user when they connect their
 * first platform. The returned vault_id is stored on every
 * platform_connections row for that user.
 *
 * @param {string} apiKey
 * @param {Object} params
 * @param {string} params.displayName - Human-readable (e.g. "Trainer Launch — Alice")
 * @param {Object} [params.metadata] - Free-form key/value pairs, e.g. { trainer_launch_user_id: '...' }
 * @returns {Promise<{id: string, display_name: string, created_at: string}>}
 */
export async function createVault(apiKey, { displayName, metadata = {} }) {
  const response = await fetch(`${API_BASE}/v1/vaults`, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify({
      display_name: displayName,
      metadata
    })
  });
  return parseOrThrow(response, 'createVault');
}

/**
 * Archive a vault — soft-delete that revokes all credentials inside.
 * Use when a user deletes their Trainer Launch account.
 */
export async function archiveVault(apiKey, vaultId) {
  const response = await fetch(`${API_BASE}/v1/vaults/${vaultId}/archive`, {
    method: 'POST',
    headers: headers(apiKey)
  });
  return parseOrThrow(response, 'archiveVault');
}

// ============================================================
// Credentials
// ============================================================

/**
 * Add an OAuth credential to a vault. Anthropic auto-refreshes the
 * access token using the refresh_token grant before expiry.
 *
 * Use for: Meta, Google Ads, Klaviyo (anything OAuth 2.0 with refresh).
 *
 * @param {string} apiKey
 * @param {string} vaultId
 * @param {Object} params
 * @param {string} params.displayName - e.g. "Klaviyo — Acme Coaching"
 * @param {string} params.mcpServerUrl - The MCP server URL Anthropic should attach this credential to
 * @param {string} params.accessToken - Current OAuth access token
 * @param {string} params.expiresAt - ISO 8601 timestamp when accessToken expires
 * @param {string} params.refreshToken - OAuth refresh token
 * @param {string} params.tokenEndpoint - Where Anthropic posts the refresh_token grant
 * @param {string} params.clientId - OAuth client ID
 * @param {Object} params.tokenEndpointAuth - { type: 'none'|'client_secret_basic'|'client_secret_post', client_secret?: string }
 * @param {string} [params.scope] - OAuth scope string (space-separated)
 * @returns {Promise<{id: string, vault_id: string, display_name: string}>}
 */
export async function addMcpOAuthCredential(apiKey, vaultId, params) {
  const {
    displayName,
    mcpServerUrl,
    accessToken,
    expiresAt,
    refreshToken,
    tokenEndpoint,
    clientId,
    tokenEndpointAuth,
    scope
  } = params;

  const refresh = {
    token_endpoint: tokenEndpoint,
    client_id: clientId,
    refresh_token: refreshToken,
    token_endpoint_auth: tokenEndpointAuth
  };
  if (scope) refresh.scope = scope;

  const body = {
    display_name: displayName,
    auth: {
      type: 'mcp_oauth',
      mcp_server_url: mcpServerUrl,
      access_token: accessToken,
      expires_at: expiresAt,
      refresh
    }
  };

  const response = await fetch(`${API_BASE}/v1/vaults/${vaultId}/credentials`, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify(body)
  });
  return parseOrThrow(response, 'addMcpOAuthCredential');
}

/**
 * Add an environment variable credential to a vault. The sandbox sees
 * an opaque placeholder; Anthropic substitutes the real value into
 * outbound requests at egress.
 *
 * Use for: Duda (API key, no OAuth). Also useful for any non-MCP
 * service the agent needs to call via the bash tool.
 *
 * @param {string} apiKey
 * @param {string} vaultId
 * @param {Object} params
 * @param {string} params.displayName - e.g. "Duda API key — Acme Coaching"
 * @param {string} params.secretName - Env var name the sandbox sees (e.g. "DUDA_API_KEY")
 * @param {string} params.secretValue - The actual secret
 * @param {string[]} [params.allowedHosts] - Hosts the secret can be sent to. Required if not unrestricted.
 * @returns {Promise<{id: string, vault_id: string, display_name: string}>}
 */
export async function addEnvironmentVariableCredential(apiKey, vaultId, params) {
  const { displayName, secretName, secretValue, allowedHosts } = params;

  const networking = allowedHosts && allowedHosts.length > 0
    ? { type: 'limited', allowed_hosts: allowedHosts }
    : { type: 'unrestricted' };

  const body = {
    display_name: displayName,
    auth: {
      type: 'environment_variable',
      secret_name: secretName,
      secret_value: secretValue,
      networking
    }
  };

  const response = await fetch(`${API_BASE}/v1/vaults/${vaultId}/credentials`, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify(body)
  });
  return parseOrThrow(response, 'addEnvironmentVariableCredential');
}

/**
 * Delete a credential. Use when a user clicks "Disconnect" for a
 * single platform (without revoking everything).
 */
export async function deleteCredential(apiKey, vaultId, credentialId) {
  const response = await fetch(
    `${API_BASE}/v1/vaults/${vaultId}/credentials/${credentialId}`,
    {
      method: 'DELETE',
      headers: headers(apiKey)
    }
  );
  // DELETE returns 204 No Content on success
  if (response.status === 204) return { deleted: true };
  return parseOrThrow(response, 'deleteCredential');
}

// ============================================================
// Per-platform OAuth shape adapters
// ============================================================
//
// Each platform's OAuth response differs in field names and what's
// required for refresh. These adapters take the raw token response
// from the platform and the persistent identifiers (client_id etc.)
// and return the shape addMcpOAuthCredential expects.

/**
 * Klaviyo OAuth token response → credential params.
 * https://developers.klaviyo.com/en/docs/set_up_oauth
 */
export function klaviyoCredentialParams({ tokenResponse, clientId, clientSecret, accountLabel }) {
  const now = Date.now();
  const expiresAt = new Date(now + (tokenResponse.expires_in * 1000)).toISOString();
  return {
    displayName: `Klaviyo — ${accountLabel || 'account'}`,
    mcpServerUrl: 'https://mcp.klaviyo.com/sse',
    accessToken: tokenResponse.access_token,
    expiresAt,
    refreshToken: tokenResponse.refresh_token,
    tokenEndpoint: 'https://a.klaviyo.com/oauth/token',
    clientId,
    tokenEndpointAuth: { type: 'client_secret_basic', client_secret: clientSecret },
    scope: tokenResponse.scope
  };
}

/**
 * Meta Marketing API OAuth response → credential params.
 * Note: Meta long-lived tokens last ~60 days and don't issue a
 * traditional refresh_token — re-exchange the access_token for a
 * fresh long-lived one. The mcp_oauth refresh shape doesn't fit
 * perfectly; for now we store the long-lived access_token and
 * Trainer Launch's own backend handles re-exchange.
 *
 * TODO: revisit when Meta MCP server is published or Anthropic
 * supports custom refresh flows.
 */
export function metaCredentialParams({ accessToken, expiresAt, accountLabel }) {
  return {
    displayName: `Meta Ads — ${accountLabel || 'account'}`,
    mcpServerUrl: 'https://graph.facebook.com/v23.0',  // placeholder; replace if/when official MCP exists
    accessToken,
    expiresAt,
    // Meta long-lived tokens have no refresh_token — pass placeholders.
    // Renewal is handled by re-exchanging access_token before expiry.
    refreshToken: 'NOT_APPLICABLE',
    tokenEndpoint: 'https://graph.facebook.com/v23.0/oauth/access_token',
    clientId: 'NOT_APPLICABLE',
    tokenEndpointAuth: { type: 'none' }
  };
}

/**
 * Google Ads OAuth response → credential params.
 * https://developers.google.com/identity/protocols/oauth2
 */
export function googleAdsCredentialParams({ tokenResponse, clientId, clientSecret, accountLabel }) {
  const now = Date.now();
  const expiresAt = new Date(now + (tokenResponse.expires_in * 1000)).toISOString();
  return {
    displayName: `Google Ads — ${accountLabel || 'account'}`,
    mcpServerUrl: 'https://googleads.googleapis.com',  // placeholder until official MCP exists
    accessToken: tokenResponse.access_token,
    expiresAt,
    refreshToken: tokenResponse.refresh_token,
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    clientId,
    tokenEndpointAuth: { type: 'client_secret_post', client_secret: clientSecret },
    scope: tokenResponse.scope
  };
}

/**
 * Duda credentials are API-key-based, not OAuth. Use
 * addEnvironmentVariableCredential directly.
 */
export function dudaCredentialParams({ apiKey, accountLabel }) {
  return {
    displayName: `Duda — ${accountLabel || 'account'}`,
    secretName: 'DUDA_API_KEY',
    secretValue: apiKey,
    allowedHosts: ['api-sandbox.duda.co', 'api.duda.co']
  };
}
