import { createTask, updateTask } from "@/app/actions";
import { AddTaskButton } from "@/components/add-member-modal";
import { TaskList } from "@/components/task-list";
import { FilterLinks, PageHeader } from "@/components/ui";
import { getTasks } from "@/lib/data";

type PageProps = {
  searchParams?: Promise<{ view?: string }>;
};

function filterTasks(view: string, tasks: Awaited<ReturnType<typeof getTasks>>) {
  switch (view) {
    case "active":
      return tasks.filter((task) => task.status !== "done");
    case "completed":
      return tasks.filter((task) => task.status === "done");
    default:
      return [...tasks].sort((a, b) => {
        if (a.status === "done" && b.status !== "done") return 1;
        if (a.status !== "done" && b.status === "done") return -1;
        return 0;
      });
  }
}

export default async function TasksPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const view = params.view || "active";
  const tasks = await getTasks();
  const filtered = filterTasks(view, tasks);

  return (
    <div className="page">
      <PageHeader title="Tasks" description="Track what needs to get done for the launch." actions={<AddTaskButton action={createTask} />} />
      <FilterLinks
        basePath="/tasks"
        current={view}
        options={[
          { value: "active", label: "Active" },
          { value: "all", label: "All" },
          { value: "completed", label: "Completed" }
        ]}
      />
      <TaskList tasks={filtered} action={updateTask} />
    </div>
  );
}
