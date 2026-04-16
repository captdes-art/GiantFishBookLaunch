-- Add coupon_update to activity_event_type enum
alter type activity_event_type add value if not exists 'coupon_update';

-- Coupon claims table
create table if not exists public.coupon_claims (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),

  first_name text not null,
  last_name text not null,
  email text not null,
  amazon_order_number text not null,
  screenshot_url text,

  coupon_code text not null,
  coupon_value_cents integer default 2000,

  status text not null default 'pending',

  cq_coupon_id text,
  admin_notes text,
  sent_at timestamptz
);

create index if not exists idx_coupon_claims_status on public.coupon_claims (status);
create index if not exists idx_coupon_claims_email on public.coupon_claims (lower(email));
create index if not exists idx_coupon_claims_order on public.coupon_claims (amazon_order_number);
create unique index if not exists idx_coupon_claims_code on public.coupon_claims (coupon_code);

create trigger coupon_claims_updated_at
  before update on public.coupon_claims
  for each row execute function public.set_updated_at();

alter table public.coupon_claims enable row level security;

-- Storage bucket for claim screenshots
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'claim-screenshots',
  'claim-screenshots',
  false,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;
