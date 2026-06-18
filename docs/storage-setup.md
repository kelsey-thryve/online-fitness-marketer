# Supabase Storage setup

If profile image uploads (logo, photo of you, app screenshot) silently fail or the preview never shows, the Supabase storage bucket isn't fully configured yet. One-time SQL fixes it.

## What it does

`supabase/storage.sql` does three things:

1. Creates a `uploads` bucket if missing (or updates the existing one).
2. Marks the bucket **public** so the URLs the app stores in `profiles.photo_url` etc resolve in an `<img src>` tag.
3. Adds 4 row-level-security policies on `storage.objects` so authenticated users can upload to / read / update / delete files in their own `<user_id>/…` folder, and so any visitor can read images in the bucket.

## How to run it

1. Supabase dashboard → SQL Editor → New query.
2. Paste the entire contents of `supabase/storage.sql`.
3. Run. You should see "Success. No rows returned."

## Verifying the bucket

Supabase dashboard → Storage. You should see an `uploads` bucket with the public icon. Click into it; it'll be empty until you upload your first profile image.

## How to debug uploads that still fail

1. Open the app → Profile.
2. Open DevTools → Console.
3. Click any of the three image tiles and pick a PNG.
4. Watch the console for `[profile] uploading …` and either `[profile] upload OK -> …` or `[profile] upload failed …`.

Common errors and fixes:

| Console error | Cause | Fix |
|---|---|---|
| `new row violates row-level security policy` | RLS policies missing | Run `supabase/storage.sql` |
| `Bucket not found` | The `uploads` bucket doesn't exist | Run `supabase/storage.sql` |
| `mime type … is not supported` | The bucket's `allowed_mime_types` doesn't include your file type | Re-run `supabase/storage.sql` (it adds image/* and font/*) |
| `Payload too large` | File over the 25 MB limit | Resize/compress the image |
| Network 401 | Session expired | Sign out + back in |
