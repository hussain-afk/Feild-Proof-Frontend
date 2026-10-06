import { io } from "socket.io-client";
import { API_URL } from "../api/config.js";

const SOCKET_URL = API_URL;

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ["polling", "websocket"], 
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});