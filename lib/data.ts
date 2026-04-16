import { DEFAULT_LAUNCH_DATE } from "@/lib/constants";
import {
  mockActivity,
  mockContent,
  mockCouponClaims,
  mockLaunchTeam,
  mockOutreach,
  mockPurchases,
  mockReviews,
  mockSettings,
  mockTasks
} from "@/lib/mock-data";
import { hasSupabaseEnv, getSupabaseAdminClient } from "@/lib/supabase";
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

async function readTable<T>(
  table: string,
  fallback: T[],
  select = "*",
  orderBy = "created_at",
  ascending = false
): Promise<T[]> {
  const client = getSupabaseAdminClient();

  if (!client) {
    return fallback;
  }

  const { data, error } = await client.from(table).select(select).order(orderBy, { ascending });

  if (error) {
    return fallback;
  }

  return (data ?? fallback) as T[];
}

export async function getSettings(): Promise<AppSettings> {
  if (!hasSupabaseEnv()) return mockSettings;

  const client = getSupabaseAdminClient();
  if (!client) return mockSettings;

  const { data, error } = await client.from("app_settings").select("*").eq("id", 1).single();

  if (error) {
    return mockSettings;
  }

  return data ?? {
    ...mockSettings,
    launch_target_date: DEFAULT_LAUNCH_DATE
  };
}

export async function getTasks(): Promise<LaunchTask[]> {
  if (!hasSupabaseEnv()) return mockTasks;
  return readTable<LaunchTask>("launch_tasks", mockTasks, "*", "due_date", true);
}

export async function getLaunchTeam(): Promise<LaunchTeamMember[]> {
  if (!hasSupabaseEnv()) return mockLaunchTeam;
  return readTable<LaunchTeamMember>("launch_team_members", mockLaunchTeam, "*", "updated_at", false);
}

export async function getOutreach(): Promise<OutreachContact[]> {
  if (!hasSupabaseEnv()) return mockOutreach;
  return readTable<OutreachContact>("outreach_contacts", mockOutreach, "*", "updated_at", false);
}

export async function getContent(): Promise<ContentItem[]> {
  if (!hasSupabaseEnv()) return mockContent;
  return readTable<ContentItem>("content_items", mockContent, "*", "scheduled_for", true);
}

export async function getPurchases(): Promise<PurchaseSubmission[]> {
  if (!hasSupabaseEnv()) return mockPurchases;
  return readTable<PurchaseSubmission>("purchase_submissions", mockPurchases, "*", "submitted_at", false);
}

export async function getReviews(): Promise<Review[]> {
  if (!hasSupabaseEnv()) return mockReviews;

  const client = getSupabaseAdminClient();
  if (!client) return mockReviews;

  const { data, error } = await client
    .from("reviews")
    .select("*, launch_team_members(full_name, email)")
    .order("updated_at", { ascending: false });

  if (error) {
    return mockReviews;
  }

  return (data ?? mockReviews) as Review[];
}

export async function getCouponClaims(): Promise<CouponClaim[]> {
  if (!hasSupabaseEnv()) return mockCouponClaims;
  return readTable<CouponClaim>("coupon_claims", mockCouponClaims, "*", "created_at", false);
}

export async function getActivity(): Promise<ActivityLog[]> {
  if (!hasSupabaseEnv()) return mockActivity;
  return readTable<ActivityLog>("activity_log", mockActivity, "*", "created_at", false);
}

export async function getDashboardData() {
  const [settings, tasks, launchTeam, outreach, content, purchases, reviews, activity] = await Promise.all([
    getSettings(),
    getTasks(),
    getLaunchTeam(),
    getOutreach(),
    getContent(),
    getPurchases(),
    getReviews(),
    getActivity()
  ]);

  return { settings, tasks, launchTeam, outreach, content, purchases, reviews, activity };
}
