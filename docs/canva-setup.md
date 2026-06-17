# Canva Connect setup

One-time partner setup to enable the "Connect Canva" button on the profile page and (next iteration) the "Generate via Canva" PDF flow.

## 1. Register as a Canva developer

1. Open https://www.canva.com/developers/ → **Get started** (uses your Canva Pro account).
2. **Your integrations → Create an integration** → pick **Public integration**. Name it "Trainer Launch".
3. On the integration details page, copy the **Client ID** (public) and **Client secret** (server-only — treat like a password).

## 2. Configure the integration

In the integration settings panel:

- **Redirect URLs** — add the exact URL of the callback function on your deployed site:
  ```
  https://YOUR-SITE.netlify.app/api/canva-callback
  ```
  (Replace with whatever Netlify URL you're actually deploying to. If you have a custom domain, register that one too — Canva requires an exact match.)

- **Scopes** — enable:
  - `design:content:read`
  - `design:content:write`
  - `design:meta:read`
  - `brandtemplate:meta:read`
  - `brandtemplate:content:read`
  - `asset:write`
  - `profile:read`

Save the integration. While it's in **review-required** mode you can still use it from your own Canva account; production approval comes later.

## 3. Supabase service-role key

The callback writes Canva tokens onto the user's profile row via the Supabase REST API using the service-role key (because the user's browser session isn't reachable from inside an edge function). Grab it:

1. Supabase dashboard → your project → **Project Settings → API**
2. Copy the **service_role** key (the long one labelled "secret"). Treat like a password.

## 4. Netlify environment variables

Add **all five** in Netlify → your site → **Site configuration → Environment variables**:

| Key | Value |
|---|---|
| `CANVA_CLIENT_ID` | Client ID from Canva |
| `CANVA_CLIENT_SECRET` | Client secret from Canva |
| `CANVA_REDIRECT_URI` | Exact URL you registered above (e.g. `https://your-site.netlify.app/api/canva-callback`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key from Supabase |
| `URL` | Optional — Netlify usually injects this automatically; only set if redirects come back to the wrong origin |

## 5. Frontend config

In `config.js`, paste the Canva **Client ID** into `CANVA_CLIENT_ID`. (Yes, this duplicates the env var — the frontend needs it visible so it can build the authorize-URL, while the backend needs it env-side to exchange the auth code.)

## 6. Apply the Supabase migration

Run `supabase/profiles.sql` in Supabase SQL Editor. The bottom of that file adds the five `canva_*` columns. Safe to re-run — uses `ALTER … ADD COLUMN IF NOT EXISTS`.

## 7. Test the flow

1. Deploy to Netlify.
2. Sign in to the app, open **Profile**, scroll to **Canva connection**.
3. Click **Connect Canva** → you should be sent to Canva's authorize screen → approve → land back on `/profile.html?canva_connected=1` with the status dot green.
4. If you see `canva_error=…`, the query string tells you which step failed. Common ones:
   - `token_exchange_failed` — Client secret or redirect URI mismatch.
   - `invalid_supabase_token` — Session expired between sign-in and OAuth round trip; refresh and try again.
   - `server_misconfigured` — One of the five Netlify env vars is missing.

## What's next

Once OAuth works, the next iteration wires the **Generate via Canva** button on the lead-magnet (and sales-page) PDF download path. That step calls the Canva Autofill API with the magnet content as fields on a **brand template** you've pre-built in Canva. The Canva integration also stores the chosen brand template ID per user (`canva_brand_template_id`) so we can target the right design.
