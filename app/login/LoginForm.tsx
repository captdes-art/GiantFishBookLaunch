"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "./actions";

const INITIAL: LoginState = { ok: false, message: "" };

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(signIn, INITIAL);

  return (
    <form action={formAction} className="form-grid">
      <input type="hidden" name="next" value={next} />

      <label>
        <span>Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          defaultValue=""
        />
      </label>

      <label>
        <span>Password</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
        />
      </label>

      {state.message && !state.ok && (
        <p style={{ color: "#b91c1c", fontSize: 14 }}>{state.message}</p>
      )}

      <button type="submit" className="button" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
