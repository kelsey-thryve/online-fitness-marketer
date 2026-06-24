-- ============================================================
-- TRAINER LAUNCH — Phase 0 schema
--
-- Run this once against your Supabase project (SQL Editor →
-- New query → paste → Run). It is idempotent — safe to re-run.
--
-- Creates three tables:
--   launches              — first-class launch records (replaces localStorage)
--   platform_connections  — per-user, per-platform connection state
--   publish_jobs          — one row per "Go Live" click, with per-platform progress
--
-- All tables have RLS enabled and policies that restrict access to
-- the owning user via auth.uid().
-- ============================================================

-- ------------------------------------------------------------
-- Extensions
-- ------------------------------------------------------------
create extension if not exists "pgcrypto";   -- for gen_random_uuid()

-- ------------------------------------------------------------
-- launches
-- ------------------------------------------------------------
-- One row per challenge launch. The "kit" jsonb holds all 7
-- generated deliverables (sales page, emails, ad copy, scripts,
-- DM flow, plan, positioning brief).
create table if not exists public.launches (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  status       text not null default 'draft'
                check (status in ('draft', 'ready', 'publishing', 'published', 'archived')),
  intake       jsonb not null default '{}'::jsonb,   -- raw intake answers
  kit          jsonb not null default '{}'::jsonb,   -- generated deliverables
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists launches_user_id_created_at_idx
  on public.launches (user_id, created_at desc);

-- ------------------------------------------------------------
-- platform_connections
-- ------------------------------------------------------------
-- Records that user X has connected platform Y, with the
-- Anthropic vault credential ID where the OAuth token lives.
-- Secrets are NEVER stored in Supabase — only the vault pointer.
create table if not exists public.platform_connections (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references auth.users(id) on delete cascade,
  platform                 text not null
                            check (platform in ('meta', 'google_ads', 'klaviyo', 'duda')),
  status                   text not null default 'active'
                            check (status in ('active', 'expired', 'revoked', 'error')),
  vault_id                 text,                       -- Anthropic vault ID (vlt_...)
  vault_credential_id      text,                       -- Anthropic credential ID
  external_account_id      text,                       -- platform's account/business ID
  external_account_label   text,                       -- human-readable (e.g. "Acme Coaching")
  scopes                   text[] not null default '{}',
  metadata                 jsonb not null default '{}'::jsonb,
  connected_at             timestamptz not null default now(),
  last_used_at             timestamptz,
  unique (user_id, platform)
);

create index if not exists platform_connections_user_id_idx
  on public.platform_connections (user_id);

-- ------------------------------------------------------------
-- publish_jobs
-- ------------------------------------------------------------
-- One row per "Go Live" click. Per-platform progress lives in
-- the steps jsonb so we can render real-time status in the UI.
--
-- steps shape:
--   {
--     "klaviyo": { "status": "succeeded", "started_at": "...",
--                  "finished_at": "...", "result": {...} },
--     "meta":    { "status": "failed", "error": "...", ... },
--     ...
--   }
create table if not exists public.publish_jobs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  launch_id    uuid not null references public.launches(id) on delete cascade,
  status       text not null default 'pending'
                check (status in ('pending', 'running', 'partial', 'succeeded', 'failed', 'canceled')),
  platforms    text[] not null,                        -- which platforms this job targets
  steps        jsonb not null default '{}'::jsonb,
  error        text,
  created_at   timestamptz not null default now(),
  started_at   timestamptz,
  finished_at  timestamptz
);

create index if not exists publish_jobs_user_id_created_at_idx
  on public.publish_jobs (user_id, created_at desc);

create index if not exists publish_jobs_launch_id_idx
  on public.publish_jobs (launch_id);

-- ------------------------------------------------------------
-- updated_at trigger for launches
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists launches_set_updated_at on public.launches;
create trigger launches_set_updated_at
  before update on public.launches
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table public.launches              enable row level security;
alter table public.platform_connections  enable row level security;
alter table public.publish_jobs          enable row level security;

-- Drop existing policies (idempotent re-runs)
drop policy if exists "launches: owner can read"   on public.launches;
drop policy if exists "launches: owner can insert" on public.launches;
drop policy if exists "launches: owner can update" on public.launches;
drop policy if exists "launches: owner can delete" on public.launches;
drop policy if exists "platform_connections: owner can read"   on public.platform_connections;
drop policy if exists "platform_connections: owner can insert" on public.platform_connections;
drop policy if exists "platform_connections: owner can update" on public.platform_connections;
drop policy if exists "platform_connections: owner can delete" on public.platform_connections;
drop policy if exists "publish_jobs: owner can read"   on public.publish_jobs;
drop policy if exists "publish_jobs: owner can insert" on public.publish_jobs;
drop policy if exists "publish_jobs: owner can update" on public.publish_jobs;
drop policy if exists "publish_jobs: owner can delete" on public.publish_jobs;

-- launches
create policy "launches: owner can read"
  on public.launches for select
  using (auth.uid() = user_id);

create policy "launches: owner can insert"
  on public.launches for insert
  with check (auth.uid() = user_id);

create policy "launches: owner can update"
  on public.launches for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "launches: owner can delete"
  on public.launches for delete
  using (auth.uid() = user_id);

-- platform_connections — writes only via the OAuth edge function
-- using the service role key, so end users get read-only via RLS.
create policy "platform_connections: owner can read"
  on public.platform_connections for select
  using (auth.uid() = user_id);

create policy "platform_connections: owner can insert"
  on public.platform_connections for insert
  with check (auth.uid() = user_id);

create policy "platform_connections: owner can update"
  on public.platform_connections for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "platform_connections: owner can delete"
  on public.platform_connections for delete
  using (auth.uid() = user_id);

-- publish_jobs
create policy "publish_jobs: owner can read"
  on public.publish_jobs for select
  using (auth.uid() = user_id);

create policy "publish_jobs: owner can insert"
  on public.publish_jobs for insert
  with check (auth.uid() = user_id);

create policy "publish_jobs: owner can update"
  on public.publish_jobs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "publish_jobs: owner can delete"
  on public.publish_jobs for delete
  using (auth.uid() = user_id);
