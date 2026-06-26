/* ============================================================
   TRAINER LAUNCH — OAuth edge function

   Routes two endpoints for any registered platform:

     GET /api/oauth/:platform/start
       Caller: frontend "Connect" button, with the user's
       Supabase access token in Authorization: Bearer.
       Action: validate user, mint signed state, return JSON with
       the platform's authorization URL.
       Response: { authUrl: string }

     GET /api/oauth/:platform/callback
       Caller: platform redirects browser here after consent.
       Query: ?code=...&state=...
       Action: verify state, exchange code for tokens, store in
       Anthropic vault, write platform_connections row, redirect
       browser back to /dashboard.html with status flag.

     POST /api/oauth/:platform/disconnect
       Caller: dashboard "Disconnect" button, with user's Supabase
       access token in Authorization: Bearer.
       Action: validate user, look up their connection, delete the
       vault credential, delete the platform_connections row.
       Response: { ok: true } or { error: '...' }

   Required env vars on Netlify:
     ANTHROPIC_API_KEY            — existing
     SUPABASE_URL                 — existing
     SUPABASE_ANON_KEY            — existing
     SUPABASE_SERVICE_ROLE_KEY    — NEW (Settings → API → Secret keys)
     OAUTH_STATE_SECRET           — NEW (any 32+ char random string)
     KLAVIYO_CLIENT_ID            — added at Task #5
     KLAVIYO_CLIENT_SECRET        — added at Task #5
   ============================================================ */

import { getUserFromRequest } from './lib/server-auth.js';
import { signState, verifyState, generatePkceVerifier, pkceChallenge } from './lib/oauth-state.js';
import { getPlatform } from './lib/oauth-platforms.js';
import {
  createVault,
  addMcpOAuthCredential,
  deleteCredential
} from './lib/anthropic-vault.js';
import { upsert, select, deleteRows } from './lib/supabase-admin.js';

// ---------- helpers ----------

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...extraHeaders }
  });
}

function getEnv(...names) {
  const out = {};
  const missing = [];
  for (const name of names) {
    const v = Netlify.env.get(name);
    if (!v) missing.push(name);
    out[name] = v;
  }
  return { env: out, missing };
}

function redirectBack(origin, params) {
  const url = new URL('/dashboard.html', origin);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Response(null, { status: 302, headers: { 'Location': url.toString() } });
}

function callbackRedirectUri(origin, platform) {
  return `${origin}/api/oauth/${platform}/callback`;
}

// ---------- /start ----------

async function handleStart(request, platformName, ctx) {
  const platform = getPlatform(platformName);
  if (!platform) return json({ error: `Unknown platform: ${platformName}` }, 404);
  if (!platform.enabled) {
    return json({ error: `Platform ${platformName} is not yet enabled (pending approvals).` }, 503);
  }

  const user = await getUserFromRequest(request, {
    supabaseUrl: ctx.env.SUPABASE_URL,
    supabaseAnonKey: ctx.env.SUPABASE_ANON_KEY
  });
  if (!user) return json({ error: 'Not authenticated' }, 401);

  const clientId = Netlify.env.get(platform.clientIdEnv);
  if (!clientId) {
    return json({ error: `Server misconfigured: missing ${platform.clientIdEnv}` }, 500);
  }

  // Generate PKCE verifier+challenge if the platform requires it.
  // The verifier is stashed inside the signed state (HMAC-protected,
  // round-trips through the OAuth provider invisibly), so the callback
  // can recover it without server-side session storage.
  let pkceVerifier = null;
  let challenge = null;
  if (platform.usesPkce) {
    pkceVerifier = generatePkceVerifier();
    challenge = await pkceChallenge(pkceVerifier);
  }

  const state = await signState(
    { uid: user.id, platform: platformName, pkceVerifier },
    ctx.env.OAUTH_STATE_SECRET
  );

  const origin = new URL(request.url).origin;
  const authUrl = platform.buildAuthUrl({
    clientId,
    state,
    redirectUri: callbackRedirectUri(origin, platformName),
    scope: platform.scope,
    pkceChallenge: challenge
  });

  return json({ authUrl });
}

// ---------- /callback ----------

async function handleCallback(request, platformName, ctx) {
  const platform = getPlatform(platformName);
  const origin = new URL(request.url).origin;

  // Errors during the callback redirect the user back to the dashboard
  // with a status flag, so the UI can surface what went wrong.
  if (!platform || !platform.enabled) {
    return redirectBack(origin, { connect: 'error', platform: platformName, reason: 'unknown_or_disabled' });
  }

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const oauthError = url.searchParams.get('error');

  if (oauthError) {
    return redirectBack(origin, { connect: 'error', platform: platformName, reason: oauthError });
  }
  if (!code || !state) {
    return redirectBack(origin, { connect: 'error', platform: platformName, reason: 'missing_params' });
  }

  // Verify state — proves the flow was started by a real logged-in user
  let payload;
  try {
    payload = await verifyState(state, platformName, ctx.env.OAUTH_STATE_SECRET);
  } catch (err) {
    return redirectBack(origin, { connect: 'error', platform: platformName, reason: 'state_invalid' });
  }

  const clientId = Netlify.env.get(platform.clientIdEnv);
  const clientSecret = Netlify.env.get(platform.clientSecretEnv);
  if (!clientId || !clientSecret) {
    return redirectBack(origin, { connect: 'error', platform: platformName, reason: 'server_misconfigured' });
  }

  let tokenResponse;
  try {
    tokenResponse = await platform.exchangeCode({
      code,
      clientId,
      clientSecret,
      redirectUri: callbackRedirectUri(origin, platformName),
      pkceVerifier: payload.pv  // present if the platform required PKCE
    });
  } catch (err) {
    console.error(`[oauth ${platformName}] exchange failed:`, err);
    return redirectBack(origin, { connect: 'error', platform: platformName, reason: 'token_exchange_failed' });
  }

  // Get or create the user's vault
  let vaultId;
  try {
    const existing = await select(
      { supabaseUrl: ctx.env.SUPABASE_URL, serviceRoleKey: ctx.env.SUPABASE_SERVICE_ROLE_KEY },
      'platform_connections',
      { user_id: payload.uid }
    );
    vaultId = existing.find(r => r.vault_id)?.vault_id || null;

    if (!vaultId) {
      const vault = await createVault(ctx.env.ANTHROPIC_API_KEY, {
        displayName: `Trainer Launch — ${payload.uid}`,
        metadata: { trainer_launch_user_id: payload.uid }
      });
      vaultId = vault.id;
    }
  } catch (err) {
    console.error(`[oauth ${platformName}] vault setup failed:`, err);
    return redirectBack(origin, { connect: 'error', platform: platformName, reason: 'vault_setup_failed' });
  }

  // Translate the platform's token response into vault credential params
  const credentialParams = platform.toCredentialParams({
    tokenResponse,
    clientId,
    clientSecret,
    accountLabel: payload.uid  // refined later (e.g. Klaviyo account name) — see TODO below
  });

  // Store credential in the vault
  let credential;
  try {
    credential = await addMcpOAuthCredential(
      ctx.env.ANTHROPIC_API_KEY,
      vaultId,
      credentialParams
    );
  } catch (err) {
    console.error(`[oauth ${platformName}] vault credential failed:`, err);
    return redirectBack(origin, { connect: 'error', platform: platformName, reason: 'vault_store_failed' });
  }

  // Upsert platform_connections row (overwrites if user re-connects same platform)
  try {
    await upsert(
      { supabaseUrl: ctx.env.SUPABASE_URL, serviceRoleKey: ctx.env.SUPABASE_SERVICE_ROLE_KEY },
      'platform_connections',
      {
        user_id: payload.uid,
        platform: platformName,
        status: 'active',
        vault_id: vaultId,
        vault_credential_id: credential.id,
        scopes: tokenResponse.scope ? tokenResponse.scope.split(/[, ]+/).filter(Boolean) : [],
        connected_at: new Date().toISOString()
      },
      { onConflict: 'user_id,platform' }
    );
  } catch (err) {
    console.error(`[oauth ${platformName}] connection upsert failed:`, err);
    // Try to roll back the vault credential we just created so we don't leave orphans
    try {
      await deleteCredential(ctx.env.ANTHROPIC_API_KEY, vaultId, credential.id);
    } catch { /* best-effort */ }
    return redirectBack(origin, { connect: 'error', platform: platformName, reason: 'db_write_failed' });
  }

  // TODO: fetch a friendly account label from the platform (e.g. Klaviyo
  // account name) and update external_account_label in a follow-up call.

  return redirectBack(origin, { connect: 'ok', platform: platformName });
}

// ---------- /disconnect ----------

async function handleDisconnect(request, platformName, ctx) {
  const user = await getUserFromRequest(request, {
    supabaseUrl: ctx.env.SUPABASE_URL,
    supabaseAnonKey: ctx.env.SUPABASE_ANON_KEY
  });
  if (!user) return json({ error: 'Not authenticated' }, 401);

  const adminCtx = {
    supabaseUrl: ctx.env.SUPABASE_URL,
    serviceRoleKey: ctx.env.SUPABASE_SERVICE_ROLE_KEY
  };

  const rows = await select(adminCtx, 'platform_connections', {
    user_id: user.id,
    platform: platformName
  });
  if (rows.length === 0) {
    return json({ ok: true, alreadyDisconnected: true });
  }

  const row = rows[0];

  // Try to delete the vault credential — best-effort, don't block on this.
  // If it fails, the DB row deletion below still happens so the user can
  // re-connect cleanly. Orphaned credentials can be cleaned up out-of-band.
  if (row.vault_id && row.vault_credential_id) {
    try {
      await deleteCredential(
        ctx.env.ANTHROPIC_API_KEY,
        row.vault_id,
        row.vault_credential_id
      );
    } catch (err) {
      console.error(`[oauth ${platformName}] vault credential delete failed:`, err);
    }
  }

  await deleteRows(adminCtx, 'platform_connections', {
    user_id: user.id,
    platform: platformName
  });

  return json({ ok: true });
}

// ---------- router ----------

export default async (request) => {
  const url = new URL(request.url);
  // Path: /api/oauth/:platform/:action
  const segments = url.pathname.split('/').filter(Boolean);
  // ['api', 'oauth', '<platform>', '<action>']
  if (segments.length !== 4) {
    return json({ error: 'Bad path' }, 404);
  }
  const [, , platformName, action] = segments;

  // Method requirements differ per action — GET for start/callback (browser
  // navigation), POST for disconnect (modifying action).
  if ((action === 'start' || action === 'callback') && request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405);
  }
  if (action === 'disconnect' && request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const requiredEnv = [
    'ANTHROPIC_API_KEY',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'OAUTH_STATE_SECRET'
  ];
  const { env, missing } = getEnv(...requiredEnv);
  if (missing.length) {
    return json({ error: `Server misconfigured: missing env ${missing.join(', ')}` }, 500);
  }

  const ctx = { env };

  if (action === 'start')      return handleStart(request, platformName, ctx);
  if (action === 'callback')   return handleCallback(request, platformName, ctx);
  if (action === 'disconnect') return handleDisconnect(request, platformName, ctx);

  return json({ error: `Unknown action: ${action}` }, 404);
};

export const config = { path: '/api/oauth/:platform/:action' };
