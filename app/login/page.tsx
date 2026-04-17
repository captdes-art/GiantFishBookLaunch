import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Sign in — Giant Fish Command Center",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = params.next || "/dashboard";

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

      <div className="card" style={{ maxWidth: 420 }}>
        <LoginForm next={next} />
      </div>
    </div>
  );
}
