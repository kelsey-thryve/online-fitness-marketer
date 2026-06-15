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
    window.location.href = 'dashboard.html';
  }
}

export async function signUp(email, password, metadata = {}) {
  return await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata }
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
  return uploadAsset(file, userId, 'images');
}

export async function uploadAsset(file, userId, folder = 'images') {
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  const rand = Math.random().toString(36).slice(2, 10);
  const path = `${userId}/${folder}/${Date.now()}-${rand}.${ext}`;
  const { error } = await supabase.storage.from('uploads').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || 'application/octet-stream'
  });
  if (error) throw error;
  const { data } = supabase.storage.from('uploads').getPublicUrl(path);
  return data.publicUrl;
}

/* --- Profile (Supabase `profiles` table) --- */

export async function getProfile() {
  const user = await getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveProfile(updates) {
  const user = await getUser();
  if (!user) throw new Error('Not signed in.');
  const row = { user_id: user.id, ...updates };
  const { data, error } = await supabase
    .from('profiles')
    .upsert(row, { onConflict: 'user_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
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

/* --- Storage hygiene -----------------------------------------------
   Earlier versions of the app stored each generated graphic as a
   multi-MB base64 dataURL on the challenge record. With 4 graphics +
   the new editable HTML sales page, two or three saved launches could
   blow past the browser's ~5MB localStorage quota and any further
   save would fail with "exceeded the quota". This pass drops any
   surviving dataURL graphics from existing records so subsequent
   saves (now using Supabase storage URLs) have room to land. Safe to
   re-run — it's a no-op once nothing legacy is left. */
export function cleanupLegacyGraphics(userId) {
  const key = challengesKey(userId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const list = JSON.parse(raw);
    let changed = false;
    for (const c of list) {
      if (!c || !c.graphics) continue;
      for (const gid of Object.keys(c.graphics)) {
        const v = c.graphics[gid];
        if (typeof v === 'string' && v.startsWith('data:')) {
          delete c.graphics[gid];
          changed = true;
        }
      }
    }
    if (changed) localStorage.setItem(key, JSON.stringify(list));
  } catch (e) {
    console.warn('cleanupLegacyGraphics failed; clearing list to free quota:', e);
    try { localStorage.removeItem(key); } catch (_) {}
  }
}
