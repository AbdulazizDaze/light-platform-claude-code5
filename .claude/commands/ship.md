---
description: Definition-of-Done gate, push final commits to main, then hand off to the user for local browser testing.
argument-hint: <milestone id (M1 or M2)>
---

Ship: **$ARGUMENTS**

**1. Definition of Done** (`CLAUDE.md §6`) — verify all: typecheck + lint green; `npm run build`
succeeds; bilingual coverage; RTL verified; AI output Zod-validated with retry; identity server-sourced;
tests added and green (exact-number tests for matching math in M2); security rules updated if needed;
`code-reviewer` (and `security-reviewer` if applicable) approved; docs updated for any convention/model
change. If any gate fails, stop and report what remains.

**2. Commit + push** anything outstanding to `main` with a Conventional Commit message.

**3. Update the roadmap.** Check off completed items and refresh **Current state** in
`docs/build-roadmap.md`; commit + push (`docs: update roadmap for <milestone>`).

**4. Local-test handoff.** Print the milestone's **local-test checklist** from
`docs/build-roadmap.md`, plus exactly how to run it:
- env vars needed in `.env.local` (list them),
- `npm install` if deps changed,
- `npm run dev` → open `http://localhost:3000`,
- any extra services (Firestore emulator, the Cloud Run PDF service or its local equivalent) and how
  to start them.
Then **stop and wait** for the user to test in their browser and confirm.

**5. Tag (after the user approves).** When the user says the milestone works, run `/tag-release
<version>` to tag the checkpoint on `main` (M1 → `v1.0-candidate`, M2 → `v2.0-marketplace`).

Never deploy. Never force-push.
