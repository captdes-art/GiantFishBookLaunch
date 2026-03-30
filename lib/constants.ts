export const DEFAULT_LAUNCH_DATE = "2026-05-26";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tasks", label: "Tasks / Timeline" },
  { href: "/launch-team", label: "Launch Team" },
  { href: "/outreach", label: "Outreach" },
  { href: "/content", label: "Content" },
  { href: "/purchases", label: "Purchases" },
  { href: "/reviews", label: "Reviews" },
  { href: "/activity", label: "Activity" },
  { href: "/settings", label: "Settings" }
] as const;

export const TASK_STATUSES = ["not_started", "in_progress", "blocked", "waiting", "done"] as const;
export const TASK_PHASES = ["foundation", "recruitment", "arc", "outreach", "content", "launch_week", "fathers_day"] as const;
export const TASK_CATEGORIES = ["build", "launch_team", "outreach", "content", "ops", "launch_week", "post_launch"] as const;

export const LAUNCH_TEAM_STATUSES = ["prospect", "invited", "agreed", "arc_sent", "reviewing", "reviewed", "inactive"] as const;
export const OUTREACH_STATUSES = ["researching", "ready_for_draft", "draft_ready", "awaiting_approval", "approved_to_send", "sent", "follow_up_due", "responded", "booked", "closed"] as const;
export const CONTENT_STATUSES = ["idea", "drafting", "awaiting_approval", "approved", "scheduled", "posted", "archived"] as const;
export const PURCHASE_VERIFICATION_STATUSES = ["pending", "verified", "rejected"] as const;
export const PURCHASE_COUPON_STATUSES = ["not_sent", "sent", "not_applicable"] as const;
export const REVIEW_STATUSES = ["not_started", "promised", "reminder_due", "posted", "verified"] as const;
