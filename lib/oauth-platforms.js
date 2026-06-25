/* ============================================================
   TRAINER LAUNCH — Per-platform OAuth registry

   One entry per platform with everything the generic OAuth handler
   needs to (a) build the authorization URL, (b) exchange the code
   for tokens, and (c) hand off to the vault helper.

   Adding a new platform: add an entry here + set its env vars in
   Netlify. The /api/oauth/:platform/* handler doesn't need changes.

   Status: Klaviyo is the first integration (Task #5). Meta and
   Google Ads stubs are present but disabled until App Review /
   Developer Token approvals come through. Duda is API-key based
   (no OAuth) so it's handled by a separate path.
   ============================================================ */

import {
  klaviyoCredentialParams,
  metaCredentialParams,
  googleAdsCredentialParams
} from './anthropic-vault.js';

/**
 * Each platform exposes:
 *   - enabled: false → /start returns 503, /callback ignored
 *   - clientIdEnv, clientSecretEnv: Netlify env var NAMES (not values)
 *   - scope: space-separated OAuth scope string
 *   - buildAuthUrl({ clientId, state, redirectUri }) → string
 *   - exchangeCode({ code, clientId, clientSecret, redirectUri }) → token response
 *   - toCredentialParams({ tokenResponse, clientId, clientSecret, accountLabel })
 *       → params for addMcpOAuthCredential
 */

export const PLATFORMS = {
  klaviyo: {
    enabled: true,
    clientIdEnv: 'KLAVIYO_CLIENT_ID',
    clientSecretEnv: 'KLAVIYO_CLIENT_SECRET',
    scope: 'campaigns:read campaigns:write lists:read lists:write templates:read templates:write profiles:read profiles:write',

    buildAuthUrl({ clientId, state, redirectUri, scope }) {
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: redirectUri,
        scope,
        state
      });
      return `https://www.klaviyo.com/oauth/authorize?${params}`;
    },

    async exchangeCode({ code, clientId, clientSecret, redirectUri }) {
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri
      });
      const response = await fetch('https://a.klaviyo.com/oauth/token', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`),
          'content-type': 'application/x-www-form-urlencoded'
        },
        body
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Klaviyo token exchange failed (${response.status}): ${text}`);
      }
      return await response.json();
    },

    toCredentialParams({ tokenResponse, clientId, clientSecret, accountLabel }) {
      return klaviyoCredentialParams({ tokenResponse, clientId, clientSecret, accountLabel });
    }
  },

  meta: {
    enabled: false,  // Gated on Meta App Review
    clientIdEnv: 'META_APP_ID',
    clientSecretEnv: 'META_APP_SECRET',
    scope: 'ads_management,business_management,pages_show_list,pages_read_engagement,instagram_basic',

    buildAuthUrl({ clientId, state, redirectUri, scope }) {
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        state,
        scope,
        response_type: 'code'
      });
      return `https://www.facebook.com/v23.0/dialog/oauth?${params}`;
    },

    async exchangeCode({ code, clientId, clientSecret, redirectUri }) {
      // Short-lived token first
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        client_secret: clientSecret,
        code
      });
      const short = await fetch(`https://graph.facebook.com/v23.0/oauth/access_token?${params}`);
      if (!short.ok) throw new Error(`Meta short-lived token exchange failed (${short.status})`);
      const shortJson = await short.json();

      // Exchange for long-lived (~60 days)
      const longParams = new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: clientId,
        client_secret: clientSecret,
        fb_exchange_token: shortJson.access_token
      });
      const long = await fetch(`https://graph.facebook.com/v23.0/oauth/access_token?${longParams}`);
      if (!long.ok) throw new Error(`Meta long-lived token exchange failed (${long.status})`);
      return await long.json();
    },

    toCredentialParams({ tokenResponse, accountLabel }) {
      const expiresAt = new Date(Date.now() + (tokenResponse.expires_in * 1000)).toISOString();
      return metaCredentialParams({
        accessToken: tokenResponse.access_token,
        expiresAt,
        accountLabel
      });
    }
  },

  google_ads: {
    enabled: false,  // Gated on Developer Token + OAuth verification
    clientIdEnv: 'GOOGLE_CLIENT_ID',
    clientSecretEnv: 'GOOGLE_CLIENT_SECRET',
    scope: 'https://www.googleapis.com/auth/adwords',

    buildAuthUrl({ clientId, state, redirectUri, scope }) {
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope,
        access_type: 'offline',       // ensures refresh_token is returned
        prompt: 'consent',            // forces re-consent so refresh_token is reissued
        state
      });
      return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    },

    async exchangeCode({ code, clientId, clientSecret, redirectUri }) {
      const body = new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      });
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Google token exchange failed (${response.status}): ${text}`);
      }
      return await response.json();
    },

    toCredentialParams({ tokenResponse, clientId, clientSecret, accountLabel }) {
      return googleAdsCredentialParams({ tokenResponse, clientId, clientSecret, accountLabel });
    }
  }
};

export function getPlatform(name) {
  return PLATFORMS[name] || null;
}
