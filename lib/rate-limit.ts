import { headers } from "next/headers";
import { getSupabaseAdminClient } from "@/lib/supabase";

// Simple DB-backed fixed-window rate limiter. Good enough for a low-volume
// public intake surface. The rate_limits table is keyed by (scope + ip,
// window_start). Each check increments and rejects if over the limit for
// that window. Older windows are ignored (cleaned up by a future job if
// it ever matters — at current volume, leaving them is fine).

export type RateLimitResult =
  | { ok: true }
  | { ok: false; message: string; retryAfterSeconds: number };

type Scope =
  | "claim"
  | "proof-of-purchase"
  | "join-launch-team"
  | "submit-review"
  | "verify-email";

const DEFAULT_LIMITS: Record<Scope, { max: number; windowSeconds: number }> = {
  "claim": { max: 5, windowSeconds: 3600 },
  "proof-of-purchase": { max: 5, windowSeconds: 3600 },
  "join-launch-team": { max: 3, windowSeconds: 3600 },
  "submit-review": { max: 10, windowSeconds: 3600 },
  "verify-email": { max: 30, windowSeconds: 3600 },
};

export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") || "unknown";
}

export async function rateLimit(
  scope: Scope,
  extraKey?: string
): Promise<RateLimitResult> {
  const client = getSupabaseAdminClient();
  if (!client) {
    // Fail open when DB is unreachable so the form isn't a brick wall,
    // but log so we notice. At production volume a missing rate-limit
    // window is a tolerable risk; a false-positive 401 is not.
    console.warn("rate-limit: supabase admin client unavailable; failing open");
    return { ok: true };
  }

  const { max, windowSeconds } = DEFAULT_LIMITS[scope];
  const ip = await getClientIp();
  const key = extraKey ? `${scope}:${ip}:${extraKey}` : `${scope}:${ip}`;

  const windowStartMs = Math.floor(Date.now() / (windowSeconds * 1000)) * windowSeconds * 1000;
  const windowStart = new Date(windowStartMs).toISOString();

  // Postgres upsert that increments an existing row or inserts a new one
  // via an atomic round-trip. Supabase upsert doesn't support COUNT+1 in
  // one call, so we do select → insert-or-update. Race-tolerant enough
  // for this volume; would use an RPC with row-level lock at scale.
  const { data: existing } = await client
    .from("rate_limits")
    .select("count")
    .eq("key", key)
    .eq("window_start", windowStart)
    .maybeSingle();

  const newCount = (existing?.count ?? 0) + 1;

  if (newCount > max) {
    const retryAfter = Math.ceil((windowStartMs + windowSeconds * 1000 - Date.now()) / 1000);
    return {
      ok: false,
      message: `Too many submissions. Try again in ${Math.max(retryAfter, 30)} seconds.`,
      retryAfterSeconds: Math.max(retryAfter, 30),
    };
  }

  await client
    .from("rate_limits")
    .upsert(
      { key, window_start: windowStart, count: newCount },
      { onConflict: "key,window_start" }
    );

  return { ok: true };
}
