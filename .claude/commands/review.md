---
description: Review the working diff (uncommitted or recent commits) before it lands, via code-reviewer, plus security-reviewer when auth/rules/PII are touched.
argument-hint: <optional area or "working diff">
---

Review: **$ARGUMENTS**

Run the `code-reviewer` agent over the change — use `git diff` for uncommitted work or
`git diff <lastTag>..HEAD` / `git log` for recent commits. It checks correctness, conventions,
bilingual + RTL coverage, identity integrity, AI-output validation, matching cost/determinism,
security-rule updates, tests, and performance — returning APPROVE / REQUEST CHANGES with grouped
findings (blocker / should-fix / nit) at file:line.

If the change touches authentication, Firestore security rules, or PII, also run the
`security-reviewer` and require its APPROVE. Since work goes straight to `main`, treat blockers as
must-fix **before the next push**, not after.
