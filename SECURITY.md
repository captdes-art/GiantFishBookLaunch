# SECURITY.md — Giant Fish & Happiness launch command center

Last updated: 2026-04-17

## Actors

- **Public / stranger** — Anyone on the open internet. Can hit `/claim`, `/submit-review`, `/join-launch-team`, `/join-launch-team/verify`, `/proof-of-purchase`, `/login`. Has no account and no session.
- **Member (launch team)** — A person who has verified their email and been added to `launch_team_members`. They have a per-member `review_submission_token` that lets them submit their Amazon review link. They have no dashboard login.
- **Admin** — Des O'Sullivan (captdes@gmail.com). Authenticates via Supabase Auth email+password. Only role seeded in `user_roles`. Has full dashboard access.
- **Service** — Server-side code running on Vercel. Authenticates to Supabase with the service role key. Bypasses RLS.

## Assets

- **ARC PDF** (`storage.objects` bucket `arc-pdf`) — Unreleased manuscript. Only admin reads it directly; public paths receive it as an email attachment after email verification.
- **Launch team roster** (`launch_team_members`) — Contains PII (name, email, phone). Controls who gets the ARC and who is credited with a review.
- **Coupon claims** (`coupon_claims`) — Contains PII + Amazon order numbers + screenshots. Coupon codes have real dollar value ($20 at Celtic Quest).
- **Purchase submissions** (`purchase_submissions`) — Contains PII + proof-of-purchase uploads.
- **Admin credentials** — Single Supabase Auth user with admin role.
- **Token signing key** (`TOKEN_SIGNING_SECRET`) — HMAC key for member submission tokens.
- **Supabase service role key** — Bypasses all RLS. Only ever in Vercel env, never in client code.

## Trust boundaries

- Client ↔ Next.js server: all form submissions go through server actions with Next's built-in action verification.
- Next.js server ↔ Supabase: authenticated via session cookie (anon key) or server-only service role key.
- Supabase ↔ Resend: one-way outbound email. Resend API key in env only.

## Invariants

These must always be true. Any change that violates one of these is a bug.

1. **No public endpoint may modify `launch_team_members` matched solely by caller-supplied email.** `submitReviewLink` requires a `review_submission_token` that proves ownership of a specific row. `joinLaunchTeam` only writes to `email_verifications` (never touches an existing arc_sent / reviewing / reviewed row).
2. **The first email a stranger receives from us is a verification link, nothing else.** The ARC PDF is only attached to an email sent from `verifyLaunchTeamSignup`, which runs after a token click.
3. **`sendArcEmail` / `sendCouponEmail` recipients are always read from the stored row, never from `formData`.** This is enforced in `sendArcPdfToMember` (reads from `launch_team_members`), `sendCoupon` (reads from `coupon_claims`), `createLaunchTeamMember` (re-reads after insert), and `verifyLaunchTeamSignup` (re-reads after insert/update).
4. **Every admin server action / API route / page runs `await requireAdmin(...)` before touching data.** Grep for `getSupabaseAdminClient` — every call site in `app/actions.ts` is preceded either by `requireAdmin()` or by a public-intake guard (rate-limit + validation).
5. **`SUPABASE_SERVICE_ROLE_KEY` never reaches client bundles.** Only imported inside `lib/supabase.ts`, `lib/resend.ts`, `lib/rate-limit.ts`, and server-only routes.
6. **RLS is enabled on every public table with at least one policy.** No RLS-without-policies traps. Admin policies gate every operation via `has_role('admin')`.
7. **Rate limits are enforced on every public intake endpoint** (`/claim`, `/proof-of-purchase`, `/join-launch-team`, `/submit-review`, `/login`).

## What edge auth does and doesn't do

- The middleware (`middleware.ts`) redirects unauthenticated visitors from any non-public path to `/login`. This is **edge auth** — a velvet rope. It is NOT a substitute for handler-level checks.
- Every admin server action additionally runs `requireAdmin()`. Every admin page additionally runs `await requireAdmin(pathname)`. Every admin API route additionally checks the session. Middleware matcher drift cannot open a hole.
- Basic Auth has been retired. `DASHBOARD_USERNAME` / `DASHBOARD_PASSWORD` are no longer used.

## Threat model — what we explicitly defend against

- **Stranger tries to claim another person's launch-team spot by guessing their email.** Blocked: `joinLaunchTeam` only writes to `email_verifications`, never upgrades an existing arc_sent row. `submitReviewLink` requires the per-member signed token.
- **Stranger tries to turn our app into a spam cannon.** Blocked: rate limits on all public endpoints, and `sendArcEmail` / `sendCouponEmail` only send to stored addresses (not caller-supplied).
- **Anon key leak on the client.** Blocked: RLS admin-only policies on every table; anon role can only insert into `email_verifications`, `purchase_submissions` (via service role in the server action), and the public-intake storage buckets.
- **Middleware matcher drift accidentally exposes an admin route.** Blocked: every admin page + action self-gates with `requireAdmin()`.
- **A non-admin account somehow authenticates.** Blocked: `signIn` action checks `user_roles.role === 'admin'` and signs out non-admins before redirecting.

## What we explicitly do NOT defend against

- **Captcha on public forms.** Rate limiting is the only anti-automation control. If we see abuse, add hCaptcha or Turnstile.
- **Sophisticated account takeover of the admin account.** Single account, no MFA beyond password. Mitigations: strong password, eventual MFA.
- **Supabase or Vercel insider compromise.** Out of scope.

## Open follow-ups

- Add an hCaptcha/Turnstile challenge on `/claim` and `/join-launch-team` if rate limit alone is insufficient.
- Cron job to delete `rate_limits` rows with `window_start < now() - '7 days'`.
- Cron job to delete expired `email_verifications` rows.
- Consider Supabase Auth MFA on the admin account.
