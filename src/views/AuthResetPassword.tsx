import { Paths } from "@base/constants/paths";
import { Link } from "react-router-dom";
import AuthShell from "../components/auth/AuthShell";

/** Placeholder so `/auth/reset-password` stays a real public route (matches PublicPaths). */
export default function AuthResetPassword(): JSX.Element {
  return (
    <AuthShell
      title="Reset password"
      subtitle="Connect your backend reset flow here when ready."
      footer={
        <p className="authFooterText">
          <Link className="authInlineLink" to={Paths.auth.login}>
            Back to sign in
          </Link>
        </p>
      }
    >
      <p className="authSubtitle" style={{ textAlign: "center" }}>
        No reset form is configured in this app yet.
      </p>
    </AuthShell>
  );
}
