import { Server as SocketIOServer, type Socket } from "socket.io";
import { prisma } from "@/lib/prisma";
import { authenticateSocket } from "@/server/socket/auth";
import logger from "@/lib/logger";

type LiveSession = {
  id: string;
  coachId: string;
  clientId: string;
  status: "waiting" | "active" | "ended";
  startedAt: Date;
  messages: LiveMessage[];
};

type LiveMessage = {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: "text" | "exercise" | "correction" | "encouragement";
  timestamp: Date;
};

const globalForLiveSessions = globalThis as unknown as {
  activeSessions: Map<string, LiveSession> | undefined;
};

const activeSessions = globalForLiveSessions.activeSessions ?? new Map<string, LiveSession>();
globalForLiveSessions.activeSessions = activeSessions;

export function initializeLiveCoaching(io: SocketIOServer) {
  const liveNamespace = io.of("/live-coaching");

  liveNamespace.use(async (socket: Socket, next) => {
    try {
      const user = await authenticateSocket(socket);
      socket.data.user = user;
      socket.data.userId = user.userId;
      next();
    } catch (err) {
      logger.debug({ err, socketId: socket.id }, "Live coaching auth failed");
      next(new Error("Authentication failed"));
    }
  });

  liveNamespace.on("connection", (socket) => {
    const userId = socket.data.userId as string;
    logger.info({ userId, socketId: socket.id }, "Live coaching connected");

    socket.on("join-session", async (sessionId: string) => {
      try {
        const session = activeSessions.get(sessionId);
        if (!session) {
          logger.warn({ sessionId, userId }, "join-session: Session not found");
          socket.emit("error", { message: "Session not found" });
          return;
        }

        if (session.coachId !== userId && session.clientId !== userId) {
          logger.warn({ sessionId, userId, coachId: session.coachId, clientId: session.clientId }, "join-session: Unauthorized");
          socket.emit("error", { message: "Unauthorized" });
          return;
        }

        socket.join(sessionId);
        socket.data.sessionId = sessionId;

        logger.info({ sessionId, userId, status: session.status, coachId: session.coachId, clientId: session.clientId }, "join-session: Success");

        socket.emit("session-joined", {
          session: {
            id: session.id,
            status: session.status,
            startedAt: session.startedAt,
            messages: session.messages,
          },
        });

        if (session.status === "waiting" && session.coachId === userId) {
          session.status = "active";
          logger.info({ sessionId, userId }, "join-session: Session started by coach");
          liveNamespace.to(sessionId).emit("session-started", {
            sessionId: session.id,
          });
        }
      } catch (error) {
        logger.error({ err: error }, "Join session error");
        socket.emit("error", { message: "Failed to join session" });
      }
    });

    socket.on("send-message", async (data: { content: string; type: string }) => {
      try {
        const sessionId = socket.data.sessionId;
        if (!sessionId) return;

        const session = activeSessions.get(sessionId);
        if (!session || session.status !== "active") return;

        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true },
        });

        const message: LiveMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          senderId: userId,
          senderName: user?.name ?? "Unknown",
          content: data.content,
          type: (data.type as LiveMessage["type"]) || "text",
          timestamp: new Date(),
        };

        session.messages.push(message);

        liveNamespace.to(sessionId).emit("new-message", { message });
      } catch (error) {
        logger.error({ err: error }, "Send message error");
      }
    });

    socket.on("send-exercise", (data: { exerciseName: string; sets: number; reps: number; notes: string }) => {
      try {
        const sessionId = socket.data.sessionId;
        if (!sessionId) return;

        const session = activeSessions.get(sessionId);
        if (!session || session.status !== "active") return;

        const exerciseMessage: LiveMessage = {
          id: `ex_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          senderId: userId,
          senderName: "Coach",
          content: JSON.stringify(data),
          type: "exercise",
          timestamp: new Date(),
        };

        session.messages.push(exerciseMessage);
        liveNamespace.to(sessionId).emit("new-message", { message: exerciseMessage });
      } catch (error) {
        logger.error({ err: error }, "Send exercise error");
      }
    });

    socket.on("send-correction", (data: { exerciseName: string; correction: string }) => {
      try {
        const sessionId = socket.data.sessionId;
        if (!sessionId) return;

        const session = activeSessions.get(sessionId);
        if (!session || session.status !== "active") return;

        const correctionMessage: LiveMessage = {
          id: `cr_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          senderId: userId,
          senderName: "Coach",
          content: JSON.stringify(data),
          type: "correction",
          timestamp: new Date(),
        };

        session.messages.push(correctionMessage);
        liveNamespace.to(sessionId).emit("new-message", { message: correctionMessage });
      } catch (error) {
        logger.error({ err: error }, "Send correction error");
      }
    });

    socket.on("end-session", () => {
      try {
        const sessionId = socket.data.sessionId;
        if (!sessionId) return;

        const session = activeSessions.get(sessionId);
        if (!session) return;

        session.status = "ended";
        liveNamespace.to(sessionId).emit("session-ended", { sessionId });
        activeSessions.delete(sessionId);
      } catch (error) {
        logger.error({ err: error }, "End session error");
      }
    });

    socket.on("disconnect", () => {
      logger.info({ userId, socketId: socket.id }, "Live coaching disconnected");
    });
  });
}

export function createLiveSession(
  coachId: string,
  clientId: string,
): LiveSession {
  for (const session of activeSessions.values()) {
    if (
      session.coachId === coachId &&
      session.clientId === clientId &&
      session.status !== "ended"
    ) {
      return session;
    }
  }

  const session: LiveSession = {
    id: `session_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    coachId,
    clientId,
    status: "waiting",
    startedAt: new Date(),
    messages: [],
  };

  activeSessions.set(session.id, session);
  return session;
}

export function getActiveSession(
  userId: string,
): LiveSession | undefined {
  for (const session of activeSessions.values()) {
    if (
      (session.coachId === userId || session.clientId === userId) &&
      session.status !== "ended"
    ) {
      return session;
    }
  }
  return undefined;
}
