"use client";

import { useState, useRef, type ReactNode } from "react";
import { LaunchTeamCreateForm, TaskCreateForm } from "@/components/forms";

function ModalButton({ label, title, children }: { label: string; title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <button className="button" onClick={() => setOpen(true)}>{label}</button>
      {open && (
        <div
          className="modal-backdrop"
          ref={backdropRef}
          onClick={(e) => { if (e.target === backdropRef.current) setOpen(false); }}
        >
          <div className="modal">
            <div className="modal-header">
              <h3>{title}</h3>
              <button className="ghost-button" onClick={() => setOpen(false)}>✕</button>
            </div>
            {children}
          </div>
        </div>
      )}
    </>
  );
}

export function AddMemberButton({ action }: { action: (formData: FormData) => Promise<void> }) {
  return (
    <ModalButton label="+ Add Team Member" title="Add Team Member">
      <LaunchTeamCreateForm action={action} />
    </ModalButton>
  );
}

export function AddTaskButton({ action }: { action: (formData: FormData) => Promise<void> }) {
  return (
    <ModalButton label="+ Add Task" title="Add Task">
      <TaskCreateForm action={action} />
    </ModalButton>
  );
}
