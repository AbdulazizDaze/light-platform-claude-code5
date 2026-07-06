/**
 * POST /api/chat — the candidate CV-building conversation (PRD §6.1 steps
 * 3-8, §9.4; CLAUDE.md §3.4/§3.5/§3.6/§3.9; `.claude/skills/nextjs-api-route`).
 *
 * Canonical shape: verify token -> rate limit -> validate body (Zod) ->
 * load server-side profile -> load/create session -> delegate to
 * `lib/ai/conversation.ts` + `lib/chat/session.ts` -> typed JSON response.
 *
 * Client contract (app/chat/page.tsx): `{ message: string }` ("" requests the
 * initial greeting). 200 -> `{ reply, quick_replies, cv_generated, cv_data,
 * session_status }`. Errors via lib/api/errors.ts codes, bilingual messages.
 *
 * Identity: name/gender come from `users/{uid}` (requireUserProfile), never
 * from the request body or AI output — `runConversationTurn`'s user-context
 * is built exclusively from that server-side profile.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import {
  requireAuth,
  requireRateLimit,
  requireUserProfile,
  toApiErrorResponse,
  RouteError,
} from "@/lib/api/route-helpers";
import { apiError } from "@/lib/api/errors";
import { runConversationTurn } from "@/lib/ai/conversation";
import { loadOrCreateSession, persistTurn } from "@/lib/chat/session";

const BodySchema = z
  .object({
    message: z.string().max(4000),
  })
  .strict();

export async function POST(request: NextRequest) {
  try {
    const { uid } = await requireAuth(request);
    requireRateLimit(uid, "chat");

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return apiError("invalid_body", {
        en: "Request body must be valid JSON.",
        ar: "يجب أن يكون محتوى الطلب بصيغة JSON صحيحة.",
      });
    }

    const parsed = BodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return apiError("invalid_body", {
        en: "The message field is missing or invalid.",
        ar: "حقل الرسالة مفقود أو غير صحيح.",
      });
    }

    // Identity (name/gender) is read from the server-side profile, never the body.
    const profile = await requireUserProfile(uid);

    const db = adminDb();
    const { session } = await loadOrCreateSession(db, uid);

    if (session.status === "completed") {
      // The conversation already produced a CV; this session is done. The
      // client should not be sending further turns, but respond gracefully
      // rather than erroring so a stray retry doesn't surface as a failure.
      return NextResponse.json({
        reply: "",
        quick_replies: [],
        cv_generated: Boolean(session.cv_data),
        cv_data: session.cv_data ?? null,
        session_status: "completed",
      });
    }

    const isGreetingRequest = parsed.data.message.length === 0;
    const turnCount = session.messages.length + (isGreetingRequest ? 0 : 1);

    const turn = await runConversationTurn({
      userContext: {
        name: profile.name,
        gender: profile.gender,
        sessionType: session.type,
        turnCount,
      },
      currentState: session.cv_state ?? null,
      priorMessages: session.messages,
      newUserMessage: isGreetingRequest ? null : parsed.data.message,
    });

    const persisted = await persistTurn(db, {
      uid,
      priorMessages: session.messages,
      userMessageContent: isGreetingRequest ? null : parsed.data.message,
      assistantReply: turn.reply,
      assistantQuickReplies: turn.quickReplies,
      cvState: turn.state,
      cvGenerated: turn.cvGenerated,
      cvData: turn.cvData,
      sessionType: session.type,
    });

    return NextResponse.json({
      reply: turn.reply,
      quick_replies: turn.quickReplies,
      cv_generated: turn.cvGenerated,
      cv_data: turn.cvData,
      session_status: persisted.status,
    });
  } catch (error) {
    if (error instanceof RouteError) {
      return toApiErrorResponse(error);
    }
    return apiError("internal", {
      en: "Something went wrong. Please try again.",
      ar: "حدث خطأ ما. الرجاء المحاولة مرة أخرى.",
    });
  }
}
