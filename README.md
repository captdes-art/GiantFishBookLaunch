# Giant Fish & Happiness Command Center

V1 internal admin web app for running the *Giant Fish and Happiness* book launch with Supabase as the system of record.

See [BUILD_LOG.md](/Users/skipperquest/Projects/giant-fish-command-center/BUILD_LOG.md) for the running implementation log and [supabase/migrations/202603300001_initial_schema.sql](/Users/skipperquest/Projects/giant-fish-command-center/supabase/migrations/202603300001_initial_schema.sql) for the schema.

## Stack

- Next.js App Router
- TypeScript
- Supabase Postgres + Storage
- Server actions for admin updates and public proof-of-purchase intake

## V1 modules included

- Dashboard
- Tasks / Timeline
- Launch Team CRM
- Outreach Pipeline
- Content Planner
- Purchases
- Reviews
- Activity Log
- Settings
- Public proof-of-purchase form

## Run locally

1. Copy `.env.example` to `.env.local`.
2. Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
3. Install dependencies with `npm install`.
4. Start local Supabase with `supabase start`.
5. Apply migrations and seed data with `supabase db reset --local`.
6. Run the app with `npm run dev`.

If Supabase env vars are missing, the UI falls back to mock data so the scaffold still renders, but writes and uploads will not persist.

## Project structure

- [app](/Users/skipperquest/Projects/giant-fish-command-center/app)
- [components](/Users/skipperquest/Projects/giant-fish-command-center/components)
- [lib](/Users/skipperquest/Projects/giant-fish-command-center/lib)
- [supabase](/Users/skipperquest/Projects/giant-fish-command-center/supabase)
- [scripts/bootstrap.sh](/Users/skipperquest/Projects/giant-fish-command-center/scripts/bootstrap.sh)

## Notes

- Launch target defaults to `2026-05-26`, immediately after Memorial Day 2026, and remains editable in Settings.
- Outreach and content workflows stay draft-first.
- Coupon fulfillment remains manual-first.
- Out-of-scope automation is intentionally not implemented in V1.
