-- Prevent duplicate launch team signups by email (case-insensitive).
-- Allows multiple rows without an email (manually added prospects).
create unique index if not exists launch_team_email_unique
  on public.launch_team_members (lower(email))
  where email is not null;
