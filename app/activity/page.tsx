import { createActivityNote } from "@/app/actions";
import { ActivityNoteForm } from "@/components/forms";
import { Badge, DateCell, PageHeader } from "@/components/ui";
import { getActivity } from "@/lib/data";

export default async function ActivityPage() {
  const activity = await getActivity();

  return (
    <div className="page">
      <PageHeader title="Activity" description="Lightweight operational log for preserving context, recent actions, and manual notes across the launch." />

      <section className="panel">
        <h3>Add activity note</h3>
        <ActivityNoteForm action={createActivityNote} />
      </section>

      <section className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>When</th>
              <th>Event</th>
              <th>Entity</th>
              <th>Summary</th>
              <th>Created by</th>
            </tr>
          </thead>
          <tbody>
            {activity.map((entry) => (
              <tr key={entry.id}>
                <td><DateCell value={entry.created_at} time /></td>
                <td><Badge label={entry.event_type.replaceAll("_", " ")} /></td>
                <td className="small">{entry.entity_type || "—"} {entry.entity_id ? `• ${entry.entity_id}` : ""}</td>
                <td>
                  <strong>{entry.summary}</strong>
                  <div className="small">{entry.details || "No additional details."}</div>
                </td>
                <td>{entry.created_by || "system"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
