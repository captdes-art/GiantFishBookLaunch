"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdminClient, hasSupabaseEnv } from "@/lib/supabase";
import { slugify } from "@/lib/utils";

async function createActivity(summary: string, entityType: string, entityId: string | null, eventType: string) {
  if (!hasSupabaseEnv()) return;

  const client = getSupabaseAdminClient();
  if (!client) return;

  await client.from("activity_log").insert({
    summary,
    entity_type: entityType,
    entity_id: entityId,
    event_type: eventType,
    created_by: "admin"
  });
}

function getValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function createTask(formData: FormData) {
  if (!hasSupabaseEnv()) return;
  const client = getSupabaseAdminClient();
  if (!client) return;

  const payload = {
    title: getValue(formData, "title"),
    description: getValue(formData, "description") || null,
    category: getValue(formData, "category"),
    phase: getValue(formData, "phase"),
    status: getValue(formData, "status"),
    priority: getValue(formData, "priority"),
    owner: getValue(formData, "owner"),
    due_date: getValue(formData, "due_date") || null,
    start_date: getValue(formData, "start_date") || null,
    dependency_notes: getValue(formData, "dependency_notes") || null,
    notes: getValue(formData, "notes") || null
  };

  const { data } = await client.from("launch_tasks").insert(payload).select("id").single();
  await createActivity(`Task created: ${payload.title}`, "launch_tasks", data?.id ?? null, "task_update");
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function updateTaskStatus(formData: FormData) {
  if (!hasSupabaseEnv()) return;
  const client = getSupabaseAdminClient();
  if (!client) return;
  const id = getValue(formData, "id");
  const status = getValue(formData, "status");

  await client.from("launch_tasks").update({
    status,
    completed_at: status === "done" ? new Date().toISOString() : null
  }).eq("id", id);

  await createActivity(`Task status updated to ${status}`, "launch_tasks", id, "task_update");
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function createLaunchTeamMember(formData: FormData) {
  if (!hasSupabaseEnv()) return;
  const client = getSupabaseAdminClient();
  if (!client) return;
  const name = getValue(formData, "full_name");

  const { data } = await client.from("launch_team_members").insert({
    full_name: name,
    email: getValue(formData, "email") || null,
    phone: getValue(formData, "phone") || null,
    source: getValue(formData, "source") || null,
    category: getValue(formData, "category"),
    status: getValue(formData, "status"),
    agreed_to_read_review: getValue(formData, "agreed_to_read_review") === "true",
    follow_up_due: getValue(formData, "follow_up_due") || null,
    notes: getValue(formData, "notes") || null
  }).select("id").single();

  await createActivity(`Launch team record created: ${name}`, "launch_team_members", data?.id ?? null, "note");
  revalidatePath("/launch-team");
  revalidatePath("/dashboard");
}

export async function updateLaunchTeamStatus(formData: FormData) {
  if (!hasSupabaseEnv()) return;
  const client = getSupabaseAdminClient();
  if (!client) return;
  const id = getValue(formData, "id");
  const status = getValue(formData, "status");

  await client.from("launch_team_members").update({
    status,
    agreed_to_read_review: ["agreed", "arc_sent", "reviewing", "reviewed"].includes(status),
    agreed_at: ["agreed", "arc_sent", "reviewing", "reviewed"].includes(status) ? new Date().toISOString() : null,
    arc_sent: ["arc_sent", "reviewing", "reviewed"].includes(status),
    arc_sent_at: ["arc_sent", "reviewing", "reviewed"].includes(status) ? new Date().toISOString() : null,
    review_posted: status === "reviewed",
    review_posted_at: status === "reviewed" ? new Date().toISOString() : null
  }).eq("id", id);

  await createActivity(`Launch team status updated to ${status}`, "launch_team_members", id, "note");
  revalidatePath("/launch-team");
  revalidatePath("/dashboard");
}

export async function createOutreachContact(formData: FormData) {
  if (!hasSupabaseEnv()) return;
  const client = getSupabaseAdminClient();
  if (!client) return;
  const name = getValue(formData, "contact_name");

  const { data } = await client.from("outreach_contacts").insert({
    contact_name: name,
    organization_name: getValue(formData, "organization_name") || null,
    category: getValue(formData, "category"),
    contact_email: getValue(formData, "contact_email") || null,
    website: getValue(formData, "website") || null,
    platform: getValue(formData, "platform") || null,
    audience_fit_notes: getValue(formData, "audience_fit_notes") || null,
    pitch_angle: getValue(formData, "pitch_angle") || null,
    status: getValue(formData, "status"),
    approval_status: getValue(formData, "approval_status"),
    draft_copy: getValue(formData, "draft_copy") || null,
    follow_up_due: getValue(formData, "follow_up_due") || null,
    notes: getValue(formData, "notes") || null
  }).select("id").single();

  await createActivity(`Outreach contact created: ${name}`, "outreach_contacts", data?.id ?? null, "outreach_update");
  revalidatePath("/outreach");
  revalidatePath("/dashboard");
}

export async function updateOutreachStatus(formData: FormData) {
  if (!hasSupabaseEnv()) return;
  const client = getSupabaseAdminClient();
  if (!client) return;
  const id = getValue(formData, "id");
  const status = getValue(formData, "status");

  await client.from("outreach_contacts").update({
    status,
    last_contacted_at: ["sent", "follow_up_due", "responded", "booked", "closed"].includes(status) ? new Date().toISOString() : null
  }).eq("id", id);

  await createActivity(`Outreach status updated to ${status}`, "outreach_contacts", id, "outreach_update");
  revalidatePath("/outreach");
  revalidatePath("/dashboard");
}

export async function createContentItem(formData: FormData) {
  if (!hasSupabaseEnv()) return;
  const client = getSupabaseAdminClient();
  if (!client) return;
  const title = getValue(formData, "title");

  const { data } = await client.from("content_items").insert({
    title,
    content_type: getValue(formData, "content_type"),
    platform: getValue(formData, "platform"),
    theme: getValue(formData, "theme"),
    status: getValue(formData, "status"),
    draft_copy: getValue(formData, "draft_copy") || null,
    asset_needed: getValue(formData, "asset_needed") === "true",
    asset_notes: getValue(formData, "asset_notes") || null,
    cta: getValue(formData, "cta") || null,
    scheduled_for: getValue(formData, "scheduled_for") || null,
    notes: getValue(formData, "notes") || null
  }).select("id").single();

  await createActivity(`Content item created: ${title}`, "content_items", data?.id ?? null, "note");
  revalidatePath("/content");
  revalidatePath("/dashboard");
}

export async function updateContentStatus(formData: FormData) {
  if (!hasSupabaseEnv()) return;
  const client = getSupabaseAdminClient();
  if (!client) return;
  const id = getValue(formData, "id");
  const status = getValue(formData, "status");

  await client.from("content_items").update({
    status,
    posted_at: status === "posted" ? new Date().toISOString() : null
  }).eq("id", id);

  await createActivity(`Content status updated to ${status}`, "content_items", id, "note");
  revalidatePath("/content");
  revalidatePath("/dashboard");
}

export async function updatePurchaseSubmission(formData: FormData) {
  if (!hasSupabaseEnv()) return;
  const client = getSupabaseAdminClient();
  if (!client) return;
  const id = getValue(formData, "id");
  const verificationStatus = getValue(formData, "verification_status");
  const couponStatus = getValue(formData, "coupon_status");
  const couponCode = getValue(formData, "coupon_code");

  await client.from("purchase_submissions").update({
    verification_status: verificationStatus,
    verified_at: verificationStatus === "verified" ? new Date().toISOString() : null,
    verified_by: verificationStatus === "verified" ? "admin" : null,
    coupon_status: couponStatus,
    coupon_code: couponCode || null,
    coupon_sent_at: couponStatus === "sent" ? new Date().toISOString() : null,
    raffle_entered: verificationStatus === "verified",
    raffle_entered_at: verificationStatus === "verified" ? new Date().toISOString() : null,
    raffle_notes: verificationStatus === "verified" ? "Entered after manual verification." : null
  }).eq("id", id);

  await createActivity(`Purchase submission updated to ${verificationStatus}`, "purchase_submissions", id, "submission_update");
  revalidatePath("/purchases");
  revalidatePath("/dashboard");
}

export async function createReview(formData: FormData) {
  if (!hasSupabaseEnv()) return;
  const client = getSupabaseAdminClient();
  if (!client) return;

  const { data } = await client.from("reviews").insert({
    launch_team_member_id: getValue(formData, "launch_team_member_id") || null,
    review_type: getValue(formData, "review_type"),
    status: getValue(formData, "status"),
    review_link: getValue(formData, "review_link") || null,
    review_excerpt: getValue(formData, "review_excerpt") || null,
    notes: getValue(formData, "notes") || null
  }).select("id").single();

  await createActivity("Review tracker record created", "reviews", data?.id ?? null, "review_update");
  revalidatePath("/reviews");
  revalidatePath("/dashboard");
}

export async function updateReviewStatus(formData: FormData) {
  if (!hasSupabaseEnv()) return;
  const client = getSupabaseAdminClient();
  if (!client) return;
  const id = getValue(formData, "id");
  const status = getValue(formData, "status");

  await client.from("reviews").update({
    status,
    posted_at: ["posted", "verified"].includes(status) ? new Date().toISOString() : null,
    verified_at: status === "verified" ? new Date().toISOString() : null,
    reminder_sent_at: status === "reminder_due" ? new Date().toISOString() : null
  }).eq("id", id);

  await createActivity(`Review status updated to ${status}`, "reviews", id, "review_update");
  revalidatePath("/reviews");
  revalidatePath("/dashboard");
}

export async function createActivityNote(formData: FormData) {
  if (!hasSupabaseEnv()) return;
  const client = getSupabaseAdminClient();
  if (!client) return;
  const summary = getValue(formData, "summary");

  await client.from("activity_log").insert({
    summary,
    details: getValue(formData, "details") || null,
    event_type: "note",
    entity_type: getValue(formData, "entity_type") || null,
    entity_id: getValue(formData, "entity_id") || null,
    created_by: "admin"
  });

  revalidatePath("/activity");
  revalidatePath("/dashboard");
}

export async function updateSettings(formData: FormData) {
  if (!hasSupabaseEnv()) return;
  const client = getSupabaseAdminClient();
  if (!client) return;

  await client.from("app_settings").upsert({
    id: 1,
    launch_target_date: getValue(formData, "launch_target_date"),
    launch_phase: getValue(formData, "launch_phase"),
    admin_contact: getValue(formData, "admin_contact") || null,
    memorial_day_note: getValue(formData, "memorial_day_note") || null
  });

  await createActivity("Settings updated", "app_settings", "1", "system");
  revalidatePath("/settings");
  revalidatePath("/dashboard");
}

export async function submitProofOfPurchase(
  _prevState: { ok: boolean; message: string },
  formData: FormData
) {
  if (!hasSupabaseEnv()) {
    return { ok: true, message: "Saved in mock mode. Configure Supabase to persist uploads." };
  }

  const client = getSupabaseAdminClient();
  if (!client) {
    return { ok: false, message: "Supabase admin client unavailable." };
  }

  const fullName = getValue(formData, "full_name");
  const email = getValue(formData, "email");
  const submissionNotes = getValue(formData, "submission_notes") || null;
  const file = formData.get("proof");

  if (!(file instanceof File) || !file.size) {
    return { ok: false, message: "Proof of purchase is required." };
  }

  const fileExt = file.name.split(".").pop() || "bin";
  const path = `proof-of-purchase/${slugify(fullName || "buyer")}-${Date.now()}.${fileExt}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const upload = await client.storage.from("proof-of-purchase").upload(path, bytes, {
    contentType: file.type || "application/octet-stream",
    upsert: false
  });

  if (upload.error) {
    return { ok: false, message: upload.error.message };
  }

  const insert = await client.from("purchase_submissions").insert({
    full_name: fullName,
    email,
    proof_file_path: path,
    submission_notes: submissionNotes,
    verification_status: "pending",
    coupon_status: "not_sent"
  }).select("id").single();

  if (insert.error) {
    return { ok: false, message: insert.error.message };
  }

  await createActivity(`Proof of purchase submitted by ${fullName}`, "purchase_submissions", insert.data?.id ?? null, "submission_update");
  revalidatePath("/purchases");
  revalidatePath("/dashboard");

  return { ok: true, message: "Proof received. Manual verification is now pending." };
}
