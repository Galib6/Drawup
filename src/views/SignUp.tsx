import { Paths, pathToUrl } from "@base/constants/paths";
import { useSignup } from "@components/auth/lib/hooks";
import { setAuthSession } from "@components/auth/lib/utils";
import { type ChangeEvent, type FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { appToast } from "@/lib/appToast";
import AuthShell from "../components/auth/AuthShell";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";

export default function SignUp(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? undefined;
  const webRedirectUrl = `${pathToUrl(Paths.auth.validate)}?callbackUrl=${encodeURIComponent(callbackUrl ?? pathToUrl(Paths.root))}`;

  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const signUpFn = useSignup({
    config: {
      onSuccess(data) {
        if (!data?.success) return;
        setAuthSession(data.data);
        void appToast
          .promise(new Promise<void>((resolve) => setTimeout(resolve, 1000)), {
            pending: "Signing in...",
            success: "Sign up successful!",
            error: "Sign up failed!",
          })
          .then(() => {
            if (callbackUrl) {
              window.location.replace(callbackUrl);
              return;
            }
            void navigate("/", { replace: true });
          });
      },
    },
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    signUpFn.mutate(formValues);
  };

  return (
    <AuthShell
      title="Create account"
      subtitle="Google or email — same flow as sign-in."
      footer={
        <p className="authFooterText">
          Already have an account?{" "}
          <Link className="authInlineLink" to={Paths.auth.login}>
            Sign in
          </Link>
        </p>
      }
    >
      <GoogleAuthButton label="Sign up with Google" webRedirectUrl={webRedirectUrl} />

      <div className="authDivider">
        <span>or with email</span>
      </div>

      <form className="authForm" onSubmit={handleSubmit} noValidate>
        <div className="authField">
          <label className="authLabel" htmlFor="signup-firstName">
            First name
          </label>
          <input
            id="signup-firstName"
            className="authInput"
            type="text"
            name="firstName"
            autoComplete="given-name"
            placeholder="Jane"
            value={formValues.firstName}
            onChange={handleChange}
          />
        </div>
        <div className="authField">
          <label className="authLabel" htmlFor="signup-lastName">
            Last name
          </label>
          <input
            id="signup-lastName"
            className="authInput"
            type="text"
            name="lastName"
            autoComplete="family-name"
            placeholder="Doe"
            value={formValues.lastName}
            onChange={handleChange}
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
            value={formValues.email}
            onChange={handleChange}
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
            value={formValues.password}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="authBtnPrimary" disabled={signUpFn.isPending}>
          Sign up
        </button>
      </form>
    </AuthShell>
  );
}
