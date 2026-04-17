"use server";

import { getSupabaseServerClient } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";

export type ForgotState = { ok: boolean; message: string };

// Resolve the site URL to send in the recovery email. Must match a URL
// in the Supabase auth redirect allowlist (see supabase/config.toml).
function getResetRedirectUrl() {
  const base =
    process.env.APP_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return `${base}/reset-password`;
}

export async function requestPasswordReset(
  _prev: ForgotState,
  formData: FormData
): Promise<ForgotState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  // Rate limit per email AND per IP. Keeps anyone from spamming reset
  // emails to the admin (or anyone else) or fishing for account
  // enumeration via timing.
  const rl = await rateLimit("verify-email", email);
  if (!rl.ok) return { ok: false, message: rl.message };

  const client = await getSupabaseServerClient();
  if (!client) {
    return { ok: false, message: "Auth is not configured." };
  }

  // Supabase's resetPasswordForEmail is designed to NOT leak whether
  // the email exists (always returns success). We mirror that: surface
  // one generic success message either way. This is intentional — do
  // not change to "email not found" even if tempted.
  await client.auth.resetPasswordForEmail(email, {
    redirectTo: getResetRedirectUrl(),
  });

  return {
    ok: true,
    message: "If that email is on the account, a password reset link is on its way. Check your inbox.",
  };
}
