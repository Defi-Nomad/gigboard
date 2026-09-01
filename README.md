# GigBoard

A minimal, functional gig marketplace: clients post jobs, an admin approves
them, workers browse and apply with their X (Twitter) profile, and everyone
coordinates the actual work over Telegram. No crypto, escrow, or messaging
system yet - see "What's deliberately not built yet" below.

Built with Next.js 14 (App Router, TypeScript), Supabase (Postgres, Auth,
Row Level Security), and Tailwind CSS.

## How roles work (read this first)

There is no role picker. Every signed-in account can **both** post jobs
(shows up under "My jobs") **and** apply to jobs (shows up under "My
applications"). This matches how small gig platforms actually get used - the
same person often does both - and it means there's no onboarding step where
someone has to choose "worker" or "client" before they can do anything.

The one real permission boundary is **admin**, which is separate from the
account itself (see "Admin setup" below).

## 1. Project setup

```bash
npm install
cp .env.example .env.local
# fill in .env.local, see sections below
npm run dev
```

Open http://localhost:3000 - it redirects to `/jobs`.

## 2. Supabase setup

1. Create a project at https://supabase.com/dashboard.
2. Go to **SQL Editor -> New query**, paste the entire contents of
   `supabase/schema.sql`, and run it. This creates every table, enum,
   trigger, and Row Level Security policy the app needs. It's safe to
   re-run if you ever need to.
3. Go to **Project Settings -> API** and copy:
   - **Project URL** -> `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - (optional, see admin setup) **service_role key** ->
     `SUPABASE_SERVICE_ROLE_KEY`

Row Level Security is on for every table. The short version of what it
enforces:
- Anyone can browse jobs with status `approved`.
- A client can see and edit only their own jobs, and can never set a job's
  status to `approved`/`rejected` themselves (only `pending` on creation,
  or `closed` later).
- A worker can see only their own applications; a client can see
  applications to *their* jobs; nobody can self-accept.
- Only rows in `admin_emails` (or the `is_admin()` check it powers) can
  approve/reject jobs.

## 3. Google OAuth setup

1. In the Supabase dashboard: **Authentication -> Providers -> Google** ->
   toggle it on.
2. In the [Google Cloud Console](https://console.cloud.google.com/):
   create an OAuth 2.0 Client ID (type: Web application).
   - **Authorized redirect URI**: use the callback URL Supabase shows you
     on that same provider settings page - it looks like
     `https://<your-project-ref>.supabase.co/auth/v1/callback`.
3. Copy the **Client ID** and **Client Secret** from Google into the
   Supabase Google provider settings and save.
4. In **Authentication -> URL Configuration** in Supabase, set:
   - **Site URL**: your deployed URL (or `http://localhost:3000` for local
     dev)
   - **Redirect URLs**: add both `http://localhost:3000/auth/callback` and
     `https://your-app.vercel.app/auth/callback`

That's it - the app's `/login` page and `/auth/callback` route handle the
rest.

## 4. Admin setup

You need at least one admin so *someone* can approve jobs. Two ways to do
it, use either one (or both):

### Option A - the `admin_emails` table (recommended, no extra env var)

1. Sign in to the deployed app once with the Google account you want as
   admin (this creates your `profiles` row).
2. In Supabase **SQL Editor**, run:
   ```sql
   insert into public.admin_emails (email) values ('you@example.com');
   ```
3. Refresh the app - you'll see an **Admin** link in the nav bar.

### Option B - the `ADMIN_EMAIL` environment variable

Set `ADMIN_EMAIL=you@example.com` in your environment (see below). Anyone
signing in with that exact email is treated as an admin in the UI
immediately, no SQL needed.

**One nuance:** Supabase's database security rules (Row Level Security)
can't read a Next.js environment variable - they can only check the
`admin_emails` table. So the app automatically copies an `ADMIN_EMAIL`
match into that table the first time you sign in, **but only if you've
also set `SUPABASE_SERVICE_ROLE_KEY`** (Project Settings -> API ->
`service_role`, keep it secret, server-only). If you don't set that key,
you'll still see the admin screens, but the approve/reject buttons will
show an error telling you to add the row manually - at which point Option
A takes over.

Simplest path if you don't want to think about this: just do Option A.

## 5. Environment variables

See `.env.example` for the full list with comments. Summary:

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | from Supabase API settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | from Supabase API settings |
| `NEXT_PUBLIC_SITE_URL` | yes | `http://localhost:3000` locally, your real domain in production |
| `ADMIN_EMAIL` | no | see Admin setup |
| `SUPABASE_SERVICE_ROLE_KEY` | no | see Admin setup - never expose to the browser |

## 6. Vercel deployment

1. Push this project to a GitHub repo.
2. In Vercel: **New Project -> import the repo**. Framework preset
   `Next.js` is auto-detected.
3. Add the environment variables from the table above under **Settings ->
   Environment Variables** (set `NEXT_PUBLIC_SITE_URL` to your Vercel URL,
   e.g. `https://gigboard.vercel.app`).
4. Deploy.
5. Go back to Supabase **Authentication -> URL Configuration** and add
   `https://gigboard.vercel.app/auth/callback` to the redirect URL list
   (see Google OAuth setup step 4) - this is the step people most often
   forget, and login will fail with a redirect mismatch until it's done.

## 7. How to change the Telegram contacts

Each job stores its own Telegram contact (whatever the client typed in the
"Telegram contact" field when posting - a `@handle` or a full `t.me` link).
There's nothing to configure per-deployment for that part.

The **support** handle shown elsewhere in the app (not tied to a specific
job) lives in `src/lib/constants.ts`:

```ts
export const TELEGRAM_SUPPORT_HANDLE = "gigboard_support";
```

Change that string to your own handle. `buildTelegramUrl()` in the same
file is what turns any stored contact (`@handle`, `handle`, or a full URL)
into a real `https://t.me/...` link for the "Contact on Telegram" button -
edit it there if you want different parsing rules.

## 8. How to add or edit job categories

Also in `src/lib/constants.ts`:

```ts
export const JOB_CATEGORIES = [
  "Content Writing",
  "Social Media",
  "Development",
  "Design",
  "Translation",
  "Data Entry",
  "Marketing",
  "Video Editing",
  "Other",
] as const;
```

Add, remove, or rename entries in this array. It drives both the "post a
job" category dropdown and the browse/filter dropdown. Categories are
stored as plain text on each job row, so editing this list doesn't require
a database migration - existing jobs keep whatever category string they
already have.

## What's deliberately not built yet

By design, none of the following exist in this codebase: crypto payments,
escrow, wallet connection, smart contracts, NFTs, a token system, worker
ratings/reviews, public profiles, freelancer bidding, a messaging system,
the X API, an automated Telegram bot, automatic X verification, or KYC.

The code is structured so these can be added later without a rewrite:
- `jobs` and `applications` are plain tables with room for new columns
  (e.g. an `escrow_status` or `verified_at` column) without touching
  existing RLS logic.
- `src/lib/constants.ts` and `src/lib/validation.ts` centralize the rules
  that a future X-API or Telegram-bot integration would need to hook into
  (URL validation, contact formatting).
- Server actions are isolated per route (`app/*/actions.ts`), so e.g.
  swapping manual admin approval for "AI-powered job matching" later means
  changing one file, not the whole app.

## Project structure

```
src/
  app/
    login/                Google sign-in
    auth/callback/         OAuth code -> session exchange
    jobs/                  browse + job detail + apply
    post-job/               job submission form
    dashboard/
      worker/               applications you've submitted
      client/                jobs you've posted + applicant management
      admin/                 pending-job queue + moderation
    unauthorized/           shown to non-admins hitting /dashboard/admin
  components/               shared UI (navbar, cards, badges, form inputs)
  lib/
    supabase/               browser/server/middleware/admin Supabase clients
    auth.ts                 getCurrentUser() / requireUser() / admin check
    constants.ts            job categories, Telegram handle
    validation.ts           shared client+server validation
    utils.ts                formatting helpers
  types/database.types.ts  hand-written types matching supabase/schema.sql
supabase/schema.sql        the entire database: tables, RLS, triggers
middleware.ts               session refresh + route protection
```
