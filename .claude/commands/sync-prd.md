---
description: Reconcile the codebase and roadmap with PRD.md after a scope or requirement change.
argument-hint: <what changed in the PRD>
---

Sync with the PRD change: **$ARGUMENTS**

Re-read the affected `PRD.md` sections. Identify impacts on `docs/architecture.md`,
`docs/data-models.md`, `docs/conventions.md`, and `docs/build-roadmap.md`, and on any Zod schemas,
Firestore rules/indexes, prompts, or matching logic. Produce a concise diff of what must change and
where, delegate updates to the relevant agents, and update the docs + roadmap so `CLAUDE.md`'s
reference map stays accurate. Flag any change touching auth/rules/PII for `security-reviewer`.
