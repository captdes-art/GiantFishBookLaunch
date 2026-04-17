"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";

export type LoginState = { ok: boolean; message: string };

export async function signIn(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/dashboard");

  if (!email || !password) {
    return { ok: false, message: "Email and password are required." };
  }

  const rl = await rateLimit("verify-email", email);
  if (!rl.ok) {
    return { ok: false, message: rl.message };
  }

  const client = await getSupabaseServerClient();
  if (!client) {
    return { ok: false, message: "Auth is not configured on this server." };
  }

  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return { ok: false, message: "Invalid email or password." };
  }

  // Must be an admin to log into the dashboard. If a non-admin account
  // somehow authenticates, sign them back out before redirecting.
  const admin = getSupabaseAdminClient();
  const { data: roleRow } = admin
    ? await admin
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .maybeSingle()
    : { data: null };

  if (roleRow?.role !== "admin") {
    await client.auth.signOut();
    return { ok: false, message: "This account does not have dashboard access." };
  }

  // Only allow redirecting to same-origin internal paths to prevent
  // open-redirect abuse via ?next= on the login URL.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  // @ts-expect-error - typedRoutes doesn't know about dynamic strings
  redirect(safeNext);
}

export async function signOut() {
  const client = await getSupabaseServerClient();
  if (client) {
    await client.auth.signOut();
  }
  redirect("/login");
}
