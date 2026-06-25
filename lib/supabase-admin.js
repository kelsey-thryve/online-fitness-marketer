/* ============================================================
   TRAINER LAUNCH — Server-side Supabase REST client (service role)

   Bypasses RLS — only call from edge functions with the service
   role key in env. NEVER expose the service role key to the browser.

   Thin wrapper around Supabase's PostgREST API. We don't pull in
   @supabase/supabase-js here to keep edge-function cold starts fast.
   ============================================================ */

function adminHeaders(serviceRoleKey) {
  return {
    'apikey': serviceRoleKey,
    'Authorization': `Bearer ${serviceRoleKey}`,
    'content-type': 'application/json'
  };
}

/**
 * Upsert a row by an arbitrary unique-key constraint.
 *
 * @param {Object} ctx
 * @param {string} ctx.supabaseUrl
 * @param {string} ctx.serviceRoleKey
 * @param {string} table
 * @param {Object} row
 * @param {Object} [options]
 * @param {string} [options.onConflict] - Column name(s) for the conflict target (defaults to PK)
 * @returns {Promise<Object>} The upserted row
 */
export async function upsert(ctx, table, row, options = {}) {
  const params = new URLSearchParams();
  if (options.onConflict) params.set('on_conflict', options.onConflict);

  const url = `${ctx.supabaseUrl}/rest/v1/${table}${params.toString() ? '?' + params.toString() : ''}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...adminHeaders(ctx.serviceRoleKey),
      'Prefer': 'return=representation,resolution=merge-duplicates'
    },
    body: JSON.stringify(row)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase upsert ${table} failed (${response.status}): ${text}`);
  }
  const rows = await response.json();
  return rows[0];
}

/**
 * Select rows matching a single equality filter.
 */
export async function select(ctx, table, filters = {}) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    params.set(k, `eq.${v}`);
  }
  const url = `${ctx.supabaseUrl}/rest/v1/${table}?${params.toString()}`;

  const response = await fetch(url, {
    headers: adminHeaders(ctx.serviceRoleKey)
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase select ${table} failed (${response.status}): ${text}`);
  }
  return await response.json();
}

/**
 * Delete rows matching an equality filter. Returns count.
 */
export async function deleteRows(ctx, table, filters) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    params.set(k, `eq.${v}`);
  }
  const url = `${ctx.supabaseUrl}/rest/v1/${table}?${params.toString()}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: { ...adminHeaders(ctx.serviceRoleKey), 'Prefer': 'return=representation' }
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase delete ${table} failed (${response.status}): ${text}`);
  }
  const rows = await response.json();
  return rows.length;
}
