export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type TaskStatus = "not_started" | "in_progress" | "blocked" | "waiting" | "done";
export type TaskCategory = "build" | "launch_team" | "outreach" | "content" | "ops" | "launch_week" | "post_launch";
export type TaskPhase = "foundation" | "recruitment" | "arc" | "outreach" | "content" | "launch_week" | "fathers_day";
export type Priority = "low" | "medium" | "high" | "critical";
export type LaunchTeamCategory = "friend" | "family" | "cq_customer" | "fishing_contact" | "faith_contact" | "wellness_contact" | "reviewer" | "media" | "other";
export type LaunchTeamStatus = "prospect" | "invited" | "agreed" | "arc_sent" | "reviewing" | "reviewed" | "inactive";
export type OutreachCategory = "podcast" | "media" | "reviewer" | "influencer" | "faith" | "fishing" | "wellness" | "other";
export type OutreachStatus = "researching" | "ready_for_draft" | "draft_ready" | "awaiting_approval" | "approved_to_send" | "sent" | "follow_up_due" | "responded" | "booked" | "closed";
export type ApprovalStatus = "not_needed" | "pending" | "approved" | "rejected";
export type ContentType = "email" | "post" | "reel" | "quote" | "story" | "article" | "other";
export type ContentPlatform = "email" | "facebook" | "instagram" | "x" | "linkedin" | "youtube" | "website" | "other";
export type ContentTheme = "gratitude" | "calling" | "fishing" | "healing" | "faith" | "family" | "happiness" | "launch" | "review" | "raffle" | "fathers_day" | "other";
export type ContentStatus = "idea" | "drafting" | "awaiting_approval" | "approved" | "scheduled" | "posted" | "archived";
export type VerificationStatus = "pending" | "verified" | "rejected";
export type CouponStatus = "not_sent" | "sent" | "not_applicable";
export type ReviewType = "amazon" | "goodreads" | "testimonial" | "social" | "other";
export type ReviewStatus = "not_started" | "promised" | "reminder_due" | "posted" | "verified";
export type ActivityEventType = "task_update" | "outreach_update" | "submission_update" | "review_update" | "note" | "system";

export type LaunchTask = {
  id: string;
  title: string;
  description: string | null;
  category: TaskCategory;
  phase: TaskPhase;
  status: TaskStatus;
  priority: Priority;
  owner: string;
  due_date: string | null;
  start_date: string | null;
  dependency_notes: string | null;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type LaunchTeamMember = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  category: LaunchTeamCategory;
  status: LaunchTeamStatus;
  invited_at: string | null;
  agreed_to_read_review: boolean;
  agreed_at: string | null;
  arc_sent: boolean;
  arc_sent_at: string | null;
  review_posted: boolean;
  review_posted_at: string | null;
  review_link: string | null;
  follow_up_due: string | null;
  launch_party_invited: boolean;
  launch_party_confirmed: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OutreachContact = {
  id: string;
  contact_name: string;
  organization_name: string | null;
  category: OutreachCategory;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  platform: string | null;
  audience_fit_notes: string | null;
  pitch_angle: string | null;
  status: OutreachStatus;
  draft_copy: string | null;
  approval_status: ApprovalStatus;
  last_contacted_at: string | null;
  follow_up_due: string | null;
  response_summary: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ContentItem = {
  id: string;
  title: string;
  content_type: ContentType;
  platform: ContentPlatform;
  theme: ContentTheme;
  status: ContentStatus;
  draft_copy: string | null;
  asset_needed: boolean;
  asset_notes: string | null;
  cta: string | null;
  scheduled_for: string | null;
  posted_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type PurchaseSubmission = {
  id: string;
  full_name: string;
  email: string;
  proof_file_path: string | null;
  submission_notes: string | null;
  submitted_at: string;
  verification_status: VerificationStatus;
  verified_at: string | null;
  verified_by: string | null;
  coupon_status: CouponStatus;
  coupon_code: string | null;
  coupon_sent_at: string | null;
  raffle_entered: boolean;
  raffle_entered_at: string | null;
  raffle_notes: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: string;
  launch_team_member_id: string | null;
  review_type: ReviewType;
  status: ReviewStatus;
  review_link: string | null;
  review_excerpt: string | null;
  reminder_sent_at: string | null;
  posted_at: string | null;
  verified_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  launch_team_members?: Pick<LaunchTeamMember, "full_name" | "email"> | null;
};

export type ActivityLog = {
  id: string;
  event_type: ActivityEventType;
  entity_type: string | null;
  entity_id: string | null;
  summary: string;
  details: string | null;
  created_by: string | null;
  created_at: string;
};

export type AppSettings = {
  id: number;
  launch_target_date: string;
  launch_phase: string;
  admin_contact: string | null;
  memorial_day_note: string | null;
  created_at: string;
  updated_at: string;
};
