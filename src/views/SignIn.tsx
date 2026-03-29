import { useLogin } from "@components/auth/lib/hooks";
import { setAuthSession } from "@components/auth/lib/utils";
import { type ChangeEvent, type FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Paths, pathToUrl } from "@base/constants/paths";
import AuthShell from "../components/auth/AuthShell";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";

export default function SignIn(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? undefined;
  const webRedirectUrl = `${pathToUrl(Paths.auth.validate)}?callbackUrl=${encodeURIComponent(callbackUrl ?? pathToUrl(Paths.root))}`;

  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });

  const loginFn = useLogin({
    config: {
      onSuccess(data) {
        if (!data?.success) return;
        setAuthSession(data.data);
        void toast
          .promise(new Promise<void>((resolve) => setTimeout(resolve, 1000)), {
            pending: "Logging in...",
            success: "Login successful!",
            error: "Login failed!",
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
    loginFn.mutate(formValues);
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="Welcome to our community with all-time access and free"
      footer={
        <p className="authFooterText">
          Don&apos;t have an account?{" "}
          <Link className="authInlineLink" to="/sign-up">
            Sign up
          </Link>
        </p>
      }
    >
      <GoogleAuthButton label="Sign in with Google" webRedirectUrl={webRedirectUrl} />

      <div className="authDivider">
        <span>Or</span>
      </div>

      <form className="authForm" onSubmit={handleSubmit} noValidate>
        <div className="authField">
          <label className="authLabel" htmlFor="signin-email">
            Email
          </label>
          <input
            id="signin-email"
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
          <label className="authLabel" htmlFor="signin-password">
            Password
          </label>
          <input
            id="signin-password"
            className="authInput"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={formValues.password}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="authBtnPrimary" disabled={loginFn.isPending}>
          Sign in
        </button>
      </form>
    </AuthShell>
  );
}
