import { Paths } from "@base/constants/paths";
import { useAuthSession } from "@components/auth/lib/utils";
import { Link } from "react-router-dom";

/** Shown only when not signed in — nudges toward auth + archive. Hidden once logged in. */
export default function ArchiveSignInHint(): JSX.Element | null {
  const { isLoading, isAuthenticate } = useAuthSession();

  if (isLoading || isAuthenticate) {
    return null;
  }

  return (
    <div className="canvasTopHintBar" role="status">
      <p className="canvasTopHintText">
        Please{" "}
        <Link to={Paths.auth.login} className="canvasTopHintKbd">
          Sign in
        </Link>{" "}
        for{" "}
        <Link to={Paths.archive} className="canvasTopHintKbd">
          Archive
        </Link>{" "}
        — design on the canvas and store your work for the future.
      </p>
    </div>
  );
}
