import { Suspense } from "react";
import { SubmitReviewForm } from "./SubmitReviewForm";

export const metadata = {
  title: "Submit your review — Giant Fish & Happiness",
};

export default async function SubmitReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = (params.token || "").trim();

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

      {!token ? (
        <section className="panel" style={{ padding: "32px 24px" }}>
          <h3>Use your personal link</h3>
          <p>
            This form only works from the personalized link we emailed you. If you can&apos;t find it,
            reply to the ARC email Des sent you and he&apos;ll send a fresh link.
          </p>
        </section>
      ) : (
        <Suspense>
          <SubmitReviewForm token={token} />
        </Suspense>
      )}
    </div>
  );
}
