/* ============================================================
   TRAINER LAUNCH — Auth helpers (Supabase)
   Loaded as a module on every page that needs auth.
   ============================================================ */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const cfg = window.TRAINER_LAUNCH_CONFIG || {};
export const supabase = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getAccessToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  return user;
}

export async function requireGuest() {
  const user = await getUser();
  if (user) {
    // Honor ?return_to= for flows that send signed-in users back to where they started
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('return_to');
    const dest = (raw && raw.startsWith('/') && !raw.startsWith('//')) ? raw : 'dashboard.html';
    window.location.href = dest;
  }
}

export async function signUp(email, password, metadata = {}) {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      // After the user clicks the confirmation link in their email,
      // Supabase redirects them here with the session in the URL hash.
      // The Supabase client (detectSessionInUrl is on by default) picks
      // up the session automatically, so requireAuth() on dashboard.html
      // sees them as logged-in and renders the dashboard.
      emailRedirectTo: `${window.location.origin}/dashboard.html`
    }
  });
}

export async function signIn(email, password) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = 'index.html';
}

/* --- Supabase Storage upload (bucket "uploads", public) --- */

export async function uploadImage(file, userId) {
  const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '');
  const rand = Math.random().toString(36).slice(2, 10);
  const path = `${userId}/${Date.now()}-${rand}.${ext}`;
  const { error } = await supabase.storage.from('uploads').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || 'image/png'
  });
  if (error) throw error;
  const { data } = supabase.storage.from('uploads').getPublicUrl(path);
  return data.publicUrl;
}

/* --- Launch storage (Supabase `launches` table) ---
   Was localStorage — blew past the browser's ~5-10MB per-origin quota
   once a few launches' generated graphics were embedded as base64. */

function rowToChallenge(row) {
  return {
    id: row.id,
    name: row.name,
    tier: row.kit?.tier,
    createdAt: row.created_at,
    deliverableCount: row.kit?.deliverableCount,
    intake: row.intake || {},
    docs: row.kit?.docs || {},
    graphics: row.kit?.graphics || {}
  };
}

export async function listChallenges(userId) {
  const { data, error } = await supabase
    .from('launches')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('listChallenges failed:', error.message);
    return [];
  }
  return (data || []).map(rowToChallenge);
}

export async function saveChallenge(userId, challenge) {
  const { data, error } = await supabase
    .from('launches')
    .insert({
      user_id: userId,
      name: challenge.name || 'Untitled launch',
      status: 'ready',
      intake: challenge.intake || {},
      kit: {
        tier: challenge.tier,
        deliverableCount: challenge.deliverableCount,
        docs: challenge.docs || {},
        graphics: challenge.graphics || {}
      }
    })
    .select()
    .single();
  if (error) throw error;
  return rowToChallenge(data);
}

export async function getChallenge(userId, id) {
  const { data, error } = await supabase
    .from('launches')
    .select('*')
    .eq('user_id', userId)
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return rowToChallenge(data);
}

export async function deleteChallenge(userId, id) {
  const { error } = await supabase.from('launches').delete().eq('user_id', userId).eq('id', id);
  if (error) throw error;
}
