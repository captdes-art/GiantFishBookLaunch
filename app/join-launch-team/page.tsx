"use client";

import { useActionState } from "react";
import { joinLaunchTeam } from "@/app/actions";

const initialState = { ok: false, message: "" };

export default function JoinLaunchTeamPage() {
  const [state, action, pending] = useActionState(joinLaunchTeam, initialState);

  return (
    <div className="page" style={{ maxWidth: 840, margin: "0 auto", paddingTop: 40 }}>
      <section className="hero">
        <h2>Join the Giant Fish &amp; Happiness Launch Team</h2>
        <p>
          I&apos;m looking for 50 people to read my book before anyone else and be part of
          something special. You&apos;ll get a free advance copy, and when the book goes live
          on May 26th, all I ask is that you post an honest review on Amazon.
        </p>
        <p style={{ marginTop: 16 }}>
          <strong>As a thank you</strong>, every launch team member who posts a review gets a
          free trip on the Celtic Quest this summer. Come out on the boat, do some fishing,
          and celebrate the launch together. My treat.
        </p>
      </section>

      {state.ok ? (
        <section className="panel" style={{ textAlign: "center", padding: "48px 24px" }}>
          <h3 style={{ marginBottom: 16 }}>You&apos;re on the team!</h3>
          <p style={{ fontSize: 18 }}>{state.message}</p>
          <p style={{ marginTop: 24, color: "#666" }}>
            Didn&apos;t get the email? Check your spam folder or sign up again with the same email and we&apos;ll re-send it.
          </p>
        </section>
      ) : (
        <section className="panel">
          <h3>Sign up to get your free advance copy</h3>
          <form action={action} className="form-grid">
            <div className="field">
              <label htmlFor="join-name">Full Name</label>
              <input id="join-name" name="full_name" required placeholder="Your name" />
            </div>
            <div className="field">
              <label htmlFor="join-email">Email</label>
              <input id="join-email" name="email" type="email" required placeholder="you@example.com" />
            </div>
            <div className="field">
              <label htmlFor="join-phone">Phone (optional)</label>
              <input id="join-phone" name="phone" type="tel" placeholder="(555) 123-4567" />
            </div>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <p className="small" style={{ margin: 0 }}>
                By signing up, you&apos;ll receive a free PDF of the book via email. In exchange, we ask that
                you read it and post an honest review on Amazon when we launch on May 26th, 2026.
              </p>
            </div>
            <div className="actions">
              <button className="button" type="submit" disabled={pending}>
                {pending ? "Joining..." : "Join the Launch Team"}
              </button>
              {state.message && !state.ok ? <span className="small" style={{ color: "#b91c1c" }}>{state.message}</span> : null}
            </div>
          </form>
        </section>
      )}

      <section style={{ marginTop: 32, padding: "0 8px" }}>
        <h3>How it works</h3>
        <ol style={{ lineHeight: 2, paddingLeft: 20 }}>
          <li>Sign up above and check your email for the book (PDF)</li>
          <li>Read it before May 26th</li>
          <li>Post an honest review on Amazon when the book goes live</li>
          <li><a href="/submit-review">Submit your review link</a> to confirm your launch party spot</li>
          <li>Come out on the Celtic Quest for a free fishing trip this summer!</li>
        </ol>
      </section>
    </div>
  );
}
