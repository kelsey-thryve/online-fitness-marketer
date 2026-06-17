/* ============================================================
   TRAINER LAUNCH — Canva API call proxy

   Generic Canva Connect proxy. The client posts { method, path,
   body } here; we attach the user's Canva access token (refreshing
   it transparently if expired), forward the request to Canva,
   and return the result. The user's tokens stay server-side —
   the client never sees them.

   Used by everything Canva-related: list brand templates, start
   an autofill job, poll its status, kick off a PDF export, etc.
   ============================================================ */

export default async (request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const env = {
    supabaseUrl:        Netlify.env.get('SUPABASE_URL'),
    supabaseAnonKey:    Netlify.env.get('SUPABASE_ANON_KEY'),
    supabaseServiceKey: Netlify.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    clientId:           Netlify.env.get('CANVA_CLIENT_ID'),
    clientSecret:       Netlify.env.get('CANVA_CLIENT_SECRET')
  };
  for (const [k, v] of Object.entries(env)) {
    if (!v) return json({ error: 'Server misconfigured: missing ' + k }, 500);
  }

  // 1. Verify the Supabase session and resolve to a user id.
  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return json({ error: 'Missing Authorization header' }, 401);
  let userId;
  try {
    const verify = await fetch(`${env.supabaseUrl}/auth/v1/user`, {
      headers: { 'Authorization': authHeader, 'apikey': env.supabaseAnonKey }
    });
    if (!verify.ok) return json({ error: 'Invalid Supabase token' }, 401);
    userId = (await verify.json()).id;
  } catch (e) { return json({ error: 'Supabase verify failed' }, 502); }

  // 2. Load the user's Canva tokens from the profile row.
  let tokens;
  try {
    const r = await fetch(
      `${env.supabaseUrl}/rest/v1/profiles?user_id=eq.${userId}&select=canva_access_token,canva_refresh_token,canva_token_expires_at`,
      { headers: { 'apikey': env.supabaseServiceKey, 'Authorization': `Bearer ${env.supabaseServiceKey}` } }
    );
    const rows = await r.json();
    tokens = rows[0];
    if (!tokens || !tokens.canva_access_token) {
      return json({ error: 'Canva is not connected for this account. Click "Connect Canva" on your profile.' }, 401);
    }
  } catch (e) { return json({ error: 'Token lookup failed: ' + e.message }, 502); }

  // 3. Refresh if expired (or due to expire in <60s).
  const expiresAt = tokens.canva_token_expires_at ? new Date(tokens.canva_token_expires_at).getTime() : 0;
  if (expiresAt < Date.now() + 60000) {
    if (!tokens.canva_refresh_token) {
      return json({ error: 'Canva session expired. Disconnect and reconnect to refresh.' }, 401);
    }
    try {
      const refreshRes = await fetch('https://api.canva.com/rest/v1/oauth/token', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${env.clientId}:${env.clientSecret}`),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: tokens.canva_refresh_token
        })
      });
      if (!refreshRes.ok) {
        const body = await refreshRes.text();
        return json({ error: 'Token refresh failed: ' + body.slice(0, 200) }, 401);
      }
      const newTokens = await refreshRes.json();
      tokens.canva_access_token = newTokens.access_token;
      const newExpires = new Date(Date.now() + (newTokens.expires_in || 3600) * 1000).toISOString();
      await fetch(`${env.supabaseUrl}/rest/v1/profiles?user_id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'apikey': env.supabaseServiceKey,
          'Authorization': `Bearer ${env.supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          canva_access_token: newTokens.access_token,
          canva_refresh_token: newTokens.refresh_token || tokens.canva_refresh_token,
          canva_token_expires_at: newExpires
        })
      });
    } catch (e) { return json({ error: 'Token refresh error: ' + e.message }, 502); }
  }

  // 4. Read the proxied call payload.
  let payload;
  try { payload = await request.json(); } catch { return json({ error: 'Invalid JSON body' }, 400); }
  const method = (payload.method || 'GET').toUpperCase();
  const path = payload.path || '';
  if (!path.startsWith('/v1/')) return json({ error: 'Invalid path — must start with /v1/' }, 400);

  // 5. Forward to Canva.
  try {
    const canvaRes = await fetch(`https://api.canva.com/rest${path}`, {
      method,
      headers: {
        'Authorization': `Bearer ${tokens.canva_access_token}`,
        'Content-Type': 'application/json'
      },
      body: method !== 'GET' && method !== 'HEAD' && payload.body ? JSON.stringify(payload.body) : undefined
    });
    const text = await canvaRes.text();
    let respBody;
    try { respBody = JSON.parse(text); } catch { respBody = { raw: text }; }
    return json({ status: canvaRes.status, body: respBody }, 200);
  } catch (e) {
    return json({ error: 'Canva API error: ' + e.message }, 502);
  }
};

function json(payload, status) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}

export const config = { path: '/api/canva-call' };
