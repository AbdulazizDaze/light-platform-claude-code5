/**
 * Small composable helpers for the canonical API route shape
 * (`.claude/skills/nextjs-api-route/SKILL.md`, CLAUDE.md §3.4).
 *
 * `requireAuth` and `requireUserProfile` are deliberately thrown/caught
 * (via typed `RouteError`) rather than returning a union, so route handlers
 * can call them at the top in a flat `try {} catch {}` without threading
 * error-checking through every step (see app/api/register/route.ts for the
 * calling convention).
 */

import type { NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { usersAdminConverter } from "@/lib/firebase/converters";
import type { User } from "@/lib/schemas/user";
import { checkRateLimit, type RateLimitBucket } from "@/lib/rate-limit";
import { apiError, type ErrorCode } from "./errors";
import type { LocalizedString } from "@/lib/i18n";

/** Thrown by `requireAuth`/`requireUserProfile`; caught at the route's top-level try/catch. */
export class RouteError extends Error {
  code: ErrorCode;
  bilingualMessage: LocalizedString;

  constructor(code: ErrorCode, message: LocalizedString) {
    super(message.en);
    this.name = "RouteError";
    this.code = code;
    this.bilingualMessage = message;
  }
}

/** Convert a caught `RouteError` (or anything else) into a structured response. */
export function toApiErrorResponse(error: unknown) {
  if (error instanceof RouteError) {
    return apiError(error.code, error.bilingualMessage);
  }
  // Unexpected (non-RouteError) failures are server problems — log the real
  // cause for the operator (error messages here are config/infra text, not
  // user PII) while returning only a generic bilingual message to the client.
  console.error(
    "[api] unhandled route error:",
    error instanceof Error ? `${error.name}: ${error.message}` : error,
  );
  return apiError("internal", {
    en: "Something went wrong. Please try again.",
    ar: "حدث خطأ ما. الرجاء المحاولة مرة أخرى.",
  });
}

const UNAUTHORIZED_MESSAGE: LocalizedString = {
  en: "Sign in required.",
  ar: "يجب تسجيل الدخول.",
};

/**
 * Verify the Firebase ID token from the `Authorization: Bearer <token>`
 * header. Throws `RouteError("unauthorized", ...)` on any failure —
 * missing header, malformed token, expired/revoked token.
 */
export async function requireAuth(request: NextRequest): Promise<{ uid: string }> {
  const header = request.headers.get("authorization") ?? request.headers.get("Authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : undefined;

  if (!token) {
    throw new RouteError("unauthorized", UNAUTHORIZED_MESSAGE);
  }

  // Deliberately OUTSIDE the try below: a missing/malformed
  // FIREBASE_SERVICE_ACCOUNT_JSON is a server-configuration problem and must
  // surface as a logged `internal` error (via toApiErrorResponse), not
  // masquerade as a 401 that sends users chasing a sign-in bug.
  const auth = adminAuth();

  try {
    const decoded = await auth.verifyIdToken(token);
    return { uid: decoded.uid };
  } catch {
    // Never leak the underlying Firebase Admin error (CLAUDE.md §7).
    throw new RouteError("unauthorized", UNAUTHORIZED_MESSAGE);
  }
}

/**
 * Load the caller's server-side identity document from `users/{uid}`
 * (CLAUDE.md §3.4: identity is read here, never from the request body).
 * Throws `RouteError("not_found", ...)` if no profile exists yet — routes
 * that create the profile (e.g. registration) should not call this first.
 */
export async function requireUserProfile(uid: string): Promise<User> {
  const snapshot = await adminDb()
    .collection("users")
    .doc(uid)
    .withConverter(usersAdminConverter)
    .get();

  if (!snapshot.exists) {
    throw new RouteError("not_found", {
      en: "Profile not found. Please complete registration first.",
      ar: "لم يتم العثور على الملف الشخصي. الرجاء إكمال التسجيل أولاً.",
    });
  }

  // `snapshot.exists` is a plain boolean (not a type-guarded discriminant) in
  // the Admin SDK's typings, so `data()` still types as possibly-undefined
  // here even though we've just checked existence above.
  return snapshot.data()!;
}

/**
 * Rate-limit the caller by uid+bucket (chat 20/min, PDF 5/min — CLAUDE.md
 * §3.9). Throws `RouteError("rate_limited", ...)` when the limit is
 * exceeded; the bilingual message includes the retry-after hint in seconds.
 */
export function requireRateLimit(uid: string, bucket: RateLimitBucket): void {
  const { allowed, retryAfterSeconds } = checkRateLimit(uid, bucket);
  if (!allowed) {
    throw new RouteError("rate_limited", {
      en: `Too many requests. Please try again in ${retryAfterSeconds}s.`,
      ar: `طلبات كثيرة جداً. الرجاء المحاولة بعد ${retryAfterSeconds} ثانية.`,
    });
  }
}
