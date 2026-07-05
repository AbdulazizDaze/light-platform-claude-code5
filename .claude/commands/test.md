---
description: Run the test gate — write/run Vitest for pure logic and block on gaps or failures.
argument-hint: <optional area, e.g. matching, schemas>
---

Run the test gate for: **$ARGUMENTS**

Delegate to `qa-test-engineer`. Prioritize exhaustive unit tests on the matching math (hard filters,
weighted scoring, cosine, nitaqat boost cap-at-100, freshness boost day 0/7/14, fairness constraints),
Zod schemas (identity-field rejection, inferred-skill tagging), and i18n helpers. Mock Gemini and
Firebase at the `lib/` boundary — no live services. Then run `npm run test` and `npm run typecheck`
and report pass/fail plus coverage gaps. The gate is **red until pure logic is covered and green.**
