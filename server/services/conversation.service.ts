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

  const results = await Promise.all(
    conversations.map(async (conversation) => {
      const otherUser =
        conversation.clientId === userId
          ? conversation.coach
          : conversation.client;

      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conversation.id,
          senderId: { not: userId },
          readAt: null,
        },
      });

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
        unreadCount,
      };
    }),
  );

  return results;
}

export function getConversationRoomId(conversationId: string) {
  return `conversation:${conversationId}`;
}
