export const ENV = {
  apiUrl: (import.meta.env.VITE_APP_API_URL as string | undefined) ?? "",
  /** Set `VITE_APP_SOCKET_ENABLED=false` in `.env` to skip connecting (collab sync off). */
  socketEnabled: import.meta.env.VITE_APP_SOCKET_ENABLED !== "false",
} as const;
