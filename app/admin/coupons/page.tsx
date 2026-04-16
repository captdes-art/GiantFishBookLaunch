import { Badge, DateCell, FilterLinks, PageHeader } from "@/components/ui";
import { getCouponClaims } from "@/lib/data";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { ScreenshotModal } from "@/components/admin/screenshot-modal";
import { SendCouponButton, RejectClaimButton, RetryCqSyncButton } from "@/components/admin/coupon-actions";
import type { CouponClaim } from "@/lib/types";

type PageProps = {
  searchParams?: Promise<{ view?: string }>;
};

function filterClaims(view: string, claims: CouponClaim[]) {
  switch (view) {
    case "pending":
      return claims.filter((c) => c.status === "pending");
    case "sent":
      return claims.filter((c) => c.status === "sent");
    case "rejected":
      return claims.filter((c) => c.status === "rejected");
    default:
      return claims;
  }
}

async function getSignedUrl(path: string): Promise<string | null> {
  const client = getSupabaseAdminClient();
  if (!client) return null;
  const { data } = await client.storage.from("claim-screenshots").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

export default async function AdminCouponsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const view = params.view || "pending";
  const claims = await getCouponClaims();
  const filtered = filterClaims(view, claims);

  const pendingCount = claims.filter((c) => c.status === "pending").length;
  const sentCount = claims.filter((c) => c.status === "sent").length;

  // Generate signed URLs for screenshots
  const signedUrls: Record<string, string> = {};
  for (const claim of filtered) {
    if (claim.screenshot_url) {
      const url = await getSignedUrl(claim.screenshot_url);
      if (url) signedUrls[claim.id] = url;
    }
  }

  return (
    <div className="page">
      <PageHeader
        title="Coupon Claims"
        description="Review book purchase claims and send $20 Celtic Quest fishing coupons."
      />

      <div className="notice">
        {pendingCount} pending &middot; {sentCount} sent all time
      </div>

      <FilterLinks
        basePath="/admin/coupons"
        current={view}
        options={[
          { value: "pending", label: "Pending" },
          { value: "sent", label: "Sent" },
          { value: "rejected", label: "Rejected" },
          { value: "all", label: "All" },
        ]}
      />

      <section className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Order #</th>
              <th>Screenshot</th>
              <th>Coupon</th>
              <th>CQ Sync</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: 32, color: "var(--text-soft)" }}>
                  No claims in this view.
                </td>
              </tr>
            )}
            {filtered.map((claim) => (
              <tr key={claim.id}>
                <td>
                  <strong>{claim.first_name} {claim.last_name}</strong>
                  <div className="small"><DateCell value={claim.created_at} time /></div>
                </td>
                <td className="small">{claim.email}</td>
                <td className="small" style={{ fontFamily: "monospace" }}>{claim.amazon_order_number}</td>
                <td>
                  {signedUrls[claim.id] ? (
                    <ScreenshotModal url={signedUrls[claim.id]} />
                  ) : (
                    <span className="small" style={{ color: "var(--text-soft)" }}>None</span>
                  )}
                </td>
                <td>
                  <code style={{ fontSize: "0.85rem", background: "var(--panel-muted)", padding: "2px 6px", borderRadius: 4 }}>
                    {claim.coupon_code}
                  </code>
                </td>
                <td>
                  {claim.cq_coupon_id ? (
                    <Badge label="Synced" tone="success" />
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <Badge label="Pending" tone="warning" />
                      <RetryCqSyncButton claimId={claim.id} />
                    </div>
                  )}
                </td>
                <td>
                  <Badge
                    label={claim.status}
                    tone={claim.status === "sent" ? "success" : claim.status === "rejected" ? "danger" : "warning"}
                  />
                  {claim.sent_at && (
                    <div className="small"><DateCell value={claim.sent_at} time /></div>
                  )}
                </td>
                <td>
                  {claim.status === "pending" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <SendCouponButton claimId={claim.id} />
                      <RejectClaimButton claimId={claim.id} />
                    </div>
                  ) : claim.status === "rejected" ? (
                    <span className="small" style={{ color: "var(--text-soft)" }}>
                      {claim.admin_notes || "Rejected"}
                    </span>
                  ) : (
                    <span className="small" style={{ color: "var(--success)" }}>Sent</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
