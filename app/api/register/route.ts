/**
 * POST /api/register — candidate registration (PRD §6.1 step 2; CLAUDE.md
 * §3.4, §3.7; `.claude/skills/nextjs-api-route/SKILL.md`).
 *
 * Canonical shape: verify token -> validate body (Zod, .strict()) -> rate
 * limit -> delegate to lib/ -> typed JSON response. This route intentionally
 * does NOT call `requireUserProfile` first — the whole point of /api/register
 * is to create that profile, so a 404 there would be a chicken-and-egg bug.
 *
 * Identity: `uid` for the created/updated docs comes ONLY from the verified
 * ID token (`requireAuth`), never from the request body. `role` is hardcoded
 * to `"candidate"` in `registerCandidate` — this route has no path to create
 * a recruiter account.
 */

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { CandidateRegistrationSchema } from "@/lib/schemas/user";
import { registerCandidate } from "@/lib/users/register-candidate";
import { requireAuth, requireRateLimit, toApiErrorResponse, RouteError } from "@/lib/api/route-helpers";
import { apiError } from "@/lib/api/errors";

export async function POST(request: NextRequest) {
  try {
    const { uid } = await requireAuth(request);

    // Registration itself isn't in the 20/min chat or 5/min PDF buckets, but
    // it's still an authenticated write path worth guarding against abuse.
    // Reuse the "chat" bucket ceiling (20/min/uid) as a generic default —
    // registration is called once per session in normal use, so this only
    // ever engages for retries/abuse.
    requireRateLimit(uid, "chat");

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("invalid_body", {
        en: "Request body must be valid JSON.",
        ar: "يجب أن يكون محتوى الطلب بصيغة JSON صحيحة.",
      });
    }

    const parsed = CandidateRegistrationSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("invalid_body", {
        en: "Some registration fields are missing or invalid.",
        ar: "بعض حقول التسجيل مفقودة أو غير صحيحة.",
      });
    }

    // parsed.data.consent_accepted is validated as literal(true) by the
    // schema; registerCandidate() records it as a server timestamp
    // (`consent_accepted_at`), never storing the raw boolean verbatim.
    const result = await registerCandidate(adminDb(), uid, parsed.data);

    return NextResponse.json({ ok: true, created: result.created });
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
