/**
 * cv-generation-prompt.ts — the dedicated final-CV generation call (PRD v3
 * §5.2: "CV generation is a separate, single-responsibility call with the full
 * accumulated state — higher quality than asking the chat turn to also emit a
 * polished CV").
 *
 * Input:  the accumulated `PartialCv` state + user context (name, gender).
 * Output: a single polished bilingual `CvSchema` JSON object (jsonMode).
 *
 * The instructions are English; the OUTPUT is bilingual where the schema
 * requires it (professional_summary { en, ar }) and single-language elsewhere
 * (Arabic unless the candidate used English). Identity is NEVER emitted — not
 * even the candidate's NAME in the summary prose: CvSchema carries no name, and
 * the CvCard/PDF render the name from the server-side profile. The summary must
 * describe the candidate's profile in prose WITHOUT naming them.
 */

/** Bump when the generation prompt changes materially (traced alongside output). */
export const CV_GENERATION_PROMPT_VERSION = "2026-07-07.1";

/**
 * The static, cacheable system prompt for the CV-generation call. Carries no
 * per-user data (name/gender/state are appended per request by the builder
 * below), so Gemini can cache it.
 */
export const CV_GENERATION_SYSTEM = `
# TASK — GENERATE THE FINAL BILINGUAL CV
You are Light's CV writer. You are given a STRUCTURED CV STATE accumulated from a
career-consultation conversation. Produce ONE polished, professional, bilingual
CV as a single JSON object. Do NOT converse — output JSON only.

# LANGUAGE
- "professional_summary" is bilingual: { "en": "...", "ar": "..." }. The Arabic
  is a professional Saudi register (not folksy). Both languages say the same
  thing, each idiomatic in its own language (not a literal translation).
- All OTHER free text (descriptions, achievements) is a SINGLE string in the
  candidate's primary language — Arabic unless the state is clearly English.

# PROFESSIONAL SUMMARY (3–4 sentences, each language)
Write a specific, grounded 3–4 sentence summary that references the candidate's
field, institution, key skills, and target role. Ground every sentence in the
state — NO generic filler ("hardworking team player seeking opportunities").
IDENTITY RULE: do NOT write the candidate's NAME in the summary (or anywhere).
The name is server-owned and rendered separately. Refer to them by profile
("خريج إدارة أعمال من جامعة الملك سعود مع خبرة بيع..." — no personal name).

# SKILLS
- Ensure at least 6 skills. Fill in a level (1–5) and a category
  ("technical" | "soft" | "operations" | "language") for each. Preserve the
  "inferred" flag from the state (true for inferred, false for stated). If the
  state left level/category blank, choose a reasonable value.
- "skills[].name" is a PLAIN STRING, never an { en, ar } object.

# EXPERIENCE / EDUCATION / OTHER
- Fill required fields the schema needs. If the state omits a city, use a
  reasonable single value or omit it only if the schema allows. Write a concise
  "description" for each experience grounded in the role. Do NOT invent
  employers, dates, GPAs, or achievements that aren't in the state.
- education[].start_year is required by the schema; if the state gave only an
  end year, keep both when known, else supply the known year.
- languages[].proficiency ∈ "basic" | "conversational" | "fluent" | "native".

# OUTPUT PROTOCOL (STRICT)
Output a SINGLE JSON object and NOTHING else. Shape:
{
  "professional_summary": { "en": "...", "ar": "..." },
  "education": [ { "institution": "...", "degree": "...", "field": "...",
    "start_year": 2021, "end_year": 2026, "achievements": [] } ],
  "experience": [ { "company": "...", "title": "...", "city": "...",
    "start_date": "2024-01", "end_date": "2025-02", "is_current": false,
    "description": "...", "achievements": [] } ],
  "projects": [],
  "skills": [ { "name": "خدمة العملاء", "level": 4, "category": "soft", "inferred": true } ],
  "languages": [ { "language": "العربية", "proficiency": "native" } ],
  "certifications": [],
  "volunteer_work": []
}
Omit optional fields you don't know (gpa, end_date, url) — never null/""/placeholder.
"education" needs ≥1 entry; "skills" needs ≥6; "languages" needs ≥1.

# IDENTITY EXCLUSION (SECURITY — ABSOLUTE)
NEVER include name, phone, email, uid, role, created_at, or updated_at anywhere
in the JSON — not as keys, not in the summary prose. The server attaches
identity from the authenticated profile. Any identity key rejects the CV.
`.trim();

export interface CvGenerationContext {
  name: string;
  gender: "male" | "female";
}

/**
 * Build the per-request USER-content message for the generation call: the
 * accumulated state serialized as JSON plus a minimal gender/language note.
 * The candidate's NAME is intentionally NOT included — the summary must not
 * name them, and the server owns identity.
 */
export function buildCvGenerationRequest(
  state: unknown,
  context: CvGenerationContext,
): string {
  const genderNote =
    context.gender === "female"
      ? "The candidate is female — use feminine Arabic forms where grammatically relevant in free text."
      : "The candidate is male — use masculine Arabic forms where grammatically relevant in free text.";

  return [
    "Generate the final CV from this accumulated CV STATE. Do not add facts that",
    "are not present in it. Remember: no candidate name anywhere in the output.",
    genderNote,
    "",
    "CV STATE (JSON):",
    JSON.stringify(state ?? {}, null, 2),
  ].join("\n");
}
