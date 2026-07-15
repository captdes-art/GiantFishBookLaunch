import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Get a Signed Copy — Giant Fish and Happiness",
  description:
    "Order a personally signed copy of Giant Fish and Happiness by Captain Desmond O'Sullivan. #1 New Release. Signed, packaged, and shipped from Port Jefferson, NY.",
  openGraph: {
    title: "Get a Signed Copy — Giant Fish and Happiness",
    description:
      "A Long Island captain's story of peace, true love, and surrender amidst the gales of life. Signed by Captain Des and shipped to your door.",
    images: ["/book-cover.png"],
  },
};

const CHECKOUT_URL = process.env.NEXT_PUBLIC_SIGNED_COPY_CHECKOUT_URL ?? "";

export default function SignedCopyPage() {
  return (
    <div className="sc-page">
      <section className="sc-hero">
        <div className="sc-hero-inner">
          <div className="sc-cover-wrap">
            <Image
              src="/book-cover.png"
              alt="Giant Fish and Happiness book cover"
              width={460}
              height={620}
              className="sc-cover"
              priority
            />
          </div>

          <div className="sc-hero-copy">
            <p className="sc-badge">#1 New Release · Fishing</p>
            <h1>
              Get a Signed Copy of
              <span> Giant Fish and Happiness</span>
            </h1>
            <p className="sc-sub">
              Finding peace, true love, and surrender amidst the gales of life —
              a memoir from the deck of the Celtic Quest, written by Captain
              Desmond O&apos;Sullivan of Port Jefferson, New York.
            </p>

            <ul className="sc-points">
              <li>Personally signed by Captain Des</li>
              <li>Ships free anywhere in the U.S.</li>
              <li>Packed and mailed from Port Jefferson, NY</li>
              <li>Ships within 3–5 business days</li>
            </ul>

            <div className="sc-price-row">
              <span className="sc-price">$29</span>
              <span className="sc-price-note">signed paperback · free shipping</span>
            </div>

            {CHECKOUT_URL ? (
              <a className="sc-buy" href={CHECKOUT_URL}>
                Order My Signed Copy
              </a>
            ) : (
              <p className="sc-buy-pending">
                Signed copy ordering opens shortly. Check back soon.
              </p>
            )}

            <p className="sc-guarantee">
              Secure checkout · Makes a great gift for the fisherman in your life
            </p>
          </div>
        </div>
      </section>

      <section className="sc-story">
        <h2>The story behind the book</h2>
        <p>
          For more than two decades, Captain Des O&apos;Sullivan has run the
          Celtic Quest Fishing Fleet out of Port Jefferson Harbor. This book is
          the rest of that story — building a family business on the water,
          weathering grief and setbacks, and learning that the biggest catches
          in life rarely have fins.
        </p>
        <p>
          Part fishing story, part love story, part guide to letting go,{" "}
          <em>Giant Fish and Happiness</em> reached #1 in New Releases in the
          Fishing category and made the bestseller list — thanks to readers who
          saw a piece of their own story in it.
        </p>
      </section>

      <section className="sc-quotes">
        <h2>What readers are saying</h2>
        <div className="sc-quote-grid">
          <blockquote>
            <p>
              &ldquo;The fish are fun, but the memories are the real catch.
              This book proves it.&rdquo;
            </p>
          </blockquote>
          <blockquote>
            <p>
              &ldquo;Part memoir, part life lesson — I couldn&apos;t put it
              down.&rdquo;
            </p>
          </blockquote>
          <blockquote>
            <p>
              &ldquo;If you&apos;ve ever felt life steering you through a storm,
              this one is for you.&rdquo;
            </p>
          </blockquote>
        </div>
      </section>

      <section className="sc-final">
        <h2>Bring the water home</h2>
        <p>
          Every copy is signed by hand, packaged with care, and dropped in the
          mail from the harbor town where the whole story began.
        </p>
        {CHECKOUT_URL ? (
          <a className="sc-buy" href={CHECKOUT_URL}>
            Order My Signed Copy — $29
          </a>
        ) : null}
        <p className="sc-alt">
          Prefer Kindle or an unsigned copy?{" "}
          <a
            href="https://www.amazon.com/s?k=giant+fish+and+happiness+o%27sullivan"
            target="_blank"
            rel="noopener noreferrer"
          >
            Find it on Amazon
          </a>
          .
        </p>
      </section>
    </div>
  );
}
