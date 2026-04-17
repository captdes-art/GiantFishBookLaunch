import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata = {
  title: "Forgot password — Giant Fish Command Center",
};

export default function ForgotPasswordPage() {
  return (
    <div className="main">
      <div className="page-header">
        <h2>Reset your password</h2>
        <p>Enter the email on your admin account. We&apos;ll send you a one-time link to set a new password.</p>
      </div>

      <div className="card" style={{ maxWidth: 420 }}>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
