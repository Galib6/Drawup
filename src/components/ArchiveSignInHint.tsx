import { Link } from "react-router-dom";

/** Inline reminder below the top chrome; wire auth later — links are real routes today. */
export default function ArchiveSignInHint(): JSX.Element {
  return (
    <div className="canvasTopHintBar" role="status">
      <p className="canvasTopHintText">
        Please{" "}
        <Link to="/sign-in" className="canvasTopHintKbd">
          Sign in
        </Link>{" "}
        for{" "}
        <Link to="/archive" className="canvasTopHintKbd">
          Archive
        </Link>{" "}
        — design on the canvas and store your work for the future.
      </p>
    </div>
  );
}
