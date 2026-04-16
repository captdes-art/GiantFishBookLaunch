"use client";

import { useActionState } from "react";
import { submitCouponClaim } from "@/app/actions";
import Image from "next/image";

const initialState = { ok: false, message: "" };

export default function ClaimCouponPage() {
  const [state, action, pending] = useActionState(submitCouponClaim, initialState);

  return (
    <div className="cl-landing">
      {/* Hero */}
      <section className="cl-hero">
        <div className="cl-hero-glow" />
        <div className="cl-hero-inner">
          <div className="cl-hero-text">
            <p className="cl-eyebrow">Thank You For Reading</p>
            <h1 className="cl-title">
              Giant Fish &amp; Happiness
            </h1>
            <p className="cl-subtitle">
              Claim Your FREE $20 Celtic Quest Fishing Coupon
            </p>
            <p className="cl-hook">
              Thanks for buying the book! As a thank-you, I&apos;d love to offer you a
              <strong> free $20 coupon</strong> good on any Celtic Quest charter fishing trip
              out of Port Jefferson, Long Island.
            </p>
            <p className="cl-hook">
              Just fill out the form below with your Amazon order info and we&apos;ll
              email you your coupon within 24 hours. Come fishing with us &mdash;
              the water is beautiful out here.
            </p>
            <p className="cl-hook" style={{ marginTop: 8, fontStyle: "italic", color: "#d4c5a0" }}>
              &mdash; Captain Des
            </p>
          </div>
          <div className="cl-cover-wrap">
            <div className="cl-cover-shadow">
              <Image
                src="/book-cover.png"
                alt="Giant Fish and Happiness book cover"
                width={360}
                height={540}
                className="cl-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Form or Success */}
      <section className="cl-form-section" id="claim">
        {state.ok ? (
          <div className="cl-success-card">
            <div className="cl-success-icon">&#10003;</div>
            <h2>You&apos;re All Set!</h2>
            <p>{state.message}</p>
            <p className="cl-success-note">
              Didn&apos;t get the email? Check your spam folder, or contact us
              at captdes@gmail.com.
            </p>
          </div>
        ) : (
          <div className="cl-form-card">
            <h2>Claim Your Coupon</h2>
            <p className="cl-form-desc">
              Enter your info and Amazon order number below. We&apos;ll verify
              your purchase and email you a $20 coupon code.
            </p>
            <form action={action} className="cl-form">
              <div className="cl-field-row">
                <div className="cl-field">
                  <label htmlFor="claim-first">First Name</label>
                  <input id="claim-first" name="first_name" required placeholder="First name" />
                </div>
                <div className="cl-field">
                  <label htmlFor="claim-last">Last Name</label>
                  <input id="claim-last" name="last_name" required placeholder="Last name" />
                </div>
              </div>
              <div className="cl-field">
                <label htmlFor="claim-email">Email Address</label>
                <input id="claim-email" name="email" type="email" required placeholder="you@example.com" />
              </div>
              <div className="cl-field">
                <label htmlFor="claim-order">Amazon Order Number</label>
                <input id="claim-order" name="amazon_order_number" required placeholder="e.g. 113-1234567-8901234" />
                <span className="cl-helper">Found in Your Orders &rarr; Order Details</span>
              </div>
              <div className="cl-field">
                <label htmlFor="claim-screenshot">Upload Screenshot (optional)</label>
                <input id="claim-screenshot" name="screenshot" type="file" accept="image/*" />
                <span className="cl-helper">A photo of your order confirmation helps us process faster.</span>
              </div>
              <button className="cl-submit" type="submit" disabled={pending}>
                {pending ? "Submitting..." : "Claim My Coupon"}
              </button>
              {state.message && !state.ok ? (
                <p className="cl-error">{state.message}</p>
              ) : null}
              <p className="cl-disclaimer">
                Your coupon will be emailed within 24 hours after verification.
                Good on any Celtic Quest trip &mdash; no expiration.
              </p>
            </form>
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="cl-steps-section">
        <h2 className="cl-steps-title">How It Works</h2>
        <div className="cl-steps">
          <div className="cl-step">
            <div className="cl-step-num">1</div>
            <h3>Buy the Book</h3>
            <p>Purchase Giant Fish &amp; Happiness on Amazon for $19.99.</p>
          </div>
          <div className="cl-step">
            <div className="cl-step-num">2</div>
            <h3>Fill Out the Form</h3>
            <p>Enter your name, email, and Amazon order number above.</p>
          </div>
          <div className="cl-step">
            <div className="cl-step-num">3</div>
            <h3>Get Your Coupon</h3>
            <p>We&apos;ll email you a $20 Celtic Quest coupon within 24 hours.</p>
          </div>
          <div className="cl-step">
            <div className="cl-step-num">4</div>
            <h3>Go Fishing!</h3>
            <p>Book any trip at <strong>celticquestfishing.com</strong> and use your coupon at checkout.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="cl-footer">
        <p>Captain Desmond O&apos;Sullivan &middot; Celtic Quest Fishing Fleet &middot; Port Jefferson, Long Island, NY</p>
      </footer>
    </div>
  );
}
