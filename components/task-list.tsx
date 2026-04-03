"use client";

import { useState, useRef } from "react";

type Task = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  phase: string;
  status: string;
  priority: string;
  owner: string;
  due_date: string | null;
  start_date?: string | null;
  dependency_notes?: string | null;
  notes?: string | null;
};

function formatDate(d: string | null) {
  if (!d) return null;
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function statusLabel(s: string) {
  return s.replaceAll("_", " ");
}

function statusColor(s: string) {
  switch (s) {
    case "done": return "success";
    case "in_progress": return "warning";
    case "blocked": return "danger";
    default: return "neutral";
  }
}

function isOverdue(task: Task) {
  if (!task.due_date || task.status === "done") return false;
  return new Date(task.due_date) < new Date(new Date().toISOString().slice(0, 10));
}

export function TaskList({ tasks, action, deleteAction }: { tasks: Task[]; action: (formData: FormData) => Promise<void>; deleteAction: (formData: FormData) => Promise<void> }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const openTask = tasks.find((t) => t.id === openId);

  return (
    <>
      <div className="task-list">
        {tasks.length === 0 && <p className="small" style={{ padding: 16 }}>No tasks in this view.</p>}
        {tasks.map((task) => (
          <button
            key={task.id}
            className={`task-row${task.status === "done" ? " task-row-done" : ""}${isOverdue(task) ? " task-row-overdue" : ""}`}
            onClick={() => setOpenId(task.id)}
            type="button"
          >
            <span className="task-row-title">{task.title}</span>
            <span className="task-row-meta">
              {task.notes && <span className="task-row-notes">{task.notes}</span>}
              {task.due_date && (
                <span className={`task-row-date${isOverdue(task) ? " overdue" : ""}`}>
                  {formatDate(task.due_date)}
                </span>
              )}
              <span className={`badge ${statusColor(task.status)}`}>{statusLabel(task.status)}</span>
            </span>
          </button>
        ))}
      </div>

      {openTask && (
        <div
          className="modal-backdrop"
          ref={backdropRef}
          onClick={(e) => { if (e.target === backdropRef.current) setOpenId(null); }}
        >
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h3>{openTask.title}</h3>
              <button className="ghost-button" onClick={() => setOpenId(null)}>&#10005;</button>
            </div>

            {openTask.notes && (
              <p style={{ color: "var(--text-soft)", margin: "0 0 20px", lineHeight: 1.6 }}>{openTask.notes}</p>
            )}
            {openTask.description && (
              <p style={{ color: "var(--text-soft)", margin: "0 0 20px", lineHeight: 1.6, fontSize: "0.92rem" }}>{openTask.description}</p>
            )}

            <form action={action} method="post" className="form-grid">
              <input type="hidden" name="id" value={openTask.id} />
              <input type="hidden" name="owner" value={openTask.owner} />
              <input type="hidden" name="category" value={openTask.category} />
              <input type="hidden" name="phase" value={openTask.phase} />
              <input type="hidden" name="priority" value={openTask.priority} />
              <input type="hidden" name="start_date" value={openTask.start_date || ""} />
              <input type="hidden" name="description" value={openTask.description || ""} />

              <div className="field">
                <label htmlFor="modal-title">Title</label>
                <input id="modal-title" name="title" defaultValue={openTask.title} required />
              </div>
              <div className="field">
                <label htmlFor="modal-status">Status</label>
                <select id="modal-status" name="status" defaultValue={openTask.status}>
                  <option value="not_started">not started</option>
                  <option value="in_progress">in progress</option>
                  <option value="blocked">blocked</option>
                  <option value="done">done</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="modal-due">Due date</label>
                <input id="modal-due" name="due_date" type="date" defaultValue={openTask.due_date || ""} />
              </div>
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label htmlFor="modal-notes">Notes</label>
                <textarea id="modal-notes" name="notes" defaultValue={openTask.notes || ""} style={{ minHeight: 100 }} />
              </div>
              <div className="actions" style={{ gridColumn: "1 / -1", justifyContent: "space-between" }}>
                <button className="button" type="submit" onClick={() => setOpenId(null)}>Save</button>
                {openTask.status !== "done" && (
                  <button
                    className="ghost-button"
                    type="submit"
                    name="status"
                    value="done"
                    onClick={() => setOpenId(null)}
                    style={{ color: "var(--success)" }}
                  >
                    Mark Complete
                  </button>
                )}
              </div>
            </form>
            <form action={deleteAction} method="post" style={{ marginTop: 12, borderTop: "1px solid var(--line)", paddingTop: 12 }}>
              <input type="hidden" name="id" value={openTask.id} />
              <button
                className="ghost-button"
                type="submit"
                style={{ color: "var(--danger)", fontSize: "0.85rem" }}
                onClick={() => setOpenId(null)}
              >
                Delete task
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
