/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_SERVER_URL: string;
  readonly VITE_APP_API_URL: string;
  readonly VITE_APP_ORIGIN?: string;
  /** `"false"` disables Socket.IO (no realtime connection). */
  readonly VITE_APP_SOCKET_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'uuid' {
  export function v4(): string;
}

declare module 'socket.io-msgpack-parser';
