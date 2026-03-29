/** Centered loading indicator for auth and async gates. */
export default function Spinner(): JSX.Element {
  return (
    <div className="authSpinner" role="status" aria-label="Loading">
      <span className="authSpinnerRing" />
    </div>
  );
}
