import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Sign in — Giant Fish Command Center",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; reset?: string }>;
}) {
  const params = await searchParams;
  const next = params.next || "/dashboard";
  const resetOk = params.reset === "ok";

  // If already signed in as admin, skip the form.
  const user = await getSessionUser();
  if (user?.role === "admin") {
    const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
    // @ts-expect-error - typedRoutes doesn't know about dynamic strings
    redirect(safeNext);
  }

  return (
    <div className="main">
      <div className="page-header">
        <h2>Sign in</h2>
        <p>Admin access only. Public forms at /claim, /submit-review, /join-launch-team, /proof-of-purchase are always open.</p>
      </div>

      {resetOk && (
        <div
          className="card"
          style={{
            maxWidth: 420,
            marginBottom: 16,
            borderLeft: "3px solid #16a34a",
            background: "#f0fdf4",
          }}
        >
          <p style={{ margin: 0, fontSize: 14 }}>
            Your password was updated. Sign in with the new one.
          </p>
        </div>
      )}

      <div className="card" style={{ maxWidth: 420 }}>
        <LoginForm next={next} />
      </div>
    </div>
  );
}
