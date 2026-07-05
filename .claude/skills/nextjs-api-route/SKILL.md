---
name: nextjs-api-route
description: Use when creating or editing a Next.js App Router API route handler. Provides the canonical secure shape — token verification, server-side identity, Zod body validation, per-uid rate limiting, thin handler delegating to lib/, structured errors. Trigger for any /api/* work.
---

# Next.js API Route (canonical shape)

Every handler is the trust boundary. Keep it thin: parse, authorize, validate, rate-limit, delegate,
respond. Real logic lives in `lib/` (testable without HTTP).

## Order of operations
1. Verify the Firebase ID token (Bearer).
2. Load the caller's **server-side** profile from Firestore (identity source of truth).
3. Validate the request body with Zod.
4. Rate-limit by uid (chat 20/min, PDF 5/min).
5. Delegate to a pure function in `lib/`.
6. Return typed, structured JSON. Errors as `{ error: { code, message } }`.

## Template (app/api/example/route.ts)
```ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/lib/firebase/admin";
import { getUserProfile } from "@/lib/firebase/users";
import { rateLimit } from "@/lib/rate-limit";
import { doWork } from "@/lib/example";

const BodySchema = z.object({ message: z.string().min(1) }).strict(); // reject unknown/identity fields

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = token ? await verifyToken(token) : null;
    if (!decoded) return err(401, "UNAUTHENTICATED", "Sign in required");

    if (!rateLimit(decoded.uid, "example", 20, 60_000))
      return err(429, "RATE_LIMITED", "Too many requests");

    const profile = await getUserProfile(decoded.uid);     // identity from server, not body
    if (!profile) return err(404, "NO_PROFILE", "Profile not found");

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return err(400, "BAD_REQUEST", "Invalid body");

    const result = await doWork(profile, parsed.data);     // pure logic in lib/
    return NextResponse.json({ data: result });
  } catch {
    return err(500, "INTERNAL", "Something went wrong");   // never leak provider/stack details
  }
}

function err(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}
```

## Rules
- Never read identity/role from the body. `.strict()` schemas reject extra fields.
- Gemini only via `lib/ai/callGemini()`; matching only via `lib/matching/`; data via typed converters.
- AI JSON is Zod-validated with bounded retry before use.
- No secrets in responses; no stack traces leaked.

## Related
`gemini-prompt`, `cv-schema`, `matching-algorithm`, `firestore-rules`.
