import { createTask, updateTask } from "@/app/actions";
import { TaskEditForm } from "@/components/forms";
import { AddTaskButton } from "@/components/add-member-modal";
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
  const view = params.view || "all";
  const tasks = await getTasks();
  const filtered = filterTasks(view, tasks);

  return (
    <div className="page">
      <PageHeader title="Tasks" description="Track what needs to get done for the launch." actions={<AddTaskButton action={createTask} />} />
      <FilterLinks
        basePath="/tasks"
        current={view}
        options={[
          { value: "all", label: "All" },
          { value: "week", label: "This week" },
          { value: "overdue", label: "Overdue" },
          { value: "completed", label: "Completed" }
        ]}
      />

      <section className="panel">
        <div className="task-edit-list">
          {filtered.length === 0 && <p className="small" style={{ padding: 12 }}>No tasks in this view.</p>}
          {filtered.map((task) => (
            <div key={task.id} className={`task-edit-card${task.status === "done" ? " task-done" : ""}`}>
              <TaskEditForm action={updateTask} task={task} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
