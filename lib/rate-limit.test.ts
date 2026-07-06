import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetRateLimitStoreForTests,
  checkRateLimit,
  evaluateRateLimit,
  LIMITS,
} from "./rate-limit";

describe("evaluateRateLimit (pure core, injectable clock)", () => {
  it("allows the first request in a fresh window", () => {
    const { result, next } = evaluateRateLimit(undefined, 1_000, 5);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
    expect(next).toEqual({ windowStart: 1_000, count: 1 });
  });

  it("allows subsequent requests within the limit, incrementing count", () => {
    const first = evaluateRateLimit(undefined, 0, 3);
    const second = evaluateRateLimit(first.next, 100, 3);
    const third = evaluateRateLimit(second.next, 200, 3);

    expect(first.result.allowed).toBe(true);
    expect(second.result.allowed).toBe(true);
    expect(third.result.allowed).toBe(true);
    expect(third.next.count).toBe(3);
  });

  it("rejects once the limit is reached within the same window", () => {
    let state = evaluateRateLimit(undefined, 0, 2).next;
    state = evaluateRateLimit(state, 10, 2).next;
    const fourth = evaluateRateLimit(state, 20, 2);

    expect(fourth.result.allowed).toBe(false);
    expect(fourth.result.remaining).toBe(0);
    expect(fourth.result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("computes retryAfterSeconds based on remaining window time", () => {
    // Window starts at t=0, limit 1/min (60_000ms). Second request at t=45_000
    // should need to wait until t=60_000 -> 15s remaining.
    const state = evaluateRateLimit(undefined, 0, 1).next;
    const blocked = evaluateRateLimit(state, 45_000, 1);

    expect(blocked.result.allowed).toBe(false);
    expect(blocked.result.retryAfterSeconds).toBe(15);
  });

  it("resets the window after WINDOW_MS has elapsed", () => {
    let state = evaluateRateLimit(undefined, 0, 1).next;
    const blockedWithinWindow = evaluateRateLimit(state, 30_000, 1);
    expect(blockedWithinWindow.result.allowed).toBe(false);

    // Advance past the 60s window.
    const afterWindow = evaluateRateLimit(state, 60_001, 1);
    expect(afterWindow.result.allowed).toBe(true);
    expect(afterWindow.next).toEqual({ windowStart: 60_001, count: 1 });
  });

  it("treats exactly WINDOW_MS elapsed as expired (boundary)", () => {
    const state = evaluateRateLimit(undefined, 0, 1).next;
    const atBoundary = evaluateRateLimit(state, 60_000, 1);
    expect(atBoundary.result.allowed).toBe(true);
  });
});

describe("checkRateLimit (stateful, per-uid/bucket)", () => {
  beforeEach(() => {
    __resetRateLimitStoreForTests();
  });

  it("enforces the chat limit (20/min)", () => {
    const uid = "uid-chat-1";
    for (let i = 0; i < LIMITS.chat; i++) {
      const result = checkRateLimit(uid, "chat", 0);
      expect(result.allowed).toBe(true);
    }
    const blocked = checkRateLimit(uid, "chat", 0);
    expect(blocked.allowed).toBe(false);
  });

  it("enforces the pdf limit (5/min)", () => {
    const uid = "uid-pdf-1";
    for (let i = 0; i < LIMITS.pdf; i++) {
      const result = checkRateLimit(uid, "pdf", 0);
      expect(result.allowed).toBe(true);
    }
    const blocked = checkRateLimit(uid, "pdf", 0);
    expect(blocked.allowed).toBe(false);
  });

  it("isolates limits per uid — one uid's usage never affects another's", () => {
    const uidA = "uid-a";
    const uidB = "uid-b";

    for (let i = 0; i < LIMITS.pdf; i++) {
      expect(checkRateLimit(uidA, "pdf", 0).allowed).toBe(true);
    }
    expect(checkRateLimit(uidA, "pdf", 0).allowed).toBe(false);

    // uidB is unaffected by uidA exhausting its bucket.
    expect(checkRateLimit(uidB, "pdf", 0).allowed).toBe(true);
  });

  it("isolates limits per bucket — exhausting pdf does not affect chat for the same uid", () => {
    const uid = "uid-cross-bucket";
    for (let i = 0; i < LIMITS.pdf; i++) {
      checkRateLimit(uid, "pdf", 0);
    }
    expect(checkRateLimit(uid, "pdf", 0).allowed).toBe(false);
    expect(checkRateLimit(uid, "chat", 0).allowed).toBe(true);
  });

  it("resets after the window passes for a given uid+bucket", () => {
    const uid = "uid-reset";
    for (let i = 0; i < LIMITS.pdf; i++) {
      checkRateLimit(uid, "pdf", 0);
    }
    expect(checkRateLimit(uid, "pdf", 0).allowed).toBe(false);

    // 61 seconds later, a fresh window opens.
    expect(checkRateLimit(uid, "pdf", 61_000).allowed).toBe(true);
  });
});
