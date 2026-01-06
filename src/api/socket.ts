import { io, Socket } from "socket.io-client";
import parser from "socket.io-msgpack-parser";

const BACKEND_URL = import.meta.env.VITE_APP_SERVER_URL;

export const socket: Socket = io(BACKEND_URL, {
  parser,
});
