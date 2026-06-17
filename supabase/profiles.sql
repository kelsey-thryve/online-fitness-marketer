-- ============================================================
-- TRAINER LAUNCH — profiles table migration
--
-- Run this in Supabase: SQL Editor → New query → paste → Run.
-- This drops any pre-existing public.profiles table and rebuilds it
-- from scratch. Safe while the app has no real profile data.
-- ============================================================

drop table if exists public.profiles cascade;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,

  -- About
  full_name text,
  business_name text,
  handle text,
  niche text,
  credentials text,
  history text,
  what_sets_apart text,
  brand_messaging text,

  -- Voice
  tone text[] default '{}',
  avoid_words text,
  unique_mechanism text,
  contrarian_belief text,

  -- Visuals
  photo_url text,
  logo_url text,
  app_url text,

  -- Brand
  brand_primary text default '#6366f1',
  brand_secondary text default '#10b981',
  brand_accent text default '#ffffff',
  font_url text,
  font_name text,

  -- The coach's own website. When set, used as the template for the
  -- generated sales / squeeze pages (instead of the bundled Renshaw
  -- template).
  website_url text,

  -- Testimonials — array of { name, quote, photo_url, numbers }
  testimonials jsonb default '[]'::jsonb,

  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profile select own"  on public.profiles;
drop policy if exists "Profile insert own"  on public.profiles;
drop policy if exists "Profile update own"  on public.profiles;

create policy "Profile select own"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Profile insert own"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Profile update own"
  on public.profiles for update
  using (auth.uid() = user_id);

create or replace function public.profiles_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.profiles_touch_updated_at();

-- ============================================================
-- Idempotent additions for existing deployments. Re-running this
-- file is safe; ALTER ... ADD COLUMN IF NOT EXISTS only fires if
-- the column is missing.
-- ============================================================
alter table public.profiles add column if not exists website_url text;

-- Canva Connect API — OAuth tokens stored per profile. The
-- canva-callback edge function writes these after the user
-- authorises; the autofill flow reads them.
alter table public.profiles add column if not exists canva_access_token text;
alter table public.profiles add column if not exists canva_refresh_token text;
alter table public.profiles add column if not exists canva_token_expires_at timestamptz;
alter table public.profiles add column if not exists canva_user_id text;
alter table public.profiles add column if not exists canva_brand_template_id text;
