import { createLaunchTeamMember, updateLaunchTeamStatus, deleteLaunchTeamMember } from "@/app/actions";
import { AddMemberButton } from "@/components/add-member-modal";
import { LaunchTeamActions } from "@/components/launch-team-actions";
import { SendPdfButton } from "@/components/send-pdf-modal";
import { Badge, DateCell, FilterLinks, PageHeader } from "@/components/ui";
import { getLaunchTeam } from "@/lib/data";

type PageProps = {
  searchParams?: Promise<{ view?: string; saved?: string }>;
};

const ACTIVE_STATUSES = ["agreed", "arc_sent", "reviewing", "reviewed"];

function filterMembers(view: string, members: Awaited<ReturnType<typeof getLaunchTeam>>) {
  switch (view) {
    case "all":
      return members;
    case "prospects":
      return members.filter((m) => m.status === "prospect" || m.status === "invited");
    case "official":
      return members.filter((m) => ACTIVE_STATUSES.includes(m.status));
    case "arc_not_sent":
      return members.filter((m) => m.status === "agreed");
    case "arc_sent":
      return members.filter((m) => m.status === "arc_sent" || m.status === "reviewing");
    case "review_pending":
      return members.filter((m) => m.status === "arc_sent" || m.status === "reviewing");
    case "review_completed":
      return members.filter((m) => m.status === "reviewed");
    case "follow_up_due":
      return members.filter((m) => m.follow_up_due !== null);
    case "launch_party":
      return members.filter((m) => m.launch_party_confirmed || (m.review_posted && m.launch_party_invited));
    case "inactive":
      return members.filter((m) => m.status === "inactive");
    default:
      return members;
  }
}

export default async function LaunchTeamPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const view = params.view || "all";
  const saved = params.saved;
  const members = await getLaunchTeam();
  const filtered = filterMembers(view, members);

  return (
    <div className="page">
      <PageHeader title="Launch Team CRM" description="Track prospects, official launch team members, ARC progress, reviews, and launch party eligibility." actions={<AddMemberButton action={createLaunchTeamMember} />} />
      {saved === "member-created" && <p className="success-banner">New launch team member added.</p>}
      {saved === "status-updated" && <p className="success-banner">Status updated.</p>}
      {saved === "member-deleted" && <p className="success-banner">Member deleted.</p>}
      <FilterLinks
        basePath="/launch-team"
        current={view}
        options={[
          { value: "all", label: "All" },
          { value: "prospects", label: "Prospects" },
          { value: "official", label: "Official launch team" },
          { value: "arc_not_sent", label: "Needs ARC" },
          { value: "review_pending", label: "Review pending" },
          { value: "review_completed", label: "Reviewed" },
          { value: "follow_up_due", label: "Follow-up due" },
          { value: "launch_party", label: "Launch party" },
          { value: "inactive", label: "Inactive" }
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
              <th></th>
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
                    <input type="hidden" name="view" value={view} />
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
                <td>
                  <div className="actions">
                    {member.email && (
                      <SendPdfButton memberId={member.id} memberName={member.full_name} memberEmail={member.email} />
                    )}
                    <form action={deleteLaunchTeamMember}>
                      <input type="hidden" name="id" value={member.id} />
                      <input type="hidden" name="view" value={view} />
                      <button className="ghost-button" type="submit" style={{ color: "var(--danger)", fontSize: "0.82rem" }}>Delete</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
