-- ============================================================
-- TRAINER LAUNCH — Phase 0.1 schema: profiles
--
-- Run this once against your Supabase project (SQL Editor →
-- New query → paste → Run). It is idempotent — safe to re-run.
--
-- Restores the "profiles" table that existed in the previous
-- Trainer Launch Supabase project, so a coach's brand/voice/visual
-- details are captured once and reused across every launch instead
-- of being re-typed on the "About you", "Voice & positioning" and
-- "Brand visuals" steps of the new-launch wizard each time.
--
-- Requires 001_phase0_schema.sql to have run first (reuses its
-- public.set_updated_at() trigger function).
-- ============================================================

-- ------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------
-- One row per user. user_id doubles as the primary key since
-- there's exactly one profile per account.
--
-- canva_access_token / canva_refresh_token are reserved columns
-- for a future Canva OAuth integration — nothing in this app
-- writes to them yet. When that integration is built, prefer
-- moving those two columns to the vault-pointer pattern used by
-- public.platform_connections (secret lives in the Anthropic
-- vault, only a pointer lives here) rather than storing raw
-- tokens in a row readable by the owning user's browser session.
create table if not exists public.profiles (
  user_id                  uuid primary key references auth.users(id) on delete cascade,

  -- About you
  full_name                text,
  business_name            text,
  handle                   text,
  niche                    text,
  credentials              text,
  testimonials             jsonb not null default '[]'::jsonb,

  -- Brand story (optional extras, not yet in the wizard)
  history                  text,
  what_sets_apart          text,
  brand_messaging          text,
  website_url              text,

  -- Voice & positioning
  tone                     text[] not null default '{}',
  avoid_words              text,
  unique_mechanism         text,
  contrarian_belief        text,

  -- Brand visuals
  photo_url                text,
  logo_url                 text,
  app_url                  text,
  brand_primary            text,
  brand_secondary          text,
  brand_accent             text,
  font_url                 text,
  font_name                text,

  -- Canva integration (reserved — see note above)
  canva_access_token       text,
  canva_refresh_token      text,
  canva_token_expires_at   timestamptz,
  canva_user_id            text,
  canva_brand_template_id  text,

  updated_at               timestamptz not null default now()
);

-- ------------------------------------------------------------
-- updated_at trigger (reuses public.set_updated_at from 001)
-- ------------------------------------------------------------
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "profiles: owner can read"   on public.profiles;
drop policy if exists "profiles: owner can insert" on public.profiles;
drop policy if exists "profiles: owner can update" on public.profiles;
drop policy if exists "profiles: owner can delete" on public.profiles;

create policy "profiles: owner can read"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "profiles: owner can insert"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "profiles: owner can update"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "profiles: owner can delete"
  on public.profiles for delete
  using (auth.uid() = user_id);
