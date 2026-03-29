export const Paths = {
  root: "/",
  archive: "/archive",

  auth: {
    login: "/sign-in",
    signup: "/sign-up",
    validate: "/auth/validate",
    resetPass: "/auth/reset-password",
  },
};

export function pathToUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (typeof window !== "undefined") {
    return `${window.location.origin}${p}`;
  }
  const origin = (import.meta.env.VITE_APP_ORIGIN as string | undefined)?.replace(/\/$/, "") ?? "";
  return `${origin}${p}`;
}

export const PublicPaths = [
  Paths.root,
  Paths.auth.login,
  Paths.auth.signup,
  Paths.auth.validate,
  Paths.auth.resetPass,
];

/** Normalizes pathname for comparisons (trailing slash, except root). */
export function normalizePathname(pathname: string): string {
  if (pathname !== "/" && pathname.endsWith("/")) {
    return pathname.slice(0, -1) || "/";
  }
  return pathname;
}

/**
 * Same rules as Next.js middleware: public list, dev bundles, static images.
 * Client-side guard for SPA (no server middleware in Vite).
 */
export function isPublicPath(pathname: string): boolean {
  const pathName = normalizePathname(pathname);
  if (PublicPaths.includes(pathName)) return true;
  if (pathName.includes("_next")) return true;
  if (pathName.includes("/images")) return true;
  return false;
}
