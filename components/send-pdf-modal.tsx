"use client";

import { useState, useRef, useActionState, useEffect } from "react";
import { sendArcPdfToMember } from "@/app/actions";

const initialState = { ok: false, message: "" };

export function SendPdfButton({
  memberId,
  memberName,
  memberEmail,
}: {
  memberId: string;
  memberName: string;
  memberEmail: string;
}) {
  const [open, setOpen] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [state, action, pending] = useActionState(sendArcPdfToMember, initialState);

  useEffect(() => {
    if (state.ok && open) {
      const timer = setTimeout(() => setOpen(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [state.ok, open]);

  return (
    <>
      <button className="ghost-button" type="button" onClick={() => setOpen(true)} style={{ fontSize: "0.82rem", color: "var(--accent)" }}>
        Send PDF
      </button>
      {open && (
        <div
          className="modal-backdrop"
          ref={backdropRef}
          onClick={(e) => { if (e.target === backdropRef.current) setOpen(false); }}
        >
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3>Send ARC PDF</h3>
              <button className="ghost-button" onClick={() => setOpen(false)}>&#10005;</button>
            </div>

            {state.ok ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <p style={{ color: "var(--success)", fontWeight: 600, fontSize: "1.1rem" }}>{state.message}</p>
              </div>
            ) : (
              <form action={action} className="form-grid">
                <input type="hidden" name="member_id" value={memberId} />
                <input type="hidden" name="email" value={memberEmail} />
                <input type="hidden" name="name" value={memberName} />

                <div className="field">
                  <label>To</label>
                  <input value={`${memberName} <${memberEmail}>`} disabled style={{ opacity: 0.7 }} />
                </div>
                <div className="field" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="send-pdf-message">Personal message (optional)</label>
                  <textarea
                    id="send-pdf-message"
                    name="custom_message"
                    defaultValue={`Hi ${memberName}, here's your advance copy of Giant Fish & Happiness. I hope you enjoy it!`}
                    style={{ minHeight: 100 }}
                  />
                </div>
                <div className="actions" style={{ gridColumn: "1 / -1" }}>
                  <button className="button" type="submit" disabled={pending}>
                    {pending ? "Sending..." : "Send PDF"}
                  </button>
                  {state.message && !state.ok && (
                    <span className="small" style={{ color: "var(--danger)" }}>{state.message}</span>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
