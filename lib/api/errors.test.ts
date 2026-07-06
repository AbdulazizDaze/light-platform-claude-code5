import { describe, expect, it } from "vitest";
import { apiError, ERROR_CODES } from "./errors";

describe("apiError", () => {
  it("maps 'unauthorized' to HTTP 401 by default", async () => {
    const response = apiError("unauthorized", { en: "no", ar: "لا" });
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ error: { code: "unauthorized", message: { en: "no", ar: "لا" } } });
  });

  it("maps 'invalid_body' to HTTP 400 by default", () => {
    expect(apiError("invalid_body", { en: "bad", ar: "سيء" }).status).toBe(400);
  });

  it("maps 'rate_limited' to HTTP 429 by default", () => {
    expect(apiError("rate_limited", { en: "slow down", ar: "تمهل" }).status).toBe(429);
  });

  it("maps 'internal' to HTTP 500 by default", () => {
    expect(apiError("internal", { en: "err", ar: "خطأ" }).status).toBe(500);
  });

  it("maps 'not_found' to HTTP 404 by default", () => {
    expect(apiError("not_found", { en: "missing", ar: "مفقود" }).status).toBe(404);
  });

  it("allows overriding the default status", () => {
    const response = apiError("internal", { en: "err", ar: "خطأ" }, 503);
    expect(response.status).toBe(503);
  });

  it("exposes exactly the canonical error codes", () => {
    expect(Object.values(ERROR_CODES).sort()).toEqual(
      ["internal", "invalid_body", "not_found", "rate_limited", "unauthorized"].sort(),
    );
  });
});
