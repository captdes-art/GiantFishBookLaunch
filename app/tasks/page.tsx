import { createTask, updateTask } from "@/app/actions";
import { TaskCreateForm, TaskEditForm } from "@/components/forms";
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

      <section className="panel">
        <h3>Edit tasks</h3>
        <div className="task-edit-list">
          {filtered.map((task) => (
            <div key={task.id} className="task-edit-card">
              <div className="task-edit-header">
                <div>
                  <strong>{task.title}</strong>
                  <div className="small">{task.category.replaceAll("_", " ")} • {task.phase.replaceAll("_", " ")}</div>
                </div>
                <Badge label={task.priority} tone={task.priority === "critical" ? "danger" : task.priority === "high" ? "warning" : "neutral"} />
              </div>
              <TaskEditForm action={updateTask} task={task} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
