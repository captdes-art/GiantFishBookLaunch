import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateCouponCode(): string {
  const bytes = randomBytes(8);
  let code = "FISH-";
  for (let i = 0; i < 8; i++) {
    code += CHARS[bytes[i] % CHARS.length];
  }
  return code;
}

export async function generateUniqueCouponCode(client: SupabaseClient): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateCouponCode();
    const { data } = await client
      .from("coupon_claims")
      .select("id")
      .eq("coupon_code", code)
      .maybeSingle();

    if (!data) return code;
  }
  throw new Error("Failed to generate unique coupon code after 10 attempts.");
}
