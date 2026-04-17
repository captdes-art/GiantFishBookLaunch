import { redirect } from "next/navigation";
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase";

export type SessionUser = {
  id: string;
  email: string | null;
  role: "admin" | "staff" | null;
};

// Reads the current session from the cookie jar.
// Returns null if no session, or if Supabase is unavailable.
// Never throws — caller decides what to do with "not logged in".
export async function getSessionUser(): Promise<SessionUser | null> {
  const client = await getSupabaseServerClient();
  if (!client) return null;

  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;

  const userId = data.user.id;
  const email = data.user.email ?? null;

  // Role lookup uses the service-role client because the user_roles RLS
  // policy only lets users read their own row — which is fine, but we
  // want a single, consistent read path that doesn't get tangled in
  // session refresh. Service role is safe here: we're reading one row
  // keyed by the already-authenticated user id.
  const admin = getSupabaseAdminClient();
  if (!admin) return { id: userId, email, role: null };

  const { data: roleRow } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  const role = (roleRow?.role ?? null) as SessionUser["role"];
  return { id: userId, email, role };
}

// First line of every admin server action / admin API route / admin page.
// If no session → redirect to /login (with returnTo).
// If session but not admin → throw (treat as programming error; admins are
// the only role that should be hitting these paths).
export async function requireAdmin(returnTo?: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    const qs = returnTo ? `?next=${encodeURIComponent(returnTo)}` : "";
    // @ts-expect-error - typedRoutes doesn't know about dynamic strings
    redirect(`/login${qs}`);
  }
  if (user.role !== "admin") {
    throw new Error("Forbidden: admin role required");
  }
  return user;
}

// Soft variant for server components that want to render a "please log in"
// banner rather than redirect. Returns null if not admin.
export async function currentAdminOrNull(): Promise<SessionUser | null> {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return null;
  return user;
}
