import { createContentItem, updateContentStatus } from "@/app/actions";
import { ContentCreateForm } from "@/components/forms";
import { Badge, DateCell, FilterLinks, PageHeader } from "@/components/ui";
import { getContent } from "@/lib/data";

type PageProps = {
  searchParams?: Promise<{ view?: string }>;
};

function filterContent(view: string, items: Awaited<ReturnType<typeof getContent>>) {
  switch (view) {
    case "ideas":
      return items.filter((item) => item.status === "idea");
    case "drafting":
      return items.filter((item) => item.status === "drafting");
    case "awaiting_approval":
      return items.filter((item) => item.status === "awaiting_approval");
    case "week":
      return items.filter((item) => item.scheduled_for && new Date(item.scheduled_for) <= new Date(Date.now() + 7 * 86400000));
    case "scheduled":
      return items.filter((item) => item.status === "scheduled");
    case "posted":
      return items.filter((item) => item.status === "posted");
    case "platform":
      return [...items].sort((a, b) => a.platform.localeCompare(b.platform));
    default:
      return items;
  }
}

export default async function ContentPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const view = params.view || "awaiting_approval";
  const items = await getContent();
  const filtered = filterContent(view, items);

  return (
    <div className="page">
      <PageHeader title="Content Planner" description="Track launch emails and social content in a draft-first workflow with approval, scheduling, and posting states." />
      <FilterLinks
        basePath="/content"
        current={view}
        options={[
          { value: "ideas", label: "Ideas backlog" },
          { value: "drafting", label: "Drafting" },
          { value: "awaiting_approval", label: "Awaiting approval" },
          { value: "week", label: "This week" },
          { value: "scheduled", label: "Scheduled" },
          { value: "posted", label: "Posted" },
          { value: "platform", label: "By platform" }
        ]}
      />

      <section className="panel">
        <h3>Add content item</h3>
        <ContentCreateForm action={createContentItem} />
      </section>

      <section className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Platform</th>
              <th>Theme</th>
              <th>Status</th>
              <th>Scheduled</th>
              <th>CTA</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.title}</strong>
                  <div className="small">{item.draft_copy || item.notes || "No draft notes yet."}</div>
                </td>
                <td>{item.content_type}</td>
                <td>{item.platform}</td>
                <td>{item.theme.replaceAll("_", " ")}</td>
                <td>
                  <form action={updateContentStatus} className="actions">
                    <input type="hidden" name="id" value={item.id} />
                    <select name="status" defaultValue={item.status}>
                      <option value="idea">idea</option>
                      <option value="drafting">drafting</option>
                      <option value="awaiting_approval">awaiting_approval</option>
                      <option value="approved">approved</option>
                      <option value="scheduled">scheduled</option>
                      <option value="posted">posted</option>
                      <option value="archived">archived</option>
                    </select>
                    <button className="ghost-button" type="submit">Save</button>
                  </form>
                </td>
                <td><DateCell value={item.scheduled_for} time /></td>
                <td>
                  <Badge label={item.asset_needed ? "Asset needed" : item.cta || "No CTA"} tone={item.asset_needed ? "warning" : "neutral"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
