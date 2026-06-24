import { prisma } from "@/lib/prisma";
import {
  getConversationForUser,
} from "@/server/services/conversation.service";
import type { SendMessageInput } from "@/server/validators/message.schema";

function serializeMessage(message: {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  imageUrl: string | null;
  readAt: Date | null;
  createdAt: Date;
  sender: { id: string; name: string; avatar: string | null };
}) {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    content: message.content,
    imageUrl: message.imageUrl,
    readAt: message.readAt?.toISOString() ?? null,
    createdAt: message.createdAt.toISOString(),
    sender: message.sender,
  };
}

export async function getMessages(
  conversationId: string,
  userId: string,
  cursor?: string,
) {
  await getConversationForUser(conversationId, userId);

  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1,
        }
      : {}),
  });

  return messages.reverse().map(serializeMessage);
}

export async function createMessage(
  senderId: string,
  input: SendMessageInput,
) {
  await getConversationForUser(input.conversationId, senderId);

  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.message.create({
      data: {
        conversationId: input.conversationId,
        senderId,
        content: input.content || "",
        imageUrl: input.imageUrl ?? null,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    });

    await tx.conversation.update({
      where: { id: input.conversationId },
      data: { updatedAt: new Date() },
    });

    return created;
  });

  return serializeMessage(message);
}

export async function markMessagesAsRead(
  conversationId: string,
  readerId: string,
) {
  await getConversationForUser(conversationId, readerId);

  const unread = await prisma.message.findMany({
    where: {
      conversationId,
      senderId: { not: readerId },
      readAt: null,
    },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
    },
  });

  if (unread.length === 0) {
    return [];
  }

  const now = new Date();

  await prisma.message.updateMany({
    where: {
      id: { in: unread.map((message) => message.id) },
    },
    data: { readAt: now },
  });

  return unread.map((message) =>
    serializeMessage({ ...message, readAt: now }),
  );
}

export async function getUnreadMessageCount(userId: string) {
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ clientId: userId }, { coachId: userId }],
    },
    select: { id: true },
  });

  if (conversations.length === 0) {
    return 0;
  }

  return prisma.message.count({
    where: {
      conversationId: { in: conversations.map((c) => c.id) },
      senderId: { not: userId },
      readAt: null,
    },
  });
}
