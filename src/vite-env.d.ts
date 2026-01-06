/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_SERVER_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'uuid' {
  export function v4(): string;
}

declare module 'socket.io-msgpack-parser';
