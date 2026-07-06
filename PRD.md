# Light — Product Requirements Document

**Version:** 3.0
**Date:** July 7, 2026
**Author:** Abdulaziz Aljandal
**Status:** Living Document — full rewrite superseding v2.0

---

## 0. Why v3 exists (critique of v2)

v2 described the right marketplace but the wrong product mechanics. The built v2 experience failed
user testing on three roots, and v3 is rewritten around fixing them:

1. **Interrogation, not consultation.** v2's AI asked one scripted question at a time and paced the
   conversation by *message count*. Real candidates talk in rich, natural paragraphs — education,
   job history, and self-assessment mixed together. The v3 engine is built on **extraction**: every
   turn, the AI pulls *all* facts from whatever the candidate said, updates a structured CV state,
   and asks only about what is still genuinely missing. Completeness drives the conversation, not
   turn counters.
2. **Cheesy tone.** v2 conflated "Saudi dialect" with folksy filler. v3's voice is a **professional
   career consultant who happens to speak naturally**: measured, specific, encouraging through
   substance ("تحقيق التارقت أكثر من مرة نقطة قوة حقيقية") — never through exclamation marks.
3. **Lifeless design.** v3 adopts the actual Light brand — Oxford Navy + Amber Orange with the
   upward-arrow logomark — and a design language with energy: depth, glow, motion, and confident
   typography. Positioning line: **"Your AI Co-Pilot for the Saudi Job Market"** /
   **"Brightening Careers, Simplifying Hiring."**

**Architecture answer recorded:** CV building does **not** use multiple runtime AI agents. One
model call per turn returns a natural reply *and* a validated structured state update. Multi-agent
orchestration is a *build-time* tool (how we develop), never a runtime cost or complexity.

---

## 1. Executive Summary

Light is an AI-powered recruitment platform purpose-built for Saudi Arabia. Candidates talk to an
AI career consultant in natural Saudi Arabic — the way they'd talk to a trusted advisor — and Light
extracts a professional bilingual CV from the conversation, builds a discoverable profile, and
matches them with opportunities automatically. **Job hunting becomes passive: create your profile
once, and opportunities find you.**

For recruiters (SMBs without HR departments), Light turns a one-line role description into a
professional bilingual job post and returns pre-matched, ranked candidates with explainable scores
and Nitaqat (Saudization) awareness.

Both sides ship together as one marketplace. North-star metric: **successful hires facilitated per
month.**

---

## 2. Problem (unchanged in substance from v2)

- **Candidates** — CV creation is a barrier (especially bilingual); job boards reward persistence
  over quality; fresh graduates can't articulate the skills they actually have (a year at Jarir *is*
  customer service, sales, targets, pressure — but a thin CV says "بائع").
- **SMB recruiters** — no HR function; screening is manual; job descriptions are an afterthought;
  Nitaqat compliance is tracked in someone's head, if at all.

## 3. Vision & Mission

**Vision:** the default hiring infrastructure for Saudi Arabia's SMB market.
**Mission:** perfect matches through conversation — no forms, no searching.

## 4. Target market (unchanged)

Launch: Riyadh, Jeddah, Dammam + top 15 Saudi cities. Segments: fresh graduates (~200K/yr),
career switchers, part-time/gig, returnees. Employers: SMBs 5–50, startups, franchises.

---

## 5. The Candidate Experience (v3 core)

### 5.1 The conversation — extraction, not interrogation

The AI is **مستشار مهني** — a career consultant, not a form with a face. The defining behaviors:

1. **Extract everything, every turn.** Whatever the candidate says — one word or three paragraphs —
   the engine captures *all* facts into the CV state: education, dates, employers, roles, durations,
   self-described strengths, languages, implied skills.
2. **Reflect professionally, briefly.** One or two sentences acknowledging the *substance* of what
   was shared, showing it was understood ("سنة كاملة في جرير مع تحقيق التارقت أكثر من مرة —
   هذي خبرة بيع حقيقية تستاهل تنكتب صح."). Never generic praise, never exclamation-mark energy.
3. **Ask only real gaps — max one or two questions per turn.** If the candidate already said when
   they graduate, never ask again. Questions are chosen from the *missing critical fields*, most
   valuable first. Bundling two tightly-related short questions is allowed ("وش مستواك بالإنجليزي؟
   وفيه لغات ثانية؟").
4. **Infer skills silently, confirm cheaply.** A retail year implies customer service, sales,
   working under pressure, POS familiarity, targets. The AI proposes these as a confirmable set
   ("بضيف لك مهارات تجي طبيعية من شغلك في جرير: خدمة العملاء، الإقناع والبيع، الشغل تحت الضغط —
   تشوفها تمثلك؟") rather than making the candidate list them.
5. **Completeness-driven ending.** When the state covers: education, ≥1 experience OR projects,
   ≥6 skills, languages with levels, and a target role — the AI proposes generating the CV. A soft
   guard (~20 turns) exists only as a safety valve, never as visible pressure.
6. **Language mirroring.** Natural Saudi Arabic by default; mirrors English if the candidate
   writes English. Register: professional-warm. **Banned:** حياك الله يا بطل، ما شاء الله عليك،
   يا وحش، والله إنك مبدع — and any emoji spam.

**Canonical example (golden test — the engine must handle this):**

> **Candidate:** «باقي ادرس في جامعة الملك سعود. تخصصي ادارة اعمال. باقي لي سنة واتخرج ان شاء الله
> في سنة 2026 بديت الجامعة في سنة 2021 واشتغلت في جرير لمدة سنة. من سنة 2024 شهر 1 الى 2025 شهر 2.
> كبائع وحبيت الشغل هناك مره. لأني كويس مع العملاء والحمدلله حققت التارقت اكثر من مره.»
>
> Expected extraction (single turn): education = بكالوريوس إدارة أعمال، جامعة الملك سعود، 2021 →
> متوقع 2026 (طالب حالياً) · experience = بائع، مكتبة جرير، 2024-01 → 2025-02 · strengths stated =
> التعامل مع العملاء، تحقيق الأهداف · inferred skills = خدمة العملاء، البيع، الإقناع، العمل تحت
> الضغط، أنظمة نقاط البيع · status = طالب.
>
> Expected reply shape: short professional reflection + one or two precise gap questions (English
> level? target role?) — **not** a re-ask of anything above.
>
> **Candidate (later):** «كويس بالانقليزي. وكل اللي ذكرته من المهارات ينطبق علي. احب الالقاء وكويس
> في بوربوينت احب اسوي عرض واشرح عن موضوع.»
>
> Expected: English = جيد (conversational) · confirms inferred skills · adds العرض والإلقاء،
> PowerPoint، الشرح والتواصل. State likely crosses the readiness threshold → propose the CV.

### 5.2 Turn engine (runtime architecture)

```
POST /api/chat { message }
  → load session (messages + cv_state) + server-side user profile (name, gender)
  → ONE Gemini call: system prompt + cv_state snapshot + recent history + message
     returns JSON: {
       reply: string,                 // natural Arabic (or mirrored English)
       quick_replies: string[],       // 0–3, only when genuinely useful
       state: PartialCv,              // FULL updated state (idempotent, not a diff)
       ready: boolean                 // model's judgment that state is CV-ready
     }
  → Zod-validate (PartialCvSchema, .strict, identity fields forbidden)
     invalid → one corrective retry → else degrade to reply-only
  → server merges state, recomputes completeness deterministically
  → ready && server-side completeness check passes
        → second dedicated call: generate final bilingual CV (CvSchema, retry ≤1)
        → CvCard renders inline; profile becomes discoverable
  → persist transactionally (messages + cv_state + profile merge)
```

- The **server**, not the model, is the authority on readiness (deterministic checklist).
- CV **generation** is a separate, single-responsibility call with the full accumulated state —
  higher quality than asking the chat turn to also emit a polished CV.
- Identity (name/phone/email) never appears in model output; server injects it at render time.
- CV upload path: same engine; the PDF is analyzed into an initial `cv_state` + a gap-focused
  opening reply ("قريت سيرتك — قوية بالخبرة، بس ناقصها مهارات تقنية ولغات. خلنا نكملها.").

### 5.3 The rest of the candidate journey

Register (name, phone, city, gender, nationality + PDPL consent) → conversation → inline CvCard
(AR/EN) → customization page (4 templates, 6 themes + custom, live preview) → Arabic-perfect PDF
(Cloud Run + Puppeteer) → dashboard (completeness ring, discoverability status, quick actions) →
passive matching + notifications (M2). Sessions persist; returning users resume where they left.

---

## 6. The Recruiter Experience (M2 — unchanged in scope)

One-line brief → bilingual job post (title, description, responsibilities, requirements, skills,
benefits, salary guidance, Nitaqat compliance flags) → publish → ranked matched candidates with
explainable scores, Saudization badges, and direct contact info. Job management: edit/pause/close.

## 7. Matching Engine (M2 — design retained from v2, still correct)

Event-driven, deterministic-first, zero-cost per match:
- **Hard filters** (Firestore queries): city/relocation, language minimums, job type, arrangement.
- **Soft scoring** (weighted 0–100): skills similarity 35% (cosine on `text-embedding-004`, 768-d,
  embedded once per material change, stored in Firestore), experience relevance 30%, education fit
  15%, soft preferences 10%, profile quality 10%.
- **Boosts:** Nitaqat 1.15× for Saudi candidates when the company is Yellow/Red (visible, capped,
  logged); freshness 1.1×→1.0 linear decay over 14 days.
- **Fairness:** max 10 active match slots per candidate, no duplicate pairs, ≥5-company diversity.
- **Explanations:** template-based (strengths/gaps/nitaqat_note/component_scores) — never an LLM
  call per match.

## 8. Saudization (Nitaqat) — unchanged

Candidate nationality + Saudization badge; company Nitaqat category; Yellow/Red boost; compliance
flags in job generation; hire-impact preview. This remains the differentiator no competitor offers.

---

## 9. Brand & Design Language (v3 — rewritten)

### 9.1 Identity

- **Logo:** navy wordmark **LIGHT** where the L is a corner bracket with an **amber arrow rising
  through it at 45°** — growth, opportunity, escape from the pile. Logomark = bracket + arrow alone.
- **Tagline:** "Brightening Careers, Simplifying Hiring" · positioning: **"Your AI Co-Pilot for the
  Saudi Job Market"** (Arabic surfaces lead: «مساعدك الذكي لسوق العمل السعودي»).
- **Personality:** confident, energetic, professional. A sharp consultant — not a mascot, not a
  bureaucrat.

### 9.2 Color (authoritative — supersedes all green-primary guidance)

| Token | Hex | Role |
|---|---|---|
| Navy (primary) | `#14213D` | Foundation: headings, dark surfaces, navy sections, wordmark |
| Navy deep | `#0D1730` | Dark-section gradients, footer |
| Amber (accent) | `#FCA311` | **The action color**: primary buttons (navy text on amber), the arrow, highlights, focus rings, AI identity moments |
| Amber deep | `#E08900` | Hover/active on amber |
| Success | `#1F9D66` | Success/positive states ONLY (semantic, not brand) |
| Danger | `#D62828` | Errors, destructive |
| Surface | `#F7F8FA` / white | Light surfaces |
| Muted | `#5B6474` | Secondary text |
| Border | `#E5E7EC` | Hairlines |

Contrast rules: **amber is never body-text on white** — amber fills carry navy text (≈8:1);
amber works as icon/border/glow on navy. Dark navy sections with amber accents are the brand's
signature moment — use for hero, CTAs, and the chat header.

### 9.3 What "alive" means (concretely)

- **Depth:** soft shadows + 1px borders, floating preview cards, subtle amber glow behind hero art.
- **Motion:** fade-rise on message arrival, count-up numbers, arrow micro-animation on CTAs
  (translate up-right on hover), skeletons that shimmer. 150–350ms, ease-out, reduced-motion honored.
- **Typography with conviction:** big confident hero (display/bold), tight professional body.
  Alexandria stays (Arabic-first); Readex Pro for numerals/tabular.
- **The arrow as a system motif:** list bullets, empty states, progress indicators, section accents.
- **RTL-first always.** Arabic is the default language of every surface; English is the mirror.

### 9.4 Key screens (intent)

- **Landing:** dark navy hero with amber glow + live product mockup (an actual mini conversation +
  CvCard rendering), stat strip, how-it-works (3 steps with arrow motif), dual CTAs (candidate
  primary amber; recruiter "قريباً" ghost), trust/PDPL strip.
- **Chat:** focused column on a near-white canvas; navy header with logomark; AI messages carry an
  amber start-accent; user messages navy-tinted; CvCard is the hero moment with a subtle glow when
  it appears.
- **Dashboard/CV page:** cards with real hierarchy, completeness ring in amber, arrow-motif quick
  actions.

---

## 10. Technical Architecture (stack unchanged, engine reworked)

Stack: Next.js 14 App Router · TypeScript strict · Tailwind 3.4 RTL-first · **Gemini 2.5 Flash**
(fallback `flash-latest` → `2.0-flash`) · `text-embedding-004` · Firebase Anonymous Auth (phone as
persistent identifier) · Firestore `me-central1` · Firebase Storage · Cloud Run + Puppeteer PDF
(Vercel route = thin proxy) · Zod 4 on every AI output · FCM + Resend/SendGrid (M2) · Vercel · GA4.

Security posture (unchanged, already reviewed): server owns identity (uid from verified token;
name/gender/phone/email from server profile only); AI JSON validated-or-rejected, never stored raw;
owner-only Firestore rules with client-write allowlist; rate limits chat 20/min/uid, PDF 5/min/uid;
PDPL: consent at registration, in-region storage, minimization, owner-only access.

**Data model deltas from v2:** `chat_sessions/{uid}` gains `cv_state` (PartialCv — the accumulated
extraction) and drops reliance on message-count pacing. Everything else per v2 §9.7 remains.

---

## 11. Success Metrics

Candidate: registration→CV ≥60% · median turns to CV readiness ≤8 (quality of extraction, not a
forced cap) · CV download ≥40% · abandonment <30% · 30-day return ≥20%.
Recruiter (M2): activation ≥50% · post completion ≥70% · match-view ≥30% · first contact <48h.
North star: **hires/month.**

## 12. Competitive line (unchanged)

LinkedIn is overwhelming for fresh graduates; Bayt is a form farm; Hirect isn't Saudi. Light's moat:
natural-Arabic extraction conversation + Nitaqat intelligence + passive matching for the SMB market.

## 13. Revenue (unchanged)

Candidates free forever. Recruiter-side: free tier (3 active posts) → contact-reveal subscription →
premium posts → Nitaqat dashboard → enterprise.

## 14. Rollout

- **M1 (candidate)** — this rewrite's scope: conversation engine v3, brand v3, all candidate
  surfaces. Local browser acceptance by the founder before tagging `v1.0-candidate`.
- **M2 (recruiter + matching)** — per §6–7, after M1 approval. Web-first; the platform is a
  responsive web app.

## 15. Appendices carried forward from v2 (still authoritative)

- CV templates: classic / modern / executive / minimal.
- Saudi cities list (18): Riyadh, Jeddah, Dammam, Makkah, Madinah, Khobar, Dhahran, Tabuk, Abha,
  Taif, Hail, Jazan, Najran, Al Baha, Yanbu, Al Jubail, Buraidah, Khamis Mushait.
- Skill-inference examples (Jarir/barista/developer/accountant) — now applied via extraction.
- Nitaqat categories (Platinum/Green/Yellow/Red).
- Env/config: `GEMINI_API_KEY`, 7× `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_SERVICE_ACCOUNT_JSON`,
  `PDF_SERVICE_URL`, email key (M2). Firebase project `light-platform-8a089`.
- GitHub: `https://github.com/AbdulazizDaze/light-platform-claude-code5` · Firebase console:
  `https://console.firebase.google.com/project/light-platform-8a089`.
