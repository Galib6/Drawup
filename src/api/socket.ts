import { ENV } from "@/environments";
import { io, Socket } from "socket.io-client";
import parser from "socket.io-msgpack-parser";

const BACKEND_URL = import.meta.env.VITE_APP_SERVER_URL;

/** No connection; `emit` / `on` are no-ops so callers stay safe. */
function createDisabledSocket(): Socket {
  const noop = (): void => undefined;
  return {
    on: noop,
    off: noop,
    once: noop,
    emit: () => true,
    disconnect: noop,
    removeAllListeners: noop,
    close: noop,
  } as unknown as Socket;
}

export const socket: Socket =
  ENV.socketEnabled && BACKEND_URL ? io(BACKEND_URL, { parser }) : createDisabledSocket();
