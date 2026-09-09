import type { Server as HttpServer } from "http";
import { Server, type Socket } from "socket.io";
import { authenticateSocket } from "@/server/socket/auth";
import { registerSocketHandlers } from "@/server/socket/handlers";
import { initializeLiveCoaching } from "@/server/services/live-coaching.service";
import logger from "@/lib/logger";

let io: Server | null = null;

export function initializeSocketServer(httpServer: HttpServer) {
  io = new Server(httpServer, {
    path: "/api/socket/io",
    cors: {
      origin: process.env.AUTH_URL,
      credentials: true,
    },
    addTrailingSlash: false,
    connectTimeout: 5000,
  });

  io.use(async (socket: Socket, next) => {
    try {
      const user = await authenticateSocket(socket);
      socket.data.user = user;
      logger.debug({ userId: user.userId, socketId: socket.id }, "Socket auth success");
      next();
    } catch (err) {
      logger.warn({ err, socketId: socket.id }, "Socket auth failed");
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;
    if (!user) {
      logger.warn({ socketId: socket.id }, "Connection without user, disconnecting");
      socket.disconnect(true);
      return;
    }
    registerSocketHandlers(io!, socket, user);
  });

  initializeLiveCoaching(io);

  return io;
}

export function getSocketServer() {
  return io;
}
