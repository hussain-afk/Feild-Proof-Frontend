import { io } from "socket.io-client";

const SOCKET_URL =  "https://feild-proof-backend.onrender.com";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ["polling", "websocket"], 
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});