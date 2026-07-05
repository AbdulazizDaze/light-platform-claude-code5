/**
 * user-context.ts — the dynamic, per-request context appended to BASE_PROMPT.
 *
 * BASE_PROMPT is static + cacheable (no user data). Everything that varies per
 * request lives here: the candidate's name, gender (for Arabic conjugation),
 * session type, and PACING directives derived from the message count.
 *
 * Pure and unit-testable — no I/O, no Gemini call. Identity fields come from the
 * server-side profile (CLAUDE.md §3.4), never the client body; this builder
 * just formats them into a prompt fragment.
 */

/** Message count at/after which the AI is told to start wrapping up. */
export const PACING_URGENCY_AT = 8;

/** Message count at/after which the AI is told to produce the CV NOW. */
export const PACING_FORCE_CV_AT = 14;

export type SessionType = "new" | "returning" | "cv_upload";

export interface UserContextProfile {
  name: string;
  gender: "male" | "female";
  /** Number of messages exchanged so far in this session (drives pacing). */
  messageCount: number;
  sessionType: SessionType;
}

function genderDirective(gender: "male" | "female", name: string): string {
  if (gender === "female") {
    return [
      `The candidate ${name} is FEMALE. Use FEMININE Arabic conjugation`,
      `throughout (e.g. "وش تخصصكِ؟", "درستي وين؟", "أنتِ خريجة؟", "شكراً لكِ").`,
    ].join(" ");
  }
  return [
    `The candidate ${name} is MALE. Use MASCULINE Arabic conjugation`,
    `throughout (e.g. "وش تخصصك؟", "درست وين؟", "أنت خريج؟", "شكراً لك").`,
  ].join(" ");
}

function sessionDirective(sessionType: SessionType, name: string): string {
  switch (sessionType) {
    case "new":
      return [
        `This is a NEW session. Greet ${name} warmly by name in Saudi dialect,`,
        `briefly explain you'll build their CV through a short conversation, then`,
        `ask your first question (current status). Do not dump all questions at once.`,
      ].join(" ");
    case "returning":
      return [
        `This is a RETURNING candidate. Welcome ${name} back briefly — do NOT`,
        `re-ask what you already know. Pick up where the conversation left off and`,
        `fill only the remaining gaps toward a complete CV.`,
      ].join(" ");
    case "cv_upload":
      return [
        `${name} UPLOADED an existing CV. Acknowledge it, analyze its content,`,
        `point out concrete gaps and improvement areas, and ask targeted follow-up`,
        `questions to strengthen it — do not restart from scratch.`,
      ].join(" ");
  }
}

/**
 * Pacing directive based on message count:
 *  - < PACING_URGENCY_AT   → no pacing pressure (natural flow).
 *  - >= PACING_URGENCY_AT   → urgency: wrap up within 2–3 more questions.
 *  - >= PACING_FORCE_CV_AT  → FORCE the CV turn now, from whatever data exists.
 * FORCE takes precedence over urgency.
 */
function pacingDirective(messageCount: number): string | null {
  if (messageCount >= PACING_FORCE_CV_AT) {
    return [
      `PACING — FORCE CV NOW: this conversation has run long enough. On THIS turn,`,
      `generate the CV per the OUTPUT PROTOCOL using whatever data you have`,
      `gathered so far. Infer skills to reach the minimum, keep the JSON valid, and`,
      `do not ask any further questions.`,
    ].join(" ");
  }
  if (messageCount >= PACING_URGENCY_AT) {
    return [
      `PACING — URGENCY: you have gathered a lot already. Wrap up within the next`,
      `2–3 questions, then generate the CV. Prioritize the missing essentials`,
      `(target role, languages, any gap in education) over nice-to-haves.`,
    ].join(" ");
  }
  return null;
}

/**
 * Build the per-request user-context fragment. Callers append this to
 * BASE_PROMPT to form the full system instruction for callGemini().
 */
export function buildUserContext(profile: UserContextProfile): string {
  const { name, gender, messageCount, sessionType } = profile;

  const lines: string[] = [
    "# USER CONTEXT (per request — this candidate, right now)",
    `- Candidate name: ${name} (use it naturally in conversation and in the`,
    `  professional_summary prose — never as a JSON key).`,
    `- Gender directive: ${genderDirective(gender, name)}`,
    `- Session: ${sessionDirective(sessionType, name)}`,
    `- Messages so far: ${messageCount}.`,
  ];

  const pacing = pacingDirective(messageCount);
  if (pacing) {
    lines.push(`- ${pacing}`);
  }

  return lines.join("\n");
}
