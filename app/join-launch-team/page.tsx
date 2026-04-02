"use client";

import { useActionState } from "react";
import { joinLaunchTeam } from "@/app/actions";
import Image from "next/image";

const initialState = { ok: false, message: "" };

export default function JoinLaunchTeamPage() {
  const [state, action, pending] = useActionState(joinLaunchTeam, initialState);

  return (
    <div className="lt-landing">
      {/* Hero */}
      <section className="lt-hero">
        <div className="lt-hero-glow" />
        <div className="lt-hero-inner">
          <div className="lt-hero-text">
            <p className="lt-eyebrow">Advance Reader Copy</p>
            <h1 className="lt-title">
              Join the Launch Team
            </h1>
            <p className="lt-subtitle">
              Finding Peace, True Love, and Surrender Amidst the Gales of Life
            </p>
            <p className="lt-hook">
              I&apos;m looking for <strong>50 readers</strong> to get my book before anyone else,
              read it, and post an honest review on Amazon when we launch on <strong>May 26th</strong>.
            </p>
            <p className="lt-hook">
              As a thank you, every reviewer gets a <strong>free fishing trip on the Celtic Quest</strong> this
              summer. Come out on the boat, celebrate the launch, and let&apos;s catch some fish together. My treat.
            </p>
          </div>
          <div className="lt-cover-wrap">
            <div className="lt-cover-shadow">
              <Image
                src="/book-cover.png"
                alt="Giant Fish and Happiness book cover"
                width={360}
                height={540}
                className="lt-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Form or Success */}
      <section className="lt-form-section" id="signup">
        {state.ok ? (
          <div className="lt-success-card">
            <div className="lt-success-icon">&#10003;</div>
            <h2>You&apos;re on the team!</h2>
            <p>{state.message}</p>
            <p className="lt-success-note">
              Didn&apos;t get the email? Check your spam folder, or sign up again with the
              same email and we&apos;ll re-send it.
            </p>
          </div>
        ) : (
          <div className="lt-form-card">
            <h2>Get Your Free Advance Copy</h2>
            <p className="lt-form-desc">
              Sign up below and we&apos;ll email you the book right away.
            </p>
            <form action={action} className="lt-form">
              <div className="lt-field">
                <label htmlFor="join-name">Full Name</label>
                <input id="join-name" name="full_name" required placeholder="Your name" />
              </div>
              <div className="lt-field">
                <label htmlFor="join-email">Email</label>
                <input id="join-email" name="email" type="email" required placeholder="you@example.com" />
              </div>
              <div className="lt-field">
                <label htmlFor="join-phone">Phone (optional)</label>
                <input id="join-phone" name="phone" type="tel" placeholder="(555) 123-4567" />
              </div>
              <button className="lt-submit" type="submit" disabled={pending}>
                {pending ? "Joining..." : "Join the Launch Team"}
              </button>
              {state.message && !state.ok ? (
                <p className="lt-error">{state.message}</p>
              ) : null}
              <p className="lt-disclaimer">
                You&apos;ll receive a free PDF via email. All we ask is an honest Amazon review when the book goes live.
              </p>
            </form>
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="lt-steps-section">
        <h2 className="lt-steps-title">How It Works</h2>
        <div className="lt-steps">
          <div className="lt-step">
            <div className="lt-step-num">1</div>
            <h3>Sign Up</h3>
            <p>Enter your name and email above. We&apos;ll send you the book immediately.</p>
          </div>
          <div className="lt-step">
            <div className="lt-step-num">2</div>
            <h3>Read the Book</h3>
            <p>Enjoy your advance copy before anyone else gets to read it.</p>
          </div>
          <div className="lt-step">
            <div className="lt-step-num">3</div>
            <h3>Post a Review</h3>
            <p>When we launch May 26th, post an honest review on Amazon.</p>
          </div>
          <div className="lt-step">
            <div className="lt-step-num">4</div>
            <h3>Come Fishing</h3>
            <p><a href="/submit-review">Submit your review link</a> and join us on the Celtic Quest this summer!</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="lt-footer">
        <p>Captain Desmond O&apos;Sullivan &middot; Celtic Quest Fishing Fleet &middot; Port Jefferson, Long Island, NY</p>
      </footer>
    </div>
  );
}
