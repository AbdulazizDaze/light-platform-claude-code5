/**
 * `chat_sessions/{uid}` (docs/data-models.md, PRD §9.7).
 *
 * `cv_data`, when present, is the AI-generated CV JSON and must satisfy the
 * same identity-rejecting `CvSchema` used for storage on the profile.
 */

import { z } from "zod";
import { TimestampSchema } from "./common";
import { CvSchema } from "./cv";

export const ChatRoleSchema = z.enum(["user", "assistant"]);

export const ChatMessageSchema = z.object({
  id: z.string().min(1),
  role: ChatRoleSchema,
  content: z.string().min(1),
  quick_replies: z.array(z.string()).optional(),
  timestamp: TimestampSchema,
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatSessionStatusSchema = z.enum(["active", "completed", "abandoned"]);
export const ChatSessionTypeSchema = z.enum(["new", "returning", "cv_upload"]);

export const ChatSessionSchema = z.object({
  messages: z.array(ChatMessageSchema).default([]),
  status: ChatSessionStatusSchema,
  type: ChatSessionTypeSchema,
  cv_data: CvSchema.optional(),
});
export type ChatSession = z.infer<typeof ChatSessionSchema>;

export function parseChatSession(data: unknown) {
  return ChatSessionSchema.safeParse(data);
}
