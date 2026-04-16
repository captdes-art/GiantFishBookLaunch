"use client";

import { useActionState, useState } from "react";
import { sendCoupon, rejectClaim, retryCqSync } from "@/app/actions";

const initialState = { ok: false, message: "" };

export function SendCouponButton({ claimId }: { claimId: string }) {
  const [state, action, pending] = useActionState(sendCoupon, initialState);

  return (
    <form action={action}>
      <input type="hidden" name="claim_id" value={claimId} />
      <button className="send-btn" type="submit" disabled={pending}>
        {pending ? "Sending..." : "Send Coupon"}
      </button>
      {state.message && <span className="small" style={{ color: state.ok ? "var(--success)" : "var(--danger)" }}>{state.message}</span>}
    </form>
  );
}

export function RejectClaimButton({ claimId }: { claimId: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button className="ghost-button danger-text" type="button" onClick={() => setConfirming(true)} style={{ fontSize: "0.82rem" }}>
        Reject
      </button>
    );
  }

  return (
    <form action={rejectClaim} style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <input type="hidden" name="id" value={claimId} />
      <input name="admin_notes" placeholder="Reason (optional)" style={{ fontSize: "0.8rem", padding: "4px 8px", width: 140 }} />
      <button className="ghost-button danger-text" type="submit" style={{ fontSize: "0.82rem" }}>
        Confirm
      </button>
      <button className="ghost-button" type="button" onClick={() => setConfirming(false)} style={{ fontSize: "0.82rem" }}>
        Cancel
      </button>
    </form>
  );
}

export function RetryCqSyncButton({ claimId }: { claimId: string }) {
  const [state, action, pending] = useActionState(retryCqSync, initialState);

  return (
    <form action={action}>
      <input type="hidden" name="claim_id" value={claimId} />
      <button className="cq-retry-btn" type="submit" disabled={pending}>
        {pending ? "Syncing..." : "Retry"}
      </button>
      {state.message && <span className="small" style={{ color: state.ok ? "var(--success)" : "var(--danger)" }}>{state.message}</span>}
    </form>
  );
}
