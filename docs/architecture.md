# Architecture

System reference for Light. Load this when working across service boundaries, adding a
dependency, or wiring a new API surface.

## 1. High-level shape

```
Browser (Next.js App Router, React 18, Tailwind, RTL)
  ├─ AuthContext (Firebase Anonymous Auth) + authedFetch() (attaches ID token)
  ├─ FCM service worker (push)
  └─ Pages: Landing · Auth · Chat (candidate) · CV · Recruiter UI · Dashboards
        │  HTTPS + Bearer (Firebase ID token)
        ▼
Next.js API routes (Vercel serverless)
  ├─ POST /api/chat        → Gemini · Zod validate · CV generation
  ├─ POST /api/job-chat    → Gemini · job post generation
  ├─ POST /api/match       → hard filters · soft scoring · ranking (or Firestore-triggered)
  ├─ POST /api/pdf         → thin proxy → Cloud Run
  └─ POST /api/notify      → FCM + email dispatch
        │
        ├──► Gemini API (Google)         2.5-flash → flash-latest → 2.0-flash; text-embedding-004
        ├──► Cloud Firestore (me-central1)  users, candidate_profiles, chat_sessions,
        │                                    companies, job_posts, matches, notifications
        ├──► Cloud Run + Puppeteer        A4 + Arabic PDF render, scale-to-zero
        └──► FCM / Resend|SendGrid        push + email
```

## 2. Service boundaries & responsibilities

- **Client** never holds secrets, never computes trust decisions, never writes identity fields.
  It renders, collects input, and attaches the Firebase ID token via `authedFetch()`.
- **API routes** are the trust boundary. They read the caller's identity from the verified token +
  server-side Firestore profile, call Gemini, validate with Zod, and write Firestore.
- **Matching** runs event-driven (Firestore `onCreate`/`onUpdate` on `job_posts` and
  `candidate_profiles`), not on-demand. A `/api/match` route exists for manual/dev triggering.
- **PDF** is isolated on Cloud Run because Puppeteer+Chromium exceeds Vercel's 50MB bundle / 1GB
  memory limits. The Vercel route streams the Cloud Run response back to the client.

## 3. AI layer

- **Base prompt** (~7K tokens): static, cacheable — identity, conversation rules, data
  requirements, skill-inference maps, CV format spec, quality bars. See `.claude/skills/gemini-prompt`.
- **User context** (per request): name, gender (Arabic grammar), message count (pacing), session
  type (new | returning | cv_upload).
- **Fallback chain**: `gemini-2.5-flash` → `gemini-flash-latest` → `gemini-2.0-flash`, auto-retry
  on model error. Keep this behind a single `callGemini()` abstraction so providers are swappable.
- **Pacing**: nudge urgency at message 8+, force CV production at message 14+.

## 4. Matching engine (summary; full detail in `docs/data-models.md` + skill `matching-algorithm`)

1. **Hard filters** (pass/fail, Firestore compound query): location, language, job type, work
   arrangement. Must pass all four.
2. **Soft score (0–100)** weighted: skills 35% (cosine on embeddings), experience 30% (rules),
   education 15%, soft preferences 10%, profile quality 10%.
3. **Multipliers**: `nitaqat_boost` (1.15× for Saudi candidates when company is Yellow/Red, capped
   at 100), `freshness_boost` (1.0 + 0.1·max(0,14−days)/14).
4. **Top-N** selection with fairness constraints: max 10 active match slots per candidate, no
   duplicate candidate-job pairs, aim for ≥5 distinct companies per candidate's slots.
5. **Explanations** are template-based (strengths, gaps, nitaqat_note, component_scores) — no LLM
   per match. Embeddings generated once per create/material-update.

## 5. Notifications

- **FCM**: service worker registers after first CV generation. Types: new match, profile viewed,
  freshness reminder.
- **Email** (Resend/SendGrid, free tier 100/day): match alerts, weekly digest, freshness nudges.
- **Future**: WhatsApp Business API (95%+ SA penetration) becomes the primary channel.

## 6. Security & privacy (see `security-reviewer` agent + `firestore-rules` skill)

- Firebase Anonymous Auth; phone number in Firestore is the recovery/identity anchor.
- Firestore Security Rules: owner-only for personal data; job posts + companies readable by any
  authed user; matches readable by the involved candidate and recruiter only.
- Identity integrity: server reads name/gender/email/phone from Firestore, not request body.
- Rate limiting: in-memory per-uid buckets — chat 20/min, PDF 5/min, with periodic cleanup.
- PDPL: consent at registration, data minimization, `me-central1`, 72h breach notification,
  access/correct/delete rights. Contact-info blur layer is a future monetization + privacy lever.

## 7. Environment variables

| Variable | Scope | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | server | Gemini AI + embeddings |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | server | Admin SDK (production) |
| `NEXT_PUBLIC_FIREBASE_*` (7) | client | Firebase client SDK config |
| `PDF_SERVICE_URL` | server | Cloud Run PDF endpoint |
| `RESEND_API_KEY` or `SENDGRID_API_KEY` | server | Email |

Never commit these. Use `.env.local` (gitignored) locally and Vercel/Cloud Run secrets in prod.

## 8. Repo layout (target for the fresh build)

```
/
├─ app/                    # Next.js App Router (pages, layouts, route handlers)
│  ├─ (marketing)/         # landing
│  ├─ (candidate)/         # chat, cv, dashboard
│  ├─ (recruiter)/         # job chat, job management
│  └─ api/                 # chat, job-chat, match, pdf, notify
├─ components/             # Light components (CvCard, ChatBubble, MatchCard) — RTL-first
│  └─ ui/                  # shadcn/ui primitives (owned, themed to Light tokens)
├─ lib/
│  ├─ ai/                  # callGemini, prompts, fallback chain
│  ├─ matching/            # hard filters, scoring, embeddings, boosts
│  ├─ firebase/            # client + admin init, converters
│  ├─ schemas/             # Zod schemas (cv, job, match, profile)
│  └─ i18n/                # locale strings, dir helpers
├─ services/pdf/           # Cloud Run Puppeteer service (own Dockerfile)
├─ firestore.rules         # security rules
├─ firestore.indexes.json  # composite indexes for hard-filter queries
├─ docs/                   # this folder
├─ .claude/                # agents, skills, commands, hooks, settings
├─ CLAUDE.md
└─ PRD.md
```

## 9. Decision log (ADRs)

Record notable technical decisions here (or in `docs/adr/` once there are several). Use the
`engineering:architecture` skill to draft an ADR when choosing between technologies or making a
call with real trade-offs. Seed entries:

- **ADR-000**: Gemini over other LLMs — strong Arabic, cost, speed. Abstracted behind `callGemini()`
  so it's swappable (mitigates pricing/deprecation risk).
- **ADR-001**: Embeddings stored in Firestore (not a vector DB) at early scale; revisit >50K active
  profiles (Pinecone/Weaviate/Vertex Vector Search).
- **ADR-002**: PDF on Cloud Run, not Vercel — bundle/memory limits.
- **ADR-003**: UI on **shadcn/ui + Tailwind** (owned primitives, RTL-workable) over a heavier kit or
  fully-custom primitives; all screens built against `docs/design-system.md`. Rationale: consistent
  building blocks for autopilot builds, full ownership of component code, good RTL story.
