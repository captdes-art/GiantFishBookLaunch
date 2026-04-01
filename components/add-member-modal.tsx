"use client";

import { useState, useRef } from "react";
import { LaunchTeamCreateForm } from "@/components/forms";

export function AddMemberButton({ action }: { action: (formData: FormData) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <button className="button" onClick={() => setOpen(true)}>+ Add Team Member</button>
      {open && (
        <div
          className="modal-backdrop"
          ref={backdropRef}
          onClick={(e) => { if (e.target === backdropRef.current) setOpen(false); }}
        >
          <div className="modal">
            <div className="modal-header">
              <h3>Add Team Member</h3>
              <button className="ghost-button" onClick={() => setOpen(false)}>✕</button>
            </div>
            <LaunchTeamCreateForm action={action} />
          </div>
        </div>
      )}
    </>
  );
}
