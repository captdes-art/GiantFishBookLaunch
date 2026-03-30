"use client";

import { useActionState } from "react";
import { submitProofOfPurchase } from "@/app/actions";

const initialState = { ok: false, message: "" };

export default function ProofOfPurchasePage() {
  const [state, action, pending] = useActionState(submitProofOfPurchase, initialState);

  return (
    <div className="page" style={{ maxWidth: 840, margin: "0 auto", paddingTop: 40 }}>
      <section className="hero">
        <h2>Proof of Purchase</h2>
        <p>Submit your order proof for manual verification, manual coupon fulfillment, and raffle entry tracking.</p>
        <div className="meta">
          <span>V1 manual-first workflow</span>
          <span>No automatic Amazon verification</span>
          <span>Internal admin review required</span>
        </div>
      </section>

      <section className="panel">
        <h3>Submit purchase</h3>
        <form action={action} className="form-grid">
          <div className="field">
            <label htmlFor="proof-name">Name</label>
            <input id="proof-name" name="full_name" required />
          </div>
          <div className="field">
            <label htmlFor="proof-email">Email</label>
            <input id="proof-email" name="email" type="email" required />
          </div>
          <div className="field">
            <label htmlFor="proof-file">Order proof upload</label>
            <input id="proof-file" name="proof" type="file" accept="image/*,.pdf" required />
          </div>
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label htmlFor="proof-notes">Optional order notes</label>
            <textarea id="proof-notes" name="submission_notes" />
          </div>
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label htmlFor="proof-consent">Acknowledgment</label>
            <textarea
              id="proof-consent"
              disabled
              value="By submitting this form, you understand that purchase verification, coupon fulfillment, and raffle entry are handled manually in this V1 workflow."
            />
          </div>
          <div className="actions">
            <button className="button" type="submit" disabled={pending}>
              {pending ? "Submitting..." : "Submit proof"}
            </button>
            {state.message ? <span className="small">{state.message}</span> : null}
          </div>
        </form>
      </section>
    </div>
  );
}
