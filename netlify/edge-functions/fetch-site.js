/* ============================================================
   TRAINER LAUNCH — External site fetcher proxy

   The coach can put their own website URL on the brand profile.
   When generating a sales / squeeze page, the client fetches the
   HTML so Claude can rewrite it. Browsers block direct cross-origin
   fetches, so this edge function proxies the request server-side.

   Auth: verifies the caller's Supabase access token, same as the
   Claude proxy, so anonymous traffic can't use us as an open
   relay.
   ============================================================ */

export default async (request) => {
  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const supabaseUrl = Netlify.env.get('SUPABASE_URL');
  const supabaseAnonKey = Netlify.env.get('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseAnonKey) {
    return json({ error: 'Server misconfigured' }, 500);
  }

  // Caller must be logged in
  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return json({ error: 'Missing or invalid Authorization header' }, 401);
  }
  try {
    const verify = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { 'Authorization': authHeader, 'apikey': supabaseAnonKey }
    });
    if (!verify.ok) return json({ error: 'Invalid or expired auth token' }, 401);
  } catch (err) {
    return json({ error: 'Auth verification failed: ' + err.message }, 502);
  }

  // Target URL
  const target = new URL(request.url).searchParams.get('url');
  if (!target) return json({ error: 'Missing ?url= parameter' }, 400);
  let parsed;
  try { parsed = new URL(target); } catch { return json({ error: 'Invalid URL' }, 400); }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return json({ error: 'Only http/https URLs allowed' }, 400);
  }
  // Block obvious SSRF targets
  const host = parsed.hostname.toLowerCase();
  if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.internal')
      || host.startsWith('10.') || host.startsWith('192.168.')
      || host.startsWith('169.254.') || host.startsWith('172.16.')) {
    return json({ error: 'Internal hosts are not allowed' }, 400);
  }

  // Fetch the page
  let upstream;
  try {
    upstream = await fetch(parsed.toString(), {
      headers: {
        'user-agent': 'TrainerLaunch-FetchSite/1.0',
        'accept': 'text/html,application/xhtml+xml'
      },
      redirect: 'follow'
    });
  } catch (err) {
    return json({ error: 'Upstream fetch failed: ' + err.message }, 502);
  }

  const ct = upstream.headers.get('content-type') || 'text/html';
  if (!/html|xml/i.test(ct)) {
    return json({ error: 'Upstream returned non-HTML content-type: ' + ct }, 415);
  }

  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'private, max-age=60'
    }
  });
};

function json(payload, status) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}

export const config = { path: '/api/fetch-site' };
