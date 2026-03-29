import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "../../assets/icons";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export default function AuthShell({ title, subtitle, children, footer }: AuthShellProps): JSX.Element {
  return (
    <div className="authPage">
      <div className="authPageInner">
        <div className="authColumn">
          <Link className="authBackToCanvas" to="/">
            <span className="authBackToCanvasIcon" aria-hidden>
              <ChevronLeft />
            </span>
            Back to canvas
          </Link>

          <div className="authCard">
            <h1 className="authTitle">{title}</h1>
            <p className="authSubtitle">{subtitle}</p>
            {children}
            <div className="authFooter">{footer}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
