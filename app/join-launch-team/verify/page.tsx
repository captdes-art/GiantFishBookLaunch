import { verifyLaunchTeamSignup } from "@/app/actions";

export const metadata = {
  title: "Confirm your email — Giant Fish & Happiness",
};

export default async function VerifyLaunchTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = (params.token || "").trim();

  const result = token
    ? await verifyLaunchTeamSignup(token)
    : { ok: false, message: "Missing verification token." };

  return (
    <div className="page" style={{ maxWidth: 640, margin: "0 auto", paddingTop: 40 }}>
      <section
        className="panel"
        style={{
          padding: "48px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>
          {result.ok ? "\u2713" : "\u26A0"}
        </div>
        <h2 style={{ marginBottom: 16 }}>
          {result.ok ? "Email confirmed!" : "Couldn't confirm your email"}
        </h2>
        <p style={{ fontSize: 18, lineHeight: 1.6 }}>{result.message}</p>
        {!result.ok && (
          <p style={{ marginTop: 24 }}>
            <a href="/join-launch-team">Back to sign up</a>
          </p>
        )}
      </section>
    </div>
  );
}
