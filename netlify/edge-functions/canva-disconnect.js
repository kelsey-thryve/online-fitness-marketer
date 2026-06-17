/* ============================================================
   TRAINER LAUNCH — Canva disconnect

   Clears the four canva_* token columns on the user's profile.
   Caller must pass a Supabase Bearer token; we resolve it to a
   user id and PATCH that row using the service-role key so the
   write bypasses RLS (we don't expose the service key client-side).
   ============================================================ */

export default async (request) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const supabaseUrl = Netlify.env.get('SUPABASE_URL');
  const supabaseAnonKey = Netlify.env.get('SUPABASE_ANON_KEY');
  const supabaseServiceKey = Netlify.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    return json({ error: 'Server misconfigured' }, 500);
  }

  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return json({ error: 'Missing Authorization header' }, 401);
  }

  let userId;
  try {
    const verify = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { 'Authorization': authHeader, 'apikey': supabaseAnonKey }
    });
    if (!verify.ok) return json({ error: 'Invalid Supabase token' }, 401);
    const u = await verify.json();
    userId = u.id;
  } catch (e) {
    return json({ error: 'Auth verification failed' }, 502);
  }

  try {
    const r = await fetch(`${supabaseUrl}/rest/v1/profiles?user_id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        canva_access_token: null,
        canva_refresh_token: null,
        canva_token_expires_at: null,
        canva_user_id: null,
        canva_brand_template_id: null
      })
    });
    if (!r.ok) return json({ error: 'Profile update failed' }, 500);
  } catch (e) {
    return json({ error: 'Profile update error' }, 502);
  }

  return json({ ok: true }, 200);
};

function json(payload, status) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}

export const config = { path: '/api/canva-disconnect' };
