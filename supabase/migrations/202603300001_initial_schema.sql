create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'task_category') then
    create type task_category as enum ('build', 'launch_team', 'outreach', 'content', 'ops', 'launch_week', 'post_launch');
  end if;
  if not exists (select 1 from pg_type where typname = 'task_phase') then
    create type task_phase as enum ('foundation', 'recruitment', 'arc', 'outreach', 'content', 'launch_week', 'fathers_day');
  end if;
  if not exists (select 1 from pg_type where typname = 'task_status') then
    create type task_status as enum ('not_started', 'in_progress', 'blocked', 'waiting', 'done');
  end if;
  if not exists (select 1 from pg_type where typname = 'priority_level') then
    create type priority_level as enum ('low', 'medium', 'high', 'critical');
  end if;
  if not exists (select 1 from pg_type where typname = 'launch_team_category') then
    create type launch_team_category as enum ('friend', 'family', 'cq_customer', 'fishing_contact', 'faith_contact', 'wellness_contact', 'reviewer', 'media', 'other');
  end if;
  if not exists (select 1 from pg_type where typname = 'launch_team_status') then
    create type launch_team_status as enum ('prospect', 'invited', 'agreed', 'arc_sent', 'reviewing', 'reviewed', 'inactive');
  end if;
  if not exists (select 1 from pg_type where typname = 'outreach_category') then
    create type outreach_category as enum ('podcast', 'media', 'reviewer', 'influencer', 'faith', 'fishing', 'wellness', 'other');
  end if;
  if not exists (select 1 from pg_type where typname = 'outreach_status') then
    create type outreach_status as enum ('researching', 'ready_for_draft', 'draft_ready', 'awaiting_approval', 'approved_to_send', 'sent', 'follow_up_due', 'responded', 'booked', 'closed');
  end if;
  if not exists (select 1 from pg_type where typname = 'approval_status') then
    create type approval_status as enum ('not_needed', 'pending', 'approved', 'rejected');
  end if;
  if not exists (select 1 from pg_type where typname = 'content_type') then
    create type content_type as enum ('email', 'post', 'reel', 'quote', 'story', 'article', 'other');
  end if;
  if not exists (select 1 from pg_type where typname = 'content_platform') then
    create type content_platform as enum ('email', 'facebook', 'instagram', 'x', 'linkedin', 'youtube', 'website', 'other');
  end if;
  if not exists (select 1 from pg_type where typname = 'content_theme') then
    create type content_theme as enum ('gratitude', 'calling', 'fishing', 'healing', 'faith', 'family', 'happiness', 'launch', 'review', 'raffle', 'fathers_day', 'other');
  end if;
  if not exists (select 1 from pg_type where typname = 'content_status') then
    create type content_status as enum ('idea', 'drafting', 'awaiting_approval', 'approved', 'scheduled', 'posted', 'archived');
  end if;
  if not exists (select 1 from pg_type where typname = 'verification_status') then
    create type verification_status as enum ('pending', 'verified', 'rejected');
  end if;
  if not exists (select 1 from pg_type where typname = 'coupon_status') then
    create type coupon_status as enum ('not_sent', 'sent', 'not_applicable');
  end if;
  if not exists (select 1 from pg_type where typname = 'review_type') then
    create type review_type as enum ('amazon', 'goodreads', 'testimonial', 'social', 'other');
  end if;
  if not exists (select 1 from pg_type where typname = 'review_status') then
    create type review_status as enum ('not_started', 'promised', 'reminder_due', 'posted', 'verified');
  end if;
  if not exists (select 1 from pg_type where typname = 'activity_event_type') then
    create type activity_event_type as enum ('task_update', 'outreach_update', 'submission_update', 'review_update', 'note', 'system');
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.app_settings (
  id bigint primary key default 1,
  launch_target_date date not null default date '2026-05-26',
  launch_phase text not null default 'foundation',
  admin_contact text,
  memorial_day_note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint single_settings_row check (id = 1)
);

create table if not exists public.launch_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category task_category not null,
  phase task_phase not null,
  status task_status not null default 'not_started',
  priority priority_level not null default 'medium',
  owner text not null,
  due_date date,
  start_date date,
  dependency_notes text,
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.launch_team_members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  source text,
  category launch_team_category not null,
  status launch_team_status not null default 'prospect',
  invited_at timestamptz,
  agreed_to_read_review boolean not null default false,
  agreed_at timestamptz,
  arc_sent boolean not null default false,
  arc_sent_at timestamptz,
  review_posted boolean not null default false,
  review_posted_at timestamptz,
  review_link text,
  follow_up_due date,
  launch_party_invited boolean not null default false,
  launch_party_confirmed boolean not null default false,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.outreach_contacts (
  id uuid primary key default gen_random_uuid(),
  contact_name text not null,
  organization_name text,
  category outreach_category not null,
  contact_email text,
  contact_phone text,
  website text,
  platform text,
  audience_fit_notes text,
  pitch_angle text,
  status outreach_status not null default 'researching',
  draft_copy text,
  approval_status approval_status not null default 'pending',
  last_contacted_at timestamptz,
  follow_up_due date,
  response_summary text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content_type content_type not null,
  platform content_platform not null,
  theme content_theme not null,
  status content_status not null default 'idea',
  draft_copy text,
  asset_needed boolean not null default false,
  asset_notes text,
  cta text,
  scheduled_for timestamptz,
  posted_at timestamptz,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.purchase_submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  proof_file_path text,
  submission_notes text,
  submitted_at timestamptz not null default timezone('utc', now()),
  verification_status verification_status not null default 'pending',
  verified_at timestamptz,
  verified_by text,
  coupon_status coupon_status not null default 'not_sent',
  coupon_code text,
  coupon_sent_at timestamptz,
  raffle_entered boolean not null default false,
  raffle_entered_at timestamptz,
  raffle_notes text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  launch_team_member_id uuid references public.launch_team_members(id) on delete set null,
  review_type review_type not null,
  status review_status not null default 'not_started',
  review_link text,
  review_excerpt text,
  reminder_sent_at timestamptz,
  posted_at timestamptz,
  verified_at timestamptz,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  event_type activity_event_type not null,
  entity_type text,
  entity_id text,
  summary text not null,
  details text,
  created_by text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists launch_tasks_due_date_idx on public.launch_tasks (due_date);
create index if not exists launch_tasks_status_idx on public.launch_tasks (status);
create index if not exists launch_team_status_idx on public.launch_team_members (status);
create index if not exists launch_team_follow_up_idx on public.launch_team_members (follow_up_due);
create index if not exists outreach_status_idx on public.outreach_contacts (status);
create index if not exists outreach_follow_up_idx on public.outreach_contacts (follow_up_due);
create index if not exists content_status_idx on public.content_items (status);
create index if not exists content_scheduled_idx on public.content_items (scheduled_for);
create index if not exists purchase_verification_idx on public.purchase_submissions (verification_status);
create index if not exists reviews_status_idx on public.reviews (status);
create index if not exists activity_created_idx on public.activity_log (created_at desc);

drop trigger if exists app_settings_updated_at on public.app_settings;
create trigger app_settings_updated_at before update on public.app_settings for each row execute procedure public.set_updated_at();
drop trigger if exists launch_tasks_updated_at on public.launch_tasks;
create trigger launch_tasks_updated_at before update on public.launch_tasks for each row execute procedure public.set_updated_at();
drop trigger if exists launch_team_members_updated_at on public.launch_team_members;
create trigger launch_team_members_updated_at before update on public.launch_team_members for each row execute procedure public.set_updated_at();
drop trigger if exists outreach_contacts_updated_at on public.outreach_contacts;
create trigger outreach_contacts_updated_at before update on public.outreach_contacts for each row execute procedure public.set_updated_at();
drop trigger if exists content_items_updated_at on public.content_items;
create trigger content_items_updated_at before update on public.content_items for each row execute procedure public.set_updated_at();
drop trigger if exists purchase_submissions_updated_at on public.purchase_submissions;
create trigger purchase_submissions_updated_at before update on public.purchase_submissions for each row execute procedure public.set_updated_at();
drop trigger if exists reviews_updated_at on public.reviews;
create trigger reviews_updated_at before update on public.reviews for each row execute procedure public.set_updated_at();

alter table public.app_settings enable row level security;
alter table public.launch_tasks enable row level security;
alter table public.launch_team_members enable row level security;
alter table public.outreach_contacts enable row level security;
alter table public.content_items enable row level security;
alter table public.purchase_submissions enable row level security;
alter table public.reviews enable row level security;
alter table public.activity_log enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'proof-of-purchase',
  'proof-of-purchase',
  false,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;
