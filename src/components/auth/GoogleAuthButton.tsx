import { ENV } from "@/environments";
import GoogleMark from "./GoogleMark";

interface GoogleAuthButtonProps {
  label: string;
  /** When set, submits a GET to the API Google OAuth entry with this redirect target. */
  webRedirectUrl?: string;
}

export default function GoogleAuthButton({ label, webRedirectUrl }: GoogleAuthButtonProps): JSX.Element {
  if (webRedirectUrl && ENV.apiUrl) {
    return (
      <form action={`${ENV.apiUrl}/auth/google`} method="GET" className="authGoogleForm">
        <input type="hidden" name="webRedirectUrl" value={webRedirectUrl} />
        <button type="submit" className="authBtnGoogle">
          <GoogleMark />
          <span>{label}</span>
        </button>
      </form>
    );
  }

  return (
    <button type="button" className="authBtnGoogle" onClick={() => undefined}>
      <GoogleMark />
      <span>{label}</span>
    </button>
  );
}
