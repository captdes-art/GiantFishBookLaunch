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
