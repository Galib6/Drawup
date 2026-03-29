import { isPublicPath, Paths } from "@base/constants/paths";
import { getAuthSession } from "@components/auth/lib/utils";
import { Navigate, Outlet, useLocation } from "react-router-dom";

/**
 * SPA equivalent of Next.js middleware: non-public routes require a valid session cookie.
 */
export default function AuthGate(): JSX.Element {
  const location = useLocation();
  const pathname = location.pathname;

  if (isPublicPath(pathname)) {
    return <Outlet />;
  }

  const session = getAuthSession();
  if (session.isAuthenticate) {
    return <Outlet />;
  }

  const callbackUrl = encodeURIComponent(window.location.href);
  return <Navigate to={`${Paths.auth.login}?callbackUrl=${callbackUrl}`} replace />;
}
