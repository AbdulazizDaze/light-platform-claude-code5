/**
 * user-context.ts — the dynamic, per-request context appended to the
 * consultant system prompt (PRD v3 §5.2).
 *
 * The consultant prompt is static + cacheable (no user data). Everything that
 * varies per request lives here: the candidate's name, gender (for Arabic
 * conjugation), and session type. v3 DELETED message-count pacing entirely —
 * completeness drives the conversation, not turn counters. The only remaining
 * turn-based signal is a SOFT safety note past ~20 turns, so a stuck
 * conversation eventually offers to finish with what it has.
 *
 * Pure and unit-testable — no I/O, no Gemini call. Identity fields come from
 * the server-side profile (CLAUDE.md §3.4), never the client body; this builder
 * just formats them into a prompt fragment.
 */

/** Turn count past which the AI is softly nudged to offer generating the CV now. */
export const SOFT_SAFETY_TURN_THRESHOLD = 20;

export type SessionType = "new" | "returning" | "cv_upload";

export interface UserContextProfile {
  name: string;
  gender: "male" | "female";
  sessionType: SessionType;
  /**
   * Number of messages exchanged so far in this session. Not used for pacing —
   * only to trigger a soft safety note once the conversation has run long.
   */
  turnCount: number;
}

function genderDirective(gender: "male" | "female", name: string): string {
  if (gender === "female") {
    return [
      `The candidate ${name} is FEMALE. Use FEMININE Arabic conjugation`,
      `throughout (e.g. "درستي وين؟", "أنتِ خريجة؟", "خبرتكِ", "شكراً لكِ").`,
    ].join(" ");
  }
  return [
    `The candidate ${name} is MALE. Use MASCULINE Arabic conjugation`,
    `throughout (e.g. "درست وين؟", "أنت خريج؟", "خبرتك", "شكراً لك").`,
  ].join(" ");
}

function sessionDirective(sessionType: SessionType, name: string): string {
  switch (sessionType) {
    case "new":
      return [
        `This is a NEW session with ${name}. Open with a brief, professional`,
        `greeting that invites them to tell you about themselves in their own`,
        `words — do NOT front-load a list of questions. Extract whatever they`,
        `share and reflect it back.`,
      ].join(" ");
    case "returning":
      return [
        `This is a RETURNING candidate, ${name}. The state already holds what you`,
        `know — welcome them back briefly, do NOT re-ask anything in the state,`,
        `and fill only the remaining gaps toward readiness.`,
      ].join(" ");
    case "cv_upload":
      return [
        `${name} UPLOADED an existing CV, already analyzed into the state.`,
        `Acknowledge what's there specifically, point out concrete gaps, and ask`,
        `only about what's missing — never restart from scratch.`,
      ].join(" ");
  }
}

/**
 * Soft safety note past ~20 turns: never visible pressure, just a directive to
 * OFFER finishing with what's gathered. There is NO forced CV generation in
 * v3 — the model still returns a normal turn; readiness is the server's call.
 */
function safetyDirective(turnCount: number): string | null {
  if (turnCount > SOFT_SAFETY_TURN_THRESHOLD) {
    return [
      `SAFETY NOTE: this conversation has run long. If the state is close to`,
      `complete, gently propose generating the CV now with what you have rather`,
      `than opening new lines of questioning. Do not pressure the candidate.`,
    ].join(" ");
  }
  return null;
}

/**
 * Build the per-request user-context fragment. Callers append this to the
 * consultant prompt to form the full system instruction for callGemini().
 */
export function buildUserContext(profile: UserContextProfile): string {
  const { name, gender, sessionType, turnCount } = profile;

  const lines: string[] = [
    "# USER CONTEXT (per request — this candidate, right now)",
    `- Candidate name: ${name}. Use it naturally in conversation — NEVER as a JSON`,
    `  key or anywhere in the state (identity is server-owned).`,
    `- Gender directive: ${genderDirective(gender, name)}`,
    `- Session: ${sessionDirective(sessionType, name)}`,
  ];

  const safety = safetyDirective(turnCount);
  if (safety) {
    lines.push(`- ${safety}`);
  }

  return lines.join("\n");
}
