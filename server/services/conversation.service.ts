import { prisma } from "@/lib/prisma";

export async function ensureConversation(clientUserId: string, coachUserId: string) {
  return prisma.conversation.upsert({
    where: {
      clientId_coachId: {
        clientId: clientUserId,
        coachId: coachUserId,
      },
    },
    create: {
      clientId: clientUserId,
      coachId: coachUserId,
    },
    update: {},
  });
}

export async function getConversationForUser(
  conversationId: string,
  userId: string,
) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      client: { select: { id: true, name: true, avatar: true } },
      coach: { select: { id: true, name: true, avatar: true } },
    },
  });

  if (!conversation) {
    return null;
  }

  if (conversation.clientId !== userId && conversation.coachId !== userId) {
    throw new Error("FORBIDDEN");
  }

  return conversation;
}

export async function getConversationsForUser(userId: string) {
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ clientId: userId }, { coachId: userId }],
    },
    include: {
      client: { select: { id: true, name: true, avatar: true } },
      coach: { select: { id: true, name: true, avatar: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          content: true,
          createdAt: true,
          senderId: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  if (conversations.length === 0) return [];

  const unreadCounts = await prisma.message.groupBy({
    by: ["conversationId"],
    where: {
      conversationId: { in: conversations.map((c) => c.id) },
      senderId: { not: userId },
      readAt: null,
    },
    _count: { id: true },
  });

  const unreadMap = new Map(
    unreadCounts.map((r) => [r.conversationId, r._count.id]),
  );

  return conversations.map((conversation) => {
    const otherUser =
      conversation.clientId === userId
        ? conversation.coach
        : conversation.client;

    return {
      id: conversation.id,
      clientId: conversation.clientId,
      coachId: conversation.coachId,
      updatedAt: conversation.updatedAt.toISOString(),
      otherUser,
      lastMessage: conversation.messages[0]
        ? {
            content: conversation.messages[0].content,
            createdAt: conversation.messages[0].createdAt.toISOString(),
            senderId: conversation.messages[0].senderId,
          }
        : null,
      unreadCount: unreadMap.get(conversation.id) ?? 0,
    };
  });
}

export function getConversationRoomId(conversationId: string) {
  return `conversation:${conversationId}`;
}
