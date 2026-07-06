# CLAUDE.md — Light Platform

> This is the master memory file for **Light** (لايت), an AI-powered, conversational,
> bilingual (Arabic/English) recruitment platform for the Saudi Arabian SMB market.
> Read this file first, every session. It is the single source of truth for how we build.

---

## 0. How to use this file

- **Always read `PRD.md`** in the repo root for full product context. This file is the
  engineering operating system; `PRD.md` is the product spec.
- This file stays lean on purpose. Deep references live in `docs/` and are loaded **on demand**,
  not by default. Follow the pointers below.
- When you learn something durable about the codebase (a convention, a gotcha, a decision),
  record it here or in the relevant `docs/` file so the next session inherits it.

**Reference map (load only what the task needs):**

| Need | File |
|---|---|
| System architecture, data flow, service boundaries | `docs/architecture.md` |
| Coding conventions, naming, folder layout, git rules | `docs/conventions.md` |
| Firestore collections, Zod schemas, embeddings | `docs/data-models.md` |
| What to build and in what order | `docs/build-roadmap.md` |
| How agents/skills/commands fit together | `docs/agent-playbook.md` |
| Design system: tokens, components, RTL, shadcn/ui | `docs/design-system.md` |
| Autopilot loop + Git/GitHub version control | `docs/workflow.md` |
| Full product spec | `PRD.md` |

---

## 1. Product in one paragraph

Candidates talk to an AI career consultant in **Saudi-dialect Arabic**, and Light generates a
professional **bilingual CV**, builds a discoverable profile, and matches them to jobs
automatically — job hunting is **passive**. Recruiters (SMBs without HR) describe a role in one
line and get a bilingual job post plus **pre-matched, ranked candidates**, with **Nitaqat
(Saudization)** awareness baked into matching. Both sides of the marketplace ship together.

North-star metric: **successful hires facilitated per month.**

---

## 2. Tech stack (do not deviate without an ADR)

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 14 App Router** | SSR + API routes in one codebase |
| Language | **TypeScript, strict mode** | No `any` without justification |
| Styling | **Tailwind CSS 3.4**, RTL-first | `dir="rtl"` on `<html>` |
| AI | **Google Gemini 2.5 Flash** | Fallback chain: `2.5-flash` → `flash-latest` → `2.0-flash` |
| Embeddings | **Gemini `text-embedding-004`** | 768-dim, stored in Firestore |
| Auth | **Firebase Anonymous Auth** | Phone = persistent identifier |
| DB | **Cloud Firestore** (`me-central1`) | Real-time, security-rules enforced |
| Storage | **Firebase Storage** | CV PDFs, avatars, uploads |
| PDF | **Cloud Run + Puppeteer** | Vercel route is a thin proxy |
| Validation | **Zod 4** | Every AI JSON output validated |
| Push | **Firebase Cloud Messaging** | Free browser push |
| Email | **Resend or SendGrid** | Free tier |
| Hosting | **Vercel** | Serverless + edge |
| Analytics | **GA4** | Funnels |

New dependencies require a note in `docs/architecture.md` and reviewer sign-off.

---

## 3. Non-negotiable principles

1. **Bilingual by construction.** Any user-facing string, CV field, or job post exists in both
   `ar` and `en`. Data model uses `{ en: string, ar: string }` for localized content. Never ship
   an English-only or Arabic-only user-facing surface.
2. **RTL-first.** Design and build for right-to-left; LTR is the special case. AI messages bubble
   **right**, user messages **left** (opposite of Western apps — natural for Arabic reading).
3. **Saudi-dialect Arabic**, not MSA, not Egyptian, not Levantine. Gender-aware conjugation.
4. **Server owns identity.** Name, gender, email, phone, uid, role, and timestamps come from the
   **server-side Firestore profile**, never from the client request body. The Zod schema for
   AI-generated CV data must **reject** those identity fields.
5. **Validate all AI output** against Zod before storage or display. Invalid → retry, never store.
6. **Matching is deterministic-first.** Hard filters (cheap Firestore queries) eliminate before any
   embedding/AI cost. Explanations are template-based, not per-match LLM calls. Zero-cost by design.
7. **PDPL compliance.** Data minimization, in-region storage (`me-central1`), consent at
   registration, owner-only access via security rules. Treat phone/email as sensitive.
8. **Free stays free for candidates.** Monetization is recruiter-side only.
9. **Cost discipline.** Embeddings are generated once per create/material-update, never per match.
   Rate-limit chat (20/min/uid) and PDF (5/min/uid).

---

## 4. Brand + design tokens (use these exact values — PRD v3 §9 is authoritative)

**Logo:** navy LIGHT wordmark; the L is a corner bracket with an amber arrow rising through it at
45°. The arrow is a system motif (bullets, CTAs, progress). Tagline: "Brightening Careers,
Simplifying Hiring" · «مساعدك الذكي لسوق العمل السعودي».

Colors: **Navy** `#14213D` (foundation — headings, dark surfaces, wordmark; deep variant `#0D1730`
for gradients/footer), **Amber** `#FCA311` (THE action color — primary buttons carry navy text on
amber fill, AI identity accents, focus rings, glows; hover `#E08900`; never body-text on white),
**Success** `#1F9D66` (semantic success ONLY — not a brand color), **Fire Red** `#D62828`
(errors/destructive), Border `#E5E7EC`, Muted `#5B6474`, Surface `#F7F8FA`/white.

Fonts: **Alexandria** (primary UI + Arabic), **Readex Pro** (code/tables/numerals), **Noto Sans
Arabic** (CV PDF print glyphs).

Personality: confident, energetic, professional — a sharp consultant, not a mascot. Dark navy
sections with amber accents are the signature moment. Motion is part of the brand (fade-rise,
arrow micro-animations, shimmer skeletons; reduced-motion honored). Arabic is the default language
of every surface.

UI is built on **shadcn/ui + Tailwind, RTL-first**, against the full **`docs/design-system.md`** (type
and spacing scales, component specs, motion, a11y, screen layouts). Build against the system — do not
improvise per-screen UI. Reference semantic tokens, never raw hex.

---

## 5. The agent system (how work gets done)

Light is built with a **hybrid orchestration model**: role-based agents run the workflow and
delegate to domain-expert subagents. Full details in `docs/agent-playbook.md`.

**Orchestration roles** (drive the loop):
- `planner` — turns a PRD slice into a concrete, ordered implementation plan.
- `frontend-engineer` / `backend-engineer` — implement UI and API/server work.
- `code-reviewer` — reviews diffs for correctness, security, conventions before merge.
- `qa-test-engineer` — writes and runs tests; owns the test gate.
- `security-reviewer` — PDPL, auth, security-rules, identity-integrity audits.

**Domain experts** (deep, narrow knowledge — delegated to by the roles above):
- `ai-prompt-engineer` — Gemini prompt architecture, dialect, skill inference, fallback chain.
- `matching-engine-engineer` — hard filters, soft scoring, embeddings, Nitaqat/freshness boosts.
- `firebase-data-engineer` — Firestore schema, security rules, indexes, Admin SDK.
- `rtl-arabic-specialist` — RTL layout, bidi, Arabic typography, gender-aware copy.
- `pdf-service-engineer` — Cloud Run + Puppeteer, Arabic PDF typography, the proxy route.
- `notifications-engineer` — FCM + email, notification records, opt-in flow.

**Skills** (reusable procedures, in `.claude/skills/`): `cv-schema`, `bilingual-content`,
`gemini-prompt`, `matching-algorithm`, `firestore-rules`, `rtl-component`, `nitaqat-rules`,
`nextjs-api-route`. Skills are invoked automatically by matching intent, or explicitly.

**Slash commands** (in `.claude/commands/`): `/plan-feature`, `/build-feature`, `/new-api-route`,
`/new-component`, `/review`, `/test`, `/ship`, `/tag-release`, `/sync-prd`.

**Scope:** two milestones (see `docs/build-roadmap.md`) — **M1 Full Candidate Experience**, then
**M2 Full Recruiter Experience + Matching**. Each is a fully runnable slice the user tests locally
before the next begins.

**Default loop per milestone (work directly on `main`):**
`/plan-feature` → `/build-feature` (implement + commit×N + push to `main`) → `/test` → `/review` →
`/ship` (DoD gate + local-run handoff) → **user tests in the browser** → `/tag-release`. Commit in
small Conventional-Commit steps and keep `main` green and runnable (`npm run dev`) at all times. Never
skip review or test gates on auth, security rules, matching, or AI output validation. Never force-push,
`reset --hard`, or deploy — the user deploys. Full details in `docs/workflow.md`.

---

## 6. Definition of Done (every task)

- [ ] TypeScript compiles with **no errors** (`npm run typecheck`).
- [ ] Lint passes (`npm run lint`).
- [ ] Bilingual: every new user-facing string exists in `ar` + `en`.
- [ ] RTL verified for any new UI.
- [ ] AI output (if any) validated by Zod with a retry path.
- [ ] Identity fields sourced server-side, not from client body.
- [ ] Tests added/updated and green for logic (matching, scoring, validation, utils).
- [ ] Security rules updated if a new collection/field is read or written.
- [ ] `code-reviewer` approved; `security-reviewer` approved if auth/rules/PII touched.
- [ ] Docs updated if a convention, model, or decision changed.

---

## 7. Guardrails / never do

- Never trust client-supplied identity or role. Never let a candidate write another user's doc.
- Never call an LLM per match, or regenerate embeddings on every match run.
- Never store unvalidated AI JSON.
- Never hardcode Arabic-only or English-only user copy.
- Never put Puppeteer/Chromium in a Vercel function — it goes on Cloud Run.
- Never commit secrets. All keys via env (`docs/architecture.md` lists them).
- Never widen Firestore security rules "to make it work" — fix the query or the model.

---

## 8. Commands you can assume exist (wire them in package.json as we scaffold)

```
npm run dev         # next dev
npm run build       # next build
npm run start       # next start
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
npm run test        # vitest run
npm run test:watch  # vitest
```

If a script is missing during scaffolding, add it before relying on it in a hook.

---

## 9. Current state

Fresh greenfield build. The old `light-platform` repo is **not** reused. Track progress in
`docs/build-roadmap.md`. Update the "Current state" note there at the end of each working session.
