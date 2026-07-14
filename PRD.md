# Light — Product Requirements Document

**Version:** 4.0
**Date:** July 8, 2026
**Author:** Abdulaziz Aljandal
**Status:** Living Document — supersedes v3. Written with the founder after v2/v3 user testing.

---

## 1. The thesis (one line)

**Light is the ZipRecruiter of Saudi Arabia — and it starts by being the most convenient way in
the Kingdom to get a professional bilingual CV and get hired.**

Not "a chatbot that builds CVs." Not "an AI consultant experience." A **convenience machine**:
the user does the *least possible work* and gets the *best possible outcome*, faster than any
alternative (Bayt forms, CV writers, LinkedIn, Word templates). Conversation is just one input
method — the product is the outcome.

### What v2/v3 got wrong (recorded so we never repeat it)

1. **Built a conversation, not a convenience.** The chat was the product; the CV was the reward at
   the end. Wrong way around: the CV is the product and it must materialize *while you talk*, not
   after ("nothing smart about it" = "I talk, it just records").
2. **Blocking, non-streaming turns** (~5–9s of staring at typing dots) killed any feeling of
   intelligence. Speed IS the perceived intelligence.
3. **Both PRDs were written by inference, not with the founder.** v4's requirements below come
   from explicit founder decisions (2026-07-08): smart = convenient + proactive + instant ·
   benchmark = ZipRecruiter for KSA · core = CV builder done right first · speed = streaming
   instant-feel · zero loyalty to existing code.

---

## 2. Experience principles (every feature is judged against these)

1. **Responsive — but never dumb-fast.** Intelligence and output quality are never sacrificed for
   latency. The commitment is *visible progress*: something acknowledges every user action
   **< 300ms**, replies stream as they're written, and the live CV fills while the model works —
   so a genuinely deep turn may take a few seconds, but the product never feels frozen or shallow.
2. **Effortless.** Count the user's actions and minimize ruthlessly. Paste a paragraph, send a
   voice note, upload an old CV, or just type freely — all roads work. Confirmations are one-tap
   chips, never "please type your answer". Target: **signup → finished CV in under 3 minutes and
   under 10 user actions.**
3. **Proactive — without assuming.** Light acts without being asked: the CV assembles itself live
   and weak phrasing gets upgraded automatically. But Light **never invents facts**: anything
   missing or uncertain becomes a *flagged placeholder* in the CV for the user to fill whenever
   they want — not a fabricated default and not a one-by-one interrogation. Later (M2): jobs come
   to you, employers get invited to you.
4. **Honest & Saudi-professional.** Natural Saudi register, professional-warm, zero cheese
   (banned: حياك الله يا بطل، يا وحش، والله إنك مبدع). Never fabricates facts; upgrades phrasing,
   not truth. Bilingual by construction; Arabic is the default of every surface.

---

## 3. The signature interaction: the CV that builds itself

**Split-screen (desktop) / peek-card (mobile): chat on one side, the live CV on the other.**

- The user talks/pastes/uploads. **Within the same turn, extracted facts visibly land in the CV** —
  the education block fills in, the Jarir experience appears with dates, skills pop in as chips
  with a subtle highlight. The user *watches Light work*.
- The AI's streamed reply is short and secondary ("أضفت خبرتك في جرير مع إنجاز التارقت — تبقى بس
  مستواك بالإنجليزي"). The CV filling up IS the main feedback channel.
- Every AI-written line in the CV is editable in place (tap → edit). No separate "review" phase.
- A completeness meter on the CV (amber, animated) replaces all "are we done?" questions. When it
  crosses the threshold, the Download PDF button lights up — no ceremony, no "generation moment".
- Inferred content is visually marked (subtle "AI" chip) until the user confirms or edits it —
  transparency instead of interrogation.

**The 3-minute golden path (M1's acceptance test):**

1. Landing → «سوّ سيرتك بـ٣ دقايق» → register (name, phone, city, gender, nationality, consent).
2. One screen: «كلمنا عن نفسك — اكتب براحتك، الصق من ملف قديم، أو ارفع سيرتك» (textarea + upload +
   mic in one composer).
3. User dumps the Jarir paragraph (or uploads a PDF). CV visibly assembles < 5s. Light streams one
   short reply confirming + asking the 1–2 real gaps as tap-chips where possible
   (مستوى الإنجليزي: ممتاز / جيد / مبتدئ).
4. One or two more exchanges max → completeness threshold crossed → PDF downloads in one tap.
   Bilingual toggle, 4 templates, 6 themes on the same screen.

## 4. Intelligence spec (what "smart" concretely means in M1)

1. **Total extraction** — every fact from any input lands in the structured CV state in one pass
   (already proven with the golden Jarir conversation; kept as the regression test).
2. **Writing upgrade** — Light doesn't transcribe, it *elevates*: "كنت كويس مع العملاء وحققت
   التارقت" becomes a professional achievement bullet (AR + EN) with action verbs and numbers
   where the user gave them. The delta between what the user typed and what lands in the CV is
   the visible proof of intelligence.
3. **Skill inference with one-tap confirmation** — retail year ⇒ خدمة العملاء، البيع، الإقناع،
   العمل تحت الضغط، POS as pre-checked chips the user can untick; never a typing task.
4. **Flags, not assumptions** — Light never invents a fact the user didn't state. Missing or
   uncertain fields appear in the live CV as flagged placeholders («ناقص: مستواك بالإنجليزي»،
   «أضف شهاداتك إن وجدت») that the user fills whenever they want. Only *derivations from stated
   facts* are allowed (e.g. inferred skills from a stated job) and those always carry the "AI"
   chip + one-tap confirm.
5. **Gap-aware on demand** — asks only the 1–2 gaps that genuinely block a great CV, bundles
   related gaps, never re-asks, and stops when the CV is good enough. When the user asks
   «وش باقي؟ / what else؟» (or similar), Light lists every open flag with a concrete suggestion
   for each.

Explicitly **out of M1's intelligence scope** (they are M2/M3, don't fake them in M1): salary
benchmarks, market-demand positioning, interview prep, application tracking.

## 5. Performance budget (hard requirements, tested before any ship)

**Quality precedes latency:** these budgets are met through architecture (streaming, visible
progress, background work) — never by weakening the model, shortening its reasoning, or trimming
what it extracts/writes. If a budget and quality ever genuinely conflict, quality wins and the
budget is renegotiated with the founder.

| Metric | Budget |
|---|---|
| UI acknowledgment of any user action | < 300ms (hard) |
| First streamed token of an AI reply | ~1–2s target — perceived responsiveness, not a quality cap |
| Full turn (reply complete + CV updated) | a few seconds is fine **with visible progress** (streaming text / CV blocks landing) |
| Upload → first extraction visible | < 8s with progressive display |
| PDF download click → file | < 5s |
| Registration → CV done (golden path) | < 3 min, ≤ 10 user actions |
| Production build (`next build`) always | dev-mode latency never demoed again |

Engineering implications (M1): SSE/streaming responses from `/api/chat`; one model call per turn
that streams the reply text first and emits the state delta; model/settings chosen for the best
extraction + writing quality (latency is handled by streaming and the live CV, not by a weaker
model); no second blocking "CV generation" call — the CV is continuously assembled, with an
optional background polish pass that never blocks the user; optimistic UI everywhere; Firestore
writes off the critical path (fire-and-forget with retry).

## 6. Scope

### M1 — the best CV builder in KSA (rebuild against this PRD)

- The split-screen live-CV experience (§3) with streaming turns (§5).
- Inputs: free text · paste · PDF upload · **voice note** (browser mic → transcription; if this
  slips, it slips to M1.5 — the composer is designed for it from day one).
- Bilingual CV (AR/EN), 4 templates, 6 themes + custom, in-place editing, PDF (existing Cloud Run
  service — kept).
- Dashboard: CV status, completeness, «ملفك جاهز للاكتشاف» (matching promised, arrives M2).
- Registration + PDPL consent (kept as-is — it passed testing).
- Brand v3 (navy/amber, logo, dark landing) is kept; landing headline shifts to the convenience
  promise: «أفضل وأسرع طريقة تسوي فيها سيرتك — بالعربي والإنجليزي، بـ٣ دقايق».

### M2 — the ZipRecruiter mechanics (the marketplace)

- Recruiter side: one-line brief → bilingual job post → publish.
- Matching engine (deterministic-first design from v2 §7 — still the right architecture):
  hard filters → weighted scoring on stored embeddings → Nitaqat/freshness boosts → template
  explanations. Zero LLM cost per match.
- **Proactive delivery, ZipRecruiter-style:** candidates get matched-job notifications with
  one-tap «مهتم» (apply-with-profile); recruiters get ranked candidates AND can one-tap
  «ادعُ للتقديم» (invite-to-apply); both sides see status ("شاهد ملفك", "تمت دعوتك").
- Notifications: FCM + email. Nitaqat end-to-end (badges, boost, hire-impact).

### Later (M3+)

WhatsApp channel, salary benchmarks + market positioning, interview prep, application tracking
funnel, contact-reveal monetization, enterprise.

## 7. What we keep vs. rebuild (code triage — PRD-first decision 2026-07-08)

**Keep (fits v4):** Firebase/auth/identity-integrity foundation, Zod schema family + cv_state
extraction architecture, registration + consent, `services/pdf` (verified Arabic rendering),
firestore.rules, brand system + logo, dashboard bones, test suite (271 green).
**Rebuild:** `/api/chat` as a streaming endpoint; the chat page into the split-screen live-CV
experience; prompt slimmed and re-tuned for extraction + writing-upgrade + chip-confirmations.
**Delete:** the "generation moment" (separate CV call as a user-visible step), any remaining
turn-count logic.

## 8. Unchanged foundations (from v2/v3, still authoritative)

Stack (Next.js 14 · TS strict · Tailwind RTL · Gemini 2.5 Flash chain · Firestore me-central1 ·
Cloud Run PDF · Zod 4 · Vercel) · security posture (server-owned identity, validated AI output,
owner-only rules, rate limits, PDPL) · Nitaqat spec · brand tokens (navy #14213D / amber #FCA311)
· Saudi cities · CV templates · env/config (project light-platform-8a089).

## 9. Success metrics (v4)

- **Golden-path completion:** ≥ 70% of users who send one message finish a CV. Median < 3 min.
- **Perceived responsiveness:** every turn shows visible progress within ~1–2s in production
  (streamed text or CV blocks landing) — measured, not vibes. Quality is never traded for this.
- **Effort:** median user actions to finished CV ≤ 10; median user-typed messages ≤ 3.
- **Quality:** ≥ 80% of users download the PDF without editing more than 2 fields.
- North star (unchanged): successful hires/month once M2 ships.

## 10. Acceptance

M1 v4 ships only when the founder walks the golden path (§3) in a production build and signs off
on all four experience principles. No tag before that.
