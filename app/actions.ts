"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseAdminClient, hasSupabaseEnv } from "@/lib/supabase";
import {
  hasResendEnv,
  sendArcEmail,
  sendCouponEmail,
  sendVerificationEmail,
  sendReviewLinkEmail,
} from "@/lib/resend";
import { slugify } from "@/lib/utils";
import { generateUniqueCouponCode } from "@/lib/coupon";
import { syncCouponToCq } from "@/lib/cq-sync";
import { requireAdmin } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { generateVerificationToken, signMemberToken } from "@/lib/tokens";

// Record to activity_log. Used by both admin and public flows — caller
// provides the created_by label explicitly so we never default to a
// fake "admin" string on a public insert (security rule #10).
async function createActivity(
  summary: string,
  entityType: string,
  entityId: string | null,
  eventType: string,
  createdBy: string
) {
  if (!hasSupabaseEnv()) return;
  const client = getSupabaseAdminClient();
  if (!client) return;

  await client.from("activity_log").insert({
    summary,
    entity_type: entityType,
    entity_id: entityId,
    event_type: eventType,
    created_by: createdBy,
  });
}

function getValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getAppBaseUrl() {
  return (
    process.env.APP_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

// ============================================================
// ADMIN ACTIONS
// Every function here is gated by requireAdmin() as its first line.
// If a caller is not signed in → redirect to /login. Not admin → throw.
// ============================================================

export async function createTask(formData: FormData) {
  const admin = await requireAdmin();
  if (!hasSupabaseEnv()) return;
  const client = getSupabaseAdminClient();
  if (!client) return;

  const title = getValue(formData, "title").trim();
  const owner = getValue(formData, "owner").trim();

  if (!title || !owner) {
    return;
  }

  const payload = {
    title,
    description: getValue(formData, "description") || null,
    category: getValue(formData, "category") || "build",
    phase: getValue(formData, "phase") || "foundation",
    status: getValue(formData, "status") || "not_started",
    priority: getValue(formData, "priority") || "medium",
    owner,
    due_date: getValue(formData, "due_date") || null,
    start_date: getValue(formData, "start_date") || null,
    dependency_notes: null,
    notes: getValue(formData, "notes") || null
  };

  const { data, error } = await client.from("launch_tasks").insert(payload).select("id").single();
  if (error) {
    console.error("createTask failed", error);
    return;
  }
  await createActivity(`Task created: ${payload.title}`, "launch_tasks", data?.id ?? null, "task_update", admin.id);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  redirect("/tasks?saved=task-created");
}

export async function updateTask(formData: FormData) {
  const admin = await requireAdmin();
  if (!hasSupabaseEnv()) return;
  const client = getSupabaseAdminClient();
  if (!client) return;

  const id = getValue(formData, "id");
  const status = getValue(formData, "status");

  await client.from("launch_tasks").update({
    title: getValue(formData, "title"),
    description: getValue(formData, "description") || null,
    category: getValue(formData, "category"),
    phase: getValue(formData, "phase"),
    status,
    priority: getValue(formData, "priority"),
    owner: getValue(formData, "owner"),
    due_date: getValue(formData, "due_date") || null,
    start_date: getValue(formData, "start_date") || null,
    dependency_notes: null,
    notes: getValue(formData, "notes") || null,
    completed_at: status === "done" ? new Date().toISOString() : null
  }).eq("id", id);

  await createActivity(`Task updated: ${getValue(formData, "title") || id}`, "launch_tasks", id, "task_update", admin.id);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  redirect("/tasks?saved=task-updated");
}

export async function deleteTask(formData: FormData) {
  const admin = await requireAdmin();
  if (!hasSupabaseEnv()) return;
  const client = getSupabaseAdminClient();
  if (!client) return;
  const id = getValue(formData, "id");

  await client.from("launch_tasks").delete().eq("id", id);
  await createActivity("Task deleted", "launch_tasks", id, "task_update", admin.id);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  redirect("/tasks");
}

export async function uploadArcPdf(
  _prevState: { ok: boolean; message: string },
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  const admin = await requireAdmin();
  if (!hasSupabaseEnv()) {
    return { ok: false, message: "Supabase not configured." };
  }
  const client = getSupabaseAdminClient();
  if (!client) {
    return { ok: false, message: "Database unavailable." };
  }

  const file = formData.get("pdf");
  if (!(file instanceof File) || !file.size) {
    return { ok: false, message: "Please select a PDF file." };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const { error } = await client.storage.from("arc-pdf").upload("current-arc.pdf", bytes, {
    contentType: "application/pdf",
    upsert: true,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  await createActivity("ARC PDF updated", "app_settings", null, "system", admin.id);
  return { ok: true, message: `PDF uploaded successfully (${(file.size / 1024 / 1024).toFixed(1)} MB).` };
}

export async function sendArcPdfToMember(
  _prevState: { ok: boolean; message: string },
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  const admin = await requireAdmin();
  const memberId = getValue(formData, "member_id");
  const customMessage = getValue(formData, "custom_message").trim();

  if (!memberId) {
    return { ok: false, message: "Missing member id." };
  }

  if (!hasResendEnv()) {
    return { ok: false, message: "Resend not configured." };
  }

  const client = getSupabaseAdminClient();
  if (!client) {
    return { ok: false, message: "Database unavailable." };
  }

  // Read stored email + name from the member row, NOT from formData.
  // Security rule #11: actions that send mail must read the to: address
  // from the stored record, not from caller input.
  const { data: member, error: fetchErr } = await client
    .from("launch_team_members")
    .select("id, full_name, email")
    .eq("id", memberId)
    .single();

  if (fetchErr || !member || !member.email) {
    return { ok: false, message: "Member not found or has no email on file." };
  }

  const result = await sendArcEmail(member.email, member.full_name, customMessage || undefined);
  if (!result.ok) {
    return { ok: false, message: result.error || "Failed to send email." };
  }

  const now = new Date().toISOString();
  await client.from("launch_team_members").update({
    arc_sent: true,
    arc_sent_at: now,
    status: "arc_sent",
    agreed_to_read_review: true,
    agreed_at: now,
  }).eq("id", memberId);

  await createActivity(`ARC PDF sent to ${member.full_name}`, "launch_team_members", memberId, "note", admin.id);
  revalidatePath("/launch-team");
  revalidatePath("/dashboard");

  return { ok: true, message: `PDF sent to ${member.full_name} at ${member.email}.` };
}

// Admin-triggered: email a launch team member their personalized
// review-submission link. Uses the token stored on the member row.
export async function sendReviewSubmissionLink(
  _prevState: { ok: boolean; message: string },
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  const admin = await requireAdmin();
  const memberId = getValue(formData, "member_id");
  if (!memberId) {
    return { ok: false, message: "Missing member id." };
  }
  if (!hasResendEnv()) {
    return { ok: false, message: "Resend not configured." };
  }
  const client = getSupabaseAdminClient();
  if (!client) {
    return { ok: false, message: "Database unavailable." };
  }

  const { data: member, error } = await client
    .from("launch_team_members")
    .select("id, full_name, email, review_submission_token")
    .eq("id", memberId)
    .single();

  if (error || !member || !member.email) {
    return { ok: false, message: "Member not found or missing email." };
  }

  // Ensure a token exists (backfill on the fly if missing for any reason).
  let token = member.review_submission_token;
  if (!token) {
    token = signMemberToken(member.id);
    await client
      .from("launch_team_members")
      .update({ review_submission_token: token })
      .eq("id", member.id);
  }

  const url = `${getAppBaseUrl()}/submit-review?token=${encodeURIComponent(token)}`;
  const result = await sendReviewLinkEmail(member.email, member.full_name, url);
  if (!result.ok) {
    return { ok: false, message: result.error || "Failed to send email." };
  }

  await createActivity(`Review submission link sent to ${member.full_name}`, "launch_team_members", member.id, "note", admin.id);
  return { ok: true, message: `Review link sent to ${member.full_name} at ${member.email}.` };
}

export async function deleteLaunchTeamMember(formData: FormData) {
  const admin = await requireAdmin();
  if (!hasSupabaseEnv()) return;
  const client = getSupabaseAdminClient();
  if (!client) return;
  const id = getValue(formData, "id");
  const view = getValue(formData, "view") || "all";

  await client.from("launch_team_members").delete().eq("id", id);
  await createActivity("Launch team member deleted", "launch_team_members", id, "note", admin.id);
  revalidatePath("/launch-team");
  revalidatePath("/dashboard");
  redirect(`/launch-team?view=${view}&saved=member-deleted`);
}

export async function createLaunchTeamMember(formData: FormData) {
  const admin = await requireAdmin();
  if (!hasSupabaseEnv()) return;
  const client = getSupabaseAdminClient();
  if (!client) return;
  const name = getValue(formData, "full_name").trim();

  if (!name) return;

  const submittedEmail = getValue(formData, "email").trim().toLowerCase();

  const { data, error } = await client.from("launch_team_members").insert({
    full_name: name,
    email: submittedEmail || null,
    phone: getValue(formData, "phone") || null,
    source: getValue(formData, "source") || null,
    category: getValue(formData, "category"),
    status: getValue(formData, "status"),
    agreed_to_read_review: getValue(formData, "agreed_to_read_review") === "true",
    follow_up_due: getValue(formData, "follow_up_due") || null,
    notes: getValue(formData, "notes") || null,
    review_submission_token: submittedEmail ? signMemberToken(crypto.randomUUID()) : null,
  }).select("id").single();

  if (error) {
    console.error("createLaunchTeamMember failed", error);
    return;
  }

  const shouldSendArc = getValue(formData, "send_arc_email") === "true";

  if (shouldSendArc && data?.id && hasResendEnv()) {
    // Re-read the stored email from the row we just inserted (rule #11).
    const { data: stored } = await client
      .from("launch_team_members")
      .select("email, full_name")
      .eq("id", data.id)
      .single();

    if (stored?.email) {
      const now = new Date().toISOString();
      await sendArcEmail(stored.email, stored.full_name);
      await client.from("launch_team_members").update({
        arc_sent: true,
        arc_sent_at: now,
        status: "arc_sent",
        agreed_to_read_review: true,
        agreed_at: now,
      }).eq("id", data.id);
    }
  }

  await createActivity(`Launch team record created: ${name}`, "launch_team_members", data?.id ?? null, "note", admin.id);
  revalidatePath("/launch-team");
  revalidatePath("/dashboard");
  redirect("/launch-team?view=all&saved=member-created");
}

export async function updateLaunchTeamStatus(formData: FormData) {
  const admin = await requireAdmin();
  if (!hasSupabaseEnv()) return;
  const client = getSupabaseAdminClient();
  if (!client) return;
  const id = getValue(formData, "id");
  const status = getValue(formData, "status");
  const view = getValue(formData, "view") || "all";
  const now = new Date().toISOString();

  const { data: existing } = await client
    .from("launch_team_members")
    .select("agreed_at, arc_sent_at, review_posted_at")
    .eq("id", id)
    .single();

  const agreed = ["agreed", "arc_sent", "reviewing", "reviewed"].includes(status);
  const arcSent = ["arc_sent", "reviewing", "reviewed"].includes(status);
  const reviewed = status === "reviewed";

  const { error } = await client.from("launch_team_members").update({
    status,
    agreed_to_read_review: agreed,
    agreed_at: agreed ? (existing?.agreed_at || now) : null,
    arc_sent: arcSent,
    arc_sent_at: arcSent ? (existing?.arc_sent_at || now) : null,
    review_posted: reviewed,
    review_posted_at: reviewed ? (existing?.review_posted_at || now) : null,
  }).eq("id", id);

  if (error) {
    console.error("updateLaunchTeamStatus failed", error);
    return;
  }

  await createActivity(`Launch team status updated to ${status}`, "launch_team_members", id, "note", admin.id);
  revalidatePath("/launch-team");
  revalidatePath("/dashboard");
  redirect(`/launch-team?view=${view}&saved=status-updated`);
}

export async function createOutreachContact(formData: FormData) {
  const admin = await requireAdmin();
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

  await createActivity(`Outreach contact created: ${name}`, "outreach_contacts", data?.id ?? null, "outreach_update", admin.id);
  revalidatePath("/outreach");
  revalidatePath("/dashboard");
}

export async function updateOutreachStatus(formData: FormData) {
  const admin = await requireAdmin();
  if (!hasSupabaseEnv()) return;
  const client = getSupabaseAdminClient();
  if (!client) return;
  const id = getValue(formData, "id");
  const status = getValue(formData, "status");

  await client.from("outreach_contacts").update({
    status,
    last_contacted_at: ["sent", "follow_up_due", "responded", "booked", "closed"].includes(status) ? new Date().toISOString() : null
  }).eq("id", id);

  await createActivity(`Outreach status updated to ${status}`, "outreach_contacts", id, "outreach_update", admin.id);
  revalidatePath("/outreach");
  revalidatePath("/dashboard");
}

export async function createContentItem(formData: FormData) {
  const admin = await requireAdmin();
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

  await createActivity(`Content item created: ${title}`, "content_items", data?.id ?? null, "note", admin.id);
  revalidatePath("/content");
  revalidatePath("/dashboard");
}

export async function updateContentStatus(formData: FormData) {
  const admin = await requireAdmin();
  if (!hasSupabaseEnv()) return;
  const client = getSupabaseAdminClient();
  if (!client) return;
  const id = getValue(formData, "id");
  const status = getValue(formData, "status");

  await client.from("content_items").update({
    status,
    posted_at: status === "posted" ? new Date().toISOString() : null
  }).eq("id", id);

  await createActivity(`Content status updated to ${status}`, "content_items", id, "note", admin.id);
  revalidatePath("/content");
  revalidatePath("/dashboard");
}

export async function updatePurchaseSubmission(formData: FormData) {
  const admin = await requireAdmin();
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
    verified_by: verificationStatus === "verified" ? admin.id : null,
    coupon_status: couponStatus,
    coupon_code: couponCode || null,
    coupon_sent_at: couponStatus === "sent" ? new Date().toISOString() : null,
    raffle_entered: verificationStatus === "verified",
    raffle_entered_at: verificationStatus === "verified" ? new Date().toISOString() : null,
    raffle_notes: verificationStatus === "verified" ? "Entered after manual verification." : null
  }).eq("id", id);

  await createActivity(`Purchase submission updated to ${verificationStatus}`, "purchase_submissions", id, "submission_update", admin.id);
  revalidatePath("/purchases");
  revalidatePath("/dashboard");
}

export async function createReview(formData: FormData) {
  const admin = await requireAdmin();
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

  await createActivity("Review tracker record created", "reviews", data?.id ?? null, "review_update", admin.id);
  revalidatePath("/reviews");
  revalidatePath("/dashboard");
}

export async function updateReviewStatus(formData: FormData) {
  const admin = await requireAdmin();
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

  await createActivity(`Review status updated to ${status}`, "reviews", id, "review_update", admin.id);
  revalidatePath("/reviews");
  revalidatePath("/dashboard");
}

export async function createActivityNote(formData: FormData) {
  const admin = await requireAdmin();
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
    created_by: admin.id,
  });

  revalidatePath("/activity");
  revalidatePath("/dashboard");
}

export async function updateSettings(formData: FormData) {
  const admin = await requireAdmin();
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

  await createActivity("Settings updated", "app_settings", "1", "system", admin.id);
  revalidatePath("/settings");
  revalidatePath("/dashboard");
}

// ============================================================
// PUBLIC ACTIONS
// No requireAdmin(). Each must enforce its own rate limit +
// validation + (where applicable) ownership proof. Per SECURITY.md:
//   - rule #5: first email to a stranger must be a verification link
//   - rule #6: never flip state on another user's record
//   - rule #10: created_by must be "public", never a fake admin id
// ============================================================

export async function submitProofOfPurchase(
  _prevState: { ok: boolean; message: string },
  formData: FormData
) {
  const rl = await rateLimit("proof-of-purchase");
  if (!rl.ok) return { ok: false, message: rl.message };

  if (!hasSupabaseEnv()) {
    return { ok: true, message: "Saved in mock mode. Configure Supabase to persist uploads." };
  }

  const client = getSupabaseAdminClient();
  if (!client) {
    return { ok: false, message: "Supabase admin client unavailable." };
  }

  const fullName = getValue(formData, "full_name").trim();
  const email = getValue(formData, "email").trim().toLowerCase();
  const submissionNotes = getValue(formData, "submission_notes") || null;
  const file = formData.get("proof");

  if (!fullName || !email) {
    return { ok: false, message: "Name and email are required." };
  }

  if (!(file instanceof File) || !file.size) {
    return { ok: false, message: "Proof of purchase is required." };
  }

  if (file.size > 10 * 1024 * 1024) {
    return { ok: false, message: "Proof file must be under 10MB." };
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

  await createActivity(`Proof of purchase submitted by ${fullName}`, "purchase_submissions", insert.data?.id ?? null, "submission_update", "public");
  revalidatePath("/purchases");
  revalidatePath("/dashboard");

  return { ok: true, message: "Proof received. Manual verification is now pending." };
}

// Step 1 of the join-launch-team flow: take a stranger's name + email,
// create an email_verifications row, and send ONLY a verification link.
// No ARC, no state change on any existing launch_team_members row
// (rule #5 + rule #6). Step 2 is verifyLaunchTeamSignup below.
export async function joinLaunchTeam(
  _prevState: { ok: boolean; message: string },
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  const rl = await rateLimit("join-launch-team");
  if (!rl.ok) return { ok: false, message: rl.message };

  const fullName = getValue(formData, "full_name").trim();
  const email = getValue(formData, "email").trim().toLowerCase();
  const phone = getValue(formData, "phone").trim();

  if (!fullName || !email) {
    return { ok: false, message: "Name and email are required." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  if (!hasSupabaseEnv()) {
    return { ok: true, message: "Saved in mock mode. Configure Supabase to persist." };
  }

  const client = getSupabaseAdminClient();
  if (!client) {
    return { ok: false, message: "Database unavailable. Please try again." };
  }

  // Capacity check (agreed + arc_sent + reviewing + reviewed count toward cap).
  const { count } = await client
    .from("launch_team_members")
    .select("id", { count: "exact", head: true })
    .in("status", ["agreed", "arc_sent", "reviewing", "reviewed"]);

  const LAUNCH_TEAM_CAP = 60;
  if ((count ?? 0) >= LAUNCH_TEAM_CAP) {
    return { ok: false, message: "The launch team is full! Thank you for your interest — stay tuned for the book launch on May 26th." };
  }

  // If this email already belongs to a verified/arc_sent member, don't
  // mutate their row (rule #6). Just tell the caller the email is taken.
  const { data: existing } = await client
    .from("launch_team_members")
    .select("id, status")
    .ilike("email", email)
    .limit(1)
    .maybeSingle();

  if (existing && ["arc_sent", "reviewing", "reviewed"].includes(existing.status)) {
    return {
      ok: true,
      message: "This email is already on the launch team. Check your inbox for your advance copy.",
    };
  }

  // Create a verification record. Short-lived token; single-use.
  const token = generateVerificationToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  // Clear any prior unverified verifications for this email to keep things tidy.
  await client
    .from("email_verifications")
    .delete()
    .ilike("email", email)
    .is("verified_at", null);

  const { error: insertErr } = await client.from("email_verifications").insert({
    email,
    full_name: fullName,
    phone: phone || null,
    token,
    expires_at: expiresAt,
  });

  if (insertErr) {
    console.error("join email_verifications insert failed:", insertErr);
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  if (hasResendEnv()) {
    const verifyUrl = `${getAppBaseUrl()}/join-launch-team/verify?token=${encodeURIComponent(token)}`;
    const sent = await sendVerificationEmail(email, fullName, verifyUrl);
    if (!sent.ok) {
      console.error("Verification email failed:", sent.error);
      // Don't leak backend errors to the user; just tell them to retry.
      return { ok: false, message: "We couldn't send the confirmation email. Please try again in a minute." };
    }
  }

  await createActivity(
    `Launch team signup pending verification: ${fullName}`,
    "email_verifications",
    null,
    "note",
    "public"
  );

  return {
    ok: true,
    message: "Almost there! Check your email for a confirmation link. Click it to receive your advance copy.",
  };
}

// Step 2 of the join-launch-team flow. Called by the /join-launch-team/verify
// page when the user clicks the link. Creates/updates their launch_team_members
// row and sends the ARC PDF.
export async function verifyLaunchTeamSignup(
  token: string
): Promise<{ ok: boolean; message: string }> {
  if (!token) {
    return { ok: false, message: "Missing verification token." };
  }

  const rl = await rateLimit("verify-email", token.slice(0, 16));
  if (!rl.ok) return { ok: false, message: rl.message };

  if (!hasSupabaseEnv()) {
    return { ok: false, message: "Supabase not configured." };
  }

  const client = getSupabaseAdminClient();
  if (!client) {
    return { ok: false, message: "Database unavailable." };
  }

  const { data: verification, error } = await client
    .from("email_verifications")
    .select("id, email, full_name, phone, expires_at, verified_at, member_id")
    .eq("token", token)
    .maybeSingle();

  if (error || !verification) {
    return { ok: false, message: "This link is invalid or has expired." };
  }

  if (new Date(verification.expires_at).getTime() < Date.now()) {
    return { ok: false, message: "This link has expired. Please sign up again." };
  }

  if (verification.verified_at) {
    return { ok: true, message: "This email is already confirmed. Check your inbox for your advance copy." };
  }

  // Create or update the launch_team_members row (now that we have proof
  // of email ownership). Only upgrade an existing row if it's still in
  // an unverified state; never overwrite a row that already received an
  // ARC (defense in depth for rule #6).
  const now = new Date().toISOString();
  let memberId: string;

  const { data: existing } = await client
    .from("launch_team_members")
    .select("id, status")
    .ilike("email", verification.email)
    .limit(1)
    .maybeSingle();

  const memberToken = signMemberToken(existing?.id ?? crypto.randomUUID());

  if (existing) {
    if (["arc_sent", "reviewing", "reviewed"].includes(existing.status)) {
      memberId = existing.id;
    } else {
      const { error: updateErr } = await client
        .from("launch_team_members")
        .update({
          full_name: verification.full_name,
          phone: verification.phone,
          source: "email_list_signup",
          status: "arc_sent",
          agreed_to_read_review: true,
          agreed_at: now,
          arc_sent: true,
          arc_sent_at: now,
          review_submission_token: signMemberToken(existing.id),
        })
        .eq("id", existing.id);
      if (updateErr) {
        console.error("verify upgrade failed:", updateErr);
        return { ok: false, message: "Something went wrong. Please try again." };
      }
      memberId = existing.id;
    }
  } else {
    const { data: inserted, error: insertErr } = await client
      .from("launch_team_members")
      .insert({
        full_name: verification.full_name,
        email: verification.email,
        phone: verification.phone,
        source: "email_list_signup",
        category: "cq_customer",
        status: "arc_sent",
        agreed_to_read_review: true,
        agreed_at: now,
        arc_sent: true,
        arc_sent_at: now,
        launch_party_invited: false,
        notes: "Verified public signup",
        review_submission_token: memberToken,
      })
      .select("id")
      .single();
    if (insertErr || !inserted) {
      console.error("verify insert failed:", insertErr);
      return { ok: false, message: "Something went wrong. Please try again." };
    }
    memberId = inserted.id;
    // Rewrite the token now that we know the real member id.
    await client
      .from("launch_team_members")
      .update({ review_submission_token: signMemberToken(memberId) })
      .eq("id", memberId);
  }

  await client
    .from("email_verifications")
    .update({ verified_at: now, member_id: memberId })
    .eq("id", verification.id);

  // Now — and only now — send the ARC PDF.
  if (hasResendEnv()) {
    const { data: stored } = await client
      .from("launch_team_members")
      .select("email, full_name")
      .eq("id", memberId)
      .single();
    if (stored?.email) {
      const emailResult = await sendArcEmail(stored.email, stored.full_name);
      if (!emailResult.ok) {
        console.error("ARC email failed:", emailResult.error);
      }
    }
  }

  await createActivity(
    `Launch team signup verified: ${verification.full_name}`,
    "launch_team_members",
    memberId,
    "note",
    "public"
  );

  revalidatePath("/launch-team");
  revalidatePath("/dashboard");

  return {
    ok: true,
    message: "You're in! Check your email for your advance copy of the book.",
  };
}

// Rule #6: /submit-review must require proof of ownership, not email match.
// Accepts a signed HMAC token OR the per-row review_submission_token.
export async function submitReviewLink(
  _prevState: { ok: boolean; message: string },
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  const rl = await rateLimit("submit-review");
  if (!rl.ok) return { ok: false, message: rl.message };

  const token = getValue(formData, "token").trim();
  const reviewLink = getValue(formData, "review_link").trim();

  if (!token) {
    return {
      ok: false,
      message: "This form requires a personalized link from your confirmation email. Please use the link we emailed you.",
    };
  }
  if (!reviewLink) {
    return { ok: false, message: "Please paste your Amazon review link." };
  }
  if (!reviewLink.includes("amazon.com")) {
    return { ok: false, message: "Please submit your Amazon review link." };
  }

  if (!hasSupabaseEnv()) {
    return { ok: true, message: "Saved in mock mode." };
  }

  const client = getSupabaseAdminClient();
  if (!client) {
    return { ok: false, message: "Database unavailable. Please try again." };
  }

  // Look up the member by their review_submission_token. If the token
  // doesn't exist on any row, reject. This is the ownership check —
  // only someone who received the member's email can have the token.
  const { data: member } = await client
    .from("launch_team_members")
    .select("id, full_name")
    .eq("review_submission_token", token)
    .limit(1)
    .maybeSingle();

  if (!member) {
    return {
      ok: false,
      message: "This review link is invalid. Please use the personalized link from your email.",
    };
  }

  const now = new Date().toISOString();
  const { error } = await client.from("launch_team_members").update({
    review_posted: true,
    review_posted_at: now,
    review_link: reviewLink,
    status: "reviewed",
    launch_party_confirmed: true,
  }).eq("id", member.id);

  if (error) {
    console.error("submitReviewLink update failed:", error);
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  await createActivity(`Review submitted by ${member.full_name}`, "launch_team_members", member.id, "review_update", "public");
  revalidatePath("/launch-team");
  revalidatePath("/reviews");
  revalidatePath("/dashboard");

  return {
    ok: true,
    message: "Thank you! Your review has been recorded and your spot on the Celtic Quest launch party trip is confirmed. We'll be in touch with details!",
  };
}

// ===== Coupon Claims =====

export async function submitCouponClaim(
  _prevState: { ok: boolean; message: string },
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  const rl = await rateLimit("claim");
  if (!rl.ok) return { ok: false, message: rl.message };

  const firstName = getValue(formData, "first_name").trim();
  const lastName = getValue(formData, "last_name").trim();
  const email = getValue(formData, "email").trim().toLowerCase();
  const orderNumber = getValue(formData, "amazon_order_number").trim();

  if (!firstName || !lastName || !email || !orderNumber) {
    return { ok: false, message: "All fields are required." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  if (orderNumber.length < 10) {
    return { ok: false, message: "Please enter a valid Amazon order number." };
  }

  if (!hasSupabaseEnv()) {
    return { ok: true, message: "Saved in mock mode. Configure Supabase to persist." };
  }

  const client = getSupabaseAdminClient();
  if (!client) {
    return { ok: false, message: "Database unavailable. Please try again." };
  }

  const { data: existing } = await client
    .from("coupon_claims")
    .select("id, status")
    .ilike("email", email)
    .in("status", ["pending", "sent"])
    .limit(1)
    .maybeSingle();

  if (existing) {
    return { ok: false, message: "It looks like you've already claimed a coupon with this email. Check your inbox or contact us at captdes@gmail.com" };
  }

  let screenshotUrl: string | null = null;
  const file = formData.get("screenshot");
  if (file instanceof File && file.size > 0) {
    if (file.size > 5 * 1024 * 1024) {
      return { ok: false, message: "Screenshot must be under 5MB." };
    }
    const ext = file.name.split(".").pop() || "jpg";
    const path = `claims/${slugify(`${firstName}-${lastName}`)}-${Date.now()}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const upload = await client.storage.from("claim-screenshots").upload(path, bytes, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
    if (upload.error) {
      console.error("Screenshot upload failed:", upload.error);
    } else {
      screenshotUrl = path;
    }
  }

  let couponCode: string;
  try {
    couponCode = await generateUniqueCouponCode(client);
  } catch {
    return { ok: false, message: "Something went wrong generating your coupon. Please try again." };
  }

  const { data: claim, error } = await client.from("coupon_claims").insert({
    first_name: firstName,
    last_name: lastName,
    email,
    amazon_order_number: orderNumber,
    screenshot_url: screenshotUrl,
    coupon_code: couponCode,
    status: "pending",
  }).select("id").single();

  if (error) {
    console.error("submitCouponClaim insert failed:", error);
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  const cqResult = await syncCouponToCq({
    coupon_code: couponCode,
    email,
    first_name: firstName,
    last_name: lastName,
    coupon_value_cents: 2000,
  });

  if (cqResult.ok && cqResult.cqCouponId && claim?.id) {
    await client.from("coupon_claims").update({ cq_coupon_id: cqResult.cqCouponId }).eq("id", claim.id);
  }

  await createActivity(`Coupon claim submitted by ${firstName} ${lastName}`, "coupon_claims", claim?.id ?? null, "coupon_update", "public");
  revalidatePath("/admin/coupons");
  revalidatePath("/dashboard");

  return { ok: true, message: `You're all set, ${firstName}! We're processing your coupon now. You'll receive an email within 24 hours with your $20 Celtic Quest coupon code. See you on the water!` };
}

// Admin-only. Reads the stored email off the claim row (rule #11).
export async function sendCoupon(
  _prevState: { ok: boolean; message: string },
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  const admin = await requireAdmin();
  const claimId = getValue(formData, "claim_id");

  if (!claimId) {
    return { ok: false, message: "Missing claim ID." };
  }

  if (!hasSupabaseEnv()) {
    return { ok: false, message: "Supabase not configured." };
  }

  const client = getSupabaseAdminClient();
  if (!client) {
    return { ok: false, message: "Database unavailable." };
  }

  const { data: claim, error: fetchError } = await client
    .from("coupon_claims")
    .select("*")
    .eq("id", claimId)
    .single();

  if (fetchError || !claim) {
    return { ok: false, message: "Claim not found." };
  }

  if (claim.status === "sent") {
    return { ok: false, message: "Coupon already sent." };
  }

  if (!hasResendEnv()) {
    return { ok: false, message: "Email service not configured." };
  }

  // claim.email is the stored address — rule #11 compliant.
  const emailResult = await sendCouponEmail(claim.email, claim.first_name, claim.coupon_code);
  if (!emailResult.ok) {
    return { ok: false, message: emailResult.error || "Failed to send email." };
  }

  const now = new Date().toISOString();
  await client.from("coupon_claims").update({
    status: "sent",
    sent_at: now,
  }).eq("id", claimId);

  await createActivity(`Coupon sent to ${claim.first_name} ${claim.last_name} (${claim.coupon_code})`, "coupon_claims", claimId, "coupon_update", admin.id);
  revalidatePath("/admin/coupons");
  revalidatePath("/dashboard");

  return { ok: true, message: `Coupon sent to ${claim.first_name} at ${claim.email}.` };
}

export async function rejectClaim(formData: FormData) {
  const admin = await requireAdmin();
  if (!hasSupabaseEnv()) return;
  const client = getSupabaseAdminClient();
  if (!client) return;

  const id = getValue(formData, "id");
  const adminNotes = getValue(formData, "admin_notes");

  await client.from("coupon_claims").update({
    status: "rejected",
    admin_notes: adminNotes || null,
  }).eq("id", id);

  await createActivity("Coupon claim rejected", "coupon_claims", id, "coupon_update", admin.id);
  revalidatePath("/admin/coupons");
  revalidatePath("/dashboard");
}

export async function retryCqSync(
  _prevState: { ok: boolean; message: string },
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  const admin = await requireAdmin();
  const claimId = getValue(formData, "claim_id");

  if (!hasSupabaseEnv()) {
    return { ok: false, message: "Supabase not configured." };
  }

  const client = getSupabaseAdminClient();
  if (!client) {
    return { ok: false, message: "Database unavailable." };
  }

  const { data: claim, error } = await client
    .from("coupon_claims")
    .select("*")
    .eq("id", claimId)
    .single();

  if (error || !claim) {
    return { ok: false, message: "Claim not found." };
  }

  const result = await syncCouponToCq({
    coupon_code: claim.coupon_code,
    email: claim.email,
    first_name: claim.first_name,
    last_name: claim.last_name,
    coupon_value_cents: claim.coupon_value_cents,
  });

  if (!result.ok) {
    return { ok: false, message: result.error || "CQ sync failed." };
  }

  if (result.cqCouponId) {
    await client.from("coupon_claims").update({ cq_coupon_id: result.cqCouponId }).eq("id", claimId);
  }

  await createActivity(`CQ sync retried for ${claim.first_name} ${claim.last_name}`, "coupon_claims", claimId, "coupon_update", admin.id);
  revalidatePath("/admin/coupons");

  return { ok: true, message: "CQ sync successful." };
}
