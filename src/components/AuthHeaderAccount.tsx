import { Paths } from "@base/constants/paths";
import { clearAuthSession, useAuthSession } from "@components/auth/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

function avatarInitials(user: { name?: string; email: string }): string {
  const name = user.name?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  const local = user.email.split("@")[0] ?? "";
  if (local.length >= 2) return local.slice(0, 2).toUpperCase();
  return (user.email[0] ?? "?").toUpperCase();
}

export default function AuthHeaderAccount(): JSX.Element {
  const session = useAuthSession();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent): void => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (session.isLoading) {
    return <div className="authHeaderAvatarPlaceholder" aria-hidden />;
  }

  if (!session.isAuthenticate || !session.user) {
    return (
      <Link className="authHeaderSignIn" to={Paths.auth.login}>
        Sign in
      </Link>
    );
  }

  const label = session.user.name?.trim() || session.user.email;
  const initials = avatarInitials(session.user);

  const handleSignOut = (): void => {
    setOpen(false);
    clearAuthSession();
    window.location.reload();
  };

  return (
    <div className="authHeaderAccount" ref={wrapRef}>
      <button
        type="button"
        className="authHeaderAvatar"
        aria-expanded={open}
        aria-haspopup="menu"
        title={label}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="authHeaderAvatarText">{initials}</span>
      </button>
      {open ? (
        <div className="authHeaderDropdown" role="menu">
          <button type="button" className="authHeaderDropdownItem" role="menuitem" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
