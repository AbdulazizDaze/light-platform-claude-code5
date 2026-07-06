/**
 * call-gemini.ts — the ONLY place in Light that talks to the Gemini API.
 *
 * Design goals (PRD §9.4, ADR-000, docs/conventions.md "AI code"):
 *  - Single abstraction so the provider is swappable in one file (mitigates the
 *    Gemini pricing/deprecation risk in PRD §15).
 *  - Model fallback chain: gemini-2.5-flash → gemini-flash-latest → 2.0-flash.
 *    Move to the next model on 404 / 429 / 5xx / model errors. Bounded retry
 *    (1 retry per model) on transient 429/5xx with small backoff.
 *  - No SDK dependency — raw REST via fetch (no npm deps added).
 *  - Never log or leak the API key. The key rides the URL query string, so we
 *    redact it from every error message and never console.log the URL.
 */

/**
 * The model fallback chain, in priority order. Exported so the fallback logic
 * is unit-testable without hitting the network.
 */
export const MODEL_CHAIN = [
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-2.0-flash",
] as const;

export type GeminiModel = (typeof MODEL_CHAIN)[number];

/** One retry per model on transient errors. */
export const MAX_RETRIES_PER_MODEL = 1;

/** Base backoff (ms) between retries of the same model; multiplied by attempt. */
export const RETRY_BACKOFF_MS = 250;

const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

export type GeminiRole = "user" | "model";

/**
 * Inline binary data (e.g. an uploaded CV PDF) attached to a single message
 * part, per Gemini's `inline_data` content-part shape. Kept minimal and
 * additive — existing `{ role, text }` messages are unaffected.
 */
export interface GeminiInlineData {
  mimeType: string;
  /** Base64-encoded bytes (no `data:` URL prefix). */
  dataBase64: string;
}

export interface GeminiMessage {
  role: GeminiRole;
  text: string;
  /** Optional inline data part (e.g. PDF bytes) appended alongside `text` on this turn. */
  inlineData?: GeminiInlineData;
}

export interface CallGeminiOptions {
  /** System instruction — the base prompt + user-context, assembled by callers. */
  system: string;
  /** Conversation turns in order. */
  messages: GeminiMessage[];
  temperature?: number;
  maxOutputTokens?: number;
  /** When true, request `application/json` output (CV/job generation turns). */
  jsonMode?: boolean;
}

export interface CallGeminiResult {
  text: string;
  model: GeminiModel;
}

/**
 * A retryable failure from one model attempt. Carries the HTTP status (when
 * there was one) so the orchestrator can decide fallback vs. retry.
 */
export class GeminiModelError extends Error {
  readonly status?: number;
  readonly model: string;

  constructor(model: string, message: string, status?: number) {
    super(message);
    this.name = "GeminiModelError";
    this.model = model;
    this.status = status;
  }
}

/** Raised when every model in the chain has failed. */
export class GeminiAllModelsFailedError extends Error {
  readonly attempts: { model: string; message: string }[];

  constructor(attempts: { model: string; message: string }[]) {
    super(
      `All Gemini models failed: ${attempts
        .map((a) => `${a.model} (${a.message})`)
        .join("; ")}`,
    );
    this.name = "GeminiAllModelsFailedError";
    this.attempts = attempts;
  }
}

/**
 * Should we move on from the current model to the next one in the chain?
 * True for 404 (model not found / unavailable), 429 (rate/quota), and any 5xx.
 * Pure + exported for unit tests.
 */
export function shouldFallback(status: number): boolean {
  return status === 404 || status === 429 || status >= 500;
}

/**
 * Is this status transient enough to retry the SAME model once before falling
 * back? 429 (transient rate limit) and 5xx (server hiccup). 404 is not
 * transient — the model is simply unavailable, so we fall straight through.
 * Pure + exported for unit tests.
 */
export function isTransient(status: number): boolean {
  return status === 429 || status >= 500;
}

/**
 * Remove the API key from any string before it can reach a log or an error
 * message. The key is passed as `?key=...` in the URL, so redact that param
 * defensively (and any literal occurrence of the key value).
 */
export function redactApiKey(input: string, key?: string): string {
  let out = input.replace(/([?&]key=)[^&\s"']+/gi, "$1[REDACTED]");
  if (key && key.length > 0) {
    out = out.split(key).join("[REDACTED]");
  }
  return out;
}

/** Lazily read + validate the API key with a descriptive (key-free) error. */
function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.trim().length === 0) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to .env.local (server-only) — " +
        "see docs/architecture.md §7. Light cannot call Gemini without it.",
    );
  }
  return key;
}

interface GeminiApiCandidate {
  content?: { parts?: { text?: string }[] };
  finishReason?: string;
}

interface GeminiApiResponse {
  candidates?: GeminiApiCandidate[];
  promptFeedback?: { blockReason?: string };
}

/** Build the REST request body from our options. */
function buildRequestBody(opts: CallGeminiOptions): Record<string, unknown> {
  const generationConfig: Record<string, unknown> = {};
  if (typeof opts.temperature === "number") {
    generationConfig.temperature = opts.temperature;
  }
  if (typeof opts.maxOutputTokens === "number") {
    generationConfig.maxOutputTokens = opts.maxOutputTokens;
  }
  if (opts.jsonMode) {
    generationConfig.responseMimeType = "application/json";
  }

  return {
    systemInstruction: {
      parts: [{ text: opts.system }],
    },
    contents: opts.messages.map((m) => ({
      role: m.role,
      parts: [
        { text: m.text },
        ...(m.inlineData
          ? [{ inline_data: { mime_type: m.inlineData.mimeType, data: m.inlineData.dataBase64 } }]
          : []),
      ],
    })),
    ...(Object.keys(generationConfig).length > 0 ? { generationConfig } : {}),
  };
}

/** Extract the text from a Gemini response, or throw a descriptive error. */
function extractText(model: GeminiModel, data: GeminiApiResponse): string {
  const blockReason = data.promptFeedback?.blockReason;
  if (blockReason) {
    // Treat a safety block as a model error so callers can fall back / surface
    // a graceful message rather than crashing.
    throw new GeminiModelError(model, `response blocked: ${blockReason}`);
  }

  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const text = parts
    .map((p) => p.text ?? "")
    .join("")
    .trim();

  if (text.length === 0) {
    throw new GeminiModelError(model, "empty response from model");
  }
  return text;
}

/**
 * The provider-specific call. This is the ONLY function that touches the
 * network / provider shape — swapping providers is a change confined here.
 * Throws GeminiModelError on any non-OK response (carrying the status).
 */
async function invokeModel(
  model: GeminiModel,
  apiKey: string,
  opts: CallGeminiOptions,
): Promise<string> {
  const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${encodeURIComponent(
    apiKey,
  )}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildRequestBody(opts)),
    });
  } catch (e) {
    // Network/DNS/abort — no HTTP status. Redact defensively and treat as
    // transient-ish by giving it a 503-like status so the caller retries/falls
    // back rather than dying.
    const msg = redactApiKey(e instanceof Error ? e.message : String(e), apiKey);
    throw new GeminiModelError(model, `network error: ${msg}`, 503);
  }

  if (!res.ok) {
    let detail = "";
    try {
      detail = await res.text();
    } catch {
      /* ignore body read failure */
    }
    throw new GeminiModelError(
      model,
      `HTTP ${res.status}: ${redactApiKey(detail, apiKey).slice(0, 300)}`,
      res.status,
    );
  }

  let data: GeminiApiResponse;
  try {
    data = (await res.json()) as GeminiApiResponse;
  } catch (e) {
    const msg = redactApiKey(e instanceof Error ? e.message : String(e), apiKey);
    throw new GeminiModelError(model, `invalid JSON body: ${msg}`);
  }

  return extractText(model, data);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * callGemini — the single entrypoint. Walks the model fallback chain, retrying
 * each model once on transient errors, and returns the first successful text
 * plus the model that produced it.
 *
 * @throws {GeminiAllModelsFailedError} when every model fails.
 */
export async function callGemini(
  opts: CallGeminiOptions,
): Promise<CallGeminiResult> {
  const apiKey = getApiKey();
  const attempts: { model: string; message: string }[] = [];

  for (const model of MODEL_CHAIN) {
    for (let retry = 0; retry <= MAX_RETRIES_PER_MODEL; retry++) {
      try {
        const text = await invokeModel(model, apiKey, opts);
        return { text, model };
      } catch (e) {
        const err =
          e instanceof GeminiModelError
            ? e
            : new GeminiModelError(
                model,
                redactApiKey(e instanceof Error ? e.message : String(e), apiKey),
              );

        const status = err.status;
        const canRetrySameModel =
          typeof status === "number" &&
          isTransient(status) &&
          retry < MAX_RETRIES_PER_MODEL;

        if (canRetrySameModel) {
          await delay(RETRY_BACKOFF_MS * (retry + 1));
          continue; // retry same model
        }

        // Record and move to the next model. If the status is a non-fallback
        // client error (e.g. 400 bad request), there's no point trying other
        // models with the same payload — fail fast.
        attempts.push({ model, message: err.message });
        if (typeof status === "number" && !shouldFallback(status)) {
          throw new GeminiAllModelsFailedError(attempts);
        }
        break; // break retry loop → next model in chain
      }
    }
  }

  throw new GeminiAllModelsFailedError(attempts);
}
