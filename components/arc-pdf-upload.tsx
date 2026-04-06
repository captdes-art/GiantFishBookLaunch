"use client";

import { useActionState } from "react";
import { uploadArcPdf } from "@/app/actions";

const initialState = { ok: false, message: "" };

export function ArcPdfUpload() {
  const [state, action, pending] = useActionState(uploadArcPdf, initialState);

  return (
    <form action={action} className="form-grid">
      <div className="field">
        <label htmlFor="arc-pdf">Upload new ARC PDF</label>
        <input id="arc-pdf" name="pdf" type="file" accept=".pdf" required />
      </div>
      <div className="actions">
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Uploading..." : "Upload PDF"}
        </button>
        {state.message && (
          <span className="small" style={{ color: state.ok ? "var(--success)" : "var(--danger)" }}>
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}
