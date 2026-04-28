import { io } from "socket.io-client";

let socket;

function getSocketUrl() {
  // API: VITE_API_URL peut être "https://..."; les routes REST utilisent /api
  return import.meta.env.VITE_API_URL || "http://localhost:4000";
}

export function connectSocket(token) {
  if (!token) return null;

  if (socket?.connected) return socket;

  if (socket) {
    try { socket.disconnect(); } catch { /* noop */ }
    socket = undefined;
  }

  socket = io(getSocketUrl(), {
    auth: { token },
    transports: ["websocket"],
    withCredentials: true,
  });

  return socket;
}

export function disconnectSocket() {
  if (!socket) return;
  try {
    socket.disconnect();
  } finally {
    socket = undefined;
  }
}

export function getSocket() {
  return socket;
}

