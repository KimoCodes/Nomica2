"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/server/utils/response";
import {
  ensureConversation,
  getConversationsForUser,
} from "@/server/services/conversation.service";
import { getMessages } from "@/server/services/message.service";
import { getMessagesSchema } from "@/server/validators/message.schema";
import type { ApiResponse } from "@/types";
import type { ConversationSummary, MessageItem } from "@/types/socket";
import { getClientProfileByUserId } from "@/server/services/coach.service";

export async function ensureClientConversationServer(): Promise<string | null> {
  const session = await requireAuth();
  const profile = await getClientProfileByUserId(session.user.id);
  if (!profile?.coachId) return null;
  const conversation = await ensureConversation(session.user.id, profile.coachId);
  return conversation.id;
}

export async function getConversationsAction(): Promise<
  ApiResponse<{ conversations: ConversationSummary[] }>
> {
  try {
    const session = await requireAuth();
    const conversations = await getConversationsForUser(session.user.id);
    return createSuccessResponse({ conversations });
  } catch (error) {
    console.error("getConversationsAction error:", error);
    return createErrorResponse("Failed to load conversations", "INTERNAL_ERROR");
  }
}

export async function getMessagesAction(
  conversationId: string,
  cursor?: string,
): Promise<ApiResponse<{ messages: MessageItem[] }>> {
  try {
    const session = await requireAuth();
    const parsed = getMessagesSchema.safeParse({ conversationId, cursor });

    if (!parsed.success) {
      return createErrorResponse("Invalid conversation", "VALIDATION_ERROR");
    }

    const messages = await getMessages(
      parsed.data.conversationId,
      session.user.id,
      parsed.data.cursor,
    );

    return createSuccessResponse({ messages });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return createErrorResponse("Access denied", "FORBIDDEN");
    }
    console.error("getMessagesAction error:", error);
    return createErrorResponse("Failed to load messages", "INTERNAL_ERROR");
  }
}

export async function ensureClientConversationAction(): Promise<
  ApiResponse<{ conversationId: string | null }>
> {
  try {
    const session = await requireAuth();
    const { getClientProfileByUserId } = await import(
      "@/server/services/coach.service"
    );
    const profile = await getClientProfileByUserId(session.user.id);

    if (!profile?.coachId) {
      return createSuccessResponse({ conversationId: null });
    }

    const conversation = await ensureConversation(
      session.user.id,
      profile.coachId,
    );

    revalidatePath("/client/messages");
    return createSuccessResponse({ conversationId: conversation.id });
  } catch (error) {
    console.error("ensureClientConversationAction error:", error);
    return createErrorResponse("Failed to prepare conversation", "INTERNAL_ERROR");
  }
}
