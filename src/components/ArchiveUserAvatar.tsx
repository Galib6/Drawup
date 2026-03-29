import { UserCircle } from "../assets/icons";

/** Placeholder until real auth; shows after New folder on the Archive bar. */
export default function ArchiveUserAvatar(): JSX.Element {
  return (
    <button className="archiveUserAvatar" type="button" title="Account (sign-in coming soon)">
      <span className="archiveUserAvatarIcon" aria-hidden>
        <UserCircle />
      </span>
    </button>
  );
}
