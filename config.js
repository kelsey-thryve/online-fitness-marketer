/* ============================================================
   TRAINER LAUNCH — Browser-side config

   The Anthropic API key is NOT here — it lives as a server-side
   environment variable on Netlify so it's never exposed to users.
   See netlify/edge-functions/claude.js for the proxy.

   Only Supabase public values go in this file.
   ============================================================ */

window.TRAINER_LAUNCH_CONFIG = {

  /* Supabase (free at https://supabase.com)
     Create a project → Project Settings → API → copy below. */
  SUPABASE_URL:      'https://ratoutpguingwuosnqgp.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_24I6I8flW5zw6pVq0Lf6NA_SgqBwVf9',

  /* Anthropic model to use (server uses this hint).
     Override per-environment if you ever want to test a different one. */
  MODEL: 'claude-opus-4-5',

  /* Endpoint of the Netlify Edge proxy. Same-origin by default
     ("/api/claude"). Only change if you host the proxy elsewhere. */
  CLAUDE_PROXY_PATH: '/api/claude'
};
