/**
 * Structured API error responses (docs/conventions.md, CLAUDE.md §7,
 * `.claude/skills/nextjs-api-route/SKILL.md`).
 *
 * Every route returns errors as `{ error: { code, message: { en, ar } } }` —
 * never a bare string, never a stack trace, never a provider error. Message
 * is bilingual so route handlers can surface it directly in either locale.
 */

import { NextResponse } from "next/server";
import type { LocalizedString } from "@/lib/i18n";

/** Canonical error codes used across Light's API routes. */
export const ERROR_CODES = {
  unauthorized: "unauthorized",
  invalid_body: "invalid_body",
  rate_limited: "rate_limited",
  internal: "internal",
  not_found: "not_found",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/** HTTP status conventionally paired with each error code. */
const STATUS_BY_CODE: Record<ErrorCode, number> = {
  unauthorized: 401,
  invalid_body: 400,
  rate_limited: 429,
  internal: 500,
  not_found: 404,
};

export interface ApiErrorBody {
  error: {
    code: ErrorCode;
    message: LocalizedString;
  };
}

/**
 * Build a structured JSON error response. `status` defaults to the
 * conventional HTTP status for `code` but can be overridden if a route needs
 * to (rare — prefer the default so status and code stay in sync).
 */
export function apiError(
  code: ErrorCode,
  message: LocalizedString,
  status: number = STATUS_BY_CODE[code]
): NextResponse<ApiErrorBody> {
  return NextResponse.json({ error: { code, message } }, { status });
}
