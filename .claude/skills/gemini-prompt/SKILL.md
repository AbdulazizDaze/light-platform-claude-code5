---
name: gemini-prompt
description: Use when building or editing Gemini prompts and the callGemini abstraction — base/system prompt, user-context injection, Saudi-dialect behavior, skill inference, pacing, gender awareness, the model fallback chain, and embeddings. Trigger for any AI conversation, CV/job generation, or embedding work.
---

# Gemini Prompt Architecture

The AI layer is the heart of Light. Keep prompts versioned in `lib/ai/prompts/`, and route every call
through `lib/ai/callGemini()`.

## Prompt structure
- **Base prompt** (~7K tokens, static + cacheable): identity ("Light — an AI career consultant, not a
  chatbot"), conversation rules, data requirements, skill-inference maps (9+ industries), CV format
  spec (see `cv-schema`), quality bars. Do not put per-user data here — keep it cacheable.
- **User context** (dynamic, per request): `name`, `gender` (Arabic grammar), `message_count`
  (pacing), `session_type` (new | returning | cv_upload).

## Required behaviors
1. **Saudi-dialect Arabic** — professional undertone; never MSA/Egyptian/Levantine.
2. **Implicit skill inference** — 5–10 skills per stated role, tagged `inferred: true`. Maps cover
   retail, hospitality, tech, marketing, accounting, engineering, healthcare, education, HR.
3. **Professional summary** — 3–4 sentences naming the candidate, university, key skills, aspirations;
   bilingual `{ en, ar }`.
4. **Pacing** — acknowledge each answer specifically before the next question; inject urgency at
   message 8+; force CV production at message 14+.
5. **Gender-aware conjugation** from the profile gender.
6. **CV JSON** validated by `CvSchema` with bounded retry (see `cv-schema`).

## callGemini abstraction (lib/ai/callGemini.ts)
```ts
const CHAIN = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.0-flash"] as const;

export async function callGemini(opts: {
  system: string; messages: {role:"user"|"model"; content:string}[];
  json?: boolean;
}) {
  let lastErr: unknown;
  for (const model of CHAIN) {
    try {
      return await invoke(model, opts);      // provider SDK call isolated here
    } catch (e) { lastErr = e; /* try next model */ }
  }
  throw lastErr;                              // all models failed
}
```
Keep the provider SDK usage inside `invoke()` only, so switching providers is a one-file change
(mitigates the pricing/deprecation risk in PRD §15).

## Embeddings (text-embedding-004, 768-dim)
Generate once on profile/job create or material update; store on the doc. Never per match run.
See `matching-algorithm` for the exact input strings.

## Rules
- No direct SDK calls from routes/components — always `callGemini()`.
- Prompts are builders in `lib/ai/prompts/`, not inline strings in handlers.
- Provide fixture conversations so `qa-test-engineer` can test the validator/retry (never live-model).

## Related
`cv-schema`, `bilingual-content`, `matching-algorithm`, `nitaqat-rules`.
