-- Auth + RLS hardening migration
-- Adds user_roles, has_role() helper, RLS policies on every existing
-- public table, storage policies, rate-limit + email-verification tables,
-- and per-member submission tokens.
--
-- Context: pre-April-2026, RLS was enabled on every table with ZERO
-- policies. With the service-role client used everywhere, this looked
-- "secure" but evaporated the moment anything ran as the anon role.
-- This migration introduces proper policies + a role system.

-- ============================================================
-- 1. user_roles + has_role helper
-- ============================================================

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'staff')),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists user_roles_role_idx on public.user_roles (role);

-- SECURITY DEFINER so RLS policies can call it without triggering
-- recursion on user_roles itself. Locked to the current auth.uid().
create or replace function public.has_role(role_to_check text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = role_to_check
  );
$$;

revoke all on function public.has_role(text) from public;
grant execute on function public.has_role(text) to authenticated;

alter table public.user_roles enable row level security;

drop policy if exists "user_roles read own" on public.user_roles;
create policy "user_roles read own"
  on public.user_roles
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "user_roles admin all" on public.user_roles;
create policy "user_roles admin all"
  on public.user_roles
  for all
  to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

-- ============================================================
-- 2. Admin RLS policies on every existing public table
--    (every operation: select / insert / update / delete)
--
-- Public intake still writes via service role in server actions,
-- which bypasses RLS. These policies defend against the anon
-- client ever being used against these tables directly.
-- ============================================================

do $$
declare
  t text;
  tables text[] := array[
    'app_settings',
    'launch_tasks',
    'launch_team_members',
    'outreach_contacts',
    'content_items',
    'purchase_submissions',
    'reviews',
    'activity_log',
    'coupon_claims'
  ];
begin
  foreach t in array tables loop
    execute format('drop policy if exists %I on public.%I',
      t || '_admin_all', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.has_role(''admin'')) with check (public.has_role(''admin''))',
      t || '_admin_all', t);
  end loop;
end $$;

-- ============================================================
-- 3. Storage bucket policies
--    - arc-pdf: admin-only (contains paid content)
--    - proof-of-purchase: anon insert, admin read/update/delete
--    - claim-screenshots: anon insert, admin read/update/delete
--
-- Server actions that upload on behalf of anonymous users still
-- use the service role, so anon-insert policies are defense-in-depth
-- rather than the primary gate.
-- ============================================================

drop policy if exists "arc_pdf_admin_all" on storage.objects;
create policy "arc_pdf_admin_all"
  on storage.objects
  for all
  to authenticated
  using (bucket_id = 'arc-pdf' and public.has_role('admin'))
  with check (bucket_id = 'arc-pdf' and public.has_role('admin'));

drop policy if exists "pop_admin_all" on storage.objects;
create policy "pop_admin_all"
  on storage.objects
  for all
  to authenticated
  using (bucket_id = 'proof-of-purchase' and public.has_role('admin'))
  with check (bucket_id = 'proof-of-purchase' and public.has_role('admin'));

drop policy if exists "pop_anon_insert" on storage.objects;
create policy "pop_anon_insert"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'proof-of-purchase');

drop policy if exists "claim_admin_all" on storage.objects;
create policy "claim_admin_all"
  on storage.objects
  for all
  to authenticated
  using (bucket_id = 'claim-screenshots' and public.has_role('admin'))
  with check (bucket_id = 'claim-screenshots' and public.has_role('admin'));

drop policy if exists "claim_anon_insert" on storage.objects;
create policy "claim_anon_insert"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'claim-screenshots');

-- ============================================================
-- 4. rate_limits (DB-backed, keyed by ip+scope)
-- ============================================================

create table if not exists public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  count integer not null default 0,
  primary key (key, window_start)
);

create index if not exists rate_limits_window_idx on public.rate_limits (window_start);

alter table public.rate_limits enable row level security;

-- Only service role touches this (via server actions). No authenticated
-- or anon policies on purpose — keeps the surface minimal.

-- ============================================================
-- 5. email_verifications (for /join-launch-team rule #5 flow)
-- ============================================================

create table if not exists public.email_verifications (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text not null,
  phone text,
  token text not null unique,
  expires_at timestamptz not null,
  verified_at timestamptz,
  member_id uuid references public.launch_team_members(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists email_verifications_email_idx on public.email_verifications (lower(email));
create index if not exists email_verifications_token_idx on public.email_verifications (token);
create index if not exists email_verifications_expires_idx on public.email_verifications (expires_at);

alter table public.email_verifications enable row level security;

drop policy if exists "email_verifications_admin_all" on public.email_verifications;
create policy "email_verifications_admin_all"
  on public.email_verifications
  for all
  to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

-- ============================================================
-- 6. Per-member review submission token on launch_team_members
--    Lets /submit-review require proof of row ownership (rule #6).
-- ============================================================

alter table public.launch_team_members
  add column if not exists review_submission_token text;

create unique index if not exists launch_team_members_review_token_idx
  on public.launch_team_members (review_submission_token)
  where review_submission_token is not null;

-- Backfill tokens for any existing members that don't have one yet,
-- so the admin can immediately email submission links.
update public.launch_team_members
set review_submission_token =
  replace(gen_random_uuid()::text, '-', '') ||
  replace(gen_random_uuid()::text, '-', '')
where review_submission_token is null;
