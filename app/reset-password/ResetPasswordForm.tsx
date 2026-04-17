"use client";

import { useActionState } from "react";
import { updatePassword, type ResetState } from "./actions";

const INITIAL: ResetState = { ok: false, message: "" };

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, INITIAL);

  return (
    <form action={formAction} className="form-grid">
      <label>
        <span>New password</span>
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </label>

      <label>
        <span>Confirm new password</span>
        <input
          type="password"
          name="confirm"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </label>

      {state.message && !state.ok && (
        <p style={{ color: "#b91c1c", fontSize: 14 }}>{state.message}</p>
      )}

      <button type="submit" className="button" disabled={pending}>
        {pending ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}
