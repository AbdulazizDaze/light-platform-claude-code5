---
description: Scaffold a secure Next.js API route using the canonical shape.
argument-hint: <route path, e.g. /api/job-chat> and purpose
---

Create the API route: **$ARGUMENTS**

Delegate to `backend-engineer` and apply the `nextjs-api-route` skill. The handler must, in order:
verify the Firebase ID token, load the server-side profile (identity source of truth), Zod-validate
the body with `.strict()`, rate-limit by uid, delegate real work to a pure function in `lib/`, and
return structured JSON with `{ error: { code, message } }` on failure.

If it calls Gemini, route through `lib/ai/callGemini()` and Zod-validate output with retry
(`gemini-prompt`, `cv-schema`). If it touches a new collection/field, delegate schema + rule + index
to `firebase-data-engineer` (`firestore-rules`) and flag `security-reviewer`. Add unit tests for the
`lib/` logic.
