"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase";

export type ResetState = { ok: boolean; message: string };

export async function updatePassword(
  _prev: ResetState,
  formData: FormData
): Promise<ResetState> {
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");

  if (password.length < 8) {
    return { ok: false, message: "Password must be at least 8 characters." };
  }
  if (password !== confirm) {
    return { ok: false, message: "Passwords don't match." };
  }

  const client = await getSupabaseServerClient();
  if (!client) {
    return { ok: false, message: "Auth is not configured." };
  }

  // This only works when the caller already has a recovery session
  // from the /reset-password page (code-exchange). If there's no
  // session, updateUser returns an auth error and we show it.
  const { data: userData } = await client.auth.getUser();
  if (!userData.user) {
    return {
      ok: false,
      message: "Your reset link has expired. Request a new one from the forgot-password page.",
    };
  }

  const { error } = await client.auth.updateUser({ password });
  if (error) {
    return { ok: false, message: error.message };
  }

  // Sign out the recovery session so the new password has to be used
  // to log back in. Cleaner than leaving them in an ambiguous session.
  await client.auth.signOut();

  redirect("/login?reset=ok");
}
