import { DEFAULT_LAUNCH_DATE } from "@/lib/constants";
import type {
  ActivityLog,
  AppSettings,
  ContentItem,
  CouponClaim,
  LaunchTask,
  LaunchTeamMember,
  OutreachContact,
  PurchaseSubmission,
  Review
} from "@/lib/types";

export const mockSettings: AppSettings = {
  id: 1,
  launch_target_date: DEFAULT_LAUNCH_DATE,
  launch_phase: "foundation",
  admin_contact: "Des O'Sullivan",
  memorial_day_note: "No hard launch activity on Memorial Day weekend.",
  created_at: "2026-03-30T10:00:00.000Z",
  updated_at: "2026-03-30T10:00:00.000Z"
};

export const mockTasks: LaunchTask[] = [
  {
    id: "task-1",
    title: "Finalize command center spec",
    description: "Lock the operating model and required modules.",
    category: "build",
    phase: "foundation",
    status: "done",
    priority: "high",
    owner: "Skipper",
    due_date: "2026-03-31",
    start_date: "2026-03-30",
    dependency_notes: null,
    notes: "Spec approved for coding handoff.",
    completed_at: "2026-03-30T18:00:00.000Z",
    created_at: "2026-03-30T10:00:00.000Z",
    updated_at: "2026-03-30T18:00:00.000Z"
  },
  {
    id: "task-2",
    title: "Set exact launch date after Memorial Day",
    description: "Confirm the precise live date immediately after Memorial Day 2026.",
    category: "ops",
    phase: "foundation",
    status: "in_progress",
    priority: "critical",
    owner: "Des",
    due_date: "2026-04-05",
    start_date: "2026-03-31",
    dependency_notes: "Needed before final outreach calendar is locked.",
    notes: "Default target currently set to May 26, 2026.",
    completed_at: null,
    created_at: "2026-03-30T10:00:00.000Z",
    updated_at: "2026-03-31T08:00:00.000Z"
  },
  {
    id: "task-3",
    title: "Build launch team list",
    description: "Create initial prospect list across family, CQ, fishing, faith, and wellness contacts.",
    category: "launch_team",
    phase: "recruitment",
    status: "not_started",
    priority: "high",
    owner: "Skipper",
    due_date: "2026-04-07",
    start_date: null,
    dependency_notes: null,
    notes: null,
    completed_at: null,
    created_at: "2026-03-30T10:00:00.000Z",
    updated_at: "2026-03-30T10:00:00.000Z"
  },
  {
    id: "task-4",
    title: "Draft ARC instructions",
    description: "Prepare instructions for readers receiving the advance copy.",
    category: "launch_team",
    phase: "arc",
    status: "blocked",
    priority: "medium",
    owner: "Skipper",
    due_date: "2026-04-10",
    start_date: "2026-04-03",
    dependency_notes: "Need final ARC delivery format.",
    notes: "Waiting on final ARC format decision.",
    completed_at: null,
    created_at: "2026-03-30T10:00:00.000Z",
    updated_at: "2026-04-04T11:00:00.000Z"
  },
  {
    id: "task-5",
    title: "Create proof-of-purchase form",
    description: "Public upload flow for raffle entry and manual coupon fulfillment.",
    category: "build",
    phase: "foundation",
    status: "in_progress",
    priority: "critical",
    owner: "Skipper",
    due_date: "2026-04-02",
    start_date: "2026-03-31",
    dependency_notes: null,
    notes: "Server-handled upload flow in progress.",
    completed_at: null,
    created_at: "2026-03-30T10:00:00.000Z",
    updated_at: "2026-03-31T09:15:00.000Z"
  }
];

export const mockLaunchTeam: LaunchTeamMember[] = [
  {
    id: "lt-1",
    full_name: "Casey Rivers",
    email: "casey@example.com",
    phone: null,
    source: "Existing CQ customer",
    category: "cq_customer",
    status: "agreed",
    invited_at: "2026-04-01T09:00:00.000Z",
    agreed_to_read_review: true,
    agreed_at: "2026-04-02T15:00:00.000Z",
    arc_sent: false,
    arc_sent_at: null,
    review_posted: false,
    review_posted_at: null,
    review_link: null,
    follow_up_due: "2026-04-10",
    launch_party_invited: false,
    launch_party_confirmed: false,
    notes: "Strong fit for ARC and testimonial.",
    created_at: "2026-04-01T09:00:00.000Z",
    updated_at: "2026-04-02T15:00:00.000Z"
  },
  {
    id: "lt-2",
    full_name: "Mara Bennett",
    email: "mara@example.com",
    phone: null,
    source: "Family friend",
    category: "friend",
    status: "invited",
    invited_at: "2026-04-03T11:00:00.000Z",
    agreed_to_read_review: false,
    agreed_at: null,
    arc_sent: false,
    arc_sent_at: null,
    review_posted: false,
    review_posted_at: null,
    review_link: null,
    follow_up_due: "2026-04-09",
    launch_party_invited: false,
    launch_party_confirmed: false,
    notes: "Awaiting response.",
    created_at: "2026-04-03T11:00:00.000Z",
    updated_at: "2026-04-03T11:00:00.000Z"
  }
];

export const mockOutreach: OutreachContact[] = [
  {
    id: "out-1",
    contact_name: "Sarah Lake",
    organization_name: "The Healing Current Podcast",
    category: "podcast",
    contact_email: "hello@healingcurrent.fm",
    contact_phone: null,
    website: "https://example.com",
    platform: "podcast",
    audience_fit_notes: "Good overlap with healing and purpose themes.",
    pitch_angle: "Healing through fishing and faith-inflected life lessons.",
    status: "awaiting_approval",
    draft_copy: "Draft pitch prepared for Des review.",
    approval_status: "pending",
    last_contacted_at: null,
    follow_up_due: null,
    response_summary: null,
    notes: null,
    created_at: "2026-04-02T12:00:00.000Z",
    updated_at: "2026-04-02T12:00:00.000Z"
  },
  {
    id: "out-2",
    contact_name: "Ben Foster",
    organization_name: "Coastal Angler Journal",
    category: "fishing",
    contact_email: "editor@coastalangler.test",
    contact_phone: null,
    website: null,
    platform: "newsletter",
    audience_fit_notes: "Fishing audience with book/gift angle near Father's Day.",
    pitch_angle: "Meaningful Father's Day read with fishing roots.",
    status: "researching",
    draft_copy: null,
    approval_status: "not_needed",
    last_contacted_at: null,
    follow_up_due: null,
    response_summary: null,
    notes: "Need circulation numbers.",
    created_at: "2026-04-03T12:00:00.000Z",
    updated_at: "2026-04-03T12:00:00.000Z"
  }
];

export const mockContent: ContentItem[] = [
  {
    id: "content-1",
    title: "Launch email #1",
    content_type: "email",
    platform: "email",
    theme: "launch",
    status: "drafting",
    draft_copy: "Working first pass for launch announcement.",
    asset_needed: false,
    asset_notes: null,
    cta: "Buy the book and submit proof of purchase.",
    scheduled_for: "2026-05-26T13:00:00.000Z",
    posted_at: null,
    notes: null,
    created_at: "2026-04-01T08:00:00.000Z",
    updated_at: "2026-04-01T08:00:00.000Z"
  },
  {
    id: "content-2",
    title: "Father's Day email",
    content_type: "email",
    platform: "email",
    theme: "fathers_day",
    status: "idea",
    draft_copy: null,
    asset_needed: true,
    asset_notes: "Need hero photo and gift angle.",
    cta: "Order for Father's Day.",
    scheduled_for: "2026-06-10T15:00:00.000Z",
    posted_at: null,
    notes: "Write after launch messaging is stable.",
    created_at: "2026-04-01T08:00:00.000Z",
    updated_at: "2026-04-01T08:00:00.000Z"
  }
];

export const mockPurchases: PurchaseSubmission[] = [
  {
    id: "purchase-1",
    full_name: "Jordan Hale",
    email: "jordan@example.com",
    proof_file_path: "proof-of-purchase/jordan-order-1001.png",
    submission_notes: "Bought two copies.",
    submitted_at: "2026-05-26T18:15:00.000Z",
    verification_status: "pending",
    verified_at: null,
    verified_by: null,
    coupon_status: "not_sent",
    coupon_code: null,
    coupon_sent_at: null,
    raffle_entered: false,
    raffle_entered_at: null,
    raffle_notes: null,
    notes: null,
    created_at: "2026-05-26T18:15:00.000Z",
    updated_at: "2026-05-26T18:15:00.000Z"
  }
];

export const mockReviews: Review[] = [
  {
    id: "review-1",
    launch_team_member_id: "lt-1",
    review_type: "amazon",
    status: "promised",
    review_link: null,
    review_excerpt: null,
    reminder_sent_at: null,
    posted_at: null,
    verified_at: null,
    notes: "Said she plans to post during launch week.",
    created_at: "2026-04-03T10:00:00.000Z",
    updated_at: "2026-04-03T10:00:00.000Z",
    launch_team_members: {
      full_name: "Casey Rivers",
      email: "casey@example.com"
    }
  }
];

export const mockCouponClaims: CouponClaim[] = [
  {
    id: "claim-1",
    created_at: "2026-05-27T10:00:00.000Z",
    updated_at: "2026-05-27T10:00:00.000Z",
    first_name: "John",
    last_name: "Smith",
    email: "john@example.com",
    amazon_order_number: "113-1234567-8901234",
    screenshot_url: null,
    coupon_code: "FISH-AB3XK7YZ",
    coupon_value_cents: 2000,
    status: "pending",
    cq_coupon_id: null,
    admin_notes: null,
    sent_at: null,
  }
];

export const mockActivity: ActivityLog[] = [
  {
    id: "activity-1",
    event_type: "task_update",
    entity_type: "launch_tasks",
    entity_id: "task-5",
    summary: "Proof-of-purchase form moved into active build",
    details: "Public intake flow and purchase table are now in progress.",
    created_by: "Skipper",
    created_at: "2026-03-31T09:15:00.000Z"
  },
  {
    id: "activity-2",
    event_type: "outreach_update",
    entity_type: "outreach_contacts",
    entity_id: "out-1",
    summary: "Podcast pitch drafted and awaiting approval",
    details: "Draft copy prepared for Des review before send.",
    created_by: "Skipper",
    created_at: "2026-04-02T12:20:00.000Z"
  }
];
