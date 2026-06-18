/* ============================================================
   TRAINER LAUNCH — Canva Connect OAuth callback

   Step in the auth flow:
     1. Frontend redirects user to Canva's authorize URL with
        state = base64(Supabase access_token).
     2. Canva redirects back here with ?code=...&state=...
     3. This function exchanges the code for tokens using the
        Canva client_secret (stored as a Netlify env var),
        verifies the state's Supabase JWT to identify the user,
        and writes the tokens onto the user's profile via the
        Supabase service-role key.
     4. Redirects the user back to /profile.html with a status flag.
   ============================================================ */

export default async (request) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error) return redirectWithError(error);
  if (!code || !state) return redirectWithError('missing_code_or_state');

  const clientId = Netlify.env.get('CANVA_CLIENT_ID');
  const clientSecret = Netlify.env.get('CANVA_CLIENT_SECRET');
  const redirectUri = Netlify.env.get('CANVA_REDIRECT_URI');
  const supabaseUrl = Netlify.env.get('SUPABASE_URL');
  const supabaseAnonKey = Netlify.env.get('SUPABASE_ANON_KEY');
  const supabaseServiceKey = Netlify.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!clientId || !clientSecret || !redirectUri || !supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    return redirectWithError('server_misconfigured');
  }

  // 1. Decode the state. It's base64url(JSON({ t: supabase access token,
  //    v: PKCE code verifier })). The old format (raw base64 of just the
  //    Supabase token) is detected and rejected — the verifier is needed
  //    for the PKCE token exchange below.
  let supabaseAccessToken;
  let codeVerifier;
  try {
    // base64url → base64 → bytes → JSON
    const padded = state.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((state.length + 3) % 4);
    const decoded = atob(padded);
    const stateObj = JSON.parse(decoded);
    supabaseAccessToken = stateObj.t;
    codeVerifier = stateObj.v;
    if (!supabaseAccessToken || !codeVerifier) throw new Error('missing fields');
  } catch {
    return redirectWithError('invalid_state');
  }

  // 2. Verify the token + resolve to a user id
  let userId;
  try {
    const verify = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${supabaseAccessToken}`,
        'apikey': supabaseAnonKey
      }
    });
    if (!verify.ok) return redirectWithError('invalid_supabase_token');
    const user = await verify.json();
    userId = user.id;
    if (!userId) return redirectWithError('no_user_id');
  } catch (e) {
    return redirectWithError('supabase_verify_failed');
  }

  // 3. Exchange code for tokens with Canva
  let tokens;
  try {
    const tokenRes = await fetch('https://api.canva.com/rest/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier
      })
    });
    if (!tokenRes.ok) {
      const body = await tokenRes.text();
      return redirectWithError('token_exchange_failed: ' + body.slice(0, 120));
    }
    tokens = await tokenRes.json();
  } catch (e) {
    return redirectWithError('token_exchange_error');
  }

  // 4. Get the Canva user id (optional but useful)
  let canvaUserId = null;
  try {
    const userRes = await fetch('https://api.canva.com/rest/v1/users/me', {
      headers: { 'Authorization': `Bearer ${tokens.access_token}` }
    });
    if (userRes.ok) {
      const u = await userRes.json();
      canvaUserId = u?.team?.id || u?.user?.id || null;
    }
  } catch (_) { /* best effort */ }

  // 5. Write tokens to the user's profile via Supabase REST API + service role
  const expiresAt = new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString();
  try {
    const updateRes = await fetch(`${supabaseUrl}/rest/v1/profiles?user_id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        canva_access_token: tokens.access_token,
        canva_refresh_token: tokens.refresh_token,
        canva_token_expires_at: expiresAt,
        canva_user_id: canvaUserId
      })
    });
    if (!updateRes.ok) {
      const body = await updateRes.text();
      return redirectWithError('profile_update_failed: ' + body.slice(0, 120));
    }
  } catch (e) {
    return redirectWithError('profile_update_error');
  }

  return Response.redirect(siteUrl() + '/profile.html?canva_connected=1', 302);

  function siteUrl() {
    // Netlify provides URL via env; fall back to the request origin.
    return Netlify.env.get('URL') || new URL(request.url).origin;
  }
  function redirectWithError(detail) {
    return Response.redirect(
      siteUrl() + '/profile.html?canva_error=' + encodeURIComponent(detail),
      302
    );
  }
};

export const config = { path: '/api/canva-callback' };
