/**
 * POST /api/cv-upload — CV upload & AI analysis entry path (PRD §6.1 step 3,
 * §7.1 "PDF CV upload & improvement"; CLAUDE.md §3.4/§3.5/§3.6/§3.9;
 * `.claude/skills/nextjs-api-route`).
 *
 * Body: `{ file_base64: string, filename: string }` (client-side base64
 * encode — simpler than multipart for a single small PDF). Uses Gemini's
 * native PDF understanding via `callGemini`'s `inlineData` part (added in
 * lib/ai/call-gemini.ts) rather than any text-extraction library.
 *
 * This is the FIRST turn of a `cv_upload` session: it (re)creates
 * `chat_sessions/{uid}` with `type: "cv_upload"`, asks Gemini to analyze the
 * uploaded PDF and respond per the standard OUTPUT PROTOCOL (conversational
 * turn — acknowledge findings, note gaps, ask the first targeted question),
 * and persists that assistant turn. Response shape matches POST /api/chat
 * exactly so the client can continue the normal chat flow afterward.
 *
 * Identity: name/gender come from the server-side `users/{uid}` profile,
 * never the body. The uploaded file itself carries no identity write path —
 * it is only ever passed to Gemini as inline data, never stored verbatim.
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
import { createCvUploadSession, persistTurn } from "@/lib/chat/session";
import { parseUploadBase64 } from "@/lib/cv-upload/parse-upload";

const BodySchema = z
  .object({
    file_base64: z.string().min(1),
    filename: z.string().min(1).max(255),
  })
  .strict();

const CV_ANALYSIS_INSTRUCTION =
  "The candidate just uploaded their existing CV as a PDF (attached as inline data on this " +
  "message). Build the INITIAL cv_state from the document: extract all education, experience, " +
  "skills, languages, projects, and other structured facts into `state` exactly as the OUTPUT " +
  "PROTOCOL specifies (infer skills from stated roles, tag inferred:true). Then, as the FIRST " +
  "turn of a cv_upload session, write a gap-focused professional `reply` in Saudi Arabic (unless " +
  "the CV is clearly English): acknowledge the document's strengths specifically, name the " +
  "concrete gaps you still need (e.g. missing technical skills, languages, or target role), and " +
  "ask one or two precise questions to fill them. Do NOT re-ask anything already in the CV. Keep " +
  "`ready` false on this opening turn.";

export async function POST(request: NextRequest) {
  try {
    const { uid } = await requireAuth(request);
    // CV upload shares the chat rate bucket (20/min/uid) — it is the first
    // turn of a conversation, not a separate cost category like PDF export.
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
        en: "A base64-encoded PDF file and filename are required.",
        ar: "مطلوب ملف PDF مشفّر بصيغة base64 واسم الملف.",
      });
    }

    const upload = parseUploadBase64(parsed.data.file_base64);
    if (!upload.ok) {
      const messages: Record<typeof upload.reason, { en: string; ar: string }> = {
        too_large: {
          en: "The file is too large. Please upload a PDF under 4MB.",
          ar: "الملف كبير جداً. الرجاء رفع ملف PDF أقل من 4 ميجابايت.",
        },
        not_pdf: {
          en: "Only PDF files are supported.",
          ar: "يُقبل ملف PDF فقط.",
        },
        invalid_base64: {
          en: "The uploaded file could not be read.",
          ar: "تعذّرت قراءة الملف المرفوع.",
        },
      };
      return apiError("invalid_body", messages[upload.reason]);
    }

    // Identity (name/gender) is read from the server-side profile, never the body.
    const profile = await requireUserProfile(uid);

    const db = adminDb();
    const session = await createCvUploadSession(db, uid);

    const turn = await runConversationTurn({
      userContext: {
        name: profile.name,
        gender: profile.gender,
        sessionType: "cv_upload",
        turnCount: 0,
      },
      currentState: null,
      priorMessages: session.messages,
      newUserMessage: CV_ANALYSIS_INSTRUCTION,
      inlineData: {
        mimeType: "application/pdf",
        dataBase64: upload.bytes.toString("base64"),
      },
    });

    const persisted = await persistTurn(db, {
      uid,
      priorMessages: session.messages,
      // The analysis instruction is an internal directive, not the
      // candidate's own words — don't append it to the visible chat history.
      userMessageContent: null,
      assistantReply: turn.reply,
      assistantQuickReplies: turn.quickReplies,
      cvState: turn.state,
      cvGenerated: turn.cvGenerated,
      cvData: turn.cvData,
      sessionType: "cv_upload",
    });

    return NextResponse.json({
      reply: turn.reply,
      quick_replies: turn.quickReplies,
      cv_generated: turn.cvGenerated,
      cv_data: turn.cvData,
      session_status: persisted.status,
    });
  } catch (error) {
    // toApiErrorResponse handles both cases: RouteError passes through with
    // its own code/message, anything else is logged server-side and mapped
    // to a generic bilingual internal error.
    return toApiErrorResponse(error);
  }
}
