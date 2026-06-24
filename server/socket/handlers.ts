import type { Server, Socket } from "socket.io";
import {
  getConversationRoomId,
} from "@/server/services/conversation.service";
import {
  createMessage,
  markMessagesAsRead,
} from "@/server/services/message.service";
import {
  conversationJoinSchema,
  sendMessageSchema,
  typingSchema,
} from "@/server/validators/message.schema";
import { SOCKET_EVENTS } from "@/types/socket";
import type { SocketUser } from "@/server/socket/auth";

const userSocketMap = new Map<string, string>();

function registerUserSocket(userId: string, socketId: string, io: Server) {
  const existingSocketId = userSocketMap.get(userId);

  if (existingSocketId && existingSocketId !== socketId) {
    io.sockets.sockets.get(existingSocketId)?.disconnect(true);
  }

  userSocketMap.set(userId, socketId);
}

function unregisterUserSocket(userId: string, socketId: string) {
  if (userSocketMap.get(userId) === socketId) {
    userSocketMap.delete(userId);
  }
}

export function registerSocketHandlers(io: Server, socket: Socket, user: SocketUser) {
  registerUserSocket(user.userId, socket.id, io);

  socket.on(SOCKET_EVENTS.CONVERSATION_JOIN, async (payload, ack) => {
    try {
      const parsed = conversationJoinSchema.safeParse(payload);

      if (!parsed.success) {
        ack?.({ success: false, error: "Invalid conversation" });
        return;
      }

      const { conversationId } = parsed.data;
      const room = getConversationRoomId(conversationId);

      socket.join(room);

      const readMessages = await markMessagesAsRead(
        conversationId,
        user.userId,
      );

      for (const message of readMessages) {
        io.to(room).emit(SOCKET_EVENTS.MESSAGE_RECEIVE, message);
      }

      ack?.({ success: true });
    } catch (error) {
      console.error("[socket] conversation:join error:", error);
      ack?.({ success: false, error: "Failed to join conversation" });
    }
  });

  socket.on(SOCKET_EVENTS.MESSAGE_SEND, async (payload, ack) => {
    try {
      const parsed = sendMessageSchema.safeParse(payload);

      if (!parsed.success) {
        ack?.({
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid message",
        });
        return;
      }

      const message = await createMessage(user.userId, parsed.data);
      const room = getConversationRoomId(parsed.data.conversationId);

      io.to(room).emit(SOCKET_EVENTS.MESSAGE_RECEIVE, message);
      ack?.({ success: true, data: message });
    } catch (error) {
      console.error("[socket] message:send error:", error);
      ack?.({ success: false, error: "Failed to send message" });
    }
  });

  socket.on(SOCKET_EVENTS.TYPING_START, (payload) => {
    const parsed = typingSchema.safeParse(payload);
    if (!parsed.success) return;

    socket
      .to(getConversationRoomId(parsed.data.conversationId))
      .emit(SOCKET_EVENTS.TYPING_START, {
        conversationId: parsed.data.conversationId,
        userId: user.userId,
        userName: user.name,
      });
  });

  socket.on(SOCKET_EVENTS.TYPING_STOP, (payload) => {
    const parsed = typingSchema.safeParse(payload);
    if (!parsed.success) return;

    socket
      .to(getConversationRoomId(parsed.data.conversationId))
      .emit(SOCKET_EVENTS.TYPING_STOP, {
        conversationId: parsed.data.conversationId,
        userId: user.userId,
        userName: user.name,
      });
  });

  socket.on("disconnect", () => {
    unregisterUserSocket(user.userId, socket.id);
  });
}
