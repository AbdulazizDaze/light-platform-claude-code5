# Build Roadmap

Two milestones. Claude Code builds **Milestone 1 (Candidate)** end-to-end, commits and pushes to
`main`, and hands it to you to **run and test locally in the browser**. After you're satisfied, it
builds **Milestone 2 (Recruiter + Matching)**. Each milestone is a fully runnable slice.

Work happens directly on `main` with small, conventional commits (good history, easy rollback via
tags). Each milestone tackled as: `/plan-feature M1` → `/build-feature M1` → `/test` → `/review` →
`/ship M1` → **you test locally** → `/tag-release`.

Guardrails apply throughout (see `CLAUDE.md §3/§6/§7`): bilingual, RTL-first, Saudi dialect + gender,
server-owned identity, Zod-validated AI output, deterministic zero-cost matching, PDPL, tests for pure
logic.

---

## Milestone 1 — Full Candidate Experience  →  tag `v1.0-candidate`

Everything a candidate touches, working end to end and runnable with `npm run dev`. (No recruiters or
matching yet — that's M2. A candidate can register, converse, and get a downloadable bilingual CV.)

### 1.1 Foundation
- [ ] Scaffold Next.js 14 App Router + TypeScript strict + Tailwind (RTL root) + ESLint + Vitest.
- [ ] `package.json` scripts: dev/build/start/lint/typecheck/test (`CLAUDE.md §8`).
- [ ] Firebase wiring: client SDK config, Admin SDK init, region `me-central1`, `.env.local` template.
- [ ] `lib/i18n` scaffolding + direction/logical-property helpers.
- [ ] Brand Tailwind theme (semantic tokens + Alexandria/Readex Pro fonts); base `<html dir="rtl" lang="ar">`.
- [ ] Initialize **shadcn/ui**; map its CSS variables to Light tokens in `app/globals.css`; add the
      base primitives (button, input, card, dialog, dropdown-menu, badge, toast, skeleton, tabs) and
      audit each for RTL. Build strictly against `docs/design-system.md`.
- **Gate:** a token/primitive showcase renders correctly in RTL; `rtl-arabic-specialist` +
      `design:design-critique` sign-off on the base look.

### 1.2 Candidate data layer & security
- [ ] Zod schemas for `users`, `candidate_profiles`, `chat_sessions` (`cv-schema` skill for CV).
- [ ] Typed Firestore converters in `lib/firebase/`.
- [ ] `firestore.rules` (owner-only for the candidate collections) + needed indexes.
- **Gate:** rules + schemas unit-tested; `security-reviewer` sign-off.

### 1.3 Auth & candidate registration
- [ ] Firebase Anonymous Auth + `AuthContext` + `authedFetch()`.
- [ ] Landing page (dual CTAs, product mockup, value prop copy — bilingual).
- [ ] Candidate registration (name, phone, city; nationality captured/inferred) → `users` + profile.
- [ ] Server-side identity integrity in a shared route helper.
- **Gate:** identity cannot be spoofed via body; `security-reviewer` sign-off.

### 1.4 AI conversation & CV generation (core IP)
- [ ] `lib/ai/callGemini()` with fallback chain + retry.
- [ ] Base prompt + user-context builder (`gemini-prompt` skill), Saudi dialect, gender-aware.
- [ ] `POST /api/chat`: conversation, implicit skill inference, pacing, Zod-validated CV JSON.
- [ ] Chat UI (AI bubbles right, user left) + inline CvCard preview + AR/EN toggle.
- [ ] CV-upload path (PDF) → analyze → improve.
- **Gate:** invalid AI JSON never stored; dialect + gender reviewed by `rtl-arabic-specialist`.

### 1.5 CV rendering & PDF
- [ ] CV customization page: 4 templates, 6 themes + custom colors, AR/EN.
- [ ] Cloud Run Puppeteer service (`services/pdf/`) with Arabic typography (Noto Sans Arabic).
- [ ] `POST /api/pdf` thin proxy streaming Cloud Run output; rate limit 5/min/uid.
- **Gate:** Arabic renders correctly in the actual PDF.

### 1.6 Candidate dashboard
- [ ] Dashboard with status cards + quick actions (edit CV, download, view profile).
- [ ] Session persistence: returning user sees their CV.

### ✅ Milestone 1 local-test handoff (you, in the browser)
Run `npm run dev` and check `http://localhost:3000`:
- [ ] Landing loads, RTL correct, both CTAs work.
- [ ] Register as a candidate (name/phone/city).
- [ ] Chat with Light in Saudi Arabic; it infers skills and paces the conversation.
- [ ] A bilingual CV generates as a CvCard; AR/EN toggle works.
- [ ] Open the CV page: switch templates/themes; download the PDF; Arabic renders correctly.
- [ ] Upload an existing PDF CV; it analyzes and improves.
- [ ] Refresh/return: your CV persists.
- [ ] Try mobile viewport: layouts adapt, RTL holds.

**Only after you approve → `/tag-release v1.0-candidate`, then start Milestone 2.**

---

## Milestone 2 — Full Recruiter Experience + Matching  →  tag `v2.0-marketplace`

Completes the two-sided marketplace: recruiters post jobs, the matching engine connects both sides,
and notifications fire. After this, passive job hunting works: candidates from M1 start getting matches.

### 2.1 Recruiter data, auth & registration
- [ ] Zod schemas + converters for `companies`, `job_posts`, `matches`, `notifications`.
- [ ] Security rules: `companies`/`job_posts` readable by any authed user; `matches` visible to the
      involved candidate + recruiter; `matches`/`notifications` server-write-only. Indexes for hard
      filters. `firestore-rules` skill.
- [ ] Recruiter registration (name, company, phone, city, optional Nitaqat category/size).
- **Gate:** access model correct; `security-reviewer` sign-off.

### 2.2 AI job posting
- [ ] `POST /api/job-chat`: one-line brief → bilingual job post (title, description, responsibilities,
      requirements, skills, benefits, salary guidance) with Nitaqat compliance flags (`nitaqat-rules`).
- [ ] Review/edit/publish flow → `job_posts`.
- [ ] Job management dashboard (list, edit, pause, close).
- **Gate:** bilingual completeness; Nitaqat flagging works.

### 2.3 Matching engine (core IP)
- [ ] Embedding generation on profile/job create + material update (`text-embedding-004`).
- [ ] Hard filters (Firestore compound queries).
- [ ] Soft scoring (skills/experience/education/preferences/quality) — pure, exhaustively unit-tested.
- [ ] Nitaqat + freshness boosts; fairness constraints (10 slots, dedupe, ≥5 companies).
- [ ] Template-based explanations (strengths, gaps, nitaqat_note, component_scores).
- [ ] Event-driven trigger (Firestore onCreate/onUpdate) + `/api/match` dev trigger.
- **Gate:** deterministic; exact-number unit tests; `matching-engine-engineer` + `code-reviewer` sign-off.

### 2.4 Match surfaces & discovery
- [ ] Recruiter: ranked matched candidates with explanations, Saudization badge, contact info.
- [ ] Candidate: match list + status; recruiter-viewed indicator.
- [ ] Contact-info visibility (blur-layer stub for future subscription gating).
- **Gate:** match visibility rules enforced; PII shown only per rules.

### 2.5 Notifications
- [ ] FCM service worker + opt-in after CV generation.
- [ ] Email (Resend/SendGrid): match alerts, weekly digest, freshness nudges.
- [ ] `notifications` records + `POST /api/notify`; matching dispatches after batch-writing matches.
- **Gate:** opt-in respected; no PII beyond necessity in payloads.

### 2.6 Nitaqat end-to-end & polish
- [ ] Nitaqat boost visible in match cards; hire-impact preview; Saudization badges everywhere relevant.
- [ ] GA4 funnels aligned to `PRD.md §11` KPIs.
- [ ] Accessibility pass (`design:accessibility-review`) on key screens.

### ✅ Milestone 2 local-test handoff (you, in the browser)
With `npm run dev` (and the Firestore emulator for triggers, if used):
- [ ] Register as a recruiter; describe a role in one line; a bilingual job post generates.
- [ ] Publish it; matched candidates appear ranked with explanations + Saudization badges.
- [ ] View a candidate; contact info shows per rules.
- [ ] As a candidate (from M1), a match appears and a notification fires.
- [ ] Set the company to Yellow/Red; verify Saudi candidates get the Nitaqat boost + "يحسّن النطاقات".
- [ ] Job management: edit/pause/close works.

**After you approve → `/tag-release v2.0-marketplace`.**

---

## Cross-cutting (both milestones)
Bilingual coverage · RTL correctness · Zod validation of external/AI data · security-rule updates ·
PDPL data minimization · tests for pure logic (esp. matching math) · cost discipline on embeddings/LLM ·
each milestone stays runnable via `npm run dev`.

---

## Current state

**Session 0 (framework bootstrap):** Repo set up as the Claude Code operating system for Light —
`CLAUDE.md`, `docs/` (incl. `workflow.md`), agents, skills, commands, hooks, settings. Git posture:
**commit + push directly to `main`**; deploys/force-push/reset denied. Scope condensed to **two
milestones**: M1 Candidate, then M2 Recruiter + Matching. **No product code yet.**
Next: finish one-time setup (`docs/workflow.md §1`), then `/plan-feature M1`.

**Version tags:** _(none yet — first will be `v1.0-candidate` after M1)_
