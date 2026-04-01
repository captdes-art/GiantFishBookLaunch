"use client";

import { useActionState } from "react";
import { submitReviewLink } from "@/app/actions";

const initialState = { ok: false, message: "" };

export default function SubmitReviewPage() {
  const [state, action, pending] = useActionState(submitReviewLink, initialState);

  return (
    <div className="page" style={{ maxWidth: 840, margin: "0 auto", paddingTop: 40 }}>
      <section className="hero">
        <h2>Submit Your Amazon Review</h2>
        <p>
          Thank you for reading Giant Fish &amp; Happiness! Once you&apos;ve posted your honest
          review on Amazon, submit the link below to confirm your spot on the Celtic Quest
          launch party trip this summer.
        </p>
      </section>

      {state.ok ? (
        <section className="panel" style={{ textAlign: "center", padding: "48px 24px" }}>
          <h3 style={{ marginBottom: 16 }}>You&apos;re all set!</h3>
          <p style={{ fontSize: 18 }}>{state.message}</p>
        </section>
      ) : (
        <section className="panel">
          <h3>Paste your Amazon review link</h3>
          <form action={action} className="form-grid">
            <div className="field">
              <label htmlFor="review-email">Email</label>
              <input
                id="review-email"
                name="email"
                type="email"
                required
                placeholder="The email you signed up with"
              />
            </div>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="review-link">Amazon Review Link</label>
              <input
                id="review-link"
                name="review_link"
                type="url"
                required
                placeholder="https://www.amazon.com/..."
              />
              <p className="small" style={{ margin: "4px 0 0" }}>
                Go to your review on Amazon, copy the URL from your browser, and paste it here.
              </p>
            </div>
            <div className="actions">
              <button className="button" type="submit" disabled={pending}>
                {pending ? "Submitting..." : "Submit Review"}
              </button>
              {state.message && !state.ok ? <span className="small" style={{ color: "#b91c1c" }}>{state.message}</span> : null}
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
