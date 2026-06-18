-- ============================================================
-- TRAINER LAUNCH — Supabase Storage setup
--
-- Run this in Supabase: SQL Editor → New query → paste → Run.
-- Safe to re-run; uses ON CONFLICT / IF NOT EXISTS.
-- ============================================================

-- 1. Make sure the `uploads` bucket exists, is public, and accepts
--    files up to 25 MB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'uploads',
  'uploads',
  true,
  26214400, -- 25 MB
  array[
    'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml',
    'font/ttf', 'font/otf', 'font/woff', 'font/woff2',
    'application/octet-stream'
  ]
)
on conflict (id) do update set
  public = true,
  file_size_limit = 26214400;

-- 2. RLS policies on storage.objects so authenticated users can
--    upload to / read from / update their own folder. Files are
--    stored as `<user_id>/<folder>/<filename>`, so the first path
--    segment IS the user_id we check against auth.uid().

drop policy if exists "uploads_select_public" on storage.objects;
drop policy if exists "uploads_insert_own"   on storage.objects;
drop policy if exists "uploads_update_own"   on storage.objects;
drop policy if exists "uploads_delete_own"   on storage.objects;

create policy "uploads_select_public"
on storage.objects for select
to public
using (bucket_id = 'uploads');

create policy "uploads_insert_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'uploads'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "uploads_update_own"
on storage.objects for update
to authenticated
using (
  bucket_id = 'uploads'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "uploads_delete_own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'uploads'
  and (storage.foldername(name))[1] = auth.uid()::text
);
