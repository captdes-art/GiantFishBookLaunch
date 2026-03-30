import { DEFAULT_LAUNCH_DATE } from "@/lib/constants";
import {
  mockActivity,
  mockContent,
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
  LaunchTask,
  LaunchTeamMember,
  OutreachContact,
  PurchaseSubmission,
  Review
} from "@/lib/types";

async function readTable<T>(table: string, select = "*", orderBy = "created_at", ascending = false): Promise<T[]> {
  const client = getSupabaseAdminClient();

  if (!client) {
    return [];
  }

  const { data, error } = await client.from(table).select(select).order(orderBy, { ascending });

  if (error) {
    throw error;
  }

  return (data ?? []) as T[];
}

export async function getSettings(): Promise<AppSettings> {
  if (!hasSupabaseEnv()) return mockSettings;

  const client = getSupabaseAdminClient();
  if (!client) return mockSettings;

  const { data } = await client.from("app_settings").select("*").eq("id", 1).single();

  return data ?? {
    ...mockSettings,
    launch_target_date: DEFAULT_LAUNCH_DATE
  };
}

export async function getTasks(): Promise<LaunchTask[]> {
  if (!hasSupabaseEnv()) return mockTasks;
  return readTable<LaunchTask>("launch_tasks", "*", "due_date", true);
}

export async function getLaunchTeam(): Promise<LaunchTeamMember[]> {
  if (!hasSupabaseEnv()) return mockLaunchTeam;
  return readTable<LaunchTeamMember>("launch_team_members", "*", "updated_at", false);
}

export async function getOutreach(): Promise<OutreachContact[]> {
  if (!hasSupabaseEnv()) return mockOutreach;
  return readTable<OutreachContact>("outreach_contacts", "*", "updated_at", false);
}

export async function getContent(): Promise<ContentItem[]> {
  if (!hasSupabaseEnv()) return mockContent;
  return readTable<ContentItem>("content_items", "*", "scheduled_for", true);
}

export async function getPurchases(): Promise<PurchaseSubmission[]> {
  if (!hasSupabaseEnv()) return mockPurchases;
  return readTable<PurchaseSubmission>("purchase_submissions", "*", "submitted_at", false);
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
    throw error;
  }

  return (data ?? []) as Review[];
}

export async function getActivity(): Promise<ActivityLog[]> {
  if (!hasSupabaseEnv()) return mockActivity;
  return readTable<ActivityLog>("activity_log", "*", "created_at", false);
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
