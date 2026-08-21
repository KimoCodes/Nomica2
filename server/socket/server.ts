import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { authenticateSocket } from "@/server/socket/auth";
import { registerSocketHandlers } from "@/server/socket/handlers";

let io: Server | null = null;

export function initializeSocketServer(httpServer: HttpServer) {
  io = new Server(httpServer, {
    path: "/api/socket/io",
    cors: {
      origin: process.env.AUTH_URL,
      credentials: true,
    },
    addTrailingSlash: false,
  });

  io.use(async (socket, next) => {
    try {
      const user = await authenticateSocket(socket);
      socket.data.user = user;
      next();
    } catch {
      next(new Error("UNAUTHORIZED"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;
    registerSocketHandlers(io!, socket, user);
  });

  return io;
}

export function getSocketServer() {
  return io;
}
