export function hasCqEnv(): boolean {
  return Boolean(process.env.CQ_SUPABASE_URL && process.env.CQ_SUPABASE_SERVICE_ROLE_KEY);
}

type CqSyncResult = {
  ok: boolean;
  cqCouponId?: string;
  error?: string;
};

type CouponData = {
  coupon_code: string;
  email: string;
  first_name: string;
  last_name: string;
  coupon_value_cents: number;
};

export async function syncCouponToCq(claim: CouponData): Promise<CqSyncResult> {
  if (!hasCqEnv()) {
    return { ok: false, error: "CQ credentials not configured." };
  }

  const url = process.env.CQ_SUPABASE_URL!;
  const key = process.env.CQ_SUPABASE_SERVICE_ROLE_KEY!;

  try {
    const res = await fetch(`${url}/rest/v1/coupons`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        code: claim.coupon_code,
        description: "Book Purchase — Giant Fish and Happiness",
        discount_amount: claim.coupon_value_cents,
        discount_type: "fixed",
        tag: "book-purchase",
        customer_email: claim.email,
        customer_name: `${claim.first_name} ${claim.last_name}`,
        status: "active",
        source: "book-launch-portal",
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `CQ API error ${res.status}: ${text}` };
    }

    const data = await res.json();
    const cqCouponId = Array.isArray(data) ? data[0]?.id : data?.id;
    return { ok: true, cqCouponId: cqCouponId ?? undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: `CQ sync failed: ${message}` };
  }
}
