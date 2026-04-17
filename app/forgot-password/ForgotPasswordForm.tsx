"use client";

import { useActionState } from "react";
import { requestPasswordReset, type ForgotState } from "./actions";

const INITIAL: ForgotState = { ok: false, message: "" };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, INITIAL);

  if (state.ok) {
    return (
      <div style={{ padding: "24px 0" }}>
        <p style={{ fontSize: 16 }}>{state.message}</p>
        <p style={{ marginTop: 24, fontSize: 14 }}>
          <a href="/login">Back to sign in</a>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="form-grid">
      <label>
        <span>Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </label>

      {state.message && !state.ok && (
        <p style={{ color: "#b91c1c", fontSize: 14 }}>{state.message}</p>
      )}

      <button type="submit" className="button" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </button>

      <p style={{ fontSize: 13, marginTop: 8 }}>
        <a href="/login">Back to sign in</a>
      </p>
    </form>
  );
}
