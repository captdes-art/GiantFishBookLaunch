import { updatePurchaseSubmission } from "@/app/actions";
import { PurchaseUpdateForm } from "@/components/forms";
import { Badge, DateCell, FilterLinks, PageHeader } from "@/components/ui";
import { getPurchases } from "@/lib/data";
import { requireAdmin } from "@/lib/auth";

type PageProps = {
  searchParams?: Promise<{ view?: string }>;
};

function filterPurchases(view: string, purchases: Awaited<ReturnType<typeof getPurchases>>) {
  switch (view) {
    case "new":
      return purchases.filter((purchase) => {
        const ageMs = Date.now() - new Date(purchase.submitted_at).getTime();
        return ageMs < 48 * 60 * 60 * 1000;
      });
    case "pending":
      return purchases.filter((purchase) => purchase.verification_status === "pending");
    case "verified_coupon":
      return purchases.filter((purchase) => purchase.verification_status === "verified" && purchase.coupon_status !== "sent");
    case "coupon_sent":
      return purchases.filter((purchase) => purchase.coupon_status === "sent");
    case "raffle":
      return purchases.filter((purchase) => purchase.raffle_entered);
    case "rejected":
      return purchases.filter((purchase) => purchase.verification_status === "rejected");
    default:
      return purchases;
  }
}

export default async function PurchasesPage({ searchParams }: PageProps) {
  await requireAdmin("/purchases");
  const params = (await searchParams) ?? {};
  const view = params.view || "pending";
  const purchases = await getPurchases();
  const filtered = filterPurchases(view, purchases);

  return (
    <div className="page">
      <PageHeader title="Purchases" description="Manual-first verification queue for proof-of-purchase submissions, coupon fulfillment, and raffle entry." />
      <div className="notice">Public buyers use the proof-of-purchase form. Admins verify purchases manually, send coupons manually, and mark raffle entry after verification.</div>
      <FilterLinks
        basePath="/purchases"
        current={view}
        options={[
          { value: "new", label: "New submissions" },
          { value: "pending", label: "Pending verification" },
          { value: "verified_coupon", label: "Verified / coupon not sent" },
          { value: "coupon_sent", label: "Coupon sent" },
          { value: "raffle", label: "Raffle entered" },
          { value: "rejected", label: "Rejected / needs follow-up" }
        ]}
      />

      <section className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Buyer</th>
              <th>Submitted</th>
              <th>Proof</th>
              <th>Verification</th>
              <th>Coupon</th>
              <th>Raffle</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((purchase) => (
              <tr key={purchase.id}>
                <td>
                  <strong>{purchase.full_name}</strong>
                  <div className="small">{purchase.email}</div>
                </td>
                <td><DateCell value={purchase.submitted_at} time /></td>
                <td className="small">{purchase.proof_file_path || "No file path recorded"}</td>
                <td>
                  <PurchaseUpdateForm
                    action={updatePurchaseSubmission}
                    id={purchase.id}
                    verificationStatus={purchase.verification_status}
                    couponStatus={purchase.coupon_status}
                    couponCode={purchase.coupon_code}
                  />
                </td>
                <td>
                  <Badge
                    label={purchase.coupon_status.replaceAll("_", " ")}
                    tone={purchase.coupon_status === "sent" ? "success" : purchase.coupon_status === "not_sent" ? "warning" : "neutral"}
                  />
                </td>
                <td><Badge label={purchase.raffle_entered} tone={purchase.raffle_entered ? "success" : "neutral"} /></td>
                <td>{purchase.submission_notes || purchase.notes || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
