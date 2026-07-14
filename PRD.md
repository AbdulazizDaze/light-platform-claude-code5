# Light (لايت) — Product Requirements Document

**Version:** 5.0 — the founding document for a fresh build
**Date:** July 8, 2026
**Owner:** Abdulaziz Aljandal
**Audience of this document:** the engineering agent (Claude Code) building Light from scratch. This
PRD is self-contained: product, experience, technology, AI architecture, and the full milestone
roadmap. Build only what is written here; where detail is missing, propose before building.

---

# Part I — Product

## 1. Vision

Light is Saudi Arabia's hiring platform: the place where every job seeker becomes discoverable
with a professional bilingual profile in minutes, and where every employer finds pre-matched,
ready-to-contact talent. The model that ZipRecruiter proved globally — effortless entry,
proactive AI matching, employers who come to the candidate — built natively for the Saudi market:
Arabic-first, bilingual by construction, and fluent in the realities of Saudization (Nitaqat).

**North-star metric:** successful hires facilitated per month.

## 2. The two customers

Every screen, flow, and sentence in Light serves one of two people, and always knows which:

**The job seeker (الباحث عن عمل).** Primary persona: a Saudi student or fresh graduate, 21–25,
phone in hand. Voice notes are a natural input; long forms end sessions. They may not know what a
strong CV contains, and many feel more confident in Arabic than English. Secondary personas:
early-career switchers (1–3 years of experience), and women returning to the workforce — a fast
growing segment for whom clarity about privacy («من يستطيع رؤية رقمي؟») is a decisive trust
factor. For all of them, Light produces a professional bilingual CV and a discoverable profile
with the least effort on the market, then brings opportunities to them.

**The employer (صاحب العمل).** An SMB owner, manager, or office admin without an HR department,
hiring between other responsibilities. They describe a role in one sentence and receive a
publishable bilingual job post, then a ranked list of matched candidates with clear reasons and
direct contact — plus built-in awareness of how each hire affects their Nitaqat standing.

## 3. Product principles

1. **Value before registration.** Both customers experience the core magic anonymously — the job
   seeker watches a CV take shape; the employer watches a job post write itself. Account creation
   happens at the moment of saving, downloading, or publishing, framed as securing their work.
2. **The outcome builds itself in view.** Light's intelligence is shown, not narrated: as the user
   speaks, the CV (or job post) visibly assembles, wording is elevated to professional standard,
   and open items appear as clearly marked placeholders the user can complete at any time.
3. **Everything traces to the user.** Every statement in a CV or job post originates from what the
   user provided. Derived content (for example, skills implied by a stated job) is visually
   labelled and confirmed with one tap. Missing information is represented as actionable
   placeholders — with a helpful example of what could go there — and the assistant lists all open
   items with suggestions whenever the user asks what remains.
4. **Quality first, felt as responsiveness.** Model quality and depth take precedence over
   latency; the experience earns its speed through architecture — streamed responses, live
   progress in the interface, and background work — so the product always feels immediate even
   when the thinking is deep.
5. **Professional Saudi voice.** The assistant converses in natural, professional Saudi Arabic —
   the register of a competent consultant: warm, specific, and measured. Marketing and interface
   copy use clean professional Arabic. English is a first-class equal across every surface.
6. **Trust as a feature.** Free for job seekers, stated plainly. Data stored in the Kingdom,
   stated plainly. Clear answers to who can see contact details. PDPL compliance expressed as
   user-facing clarity, not fine print.

## 4. The experiences

### 4.1 Job seeker — from first sentence to bilingual CV

**Entry.** The landing page speaks to both customers with two clear doors. The job seeker's door
leads directly into the builder — a single inviting screen: «حدّثنا عن خلفيتك الدراسية وخبراتك —
اكتب بأسلوبك الطبيعي، أو ارفع سيرتك الحالية». One composer accepts free text, pasted content, an
uploaded PDF, or a recorded voice note. A concise consent notice sits beneath the composer.

**The live CV.** The defining interaction. The screen holds the conversation and the CV together —
side by side on desktop; on mobile, the CV rides as a persistent summary bar with a completeness
indicator that expands into a full sheet. When the user sends their first message:

- Extracted facts land in the CV visibly, section by section: education, experience with correct
  dates, languages, stated strengths.
- Weak phrasing is elevated to professional standard in both languages, and the improvement is
  visible (the original phrasing shown small beneath the professional version).
- Skills implied by stated experience appear as labelled, pre-selected suggestions the user
  confirms or removes with a tap.
- Whatever a strong CV still needs appears as amber placeholders inside the CV itself — each with
  a one-line example of what belongs there — fillable from the conversation or by tapping the
  placeholder directly, in any order, at any time.
- The assistant's streamed reply stays brief and substantive: it reflects what was understood and
  asks for at most the one or two items that most improve the CV, offering tap-to-answer options
  whenever the answer set is predictable (language level, target role).

**Completion.** A completeness indicator fills as the CV strengthens. When the CV crosses the
readiness threshold, the download action becomes prominent. Choosing it opens account creation —
name, phone, city, gender, nationality, and explicit consent, prefilled where the conversation
already provided the answer, with a one-line reason beside each field («رقم جوالك يحفظ ملفك،
وتصلك عليه الفرص — لا يظهر لأي جهة دون إذنك»). Completing it saves the profile, activates
discoverability, and delivers the PDF.

**The CV itself.** Bilingual (Arabic and English versions of every section), four templates
(classic, modern, executive, minimal), six color themes plus custom colors, live preview,
in-place editing of any line, and print-perfect Arabic typography in the generated PDF.

**Return visits.** The profile and conversation persist. A returning user lands on their
dashboard: CV status, profile completeness, an editable CV, and — until matching launches — a
truthful status: «التوظيف الذكي قادم قريباً، وملفك سيكون من أوائل المرشحين». Matching language
appears in the product only when matching is live.

### 4.2 Employer — from one sentence to ranked candidates

**Entry.** The employer's door opens into the same pattern: one composer — «صف الوظيفة التي تريد
شغلها بجملة واحدة» — and the job post assembles live beside it: bilingual title and description,
responsibilities, requirements, skills, employment type, salary guidance presented as an editable
suggestion, every element editable in place, open items as placeholders. Publishing triggers
account and company creation (name, company, phone, city, optional Nitaqat category) — the same
value-first sequence as the job seeker's.

**Matching (once live).** A published job immediately presents ranked matched candidates. Each
match card carries: the fit score with its component breakdown, two or three concrete strengths,
any gaps, the Saudization badge where applicable with its effect on the score, and direct contact
actions. The employer can invite a candidate to apply in one tap; the job seeker sees the
invitation and responds with interest in one tap. Both sides see honest status trails («شاهد
ملفك», «تمت دعوتك», «أبدى اهتماماً»).

**Job management.** A simple board of the employer's posts: active, paused, closed; per-post
match lists; edit and republish.

### 4.3 Notifications (both sides)

Browser push (FCM) and email, each individually opt-in, each valuable: new match, profile viewed,
invitation received, interest received. Frequency-capped and consolidated (daily digest for
non-urgent events). Every notification deep-links to the exact surface it describes.

## 5. Intelligence specification

The assistant's capabilities, in order of product importance:

1. **Total extraction.** From any input — informal Arabic, English, mixed text with typos, a
   voice note, or an uploaded CV — the engine captures every stated fact into the structured
   profile in a single pass: education with institutions and dates, roles with employers and
   periods, achievements, languages, tools, preferences.
2. **Professional elevation.** Stated facts are rewritten to recruiter-grade standard in both
   languages — action verbs, quantified outcomes where the user provided numbers, correct CV
   register in Arabic and idiomatic professional English (never literal translation).
3. **Labelled derivation.** Experience implies skills (a year in retail implies customer service,
   sales, working under pressure, POS familiarity). Derived skills enter the CV pre-selected,
   visually labelled as suggestions, and confirmable or removable with one tap.
4. **Placeholder intelligence.** The engine maintains a model of what a strong CV for this person
   still lacks, expresses each gap as an in-CV placeholder with a concrete example, asks about at
   most one or two high-value gaps per turn, and enumerates all remaining gaps with suggestions
   when the user requests it.
5. **Conversational judgment.** Answers arriving out of order, corrections («لا، التخرج 2027»),
   multiple facts in one message, and topic jumps are all absorbed correctly; the engine updates
   the profile idempotently and acknowledges the change.
6. **Employer-side generation.** One sentence about a role expands into a complete, publishable
   bilingual job post with sensible structure and salary guidance presented as editable
   suggestions, refined through the same conversational loop.

## 6. Voice and copy standard

- **Assistant register:** natural Saudi Arabic with professional composure — the voice of a
  skilled consultant. Encouragement is expressed through substance («خبرة سنة في المبيعات مع
  تحقيق مستهدفات متكررة — هذه نقطة قوة حقيقية في سيرتك»). Sentences are short and specific. The
  assistant mirrors the user's language when they write in English.
- **Interface and marketing register:** clean professional Arabic as the default of every surface
  («أنشئ سيرتك الذاتية باحترافية — بالعربية والإنجليزية، خلال دقائق»), with equally polished
  English equivalents. Every user-facing string ships in both languages.
- **CV output register:** formal CV Arabic; idiomatic professional English composed directly (not
  translated word-for-word).

## 7. Design language

- **Brand.** The Light logomark — a navy corner bracket with an amber arrow rising through it at
  45° — anchors the identity. Navy `#14213D` (deep variant `#0D1730`) is the foundation; amber
  `#FCA311` (hover `#E08900`) is the single action color, carrying navy text on amber fills;
  green `#1F9D66` expresses success states; red `#D62828` expresses errors. Light surfaces
  `#F7F8FA`/white with border `#E5E7EC` and muted text `#5B6474`. The arrow recurs as a quiet
  motif in bullets, progress, and calls to action.
- **Typography.** Alexandria for interface and Arabic text; Readex Pro for numerals and tabular
  data; Noto Sans Arabic embedded in the PDF renderer. Generous Arabic line-height; no letter
  spacing on Arabic text.
- **Layout.** RTL-first with full logical-property discipline; LTR English is the mirror. Mobile
  and desktop are designed as siblings: each layout is composed intentionally for its format —
  the mobile live-CV bar/sheet and the desktop side-by-side pane are equal citizens specified
  together.
- **Motion.** Purposeful and restrained: content rising into place as it is created, a smoothly
  filling completeness indicator, streamed text, shimmer on loading surfaces. Every animation
  respects reduced-motion preferences. Motion communicates progress — the product feels alive
  because it is visibly working.
- **Accessibility.** WCAG AA contrast throughout (amber is used for fills, borders, and icons
  with navy text — body text on white remains navy or muted), 44px touch targets, visible focus,
  full keyboard operability, screen-reader labels in both languages.

## 8. Trust, privacy, and compliance (PDPL)

- Consent is captured explicitly at account creation, with a concise processing notice at the
  anonymous entry point. Consent timestamps are stored.
- Data residency: all user data lives in the Kingdom (Firestore region `me-central1`, Dammam).
- Data minimization: Light collects only what the product uses. Contact details are visible to
  employers only within the defined matching flows, and the job seeker's UI states this clearly.
- User rights: profile data is viewable, correctable, and deletable through a server-mediated
  account-deletion flow.
- Identity integrity: the server is the sole authority for identity fields (name, phone, email,
  gender, nationality); AI output and client requests carry profile content only, enforced by
  schema at every boundary.
- All AI-generated JSON is schema-validated before storage; failed validation triggers a bounded
  retry and never persists.

---

# Part II — Technology

## 9. Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | **Next.js (latest stable, App Router) + React + TypeScript strict** | One codebase for SSR, streaming route handlers, and the client; first-class Vercel deployment |
| Styling | **Tailwind CSS + shadcn/ui primitives (owned and themed)** | Token-driven design system, RTL logical properties, full ownership of components |
| AI | **Google Gemini 2.5 Flash** (chain: `gemini-2.5-flash` → `gemini-flash-latest` → `gemini-2.0-flash`) | Best Arabic quality per cost with streaming, native PDF & audio understanding (one API for text, uploaded CVs, and voice notes), structured output |
| Embeddings | **Gemini `text-embedding-004`** (768-d) | Matching similarity at negligible cost; generated once per material change and stored with the document |
| Auth | **Firebase Authentication** — anonymous first, phone number linked at account creation | Enables the value-before-registration flow natively; phone becomes the persistent identifier |
| Database | **Cloud Firestore, region `me-central1`** | In-Kingdom residency (PDPL), realtime listeners for live surfaces, security rules for owner-scoped access |
| Files | **Firebase Storage** | Uploaded CVs and generated assets, same residency |
| PDF | **Cloud Run + Puppeteer** rendering service; Next.js route as a thin authenticated proxy | Print-perfect Arabic shaping requires a real browser engine; Cloud Run scales to zero |
| Hosting | **Vercel** | Streaming-friendly serverless, preview deployments, CDN |
| Email | **Resend** | Transactional notifications from M4 |
| Push | **Firebase Cloud Messaging** | Browser push from M4 |
| Analytics | **GA4** + structured server logs | Funnel measurement against §17 metrics |
| Testing | **Vitest** (pure logic) + **Playwright** (golden-path E2E on production builds) | The golden paths are executable acceptance tests |

**Environment:** `GEMINI_API_KEY`, `FIREBASE_SERVICE_ACCOUNT_JSON` (single line), seven
`NEXT_PUBLIC_FIREBASE_*` values, `PDF_SERVICE_URL`, `RESEND_API_KEY` (M4). All secrets live in
environment configuration; none are ever committed.

## 10. AI architecture

**One engine, two products.** A single conversational-extraction engine powers both the CV
builder and the job-post builder, parameterized by a document schema (CV or job post), a system
prompt, and a completeness model.

**The turn pipeline.**

```
client ──(SSE)── POST /api/turn
  1. verify token · rate-limit · validate body (Zod)
  2. load document state + recent conversation from Firestore
  3. ONE streaming Gemini call:
       system prompt (compact, cached) + state snapshot + recent turns + user input
       (voice notes and PDFs attach as native media parts on the same call)
  4. the model streams:  reply text  →  then a fenced JSON state block
     • reply tokens forward to the client as they arrive
     • the state block is parsed, schema-validated (strict, identity-free),
       merged idempotently, completeness recomputed server-side
     • CV-delta events stream to the client so sections land visibly
  5. persist transactionally (messages + state + completeness), off the
     client's critical path
```

- **Structured streaming:** the client receives typed SSE events — `token` (reply text),
  `state` (validated document delta), `meta` (completeness, open placeholders) — so the interface
  can animate the reply and the live document independently.
- **Validation:** every state block is parsed against a strict Zod schema that contains no
  identity fields; a failed parse triggers one corrective re-ask inside the same request, after
  which the turn degrades gracefully to reply-only with state unchanged.
- **Readiness:** the server owns the completeness model (a deterministic, tested function over
  the document state). Model judgment is advisory.
- **Document finalization:** when the user downloads or publishes, a dedicated generation call
  composes the polished bilingual document from the accumulated state (higher output budget,
  same validation discipline). It runs while the user completes account creation, so the result
  feels instant.
- **Model economics:** turn calls and finalization run on Flash-class models; embeddings are
  generated once per material update; matching runs entirely without model calls (see §11).
  Per-user rate limits: 20 turns/minute, 5 PDF renders/minute.
- **Prompt system:** versioned prompt modules per product surface (CV consultant, job-post
  consultant, finalizers), each carrying the voice standard (§6), the extraction and
  placeholder rules (§5), and few-shot exemplars including the canonical golden conversation
  (§16). Prompts live in code, reviewed like code.

## 11. Matching architecture (deterministic core)

Matching runs as an event-driven background process on publish/activation events, with zero
model calls per match:

1. **Hard filters** via Firestore queries: city or relocation willingness, employment type,
   work arrangement, minimum language requirements.
2. **Weighted scoring** over the filtered set: skills similarity (cosine over stored embeddings,
   35%), experience relevance (30%), education fit (15%), preference alignment (10%), profile
   quality and freshness (10%).
3. **Boosts:** Saudization boost (×1.15, capped at 100) for Saudi candidates when the employer's
   Nitaqat category is Yellow or Red — always visible and labelled in the match card; freshness
   boost for new profiles decaying over 14 days.
4. **Fairness constraints:** a candidate holds at most 10 open matches at a time, one match per
   candidate-job pair, distributed across employers.
5. **Explanations** are template-composed from the score components in both languages.

## 12. Engineering standards

- TypeScript strict; every AI and client payload validated with Zod at the boundary.
- Firestore security rules: owner-scoped documents; server-only writes for identity, matching,
  and derived fields; rules covered by emulator tests.
- The golden paths (§16) are Playwright suites run against production builds; pure logic
  (completeness, scoring, schema validation, i18n utilities) carries exhaustive Vitest coverage.
- Conventional Commits on `main`, small and reviewable; every milestone ends runnable
  (`npm run build && npm start`) and is demonstrated on a production build.
- Performance discipline: streamed first content ~1–2s; interface acknowledgment of any action
  under 300ms; Firestore writes off the interactive path; bundle size budgeted per route.
- Observability: structured server logs for every AI call (model, latency, validation outcome,
  retry) and every matching run; GA4 events mapped to §17.

---

# Part III — Roadmap

Milestones are complete, sequential slices; each ends with a production-build demonstration
against its acceptance criteria and the founder's sign-off. The golden-path tests accumulate —
every milestone keeps all previous ones green.

## M0 — Foundation & design system (~1 week of build effort)

**Scope:** fresh repository; Next.js + TypeScript strict + Tailwind scaffold with RTL root;
design tokens from §7 as CSS variables; owned shadcn/ui primitives themed to Light (buttons,
inputs, cards, sheets, chips, toasts, skeletons, tabs); the logo components; the two-door landing
page (professional copy per §6, both doors leading to functional M1/M2 surfaces as they arrive);
Firebase wiring (anonymous auth, Firestore `me-central1`, security-rule baseline); the streaming
`/api/turn` skeleton with Gemini connectivity, validation harness, and rate limiting; CI-grade
scripts (typecheck, lint, test, build) and the Playwright harness.
**Acceptance:** production build renders the landing and a component showcase flawlessly in RTL
on mobile and desktop; a stub conversation streams end-to-end through the full validation
pipeline; all checks green.

## M1 — The job seeker experience (the wedge)

**Scope:** the complete §4.1 experience —
- The builder with the live CV: side-by-side (desktop) and summary-bar/sheet (mobile) composed as
  sibling designs; streamed replies; sections landing visibly; elevation with visible original
  phrasing; labelled skill suggestions with one-tap confirmation; amber placeholders with
  examples; tap-to-answer chips; completeness indicator; «ماذا تبقى؟» enumeration.
- Inputs: free text, paste, PDF upload (native Gemini document understanding), voice note
  (native Gemini audio understanding).
- Value-first account creation at download/save with prefill and per-field reasons; PDPL consent;
  phone linked to the anonymous account.
- The CV product: bilingual sections, four templates, six themes + custom, in-place editing,
  Cloud Run PDF with verified Arabic typography.
- The dashboard with truthful pre-matching status; full session persistence.
**Acceptance:** the golden conversation (§16) passes as a Playwright suite on a production
build — from first message to downloaded bilingual PDF in under 3 minutes with ≤10 user actions;
the founder walks the same path by hand and signs off on feel, voice, and speed.

## M2 — The employer experience

**Scope:** the complete §4.2 pre-matching experience — the employer door, the live job-post
builder on the shared engine (bilingual post assembling in view, editable everywhere,
placeholders, salary guidance as editable suggestion), publish with value-first account/company
creation (including optional Nitaqat category with a one-line explanation of its later benefit),
the job management board, and employer dashboard.
**Acceptance:** one sentence («أحتاج كاشير لفرعنا في الرياض، دوام كامل، يفضل إجادة الإنجليزية»)
becomes a published, professionally worded bilingual job post on a production build in under
2 minutes; editing and republishing work; the founder signs off.

## M3 — Matching & the marketplace moment

**Scope:** §11 in full — embedding generation on activation/material update; the matching
pipeline with boosts, fairness, and bilingual explanations; employer match lists with score
breakdowns, Saudization badges, and contact actions; one-tap invite-to-apply and one-tap
interest; status trails on both sides; the job seeker's matches surface; matching language
switched on across the product (replacing the pre-launch status); contact-visibility rules
enforced and stated in the UI.
**Acceptance:** with seeded profiles and jobs in a test project, publishing a job produces
correctly ranked, explained matches in exact-number unit tests and on screen; invitations and
interest flow end-to-end between two real sessions; Nitaqat boost demonstrably reorders and
labels affected matches; the founder signs off on the two-sided flow.

## M4 — Notifications & engagement

**Scope:** §4.3 — FCM browser push and Resend email with per-channel opt-in captured in context;
notification composition in both languages; daily digest consolidation; deep links; notification
preferences on both dashboards; freshness nudges for aging profiles.
**Acceptance:** a new match triggers correctly localized push and email to an opted-in test
account with working deep links; opt-out is immediate and respected; delivery is observable in
logs.

## M5 — Nitaqat intelligence & employer growth

**Scope:** the Saudization layer as a first-class employer feature — company Nitaqat category
with plain-language guidance, hire-impact preview per candidate («توظيف هذا المرشح يحسّن نسبة
التوطين لديك»), Saudization filters and reporting on the employer dashboard; job-post compliance
hints during generation.
**Acceptance:** an employer with a Yellow category sees the boost, the labels, and a correct
hire-impact preview across the product; guidance copy approved by the founder.

## M6 — Monetization & scale readiness

**Scope:** the revenue layer on the proven marketplace — employer free tier (limited active
posts), contact-reveal subscription, premium post placement; billing integration; admin
analytics against §17; performance/cost review (embedding volumes, Firestore query patterns,
model spend per completed CV/hire) with a scaling plan for the first 50K profiles.
**Acceptance:** an employer can subscribe, reveal, and manage billing in production; unit
economics per hire are measured and reported; founder signs off on pricing presentation.

---

# Part IV — Reference

## 16. The golden conversation (canonical acceptance fixture)

**User (message 1):** «باقي ادرس في جامعة الملك سعود. تخصصي ادارة اعمال. باقي لي سنة واتخرج ان
شاء الله في سنة 2026 بديت الجامعة في سنة 2021 واشتغلت في جرير لمدة سنة. من سنة 2024 شهر 1 الى
2025 شهر 2. كبائع وحبيت الشغل هناك مره. لأني كويس مع العملاء والحمدلله حققت التارقت اكثر من مره.»

Expected in one turn: education (بكالوريوس إدارة أعمال، جامعة الملك سعود، 2021 → متوقع 2026،
طالب حالياً) and experience (بائع، مكتبة جرير، 2024-01 → 2025-02) land in the CV; the
achievement is elevated professionally in both languages with the original phrasing visible;
customer-facing skills appear as labelled suggestions; placeholders appear for language level,
certifications, and target role; the streamed reply reflects substance and asks only for the
one or two highest-value gaps, with tap-to-answer options for language level.

**User (message 2):** «كويس بالانقليزي. وكل اللي ذكرته من المهارات ينطبق علي. احب الالقاء وكويس
في بوربوينت احب اسوي عرض واشرح عن موضوع.»

Expected: English proficiency recorded; suggested skills confirmed; presentation and PowerPoint
skills added; completeness crosses readiness once the target role is provided; download becomes
prominent; account creation completes and the bilingual PDF is delivered.

## 17. Success metrics

| Area | Metric | Target |
|---|---|---|
| Wedge | First message → completed CV | ≥ 70% |
| Wedge | Median time / actions to CV | < 3 min / ≤ 10 actions |
| Wedge | PDF downloads with ≤ 2 manual edits | ≥ 80% |
| Retention | Profiles contactable 30 days after creation | ≥ 60% |
| Employer | One sentence → published post | ≥ 70% |
| Marketplace | Matches acted on by employers (view → contact) | ≥ 30% |
| Marketplace | Median time from match to first contact | < 48h |
| North star | Successful hires per month | growth |

## 18. Glossary of shared terms

**Document state** — the accumulating structured profile (CV or job post) built by extraction.
**Placeholder** — an in-document, labelled open item with an example, fillable any time.
**Elevation** — rewriting a stated fact to professional register in both languages.
**Labelled derivation** — AI-suggested content traceable to stated facts, confirmed by the user.
**Readiness** — the server-computed completeness threshold that unlocks finalization.
**Golden path** — the scripted end-to-end journey each milestone must pass on a production build.
