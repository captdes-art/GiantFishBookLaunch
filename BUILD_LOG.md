# Build Log

## 2026-03-30

- Read the source-of-truth spec and confirmed the repo was empty.
- Selected a V1 stack: Next.js App Router + TypeScript + Supabase.
- Building an internal admin dashboard with public proof-of-purchase intake.
- Keeping the workflow manual-first for coupons and draft-first for outreach/content.
- Added the full project scaffold, Supabase migration, seed SQL, and all V1 module pages.
- Implemented the public proof-of-purchase upload flow through a server action and Supabase Storage bucket path.
- Added mock fallback data so the UI can render before Supabase is connected.
- Blocker: `npm install` cannot complete in this sandbox because `registry.npmjs.org` resolves with `ENOTFOUND`.
- Blocker: full `next build` verification is pending until dependencies can be installed.
- Blocker: required `openclaw system event ...` notification was attempted twice and failed because the local OpenClaw gateway at `ws://127.0.0.1:18789` closed with code `1006`.

## 2026-04-17

- Set `DASHBOARD_USERNAME` and `DASHBOARD_PASSWORD` on Vercel (production + preview) for `giant-fish-book-launch`.
- Redeployed latest production (dpl `lk5swe9ia`) so env vars take effect.
- Smoke test (logged-out curl sweep per security rule #10):
  - `GET /` with no auth → `401` ✅
  - `GET /` with wrong password → `401` ✅
  - `GET /` with correct creds → `307` → `/dashboard` `200` ✅
  - `GET /claim` (public path) → `200` ✅
- Caveat: this is edge Basic Auth only (velvet rope). Plan B (Supabase Auth + `user_roles` + handler-level `requireAdmin()` + RLS policies) is the next task, required by global security rules #1, #2, #4, #7, #10.

### 2026-04-17 — Plan B: real auth + public endpoint hardening

- Added migration `202604170001_auth_and_rls.sql` — `user_roles`, `has_role()` helper, admin RLS policies on every public table, storage policies on `arc-pdf`/`proof-of-purchase`/`claim-screenshots`, `rate_limits` + `email_verifications` tables, `review_submission_token` column on `launch_team_members`. Pushed via `supabase db push`.
- Created admin user `captdes@gmail.com` (password: `CQfun48@`) via `scripts/create-admin.mjs`; seeded `user_roles` row with role `admin`.
- Built `lib/auth.ts` (`requireAdmin`, `getSessionUser`), `lib/rate-limit.ts` (DB-backed fixed-window limiter), `lib/tokens.ts` (HMAC-signed member tokens + random verification tokens).
- New `/login` page + `signIn` / `signOut` server actions. Middleware rewritten to replace Basic Auth with Supabase session check (redirect to `/login?next=...` when no session).
- Refactored every admin server action in `app/actions.ts` to call `await requireAdmin()` first. Every admin page (`/dashboard`, `/tasks`, `/launch-team`, `/outreach`, `/content`, `/purchases`, `/reviews`, `/activity`, `/settings`, `/admin/coupons`) now guards with `requireAdmin()`. `/api/upload-arc` self-gates per security rule #12.
- Fixed security rule #11 violations: `sendArcPdfToMember`, `sendCoupon`, `createLaunchTeamMember` now read recipient email from the stored row, never from `formData`.
- Hardened the 4 public endpoints:
  - `/claim`: rate limited (5/hr per IP); duplicates rejected (no mutation of existing row).
  - `/proof-of-purchase`: rate limited (5/hr per IP); additive-only inserts.
  - `/join-launch-team`: now sends ONLY a verification email first (security rule #5). New `/join-launch-team/verify?token=...` route finalizes signup and sends the ARC. Never overwrites an existing `arc_sent` row (rule #6).
  - `/submit-review`: requires a per-member HMAC/token URL param (rule #6). No-token GETs render a "use your personal link" page.
- New `TOKEN_SIGNING_SECRET` (96 hex chars) + `APP_BASE_URL` env vars added to Vercel production.
- Added `SECURITY.md` — actors, assets, invariants, threat model.
- Added `Sign out` button to the admin sidebar.
- Local `npm run build` passes (Next 15.5.14, clean typecheck).
