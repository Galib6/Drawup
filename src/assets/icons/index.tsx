const demention = 15;

export const Pencil = (): JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height={demention}
    fill="currentcolor"
    viewBox="0 0 32 32"
  >
    <path
      id="SVGRepo_iconCarrier"
      d="M30.133 1.552C29.043.508 27.842-.021 26.559-.021c-2.006 0-3.47 1.296-3.87 1.693C22.125 2.23 2.903 21.46 2.903 21.46a1.03 1.03 0 0 0-.264.456c-.433 1.602-2.605 8.71-2.627 8.782a1.03 1.03 0 0 0 .256 1.029 1.01 1.01 0 0 0 1.023.246c.073-.024 7.41-2.395 8.618-2.756a1 1 0 0 0 .423-.251c.763-.754 18.691-18.483 19.881-19.712 1.231-1.268 1.843-2.59 1.819-3.925-.025-1.319-.664-2.589-1.901-3.776zM22.37 4.87c.509.123 1.711.527 2.938 1.765 1.24 1.251 1.575 2.681 1.638 3.007a11361 11361 0 0 1-16.551 16.396 8.2 8.2 0 0 0-1.719-2.555 8.9 8.9 0 0 0-2.932-1.984C9.275 17.967 18.497 8.742 22.369 4.871zM4.387 23.186c.55.146 1.691.57 2.854 1.742a6.24 6.24 0 0 1 1.509 2.508c-1.39.447-4.434 1.497-6.367 2.121.573-1.886 1.541-4.822 2.004-6.371M28.763 7.824l-.19.192a8.3 8.3 0 0 0-1.831-2.828 8.9 8.9 0 0 0-2.773-1.917l.141-.14c.114-.113 1.153-1.106 2.447-1.106.745 0 1.477.34 2.175 1.01.828.795 1.256 1.579 1.27 2.331.014.768-.404 1.595-1.24 2.458z"
    ></path>
  </svg>
);

export const Text = (): JSX.Element => (
  <svg
    height={demention}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20 4H4a1 1 0 0 0-1 1v3a1 1 0 0 0 2 0V6h6v13H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2V6h6v2a1 1 0 0 0 2 0V5a1 1 0 0 0-1-1Z" />
  </svg>
);

export const Eraser = (): JSX.Element => (
  <svg
    height={demention}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="m8.586 8.86-4.95 4.95 5.194 5.194H10v-.002h1.172l3.778-3.778L8.586 8.86ZM10 7.446l6.364 6.364 2.828-2.829-6.364-6.364L10 7.447Zm4 11.556h7v2h-9l-3.998.002-6.487-6.487a1 1 0 0 1 0-1.414L12.12 2.496a1 1 0 0 1 1.415 0l7.778 7.778a1 1 0 0 1 0 1.414L14 19.002Z" />
  </svg>
);

export const Circle = (): JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    height={demention}
    fill="currentcolor"
  >
    <path d="M464 256a208 208 0 10-416 0 208 208 0 10416 0zM0 256a256 256 0 11512 0 256 256 0 11-512 0z"></path>
  </svg>
);

export const Rectangle = (): JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 448 512"
    height={demention}
    fill="currentcolor"
  >
    <path d="M384 80c8.8 0 16 7.2 16 16v320c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V96c0-8.8 7.2-16 16-16h320zM64 32C28.7 32 0 60.7 0 96v320c0 35.3 28.7 64 64 64h320c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64z"></path>
  </svg>
);

export const Line = (): JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 290.658 290.658"
    fill="currentcolor"
    stroke="currentcolor"
    strokeWidth="21"
    height={demention}
  >
    <path d="M0 139.474H290.658V151.185H0z"></path>
  </svg>
);

export const Arrow = (): JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    fill="none"
    stroke="currentcolor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeMiterlimit="10"
    strokeWidth="2"
    version="1.1"
    viewBox="0 0 32 32"
    xmlSpace="preserve"
  >
    <path d="M21 10l6 6-6 6m6-6H5" className="st0"></path>
  </svg>
);

export const Selection = (): JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 320 512"
    fill="currentcolor"
    height={demention}
  >
    <path d="M0 55.2V426c0 12.2 9.9 22 22 22 6.3 0 12.4-2.7 16.6-7.5l82.6-94.5 58.1 116.3c7.9 15.8 27.1 22.2 42.9 14.3s22.2-27.1 14.3-42.9L179.8 320h118.1c12.2 0 22.1-9.9 22.1-22.1 0-6.3-2.7-12.3-7.4-16.5L38.6 37.9c-4.3-3.8-9.7-5.9-15.4-5.9C10.4 32 0 42.4 0 55.2z"></path>
  </svg>
);

export const Diamond = (): JSX.Element => (
  <svg
    fill="none"
    height={demention}
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M10.5 20.4l-6.9-6.9c-.781-.781-.781-2.219 0-3l6.9-6.9c.781-.781 2.219-.781 3 0l6.9 6.9c.781.781.781 2.219 0 3l-6.9 6.9c-.781.781-2.219.781-3 0z"></path>
  </svg>
);

export const Hand = (): JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height={demention}
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="5"
    viewBox="-14.55 -14.55 514.1 514.1"
  >
    <path d="M382.5 69.429c-7.441 0-14.5 1.646-20.852 4.573-4.309-23.218-24.7-40.859-49.148-40.859a49.685 49.685 0 00-21.467 4.852C285.641 16.205 265.932 0 242.5 0c-23.432 0-43.141 16.206-48.533 37.995a49.696 49.696 0 00-21.467-4.852c-27.57 0-50 22.43-50 50v122.222a49.702 49.702 0 00-20-4.187c-27.57 0-50 22.43-50 50V354c0 72.233 58.766 131 131 131h118c72.233 0 131-58.767 131-131V119.429c0-27.571-22.43-50-50-50zM402.5 354c0 55.691-45.309 101-101 101h-118c-55.691 0-101-45.309-101-101V251.178c0-11.028 8.972-20 20-20s20 8.972 20 20v80h30V83.143c0-11.028 8.972-20 20-20s20 8.972 20 20v158.035h30V50c0-11.028 8.972-20 20-20s20 8.972 20 20v191.178h30V83.143c0-11.028 8.972-20 20-20s20 8.972 20 20v158.035h30v-121.75c0-11.028 8.972-20 20-20s20 8.972 20 20V354z"></path>
  </svg>
);

export const Lock = (): JSX.Element => (
  <svg
    height={demention}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <rect width={18} height={11} x={3} y={11} rx={2} ry={2} />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const SolidLine = (): JSX.Element => (
  <svg
    height={demention}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeWidth={2.5}
  >
    <line x1="3" y1="12" x2="21" y2="12" />
  </svg>
);

export const DashedLine = (): JSX.Element => (
  <svg
    height={demention}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeWidth={2}
  >
    <line x1="3" y1="12" x2="7" y2="12" />
    <line x1="10" y1="12" x2="14" y2="12" />
    <line x1="17" y1="12" x2="21" y2="12" />
  </svg>
);

export const DottedLine = (): JSX.Element => (
  <svg height={demention} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="1.35" />
    <circle cx="10" cy="12" r="1.35" />
    <circle cx="15" cy="12" r="1.35" />
    <circle cx="20" cy="12" r="1.35" />
  </svg>
);

export const Duplicate = (): JSX.Element => (
  <svg
    height={demention}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
  >
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <rect x="4" y="4" width="11" height="11" rx="2" />
  </svg>
);

export const Delete = (): JSX.Element => (
  <svg
    height={demention}
    viewBox="0 0 24 24"
    stroke="currentColor"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
  >
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

export const Backward = (): JSX.Element => (
  <svg
    height={demention}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
  >
    <path d="M12 5v14M8 13l4 4 4-4" />
  </svg>
);

export const Forward = (): JSX.Element => (
  <svg
    height={demention}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
  >
    <path d="M12 19V5M8 11l4-4 4 4" />
  </svg>
);

export const ToBack = (): JSX.Element => (
  <svg
    height={demention}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
  >
    <path d="M4 20h16" />
    <path d="M12 4v10M8 10l4 4 4-4" />
  </svg>
);

export const ToFront = (): JSX.Element => (
  <svg
    height={demention}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
  >
    <path d="M4 4h16" />
    <path d="M12 20V10M8 14l4-4 4 4" />
  </svg>
);

export const Link = (): JSX.Element => (
  <svg
    height={demention}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
  >
    <g transform="rotate(-38 12 12)">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </g>
  </svg>
);

export const Undo = (): JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height={demention}
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L3.71 8.71C3.08 8.08 2 8.52 2 9.41V15c0 .55.45 1 1 1h5.59c.89 0 1.34-1.08.71-1.71l-1.91-1.91c1.39-1.16 3.16-1.88 5.12-1.88 3.16 0 5.89 1.84 7.19 4.5.27.56.91.84 1.5.64.71-.23 1.07-1.04.75-1.72C20.23 10.42 16.65 8 12.5 8z"></path>
  </svg>
);

export const Redo = (): JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height={demention}
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.16 0-7.74 2.42-9.44 5.93-.32.67.04 1.47.75 1.71.59.2 1.23-.08 1.5-.64 1.3-2.66 4.03-4.5 7.19-4.5 1.95 0 3.73.72 5.12 1.88l-1.91 1.91c-.63.63-.19 1.71.7 1.71H21c.55 0 1-.45 1-1V9.41c0-.89-1.08-1.34-1.71-.71l-1.89 1.9z"></path>
  </svg>
);

export const MenuIcon = (): JSX.Element => (
  <svg
    height="21"
    width="21"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path d="M3 12h18" />
    <path d="M3 6h18" />
    <path d="M3 18h18" />
  </svg>
);

/** Nav / back control; sized to pair with ~14px UI labels. */
export const ChevronLeft = (): JSX.Element => (
  <svg
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    viewBox="0 0 24 24"
    aria-hidden
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
);

export const Xmark = (): JSX.Element => (
  <svg
    width={21}
    height={21}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export const Folder = (): JSX.Element => (
  <svg
    height={demention}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

export const ArchiveBox = (): JSX.Element => (
  <svg
    height={demention}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <rect width="20" height="5" x="2" y="3" rx="1" />
    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
    <path d="M10 12h4" />
  </svg>
);

export const UserCircle = (): JSX.Element => (
  <svg
    height={demention}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" />
  </svg>
);

export const Download = (): JSX.Element => (
  <svg
    height={demention}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="m7 10 5 5 5-5" />
    <path d="M12 15V3" />
  </svg>
);

export const Image = (): JSX.Element => (
  <svg
    height={demention}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <rect width={18} height={18} x={3} y={3} rx={2} ry={2} />
    <path d="M8.5 7a1.5 1.5 0 1 0 0 3 1.5 1.5 0 1 0 0-3z" />
    <path d="m21 15-5-5L5 21" />
  </svg>
);

export const Github = (): JSX.Element => (
  <svg
    height={demention}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path d="M16.25 22.5v-3.865a3.361 3.361 0 0 0-.94-2.607c3.14-.35 6.44-1.538 6.44-6.99a5.43 5.43 0 0 0-1.5-3.746 5.058 5.058 0 0 0-.09-3.765s-1.18-.35-3.91 1.478a13.397 13.397 0 0 0-7 0C6.52 1.177 5.34 1.527 5.34 1.527a5.058 5.058 0 0 0-.09 3.765 5.43 5.43 0 0 0-1.5 3.775c0 5.413 3.3 6.602 6.44 6.991a3.366 3.366 0 0 0-.94 2.577V22.5" />
    <path d="M9.25 19.503c-5 1.498-5-2.496-7-2.996" />
  </svg>
);

export const SharpArrow = (): JSX.Element => (
  <svg
    height={demention}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
  >
    <path d="M5 17L19 7" />
    <path d="M19 7l-5 1" />
    <path d="M19 7l-1 5" />
  </svg>
);

export const CurvedArrow = (): JSX.Element => (
  <svg
    height={demention}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
  >
    <path d="M5 17Q5 5 19 7" />
    <path d="M19 7l-5 1" />
    <path d="M19 7l-1 5" />
  </svg>
);

export const ElbowedArrow = (): JSX.Element => (
  <svg
    height={demention}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
  >
    <path d="M4 7h8Q15 7 15 10v4Q15 17 18 17h2" />
    <path d="M20 17l-3-2.5" />
    <path d="M20 17l-3 2.5" />
  </svg>
);

export const ArrowheadEnd = (): JSX.Element => (
  <svg
    height={demention}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
  >
    <line x1="4" y1="12" x2="16" y2="12" strokeDasharray="2 3" />
    <path d="M16 12l4 0" />
    <path d="M20 12l-4-3" />
    <path d="M20 12l-4 3" />
  </svg>
);

export const ArrowheadBoth = (): JSX.Element => (
  <svg
    height={demention}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
  >
    <line x1="8" y1="12" x2="16" y2="12" />
    <path d="M4 12l4-3" />
    <path d="M4 12l4 3" />
    <path d="M20 12l-4-3" />
    <path d="M20 12l-4 3" />
  </svg>
);
