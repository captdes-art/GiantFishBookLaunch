import { createOutreachContact, updateOutreachStatus } from "@/app/actions";
import { OutreachCreateForm } from "@/components/forms";
import { Badge, DateCell, FilterLinks, PageHeader } from "@/components/ui";
import { getOutreach } from "@/lib/data";

type PageProps = {
  searchParams?: Promise<{ view?: string }>;
};

function filterContacts(view: string, contacts: Awaited<ReturnType<typeof getOutreach>>) {
  switch (view) {
    case "researching":
      return contacts.filter((contact) => contact.status === "researching");
    case "needs_draft":
      return contacts.filter((contact) => ["ready_for_draft", "draft_ready"].includes(contact.status));
    case "awaiting_approval":
      return contacts.filter((contact) => contact.status === "awaiting_approval" || contact.approval_status === "pending");
    case "approved":
      return contacts.filter((contact) => contact.status === "approved_to_send");
    case "follow_up_due":
      return contacts.filter((contact) => contact.status === "follow_up_due" || Boolean(contact.follow_up_due));
    case "responded":
      return contacts.filter((contact) => ["responded", "booked"].includes(contact.status));
    case "closed":
      return contacts.filter((contact) => contact.status === "closed");
    default:
      return contacts;
  }
}

export default async function OutreachPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const view = params.view || "awaiting_approval";
  const contacts = await getOutreach();
  const filtered = filterContacts(view, contacts);

  return (
    <div className="page">
      <PageHeader title="Outreach Pipeline" description="Track research, draft-first outreach, Des approval, manual sending, and follow-up discipline across podcasts, media, reviewers, and aligned communities." />
      <FilterLinks
        basePath="/outreach"
        current={view}
        options={[
          { value: "researching", label: "Researching" },
          { value: "needs_draft", label: "Needs draft" },
          { value: "awaiting_approval", label: "Awaiting Des approval" },
          { value: "approved", label: "Approved to send" },
          { value: "follow_up_due", label: "Follow-up due" },
          { value: "responded", label: "Responded / booked" },
          { value: "closed", label: "Closed" }
        ]}
      />

      <section className="panel">
        <h3>Add outreach contact</h3>
        <OutreachCreateForm action={createOutreachContact} />
      </section>

      <section className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Contact</th>
              <th>Category</th>
              <th>Platform</th>
              <th>Status</th>
              <th>Approval</th>
              <th>Follow-up</th>
              <th>Pitch angle</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((contact) => (
              <tr key={contact.id}>
                <td>
                  <strong>{contact.contact_name}</strong>
                  <div className="small">{contact.organization_name || "Independent"} {contact.contact_email ? `• ${contact.contact_email}` : ""}</div>
                </td>
                <td>{contact.category}</td>
                <td>{contact.platform || "—"}</td>
                <td>
                  <form action={updateOutreachStatus} className="actions">
                    <input type="hidden" name="id" value={contact.id} />
                    <select name="status" defaultValue={contact.status}>
                      <option value="researching">researching</option>
                      <option value="ready_for_draft">ready_for_draft</option>
                      <option value="draft_ready">draft_ready</option>
                      <option value="awaiting_approval">awaiting_approval</option>
                      <option value="approved_to_send">approved_to_send</option>
                      <option value="sent">sent</option>
                      <option value="follow_up_due">follow_up_due</option>
                      <option value="responded">responded</option>
                      <option value="booked">booked</option>
                      <option value="closed">closed</option>
                    </select>
                    <button className="ghost-button" type="submit">Save</button>
                  </form>
                </td>
                <td><Badge label={contact.approval_status} tone={contact.approval_status === "approved" ? "success" : contact.approval_status === "rejected" ? "danger" : "warning"} /></td>
                <td><DateCell value={contact.follow_up_due} /></td>
                <td>{contact.pitch_angle || contact.audience_fit_notes || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
