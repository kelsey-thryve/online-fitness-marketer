/* ============================================================
   TRAINER LAUNCH — Anthropic proxy (Netlify Edge Function)

   Reads ANTHROPIC_API_KEY from server env, so the key is never
   exposed in the browser. Verifies the caller's Supabase access
   token before forwarding, so anonymous users can't burn tokens.
   ============================================================ */

export default async (request) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const apiKey = Netlify.env.get('ANTHROPIC_API_KEY');
  const supabaseUrl = Netlify.env.get('SUPABASE_URL');
  const supabaseAnonKey = Netlify.env.get('SUPABASE_ANON_KEY');

  if (!apiKey || !supabaseUrl || !supabaseAnonKey) {
    return json({
      error: 'Server misconfigured. Set ANTHROPIC_API_KEY, SUPABASE_URL and SUPABASE_ANON_KEY in Netlify env.'
    }, 500);
  }

  // 1. Verify the request came from a logged-in user
  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return json({ error: 'Missing or invalid Authorization header' }, 401);
  }

  try {
    const verify = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': authHeader,
        'apikey': supabaseAnonKey
      }
    });
    if (!verify.ok) {
      return json({ error: 'Invalid or expired auth token' }, 401);
    }
  } catch (err) {
    return json({ error: 'Auth verification failed: ' + err.message }, 502);
  }

  // 2. Forward to Anthropic
  let body;
  try {
    body = await request.text();
  } catch (err) {
    return json({ error: 'Could not read request body' }, 400);
  }

  let upstream;
  try {
    upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body
    });
  } catch (err) {
    return json({ error: 'Upstream call failed: ' + err.message }, 502);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') || 'application/json'
    }
  });
};

function json(payload, status) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}

export const config = { path: '/api/claude' };
