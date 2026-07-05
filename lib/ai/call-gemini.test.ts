import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  callGemini,
  GeminiAllModelsFailedError,
  isTransient,
  MODEL_CHAIN,
  redactApiKey,
  shouldFallback,
} from "./call-gemini";

// ---------------------------------------------------------------------------
// Pure logic (no network): fallback-chain ordering + status classification.
// ---------------------------------------------------------------------------

describe("MODEL_CHAIN", () => {
  it("is the documented fallback order", () => {
    expect([...MODEL_CHAIN]).toEqual([
      "gemini-2.5-flash",
      "gemini-flash-latest",
      "gemini-2.0-flash",
    ]);
  });
});

describe("shouldFallback", () => {
  it("falls back on 404, 429, and 5xx", () => {
    expect(shouldFallback(404)).toBe(true);
    expect(shouldFallback(429)).toBe(true);
    expect(shouldFallback(500)).toBe(true);
    expect(shouldFallback(503)).toBe(true);
  });

  it("does NOT fall back on ordinary client errors (400, 401, 403)", () => {
    expect(shouldFallback(400)).toBe(false);
    expect(shouldFallback(401)).toBe(false);
    expect(shouldFallback(403)).toBe(false);
  });
});

describe("isTransient", () => {
  it("treats 429 and 5xx as transient, 404 as not", () => {
    expect(isTransient(429)).toBe(true);
    expect(isTransient(500)).toBe(true);
    expect(isTransient(404)).toBe(false);
    expect(isTransient(400)).toBe(false);
  });
});

describe("redactApiKey", () => {
  it("strips the key= query param", () => {
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/x:generateContent?key=SECRET123";
    expect(redactApiKey(url)).not.toContain("SECRET123");
    expect(redactApiKey(url)).toContain("[REDACTED]");
  });

  it("strips literal occurrences of the key value", () => {
    expect(redactApiKey("error involving SECRET123 here", "SECRET123")).not.toContain(
      "SECRET123",
    );
  });
});

// ---------------------------------------------------------------------------
// callGemini with a mocked fetch (NEVER hits the live API).
// ---------------------------------------------------------------------------

function okResponse(text: string): Response {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      candidates: [{ content: { parts: [{ text }] } }],
    }),
    text: async () => "",
  } as unknown as Response;
}

function errorResponse(status: number, body = "err"): Response {
  return {
    ok: false,
    status,
    json: async () => ({}),
    text: async () => body,
  } as unknown as Response;
}

describe("callGemini", () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = "TEST_KEY_do_not_log";
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const baseOpts = {
    system: "SYSTEM",
    messages: [{ role: "user" as const, text: "hello" }],
  };

  it("throws a descriptive error when GEMINI_API_KEY is missing", async () => {
    delete process.env.GEMINI_API_KEY;
    await expect(callGemini(baseOpts)).rejects.toThrow(/GEMINI_API_KEY is not set/);
  });

  it("happy path: uses the first model and returns its text + model id", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse("مرحبا"));
    vi.stubGlobal("fetch", fetchMock);

    const result = await callGemini(baseOpts);

    expect(result).toEqual({ text: "مرحبا", model: "gemini-2.5-flash" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    // The requested URL targets the first model in the chain.
    expect(String(fetchMock.mock.calls[0][0])).toContain("gemini-2.5-flash");
  });

  it("fallback path: 404 on first model → succeeds on the second model", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(errorResponse(404, "model not found"))
      .mockResolvedValueOnce(okResponse("من الموديل الثاني"));
    vi.stubGlobal("fetch", fetchMock);

    const result = await callGemini(baseOpts);

    expect(result.model).toBe("gemini-flash-latest");
    expect(result.text).toBe("من الموديل الثاني");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[1][0])).toContain("gemini-flash-latest");
  });

  it("retries the SAME model once on a transient 429 before returning success", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(errorResponse(429, "rate limited"))
      .mockResolvedValueOnce(okResponse("نجح بعد إعادة المحاولة"));
    vi.stubGlobal("fetch", fetchMock);

    const result = await callGemini(baseOpts);

    expect(result.model).toBe("gemini-2.5-flash");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    // Both calls target the same (first) model — this was a retry, not a fallback.
    expect(String(fetchMock.mock.calls[0][0])).toContain("gemini-2.5-flash");
    expect(String(fetchMock.mock.calls[1][0])).toContain("gemini-2.5-flash");
  });

  it("fails fast on a non-fallback client error (400) without trying other models", async () => {
    const fetchMock = vi.fn().mockResolvedValue(errorResponse(400, "bad request"));
    vi.stubGlobal("fetch", fetchMock);

    await expect(callGemini(baseOpts)).rejects.toBeInstanceOf(
      GeminiAllModelsFailedError,
    );
    // Only the first model is tried; 400 is not retryable and not a fallback trigger.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws GeminiAllModelsFailedError when every model returns 5xx", async () => {
    const fetchMock = vi.fn().mockResolvedValue(errorResponse(500, "server error"));
    vi.stubGlobal("fetch", fetchMock);

    await expect(callGemini(baseOpts)).rejects.toBeInstanceOf(
      GeminiAllModelsFailedError,
    );
    // 3 models × (1 initial + 1 retry) = 6 attempts.
    expect(fetchMock).toHaveBeenCalledTimes(6);
  });

  it("never leaks the API key in the thrown error", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(errorResponse(500, "TEST_KEY_do_not_log leaked here"));
    vi.stubGlobal("fetch", fetchMock);

    await expect(callGemini(baseOpts)).rejects.toThrow();
    try {
      await callGemini(baseOpts);
    } catch (e) {
      expect((e as Error).message).not.toContain("TEST_KEY_do_not_log");
    }
  });

  it("sets responseMimeType application/json in jsonMode", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse("{}"));
    vi.stubGlobal("fetch", fetchMock);

    await callGemini({ ...baseOpts, jsonMode: true });

    const body = JSON.parse(String(fetchMock.mock.calls[0][1].body));
    expect(body.generationConfig.responseMimeType).toBe("application/json");
  });
});
