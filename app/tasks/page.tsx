import { createTask, updateTaskStatus } from "@/app/actions";
import { TaskCreateForm } from "@/components/forms";
import { Badge, DateCell, FilterLinks, PageHeader } from "@/components/ui";
import { getTasks } from "@/lib/data";

type PageProps = {
  searchParams?: Promise<{ view?: string }>;
};

function filterTasks(view: string, tasks: Awaited<ReturnType<typeof getTasks>>) {
  const now = new Date();
  switch (view) {
    case "today":
      return tasks.filter((task) => task.due_date === now.toISOString().slice(0, 10));
    case "week": {
      const week = new Date();
      week.setDate(now.getDate() + 7);
      return tasks.filter((task) => task.due_date && new Date(task.due_date) <= week && task.status !== "done");
    }
    case "overdue":
      return tasks.filter((task) => task.due_date && new Date(task.due_date) < now && task.status !== "done");
    case "blocked":
      return tasks.filter((task) => task.status === "blocked");
    case "completed":
      return tasks.filter((task) => task.status === "done");
    case "phase":
      return [...tasks].sort((a, b) => a.phase.localeCompare(b.phase));
    case "category":
      return [...tasks].sort((a, b) => a.category.localeCompare(b.category));
    default:
      return tasks;
  }
}

export default async function TasksPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const view = params.view || "today";
  const tasks = await getTasks();
  const filtered = filterTasks(view, tasks);

  return (
    <div className="page">
      <PageHeader title="Tasks / Timeline" description="Structured implementation schedule from foundation through launch and the Father’s Day follow-through window." />
      <FilterLinks
        basePath="/tasks"
        current={view}
        options={[
          { value: "today", label: "Today" },
          { value: "week", label: "This week" },
          { value: "overdue", label: "Overdue" },
          { value: "phase", label: "By phase" },
          { value: "category", label: "By category" },
          { value: "blocked", label: "Blocked" },
          { value: "completed", label: "Completed" }
        ]}
      />

      <section className="panel">
        <h3>Add task</h3>
        <TaskCreateForm action={createTask} />
      </section>

      <section className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Phase</th>
              <th>Priority</th>
              <th>Owner</th>
              <th>Due</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((task) => (
              <tr key={task.id}>
                <td>
                  <strong>{task.title}</strong>
                  <div className="small">{task.description || "No description"}</div>
                </td>
                <td>{task.category.replaceAll("_", " ")}</td>
                <td>{task.phase.replaceAll("_", " ")}</td>
                <td><Badge label={task.priority} tone={task.priority === "critical" ? "danger" : task.priority === "high" ? "warning" : "neutral"} /></td>
                <td>{task.owner}</td>
                <td><DateCell value={task.due_date} /></td>
                <td>
                  <form action={updateTaskStatus} className="actions">
                    <input type="hidden" name="id" value={task.id} />
                    <select name="status" defaultValue={task.status}>
                      <option value="not_started">not_started</option>
                      <option value="in_progress">in_progress</option>
                      <option value="blocked">blocked</option>
                      <option value="waiting">waiting</option>
                      <option value="done">done</option>
                    </select>
                    <button className="ghost-button" type="submit">Save</button>
                  </form>
                </td>
                <td>{task.notes || task.dependency_notes || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
