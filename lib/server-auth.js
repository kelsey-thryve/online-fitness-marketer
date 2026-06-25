/* ============================================================
   TRAINER LAUNCH — Server-side Supabase token verification

   Used by edge functions to validate that a request was made by
   a real logged-in user, and to extract the user_id.

   Two callers:
     - /api/oauth/:platform/start  — needs to know which user is
       starting the OAuth flow so we can embed user_id in the state
     - /api/claude — already does this inline; could be refactored
       to use this module later (left alone for now)
   ============================================================ */

/**
 * Extract the bearer token from an Authorization header.
 */
function extractBearer(authHeader) {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

/**
 * Verify a Supabase access token by calling Supabase's /auth/v1/user.
 * Returns the user object on success, throws on failure.
 *
 * @param {Object} params
 * @param {string} params.token - Supabase access token
 * @param {string} params.supabaseUrl - Supabase project URL
 * @param {string} params.supabaseAnonKey - Anon (publishable) key
 * @returns {Promise<{id: string, email: string, user_metadata: object}>}
 */
export async function verifySupabaseToken({ token, supabaseUrl, supabaseAnonKey }) {
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'apikey': supabaseAnonKey
    }
  });

  if (!response.ok) {
    const err = new Error(`Supabase token verification failed (${response.status})`);
    err.status = response.status;
    throw err;
  }
  return await response.json();
}

/**
 * Convenience: pull the bearer from a Request and verify it.
 * Returns the user object on success, or null if no/invalid token.
 *
 * Use when an edge function wants to require auth — caller can
 * `if (!user) return 401`.
 */
export async function getUserFromRequest(request, { supabaseUrl, supabaseAnonKey }) {
  const token = extractBearer(request.headers.get('authorization') || '');
  if (!token) return null;

  try {
    return await verifySupabaseToken({ token, supabaseUrl, supabaseAnonKey });
  } catch {
    return null;
  }
}
