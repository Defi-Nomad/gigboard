-- ============================================================================
-- GigBoard database schema
-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query)
-- Safe to re-run: uses "if not exists" / "or replace" where possible.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. profiles
-- One row per authenticated user, created automatically on first sign-in.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  x_profile_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- 2. admin_emails
-- Manually curated allow-list. A user is an admin if their auth email
-- appears here, OR if it matches the ADMIN_EMAIL server environment
-- variable (checked in application code, not here).
-- ----------------------------------------------------------------------------
create table if not exists public.admin_emails (
  email text primary key,
  added_at timestamptz not null default now()
);

alter table public.admin_emails enable row level security;

-- A signed-in user may check only their own email's admin status.
drop policy if exists "admin_emails_self_check" on public.admin_emails;
create policy "admin_emails_self_check"
  on public.admin_emails for select
  using (email = auth.jwt() ->> 'email');

-- No insert/update/delete policy is defined on purpose: rows are added by
-- you, manually, from the SQL editor (or via the service role key), never
-- from the app. See README "Admin setup".

-- ----------------------------------------------------------------------------
-- 3. is_admin() helper
-- SECURITY DEFINER so it can check admin_emails on behalf of the caller
-- without needing a broad RLS policy on that table (avoids leaking the
-- full admin list to every user).
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admin_emails
    where email = auth.jwt() ->> 'email'
  );
$$;

-- ----------------------------------------------------------------------------
-- 4. handle_new_user trigger
-- Creates a profiles row automatically the first time someone signs in.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 5. jobs
-- ----------------------------------------------------------------------------
do $$ begin
  create type public.job_status as enum ('pending', 'approved', 'rejected', 'closed');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  description text not null check (char_length(description) between 10 and 5000),
  category text not null,
  budget_amount numeric(12, 2) not null check (budget_amount >= 0),
  budget_currency text not null default 'USD',
  telegram_contact text not null,
  status public.job_status not null default 'pending',
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.jobs enable row level security;

drop policy if exists "jobs_select" on public.jobs;
create policy "jobs_select"
  on public.jobs for select
  using (
    status = 'approved'
    or client_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists "jobs_insert_own" on public.jobs;
create policy "jobs_insert_own"
  on public.jobs for insert
  with check (
    client_id = auth.uid()
    and status = 'pending'
  );

-- Clients may edit their own job while it is pending, or close it once
-- approved. They can never set status to 'approved' or 'rejected' directly.
-- Admins may update anything (used to approve/reject).
drop policy if exists "jobs_update" on public.jobs;
create policy "jobs_update"
  on public.jobs for update
  using (client_id = auth.uid() or public.is_admin())
  with check (
    public.is_admin()
    or (
      client_id = auth.uid()
      and status in ('pending', 'closed')
    )
  );

drop policy if exists "jobs_delete_own_pending" on public.jobs;
create policy "jobs_delete_own_pending"
  on public.jobs for delete
  using (client_id = auth.uid() and status = 'pending');

drop trigger if exists set_jobs_updated_at on public.jobs;
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger set_jobs_updated_at
  before update on public.jobs
  for each row execute procedure public.set_updated_at();

create index if not exists jobs_status_idx on public.jobs (status);
create index if not exists jobs_category_idx on public.jobs (category);
create index if not exists jobs_client_idx on public.jobs (client_id);

-- ----------------------------------------------------------------------------
-- 6. applications
-- ----------------------------------------------------------------------------
do $$ begin
  create type public.application_status as enum ('pending', 'accepted', 'rejected');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  worker_id uuid not null references public.profiles(id) on delete cascade,
  x_profile_url text not null,
  cover_message text not null check (char_length(cover_message) between 10 and 2000),
  status public.application_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (job_id, worker_id)
);

alter table public.applications enable row level security;

drop policy if exists "applications_select" on public.applications;
create policy "applications_select"
  on public.applications for select
  using (
    worker_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.jobs j
      where j.id = job_id and j.client_id = auth.uid()
    )
  );

drop policy if exists "applications_insert_own" on public.applications;
create policy "applications_insert_own"
  on public.applications for insert
  with check (
    worker_id = auth.uid()
    and exists (
      select 1 from public.jobs j
      where j.id = job_id
        and j.status = 'approved'
        and j.client_id <> auth.uid()
    )
  );

-- Only the job's owner (client) or an admin may change an application's
-- status; the worker who applied cannot self-accept.
drop policy if exists "applications_update_by_job_owner" on public.applications;
create policy "applications_update_by_job_owner"
  on public.applications for update
  using (
    public.is_admin()
    or exists (
      select 1 from public.jobs j
      where j.id = job_id and j.client_id = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.jobs j
      where j.id = job_id and j.client_id = auth.uid()
    )
  );

create index if not exists applications_job_idx on public.applications (job_id);
create index if not exists applications_worker_idx on public.applications (worker_id);

-- ============================================================================
-- ADMIN SETUP
-- Run this line (with your real email) once, after you have signed in to
-- the app at least one time with that Google account:
--
--   insert into public.admin_emails (email) values ('you@example.com');
--
-- See README.md for the full explanation and the ADMIN_EMAIL env-var
-- alternative.
-- ============================================================================
