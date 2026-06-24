import { z } from "zod";

export const sendMessageSchema = z.object({
  conversationId: z.string().cuid(),
  content: z
    .string()
    .max(5000)
    .trim()
    .optional()
    .default(""),
  imageUrl: z.string().url().optional().nullable(),
}).refine(
  (data) => data.content.length > 0 || data.imageUrl,
  { message: "Message must have text or an image" },
);

export const conversationJoinSchema = z.object({
  conversationId: z.string().cuid(),
});

export const typingSchema = z.object({
  conversationId: z.string().cuid(),
});

export const getMessagesSchema = z.object({
  conversationId: z.string().cuid(),
  cursor: z.string().cuid().optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
