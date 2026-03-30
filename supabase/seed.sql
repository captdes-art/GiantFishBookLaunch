insert into public.app_settings (id, launch_target_date, launch_phase, admin_contact, memorial_day_note)
values
  (1, date '2026-05-26', 'foundation', 'Des O''Sullivan', 'No hard launch activity on Memorial Day weekend.')
on conflict (id) do update
set
  launch_target_date = excluded.launch_target_date,
  launch_phase = excluded.launch_phase,
  admin_contact = excluded.admin_contact,
  memorial_day_note = excluded.memorial_day_note;

insert into public.launch_tasks (title, description, category, phase, status, priority, owner, due_date, notes)
values
  ('Finalize command center spec', 'Lock the operating model and required modules.', 'build', 'foundation', 'done', 'high', 'Skipper', date '2026-03-31', 'Starter task from spec'),
  ('Set exact launch date after Memorial Day', 'Confirm the precise live date immediately after Memorial Day 2026.', 'ops', 'foundation', 'in_progress', 'critical', 'Des', date '2026-04-05', 'Default target is May 26, 2026 pending explicit final confirmation'),
  ('Build launch team list', 'Create initial prospect list.', 'launch_team', 'recruitment', 'not_started', 'high', 'Skipper', date '2026-04-07', null),
  ('Draft launch team invitation copy', 'Prepare draft-only invitation language for approval.', 'launch_team', 'recruitment', 'not_started', 'high', 'Skipper', date '2026-04-08', null),
  ('Draft ARC instructions', 'Prepare instructions for readers receiving the advance copy.', 'launch_team', 'arc', 'not_started', 'medium', 'Skipper', date '2026-04-10', null),
  ('Create proof-of-purchase form', 'Public upload flow for raffle entry and manual coupon fulfillment.', 'build', 'foundation', 'in_progress', 'critical', 'Skipper', date '2026-04-02', null),
  ('Draft launch email #1', 'Primary launch announcement.', 'content', 'content', 'not_started', 'high', 'Skipper', date '2026-04-20', null),
  ('Draft launch email #2', 'Secondary launch follow-up.', 'content', 'content', 'not_started', 'medium', 'Skipper', date '2026-04-27', null),
  ('Draft launch email #3', 'Late launch sequence email.', 'content', 'launch_week', 'not_started', 'medium', 'Skipper', date '2026-05-18', null),
  ('Draft Father''s Day email', 'Prepare post-launch Father''s Day push.', 'content', 'fathers_day', 'not_started', 'medium', 'Skipper', date '2026-05-28', null),
  ('Build outreach target list', 'Assemble podcasts, media, faith, fishing, wellness, and reviewer targets.', 'outreach', 'outreach', 'not_started', 'high', 'Skipper', date '2026-04-12', null),
  ('Build content calendar for April/May', 'Set schedule for email and social content.', 'content', 'content', 'not_started', 'high', 'Skipper', date '2026-04-14', null),
  ('Define raffle rules', 'Document the raffle process for verified purchases.', 'ops', 'foundation', 'not_started', 'high', 'Des', date '2026-04-10', null),
  ('Define manual coupon fulfillment SOP', 'Document the manual coupon workflow for verified buyers.', 'ops', 'foundation', 'not_started', 'high', 'Skipper', date '2026-04-10', null);

insert into public.launch_team_members (full_name, email, source, category, status, invited_at, agreed_to_read_review, agreed_at, follow_up_due, notes)
values
  ('Casey Rivers', 'casey@example.com', 'Existing CQ customer', 'cq_customer', 'agreed', timezone('utc', now()), true, timezone('utc', now()), date '2026-04-10', 'Strong fit for ARC and testimonial'),
  ('Mara Bennett', 'mara@example.com', 'Family friend', 'friend', 'invited', timezone('utc', now()), false, null, date '2026-04-09', 'Awaiting response');

insert into public.outreach_contacts (contact_name, organization_name, category, contact_email, platform, audience_fit_notes, pitch_angle, status, approval_status, draft_copy)
values
  ('Sarah Lake', 'The Healing Current Podcast', 'podcast', 'hello@healingcurrent.fm', 'podcast', 'Good overlap with healing and purpose themes.', 'Healing through fishing and faith-inflected life lessons.', 'awaiting_approval', 'pending', 'Draft pitch prepared for Des review.'),
  ('Ben Foster', 'Coastal Angler Journal', 'fishing', 'editor@coastalangler.test', 'newsletter', 'Fishing audience with Father''s Day gift overlap.', 'Meaningful Father''s Day read with fishing roots.', 'researching', 'not_needed', null);

insert into public.content_items (title, content_type, platform, theme, status, draft_copy, asset_needed, cta, scheduled_for, notes)
values
  ('Launch email #1', 'email', 'email', 'launch', 'drafting', 'Working first pass for launch announcement.', false, 'Buy the book and submit proof of purchase.', timestamptz '2026-05-26 13:00:00+00', null),
  ('Father''s Day email', 'email', 'email', 'fathers_day', 'idea', null, true, 'Order for Father''s Day.', timestamptz '2026-06-10 15:00:00+00', 'Need hero photo and gift angle');

insert into public.activity_log (event_type, entity_type, summary, details, created_by)
values
  ('system', 'app_settings', 'Seed data loaded', 'Starter tasks and sample records loaded for V1.', 'seed'),
  ('note', 'launch_tasks', 'Launch plan initialized', 'Initial starter tasks inserted from the approved spec.', 'seed');
