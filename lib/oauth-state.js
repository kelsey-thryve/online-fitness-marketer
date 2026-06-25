/* ============================================================
   TRAINER LAUNCH — OAuth state token (HMAC-signed, stateless)

   The OAuth callback hits our server with no auth context — it's
   just a redirect from the OAuth provider. We need to:
     1. Know which Trainer Launch user initiated the flow
     2. Prevent CSRF (an attacker can't forge a state token)
     3. Reject replayed/expired states

   Approach: sign a compact payload server-side, embed it as `state`
   in the OAuth URL, verify on callback. No DB roundtrip needed.

   Payload: { uid, platform, nonce, iat }
   Format:  base64url(JSON.stringify(payload)) + "." + base64url(hmac-sha256)

   Secret comes from OAUTH_STATE_SECRET env var. Generate with:
     openssl rand -hex 32
   ============================================================ */

const STATE_TTL_MS = 10 * 60 * 1000;  // 10 minutes — OAuth flow should complete well under this

// ---------- PKCE helpers (RFC 7636) ----------

/**
 * Generate a PKCE code_verifier — a high-entropy random string.
 * Spec requires 43-128 chars from [A-Z][a-z][0-9]-._~ — base64url of
 * 32 random bytes lands us at 43 chars and meets the alphabet.
 */
export function generatePkceVerifier() {
  return b64urlEncode(crypto.getRandomValues(new Uint8Array(32)));
}

/**
 * Compute the PKCE code_challenge for a given verifier.
 * challenge = base64url(sha256(verifier)) — the S256 method.
 */
export async function pkceChallenge(verifier) {
  const hash = await crypto.subtle.digest('SHA-256', enc.encode(verifier));
  return b64urlEncode(new Uint8Array(hash));
}

// ---------- base64url helpers (Deno-native, no Buffer) ----------

function b64urlEncode(bytes) {
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function b64urlDecode(s) {
  const padded = s.replaceAll('-', '+').replaceAll('_', '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

const enc = new TextEncoder();
const dec = new TextDecoder();

// ---------- HMAC ----------

async function hmacKey(secret) {
  return await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

async function hmacSign(secret, message) {
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return b64urlEncode(new Uint8Array(sig));
}

/**
 * Constant-time comparison of two strings to defeat timing attacks.
 */
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// ---------- public API ----------

/**
 * Mint a state token for an OAuth start.
 *
 * @param {Object} payload
 * @param {string} payload.uid - Trainer Launch user_id (Supabase auth.users.id)
 * @param {string} payload.platform - One of 'meta', 'google_ads', 'klaviyo', 'duda'
 * @param {string} [payload.pkceVerifier] - Optional PKCE code_verifier to round-trip
 * @param {string} secret - OAUTH_STATE_SECRET
 * @returns {Promise<string>} state token to embed in OAuth URL
 */
export async function signState({ uid, platform, pkceVerifier }, secret) {
  // nonce makes each state unique even if the same user re-initiates the same platform back-to-back
  const nonce = b64urlEncode(crypto.getRandomValues(new Uint8Array(16)));
  const payload = { uid, platform, nonce, iat: Date.now() };
  if (pkceVerifier) payload.pv = pkceVerifier;
  const payloadB64 = b64urlEncode(enc.encode(JSON.stringify(payload)));
  const sig = await hmacSign(secret, payloadB64);
  return `${payloadB64}.${sig}`;
}

/**
 * Verify a state token from an OAuth callback.
 * Throws if invalid, expired, or platform mismatch.
 *
 * @param {string} state - The state value from the callback query string
 * @param {string} expectedPlatform - Platform from the URL path
 * @param {string} secret - OAUTH_STATE_SECRET
 * @returns {Promise<{uid: string, platform: string, nonce: string, iat: number, pv?: string}>}
 */
export async function verifyState(state, expectedPlatform, secret) {
  if (!state || typeof state !== 'string') {
    throw new Error('Missing state token');
  }
  const parts = state.split('.');
  if (parts.length !== 2) {
    throw new Error('Malformed state token');
  }
  const [payloadB64, sig] = parts;

  const expectedSig = await hmacSign(secret, payloadB64);
  if (!safeEqual(sig, expectedSig)) {
    throw new Error('State signature invalid');
  }

  let payload;
  try {
    payload = JSON.parse(dec.decode(b64urlDecode(payloadB64)));
  } catch {
    throw new Error('State payload not parseable');
  }

  if (!payload.uid || !payload.platform || !payload.iat) {
    throw new Error('State payload missing fields');
  }
  if (payload.platform !== expectedPlatform) {
    throw new Error(`State platform mismatch: expected ${expectedPlatform}, got ${payload.platform}`);
  }
  if (Date.now() - payload.iat > STATE_TTL_MS) {
    throw new Error('State expired');
  }

  return payload;
}
