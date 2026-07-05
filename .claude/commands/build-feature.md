---
description: Build a milestone end-to-end on main — plan, implement via the right agents, commit in small steps, test, and self-review. Ends runnable via npm run dev.
argument-hint: <milestone id (M1 or M2) or feature description>
---

Build: **$ARGUMENTS**

Work directly on `main`. Keep it green and runnable at every step.

1. **Plan.** If no approved plan exists, run the `planner` (`/plan-feature`) and confirm scope against
   `docs/build-roadmap.md`.
2. **Implement.** Dispatch `frontend-engineer` and/or `backend-engineer`, delegating to domain experts
   (`ai-prompt-engineer`, `matching-engine-engineer`, `firebase-data-engineer`, `rtl-arabic-specialist`,
   `pdf-service-engineer`, `notifications-engineer`) per the plan. Run independent work in parallel and
   apply the relevant skills. **Commit after each coherent step** with a Conventional Commit message
   (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`) referencing the roadmap item, and
   **push to `main`** (`git push origin main`) so history stays current — small commits, not one blob.
3. **Test.** Run `qa-test-engineer` (`/test`). Block on red or untested pure logic.
4. **Review.** Run `code-reviewer` (`/review`), plus `security-reviewer` if auth/rules/PII are touched.
   Fix findings and re-commit/push.
5. **Runnable check.** Ensure `npm run dev`, `npm run build`, `npm run typecheck`, and `npm run lint`
   all succeed, so the milestone can be tested locally in the browser.
6. **Ship.** Hand to `/ship <milestone>` for the Definition-of-Done gate and the local-test handoff.

Honor every guardrail in `CLAUDE.md §3/§7`. Never skip test or review gates on auth, security rules,
matching, or AI-output validation. Never force-push or reset --hard.
