/**
 * conversation.ts — orchestration for a single chat turn (PRD §6.1 steps 3-8,
 * §9.4; CLAUDE.md §3.4/§3.5/§3.6/§3.9).
 *
 * Two responsibilities, kept separable for testing:
 *  1. `parseModelTurn` — a PURE parser for the OUTPUT PROTOCOL defined in
 *     `lib/ai/prompts/base-prompt.ts` (CV_OUTPUT_PROTOCOL). No I/O.
 *  2. `runConversationTurn` — composes the system prompt from BASE_PROMPT +
 *     buildUserContext(), maps Firestore history to Gemini's message shape,
 *     calls `callGemini()`, parses the result, and — on a detected CV turn —
 *     validates it against `CvSchema` with ONE bounded corrective re-ask
 *     before giving up. It NEVER returns unvalidated `cv_data`.
 */

import { callGemini, type GeminiMessage } from "./call-gemini";
import { BASE_PROMPT } from "./prompts/base-prompt";
import { buildUserContext, type UserContextProfile } from "./prompts/user-context";
import { parseCvData, type Cv } from "@/lib/schemas/cv";
import type { ChatMessage } from "@/lib/schemas/chat";

/** Cap on how much prior conversation we replay to Gemini per turn (cost + context window discipline). */
export const MAX_HISTORY_MESSAGES = 30;

/** Bounded retry: at most one corrective re-ask when a detected CV turn fails Zod validation. */
export const MAX_CV_RETRIES = 1;

export interface ParsedTurn {
  /** Plain conversational reply text (empty string on a pure CV turn). */
  reply: string;
  /** Quick-reply suggestions parsed from a normal turn's fenced json block, if any. */
  quickReplies: string[];
  /** True when the model's fenced json block looks like a CV object (has professional_summary). */
  isCvTurn: boolean;
  /** The raw (unvalidated) parsed JSON object from a detected CV turn, if any. */
  cvCandidate: unknown | null;
}

/**
 * Extract the first fenced ```json ... ``` block from model text, if any.
 * Returns null when there is no fenced json block, or its contents don't
 * parse as JSON (malformed json is treated as "no block" — the surrounding
 * text is preserved as plain reply per the task spec).
 */
function extractFencedJsonBlock(text: string): { json: unknown; before: string; after: string } | null {
  const fenceRegex = /```json\s*([\s\S]*?)```/i;
  const match = fenceRegex.exec(text);
  if (!match) return null;

  const raw = match[1] ?? "";
  try {
    const json = JSON.parse(raw);
    const before = text.slice(0, match.index).trim();
    const after = text.slice(match.index + match[0].length).trim();
    return { json, before, after };
  } catch {
    return null;
  }
}

/** True if the parsed JSON looks like a quick_replies payload (normal-turn shape). */
function isQuickRepliesShape(json: unknown): json is { quick_replies: string[] } {
  if (typeof json !== "object" || json === null) return false;
  const candidate = (json as { quick_replies?: unknown }).quick_replies;
  return (
    Array.isArray(candidate) && candidate.every((item) => typeof item === "string")
  );
}

/**
 * True if the parsed JSON looks like a CV object per CV_OUTPUT_PROTOCOL —
 * i.e. it's an object carrying a `professional_summary` key. This is a
 * shape-level heuristic (cheap, pre-Zod) to distinguish "the model emitted a
 * CV turn" from "the model emitted a quick_replies block"; the actual
 * validity of the CV content is decided by `CvSchema` downstream.
 */
function looksLikeCvCandidate(json: unknown): boolean {
  if (typeof json !== "object" || json === null || Array.isArray(json)) return false;
  return "professional_summary" in json;
}

/**
 * Parse a raw model turn per the OUTPUT PROTOCOL (base-prompt.ts). Pure,
 * synchronous, exported for unit tests.
 *
 * - Normal turn: plain text, optionally followed by a single fenced json
 *   block of the form `{ "quick_replies": [...] }`.
 * - CV turn: a single fenced json block whose object looks like a CV (has
 *   `professional_summary`). No prose is expected around it, but we still
 *   tolerate/preserve any (the server ignores prose on a CV turn).
 * - Malformed json inside the fence is NOT a parse error — it is treated as
 *   plain text (the whole raw string becomes the reply, no crash).
 */
export function parseModelTurn(text: string): ParsedTurn {
  const trimmed = text.trim();
  const block = extractFencedJsonBlock(trimmed);

  if (!block) {
    // No fenced json block at all (or it was malformed) — plain text turn.
    return { reply: trimmed, quickReplies: [], isCvTurn: false, cvCandidate: null };
  }

  if (looksLikeCvCandidate(block.json)) {
    // CV turn: per protocol this is a single fenced json block with no
    // surrounding prose, but we don't fail if the model added stray text —
    // reply is left empty since a CV turn has no conversational message.
    return { reply: "", quickReplies: [], isCvTurn: true, cvCandidate: block.json };
  }

  if (isQuickRepliesShape(block.json)) {
    const reply = [block.before, block.after].filter(Boolean).join("\n").trim();
    return { reply, quickReplies: block.json.quick_replies, isCvTurn: false, cvCandidate: null };
  }

  // A fenced json block that's neither quick_replies nor CV-shaped: treat the
  // block as inert and fall back to the surrounding text as the reply.
  const reply = [block.before, block.after].filter(Boolean).join("\n").trim() || trimmed;
  return { reply, quickReplies: [], isCvTurn: false, cvCandidate: null };
}

/** Map a Firestore chat message to the `callGemini` message shape. */
function toGeminiMessage(message: ChatMessage): GeminiMessage {
  return {
    role: message.role === "assistant" ? "model" : "user",
    text: message.content,
  };
}

/**
 * Build the full Gemini `contents` history: prior session messages (capped
 * to the last `MAX_HISTORY_MESSAGES`) followed by the new user turn (when
 * present — the initial-greeting request sends no new user message).
 */
export function buildHistoryMessages(
  priorMessages: ChatMessage[],
  newUserMessage: string | null,
): GeminiMessage[] {
  const capped = priorMessages.slice(-MAX_HISTORY_MESSAGES).map(toGeminiMessage);
  if (newUserMessage !== null && newUserMessage.length > 0) {
    capped.push({ role: "user", text: newUserMessage });
  }
  return capped;
}

export interface RunConversationTurnParams {
  /** Server-side identity/session context — never client-supplied (CLAUDE.md §3.4). */
  userContext: UserContextProfile;
  /** Prior messages already persisted in this session (oldest first). */
  priorMessages: ChatMessage[];
  /**
   * The new user message for this turn, or `null` for the initial-greeting
   * request (client sends `message: ""`) where there is no new user turn to
   * append to history.
   */
  newUserMessage: string | null;
  /** Optional inline data (e.g. an uploaded CV PDF) appended as a user-content part on THIS turn only. */
  inlineData?: { mimeType: string; dataBase64: string };
}

export interface RunConversationTurnResult {
  reply: string;
  quickReplies: string[];
  cvGenerated: boolean;
  cvData: Cv | null;
  /** Which model in the fallback chain produced the final accepted turn. */
  model: string;
}

/**
 * Run one full conversation turn: compose the prompt, call Gemini, parse the
 * protocol, and — for a detected CV turn — validate with a single bounded
 * corrective re-ask on failure. Never returns an unvalidated `cvData`
 * (CLAUDE.md §3.5/§7): if validation still fails after the retry, the turn
 * degrades to a plain-text reply instead of surfacing broken CV JSON.
 */
export async function runConversationTurn(
  params: RunConversationTurnParams,
): Promise<RunConversationTurnResult> {
  const { userContext, priorMessages, newUserMessage, inlineData } = params;

  const system = `${BASE_PROMPT}\n\n${buildUserContext(userContext)}`;
  const messages = buildHistoryMessages(priorMessages, newUserMessage);

  if (inlineData) {
    // Attach inline data (e.g. an uploaded CV PDF) to the last user turn so
    // Gemini's native document understanding sees it alongside the prompt
    // text for THIS request only — it is not persisted into chat history.
    const last = messages[messages.length - 1];
    if (last && last.role === "user") {
      last.inlineData = inlineData;
    } else {
      messages.push({ role: "user", text: "", inlineData });
    }
  }

  let { text, model } = await callGemini({ system, messages });
  let parsed = parseModelTurn(text);

  if (!parsed.isCvTurn) {
    return {
      reply: parsed.reply,
      quickReplies: parsed.quickReplies,
      cvGenerated: false,
      cvData: null,
      model,
    };
  }

  // CV turn detected — validate before ever trusting it.
  let validated = parseCvData(parsed.cvCandidate);
  let attempts = 0;

  while (!validated.success && attempts < MAX_CV_RETRIES) {
    attempts += 1;
    const correctiveMessages: GeminiMessage[] = [
      ...messages,
      { role: "model", text },
      {
        role: "user",
        text:
          "Your last CV JSON failed validation: " +
          validated.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") +
          ". Re-emit the CV turn as a SINGLE fenced ```json block matching the exact schema " +
          "from the OUTPUT PROTOCOL, with no identity fields and no prose. Fix the reported issues.",
      },
    ];

    const retryResult = await callGemini({ system, messages: correctiveMessages });
    text = retryResult.text;
    model = retryResult.model;
    parsed = parseModelTurn(text);

    if (!parsed.isCvTurn) {
      // Model abandoned the CV turn on retry — fall back to its plain reply.
      return {
        reply: parsed.reply,
        quickReplies: parsed.quickReplies,
        cvGenerated: false,
        cvData: null,
        model,
      };
    }

    validated = parseCvData(parsed.cvCandidate);
  }

  if (!validated.success) {
    // Never store/return invalid CV JSON (CLAUDE.md §3.5/§7). Degrade
    // gracefully to a conversational nudge rather than surfacing broken data.
    return {
      reply:
        "عذراً، واجهت مشكلة في إعداد سيرتك الذاتية. خلنا نكمل المحادثة وبعدها أعيد المحاولة.",
      quickReplies: [],
      cvGenerated: false,
      cvData: null,
      model,
    };
  }

  return {
    reply: "",
    quickReplies: [],
    cvGenerated: true,
    cvData: validated.data,
    model,
  };
}
