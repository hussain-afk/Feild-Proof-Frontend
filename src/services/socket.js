import { io } from "socket.io-client";

// Backend URL 4000
const SOCKET_URL = "https://feild-proof-backend.vercel.app";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ["polling", "websocket"], 
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});