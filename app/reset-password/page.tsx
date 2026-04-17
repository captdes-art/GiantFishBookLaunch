import { getSupabaseServerClient } from "@/lib/supabase";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata = {
  title: "Set a new password — Giant Fish Command Center",
};

// The Supabase recovery link lands here with either:
//   ?code=<pkce>      (newer flow — exchange once for a session)
//   ?token_hash=<t>&type=recovery  (some templates)
// We handle the PKCE flow (the default). If the exchange succeeds,
// the cookie jar has a short-lived recovery session and the form
// below can call auth.updateUser({ password }).
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string; error_description?: string }>;
}) {
  const params = await searchParams;
  const client = await getSupabaseServerClient();

  let exchangeError: string | null = null;
  let hasSession = false;

  if (client) {
    if (params.code) {
      const { error } = await client.auth.exchangeCodeForSession(params.code);
      if (error) {
        exchangeError = error.message;
      }
    }
    const { data } = await client.auth.getUser();
    hasSession = Boolean(data.user);
  }

  const urlError =
    params.error_description || params.error || exchangeError || null;

  return (
    <div className="main">
      <div className="page-header">
        <h2>Set a new password</h2>
        <p>Pick something strong — at least 8 characters.</p>
      </div>

      <div className="card" style={{ maxWidth: 420 }}>
        {urlError && (
          <p style={{ color: "#b91c1c", fontSize: 14, marginBottom: 16 }}>
            {urlError}
          </p>
        )}

        {hasSession ? (
          <ResetPasswordForm />
        ) : (
          <div>
            <p style={{ fontSize: 14 }}>
              This reset link is invalid or has expired. Request a new one:
            </p>
            <p style={{ marginTop: 16 }}>
              <a href="/forgot-password">Send a new reset link</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
