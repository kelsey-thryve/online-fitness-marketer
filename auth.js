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

/* --- Challenge storage (localStorage, scoped by user id) --- */

function challengesKey(userId) {
  return `trainerlaunch:challenges:${userId}`;
}

export function listChallenges(userId) {
  try {
    return JSON.parse(localStorage.getItem(challengesKey(userId)) || '[]');
  } catch { return []; }
}

export function saveChallenge(userId, challenge) {
  const list = listChallenges(userId);
  list.unshift(challenge);
  localStorage.setItem(challengesKey(userId), JSON.stringify(list));
}

export function getChallenge(userId, id) {
  return listChallenges(userId).find(c => c.id === id);
}

export function deleteChallenge(userId, id) {
  const list = listChallenges(userId).filter(c => c.id !== id);
  localStorage.setItem(challengesKey(userId), JSON.stringify(list));
}
