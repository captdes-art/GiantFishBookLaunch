import { createLaunchTeamMember, updateLaunchTeamStatus } from "@/app/actions";
import { AddMemberButton } from "@/components/add-member-modal";
import { LaunchTeamActions } from "@/components/launch-team-actions";
import { Badge, DateCell, FilterLinks, PageHeader } from "@/components/ui";
import { getLaunchTeam } from "@/lib/data";

type PageProps = {
  searchParams?: Promise<{ view?: string; saved?: string }>;
};

function filterMembers(view: string, members: Awaited<ReturnType<typeof getLaunchTeam>>) {
  switch (view) {
    case "prospects":
      return members.filter((member) => member.status === "prospect");
    case "awaiting":
      return members.filter((member) => member.status === "invited");
    case "official":
      return members.filter((member) => member.agreed_to_read_review);
    case "arc_not_sent":
      return members.filter((member) => member.agreed_to_read_review && !member.arc_sent);
    case "review_pending":
      return members.filter((member) => member.arc_sent && !member.review_posted);
    case "review_completed":
      return members.filter((member) => member.review_posted);
    case "follow_up_due":
      return members.filter((member) => Boolean(member.follow_up_due));
    case "launch_party":
      return members.filter((member) => member.review_posted || member.launch_party_invited);
    default:
      return members;
  }
}

export default async function LaunchTeamPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const view = params.view || "prospects";
  const saved = params.saved;
  const members = await getLaunchTeam();
  const filtered = filterMembers(view, members);

  return (
    <div className="page">
      <PageHeader title="Launch Team CRM" description="Track prospects, official launch team members, ARC progress, reviews, and launch party eligibility." actions={<AddMemberButton action={createLaunchTeamMember} />} />
      {saved === "member-created" && <p className="success-banner">New launch team member added.</p>}
      {saved === "status-updated" && <p className="success-banner">Status updated.</p>}
      <FilterLinks
        basePath="/launch-team"
        current={view}
        options={[
          { value: "prospects", label: "Prospects" },
          { value: "awaiting", label: "Invited / awaiting response" },
          { value: "official", label: "Official launch team" },
          { value: "arc_not_sent", label: "ARC not yet sent" },
          { value: "review_pending", label: "Review pending" },
          { value: "review_completed", label: "Review completed" },
          { value: "follow_up_due", label: "Follow-up due" },
          { value: "launch_party", label: "Launch party eligible" }
        ]}
      />

      <LaunchTeamActions members={filtered} />

      <section className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Source</th>
              <th>Status</th>
              <th>Agreed</th>
              <th>ARC</th>
              <th>Review</th>
              <th>Follow-up</th>
              <th>Launch party</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((member) => (
              <tr key={member.id}>
                <td>
                  <strong>{member.full_name}</strong>
                  <div className="small">{member.email || "No email"} {member.phone ? `• ${member.phone}` : ""}</div>
                </td>
                <td>{member.category.replaceAll("_", " ")}</td>
                <td>{member.source || "—"}</td>
                <td>
                  <form action={updateLaunchTeamStatus} className="actions">
                    <input type="hidden" name="id" value={member.id} />
                    <select name="status" defaultValue={member.status}>
                      <option value="prospect">prospect</option>
                      <option value="invited">invited</option>
                      <option value="agreed">agreed</option>
                      <option value="arc_sent">arc_sent</option>
                      <option value="reviewing">reviewing</option>
                      <option value="reviewed">reviewed</option>
                      <option value="inactive">inactive</option>
                    </select>
                    <button className="ghost-button" type="submit">Save</button>
                  </form>
                </td>
                <td><Badge label={member.agreed_to_read_review} tone={member.agreed_to_read_review ? "success" : "neutral"} /></td>
                <td><Badge label={member.arc_sent} tone={member.arc_sent ? "success" : "warning"} /></td>
                <td><Badge label={member.review_posted} tone={member.review_posted ? "success" : "warning"} /></td>
                <td><DateCell value={member.follow_up_due} /></td>
                <td><Badge label={member.review_posted || member.launch_party_invited} tone={member.review_posted || member.launch_party_invited ? "success" : "neutral"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
