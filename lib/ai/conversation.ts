/**
 * conversation.ts — the v3 turn engine (PRD v3 §5.2).
 *
 * Each turn is ONE Gemini call (jsonMode) whose JSON is validated against
 * `TurnResponseSchema`: { reply, quick_replies, state, ready }. The server
 * merges the returned FULL state, re-checks readiness DETERMINISTICALLY
 * (checkReadiness — the model's `ready` is advisory), and — when both agree —
 * fires a SEPARATE, dedicated CV-generation call that produces a validated
 * `CvSchema` with one bounded corrective retry.
 *
 * Never returns unvalidated output (CLAUDE.md §3.5/§7):
 *  - turn JSON invalid → ONE corrective retry with the Zod issues → else
 *    DEGRADE to reply-only (extract nothing, keep the previous state).
 *  - CV generation invalid twice → no cv_data; the turn still returns its
 *    reply and the caller retries generation next turn.
 */

import { callGemini, type GeminiMessage } from "./call-gemini";
import { CONSULTANT_PROMPT } from "./prompts/consultant-prompt";
import { buildUserContext, type UserContextProfile } from "./prompts/user-context";
import {
  CV_GENERATION_SYSTEM,
  buildCvGenerationRequest,
  type CvGenerationContext,
} from "./prompts/cv-generation-prompt";
import { parseCvData, type Cv } from "@/lib/schemas/cv";
import {
  parseTurnResponse,
  type PartialCv,
  type PartialCvEducation,
  type PartialCvExperience,
  type PartialCvSkill,
  type PartialCvLanguage,
  type PartialCvProject,
  type PartialCvCertification,
} from "@/lib/schemas/cv-state";
import type { ChatMessage } from "@/lib/schemas/chat";

/** Cap on how much prior conversation we replay to Gemini per turn (~20 messages, PRD §5.2). */
export const MAX_HISTORY_MESSAGES = 20;

/** Bounded retry: at most one corrective re-ask when the turn JSON fails Zod validation. */
export const MAX_TURN_RETRIES = 1;

/** Bounded retry: at most one corrective re-ask when the generated CV fails Zod validation. */
export const MAX_CV_GENERATION_RETRIES = 1;

/** The graceful degrade reply when the turn JSON can't be parsed even after a retry. */
export const DEGRADE_REPLY =
  "عذراً، صار عندي خلل بسيط. ممكن تعيد آخر رسالة أو تكملها؟";

// ---------------------------------------------------------------------------
// Deterministic server-side readiness — the AUTHORITY, not the model's flag.
// ---------------------------------------------------------------------------

/** Minimum skills required before a CV is generated (PRD §5.1). */
export const MIN_SKILLS_FOR_READY = 6;

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

/**
 * DETERMINISTIC readiness checklist (PRD v3 §5.2 — "the server, not the model,
 * is the authority on readiness"). Ready iff the state covers:
 *  - education: ≥1 entry with an institution AND a field,
 *  - experience OR projects: ≥1 entry,
 *  - skills: ≥6,
 *  - languages: ≥1 with a proficiency level,
 *  - target role present.
 * Pure + total — never throws; defensive against a sparse/partial state.
 */
export function checkReadiness(state: PartialCv | null | undefined): boolean {
  if (!state || typeof state !== "object") return false;

  const hasEducation = (state.education ?? []).some(
    (e) => isNonEmptyString(e?.institution) && isNonEmptyString(e?.field),
  );
  if (!hasEducation) return false;

  const hasExperienceOrProjects =
    (state.experience ?? []).length > 0 || (state.projects ?? []).length > 0;
  if (!hasExperienceOrProjects) return false;

  const skillCount = (state.skills ?? []).filter((s) => isNonEmptyString(s?.name)).length;
  if (skillCount < MIN_SKILLS_FOR_READY) return false;

  const hasLanguageWithLevel = (state.languages ?? []).some(
    (l) => isNonEmptyString(l?.language) && isNonEmptyString(l?.proficiency),
  );
  if (!hasLanguageWithLevel) return false;

  if (!isNonEmptyString(state.target_role)) return false;

  return true;
}

// ---------------------------------------------------------------------------
// Defensive state merge. The model returns the FULL updated state each turn,
// but mergeState guards against a model that regresses (drops earlier facts):
// it prefers incoming non-empty fields and UNIONS arrays by a natural key so a
// dropped entry from a previous turn is never lost.
// ---------------------------------------------------------------------------

function normalizeKey(v: string | undefined): string {
  return (v ?? "").trim().toLowerCase();
}

/** Union two arrays of objects, de-duplicating by a natural key; incoming wins on conflict. */
function unionBy<T>(
  previous: T[],
  incoming: T[],
  keyOf: (item: T) => string,
): T[] {
  const byKey = new Map<string, T>();
  for (const item of previous) {
    const k = keyOf(item);
    if (k) byKey.set(k, item);
  }
  for (const item of incoming) {
    const k = keyOf(item);
    if (k) byKey.set(k, item); // incoming overrides previous on the same key
  }
  // Preserve deterministic order: previous keys first (in their order), then
  // any new incoming keys not seen before.
  const order: string[] = [];
  const seen = new Set<string>();
  for (const item of [...previous, ...incoming]) {
    const k = keyOf(item);
    if (k && !seen.has(k)) {
      seen.add(k);
      order.push(k);
    }
  }
  const out: T[] = [];
  for (const k of order) {
    const item = byKey.get(k);
    if (item !== undefined) out.push(item);
  }
  return out;
}

function unionStrings(previous: string[], incoming: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of [...previous, ...incoming]) {
    const k = s.trim().toLowerCase();
    if (k && !seen.has(k)) {
      seen.add(k);
      out.push(s);
    }
  }
  return out;
}

/**
 * Defensively merge a newly-returned state onto the previous one. The model is
 * SUPPOSED to return the full state, so `incoming` is authoritative for arrays
 * it includes — but if it drops entries, the union preserves them. Scalar
 * fields prefer a non-empty incoming value, else keep the previous.
 */
export function mergeState(previous: PartialCv | null | undefined, incoming: PartialCv): PartialCv {
  const prev = previous ?? { education: [], experience: [], projects: [], skills: [], languages: [], certifications: [], volunteer_work: [] };

  return {
    professional_summary:
      incoming.professional_summary ?? prev.professional_summary,
    education: unionBy<PartialCvEducation>(
      prev.education ?? [],
      incoming.education ?? [],
      (e) => normalizeKey(e.institution),
    ),
    experience: unionBy<PartialCvExperience>(
      prev.experience ?? [],
      incoming.experience ?? [],
      (e) => normalizeKey(e.company),
    ),
    projects: unionBy<PartialCvProject>(
      prev.projects ?? [],
      incoming.projects ?? [],
      (p) => normalizeKey(p.name),
    ),
    skills: unionBy<PartialCvSkill>(
      prev.skills ?? [],
      incoming.skills ?? [],
      (s) => normalizeKey(s.name),
    ),
    languages: unionBy<PartialCvLanguage>(
      prev.languages ?? [],
      incoming.languages ?? [],
      (l) => normalizeKey(l.language),
    ),
    certifications: unionBy<PartialCvCertification>(
      prev.certifications ?? [],
      incoming.certifications ?? [],
      (c) => normalizeKey(c.name),
    ),
    volunteer_work: unionStrings(prev.volunteer_work ?? [], incoming.volunteer_work ?? []),
    target_role: isNonEmptyString(incoming.target_role)
      ? incoming.target_role
      : prev.target_role,
    preferences_note: isNonEmptyString(incoming.preferences_note)
      ? incoming.preferences_note
      : prev.preferences_note,
  };
}

// ---------------------------------------------------------------------------
// History mapping.
// ---------------------------------------------------------------------------

function toGeminiMessage(message: ChatMessage): GeminiMessage {
  return { role: message.role === "assistant" ? "model" : "user", text: message.content };
}

/**
 * Synthetic opening instruction for the greeting turn. Gemini rejects a
 * generateContent request whose `contents` array is empty, so when there is
 * no history and no user message yet this instruction is sent as the sole
 * user part. It is never persisted to the session — the visible history
 * starts with the assistant's greeting.
 */
export const GREETING_INSTRUCTION =
  "(هذه بداية الجلسة — رحّب بالمرشح باسمه بأسلوب مهني ودود واسأله السؤال الافتتاحي.)";

/**
 * Build the Gemini `contents` history: prior session messages (capped to the
 * last MAX_HISTORY_MESSAGES) followed by the new user turn (when present — the
 * initial-greeting request sends no new user message).
 */
export function buildHistoryMessages(
  priorMessages: ChatMessage[],
  newUserMessage: string | null,
): GeminiMessage[] {
  const capped = priorMessages.slice(-MAX_HISTORY_MESSAGES).map(toGeminiMessage);
  if (newUserMessage !== null && newUserMessage.length > 0) {
    capped.push({ role: "user", text: newUserMessage });
  }
  if (capped.length === 0) {
    capped.push({ role: "user", text: GREETING_INSTRUCTION });
  }
  return capped;
}

// ---------------------------------------------------------------------------
// The turn call.
// ---------------------------------------------------------------------------

export interface RunConversationTurnParams {
  /** Server-side identity/session context — never client-supplied (CLAUDE.md §3.4). */
  userContext: UserContextProfile;
  /** The state accumulated so far (from the persisted session), or null on turn 1. */
  currentState: PartialCv | null;
  /** Prior messages already persisted in this session (oldest first). */
  priorMessages: ChatMessage[];
  /** The new user message for this turn, or null for the initial-greeting request. */
  newUserMessage: string | null;
  /** Optional inline data (e.g. an uploaded CV PDF) appended on THIS turn only. */
  inlineData?: { mimeType: string; dataBase64: string };
}

export interface RunConversationTurnResult {
  reply: string;
  quickReplies: string[];
  /** The merged, validated state after this turn (defensively unioned onto the previous). */
  state: PartialCv;
  /** The model's advisory readiness flag (server re-checks via checkReadiness). */
  modelReady: boolean;
  cvGenerated: boolean;
  cvData: Cv | null;
  /** Which model in the fallback chain produced the final accepted turn. */
  model: string;
}

/** Serialize the current state into the system prompt so the model extends it idempotently. */
function stateSnapshot(state: PartialCv | null): string {
  return [
    "# CURRENT CV STATE (extend this — return the FULL updated state, do not drop facts)",
    JSON.stringify(state ?? {}, null, 2),
  ].join("\n");
}

/**
 * Run one full conversation turn: compose the prompt (consultant prompt +
 * user-context + current-state snapshot), call Gemini in jsonMode, validate the
 * turn JSON with one bounded corrective re-ask, merge state, and — when the
 * server ALSO judges the state ready — generate + validate the final CV.
 */
export async function runConversationTurn(
  params: RunConversationTurnParams,
): Promise<RunConversationTurnResult> {
  const { userContext, currentState, priorMessages, newUserMessage, inlineData } = params;

  const system = [
    CONSULTANT_PROMPT,
    buildUserContext(userContext),
    stateSnapshot(currentState),
  ].join("\n\n");

  const messages = buildHistoryMessages(priorMessages, newUserMessage);

  if (inlineData) {
    const last = messages[messages.length - 1];
    if (last && last.role === "user") {
      last.inlineData = inlineData;
    } else {
      messages.push({ role: "user", text: "", inlineData });
    }
  }

  let { text, model } = await callGemini({ system, messages, jsonMode: true });
  let parsed = parseTurnResponse(safeJson(text));
  let attempts = 0;

  while (!parsed.success && attempts < MAX_TURN_RETRIES) {
    attempts += 1;
    const issues = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    const correctiveMessages: GeminiMessage[] = [
      ...messages,
      { role: "model", text },
      {
        role: "user",
        text:
          "Your last JSON failed validation: " +
          issues +
          ". Re-emit a SINGLE JSON object with EXACTLY the keys {reply, quick_replies, state, ready}, " +
          "matching the OUTPUT PROTOCOL. No identity fields anywhere in state, no unknown keys, no prose.",
      },
    ];
    const retry = await callGemini({ system, messages: correctiveMessages, jsonMode: true });
    text = retry.text;
    model = retry.model;
    parsed = parseTurnResponse(safeJson(text));
  }

  // Degrade: keep the previous state, extract nothing, return a graceful reply.
  if (!parsed.success) {
    return {
      reply: DEGRADE_REPLY,
      quickReplies: [],
      state: currentState ?? emptyState(),
      modelReady: false,
      cvGenerated: false,
      cvData: null,
      model,
    };
  }

  const turn = parsed.data;
  const mergedState = mergeState(currentState, turn.state);

  const result: RunConversationTurnResult = {
    reply: turn.reply,
    quickReplies: turn.quick_replies,
    state: mergedState,
    modelReady: turn.ready,
    cvGenerated: false,
    cvData: null,
    model,
  };

  // Server is the authority: only generate when BOTH the model proposes it AND
  // the deterministic checklist agrees.
  if (turn.ready && checkReadiness(mergedState)) {
    const generated = await generateCv(mergedState, {
      name: userContext.name,
      gender: userContext.gender,
    });
    if (generated) {
      result.cvGenerated = true;
      result.cvData = generated;
    }
    // If generation failed validation twice, cvGenerated stays false and the
    // reply is still returned — the caller retries generation next turn.
  }

  return result;
}

/**
 * The dedicated CV-generation call (PRD v3 §5.2). Runs the generation prompt
 * over the accumulated state and validates the result against `CvSchema` with
 * one bounded corrective retry. Returns null (never throws, never partial) if
 * validation still fails — the caller keeps the conversation going.
 */
export async function generateCv(
  state: PartialCv,
  context: CvGenerationContext,
): Promise<Cv | null> {
  const request = buildCvGenerationRequest(state, context);
  const messages: GeminiMessage[] = [{ role: "user", text: request }];

  let { text } = await callGemini({
    system: CV_GENERATION_SYSTEM,
    messages,
    jsonMode: true,
  });
  let validated = parseCvData(safeJson(text));
  let attempts = 0;

  while (!validated.success && attempts < MAX_CV_GENERATION_RETRIES) {
    attempts += 1;
    const issues = validated.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    const correctiveMessages: GeminiMessage[] = [
      ...messages,
      { role: "model", text },
      {
        role: "user",
        text:
          "The CV JSON failed validation: " +
          issues +
          ". Re-emit a SINGLE JSON object matching the schema exactly — no identity fields, no unknown " +
          "keys, ≥1 education, ≥6 skills, ≥1 language. Fix the reported issues.",
      },
    ];
    const retry = await callGemini({
      system: CV_GENERATION_SYSTEM,
      messages: correctiveMessages,
      jsonMode: true,
    });
    text = retry.text;
    validated = parseCvData(safeJson(text));
  }

  return validated.success ? validated.data : null;
}

/** Parse model text as JSON; on failure return the raw string so Zod reports a shape error. */
function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function emptyState(): PartialCv {
  return {
    education: [],
    experience: [],
    projects: [],
    skills: [],
    languages: [],
    certifications: [],
    volunteer_work: [],
  };
}
