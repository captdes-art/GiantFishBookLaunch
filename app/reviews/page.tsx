import { createReview, updateReviewStatus } from "@/app/actions";
import { ReviewCreateForm } from "@/components/forms";
import { Badge, DateCell, FilterLinks, PageHeader } from "@/components/ui";
import { getLaunchTeam, getReviews } from "@/lib/data";

type PageProps = {
  searchParams?: Promise<{ view?: string }>;
};

function filterReviews(view: string, reviews: Awaited<ReturnType<typeof getReviews>>) {
  switch (view) {
    case "promised":
      return reviews.filter((review) => review.status === "promised");
    case "reminder_due":
      return reviews.filter((review) => review.status === "reminder_due");
    case "posted":
      return reviews.filter((review) => review.status === "posted");
    case "verified":
      return reviews.filter((review) => review.status === "verified");
    default:
      return reviews;
  }
}

export default async function ReviewsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const view = params.view || "promised";
  const [reviews, launchTeam] = await Promise.all([getReviews(), getLaunchTeam()]);
  const filtered = filterReviews(view, reviews);

  return (
    <div className="page">
      <PageHeader title="Reviews" description="Track promised reviews, reminder timing, posted review links, and manual verification." />
      <FilterLinks
        basePath="/reviews"
        current={view}
        options={[
          { value: "promised", label: "Promised / not posted" },
          { value: "reminder_due", label: "Reminder due" },
          { value: "posted", label: "Posted / awaiting verification" },
          { value: "verified", label: "Verified reviews" }
        ]}
      />

      <section className="panel">
        <h3>Add review tracker record</h3>
        <ReviewCreateForm action={createReview} launchTeamMembers={launchTeam.map((member) => ({ id: member.id, full_name: member.full_name }))} />
      </section>

      <section className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Type</th>
              <th>Status</th>
              <th>Link</th>
              <th>Reminder sent</th>
              <th>Posted</th>
              <th>Verified</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((review) => (
              <tr key={review.id}>
                <td>
                  <strong>{review.launch_team_members?.full_name || "Unlinked"}</strong>
                  <div className="small">{review.launch_team_members?.email || review.notes || "No linked contact"}</div>
                </td>
                <td>{review.review_type}</td>
                <td>
                  <form action={updateReviewStatus} className="actions">
                    <input type="hidden" name="id" value={review.id} />
                    <select name="status" defaultValue={review.status}>
                      <option value="not_started">not_started</option>
                      <option value="promised">promised</option>
                      <option value="reminder_due">reminder_due</option>
                      <option value="posted">posted</option>
                      <option value="verified">verified</option>
                    </select>
                    <button className="ghost-button" type="submit">Save</button>
                  </form>
                </td>
                <td className="small">{review.review_link || review.review_excerpt || "—"}</td>
                <td><DateCell value={review.reminder_sent_at} time /></td>
                <td><DateCell value={review.posted_at} time /></td>
                <td><Badge label={Boolean(review.verified_at)} tone={review.verified_at ? "success" : "neutral"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
