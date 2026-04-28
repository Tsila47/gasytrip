import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

function extractToken(socket) {
  const fromAuth = socket.handshake?.auth?.token;
  if (fromAuth) return fromAuth;
  const hdr = socket.handshake?.headers?.authorization;
  if (typeof hdr === "string" && hdr.startsWith("Bearer ")) return hdr.slice("Bearer ".length);
  return null;
}

export function initSocket(httpServer, { corsOptions } = {}) {
  io = new Server(httpServer, {
    cors: corsOptions,
  });

  io.use((socket, next) => {
    try {
      const token = extractToken(socket);
      if (!token) return next(new Error("Token manquant"));
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = payload;
      return next();
    } catch {
      return next(new Error("Token invalide"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user?.id;
    if (userId != null) socket.join(`user_${userId}`);

    socket.on("disconnect", () => {});
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.IO non initialisé (initSocket manquant).");
  return io;
}
