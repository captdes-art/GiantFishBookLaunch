import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

function getConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return { url, anonKey, serviceRoleKey };
}

export function hasSupabaseEnv() {
  const { url, anonKey, serviceRoleKey } = getConfig();

  return Boolean(url && anonKey && serviceRoleKey);
}

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getConfig();

  if (!url || !anonKey) {
    return null;
  }

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Set is a no-op in read-only contexts (server components).
          // Server actions and route handlers re-invoke middleware for refresh.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options, maxAge: 0 });
        } catch {
          // See note above.
        }
      },
    },
  });
}

// Service-role client. Never expose to client code. Use ONLY after a caller
// has been authenticated and authorized via requireAdmin(), OR inside a
// public intake server action that has already enforced rate limit +
// verification per SECURITY.md.
export function getSupabaseAdminClient() {
  const { url, serviceRoleKey } = getConfig();

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
