import { FormEvent } from "react";
import { Link } from "react-router-dom";
import AuthShell from "../components/auth/AuthShell";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";

export default function SignUp(): JSX.Element {
  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
  };

  return (
    <AuthShell
      title="Create account"
      subtitle="Start in seconds — Google or email. Hook up your API when you are ready."
      footer={
        <p className="authFooterText">
          Already have an account?{" "}
          <Link className="authInlineLink" to="/sign-in">
            Sign in
          </Link>
        </p>
      }
    >
      <GoogleAuthButton label="Sign up with Google" />

      <div className="authDivider">
        <span>or sign up with email</span>
      </div>

      <form className="authForm" onSubmit={handleSubmit} noValidate>
        <div className="authField">
          <label className="authLabel" htmlFor="signup-name">
            Display name
          </label>
          <input
            id="signup-name"
            className="authInput"
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Alex Chen"
          />
        </div>
        <div className="authField">
          <label className="authLabel" htmlFor="signup-email">
            Email
          </label>
          <input
            id="signup-email"
            className="authInput"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@company.com"
          />
        </div>
        <div className="authField">
          <label className="authLabel" htmlFor="signup-password">
            Password
          </label>
          <input
            id="signup-password"
            className="authInput"
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
          />
        </div>
        <div className="authField">
          <label className="authLabel" htmlFor="signup-password-confirm">
            Confirm password
          </label>
          <input
            id="signup-password-confirm"
            className="authInput"
            type="password"
            name="passwordConfirm"
            autoComplete="new-password"
            placeholder="••••••••"
          />
        </div>
        <button type="submit" className="authBtnPrimary">
          Create account
        </button>
      </form>
    </AuthShell>
  );
}
