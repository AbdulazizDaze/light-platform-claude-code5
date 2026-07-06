/**
 * In-memory per-uid rate limiting (CLAUDE.md §3.9, §9.8; docs/architecture.md
 * §6): chat 20/min/uid, PDF 5/min/uid.
 *
 * Design notes:
 * - Fixed-window counter per (uid, bucket). Simpler than a sliding log and
 *   sufficient at Light's current scale; revisit if bursty edge-of-window
 *   behavior becomes a real problem.
 * - Serverless-safe cleanup: Vercel functions are short-lived and a module
 *   can be frozen/thawed between invocations, so a long-lived `setInterval`
 *   is not guaranteed to ever fire (and would leak a timer handle across
 *   invocations of the same warm instance regardless). Instead we do lazy,
 *   access-time cleanup — each call to `checkRateLimit` opportunistically
 *   evicts expired entries for the bucket it touches, and a low-probability
 *   full sweep runs on top to bound total memory even for uids that stop
 *   calling entirely. No timers, nothing to leak.
 * - The counting core (`evaluateRateLimit`) is a pure function of
 *   (state, now) so it's unit-testable with an injectable clock, independent
 *   of the module-level store and Math.random sweep.
 */

export type RateLimitBucket = "chat" | "pdf";

/** Requests-per-minute ceiling for each bucket (CLAUDE.md §3.9). */
export const LIMITS: Record<RateLimitBucket, number> = {
  chat: 20,
  pdf: 5,
};

const WINDOW_MS = 60_000;

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the caller may retry; 0 when `allowed` is true. */
  retryAfterSeconds: number;
  /** Requests remaining in the current window after this check. */
  remaining: number;
}

interface WindowState {
  /** Fixed-window start, in ms since epoch. */
  windowStart: number;
  count: number;
}

/**
 * Pure decision function: given the previous window state for a key (or
 * undefined if none), the current time, and the limit, decide whether this
 * request is allowed and what the next state should be. No module-level
 * state, no I/O — fully unit-testable with an injected clock.
 */
export function evaluateRateLimit(
  previous: WindowState | undefined,
  now: number,
  limit: number
): { result: RateLimitResult; next: WindowState } {
  const windowStart = previous?.windowStart ?? now;
  const windowExpired = now - windowStart >= WINDOW_MS;

  if (!previous || windowExpired) {
    // Fresh window: this request is the first count in it.
    return {
      result: { allowed: true, retryAfterSeconds: 0, remaining: limit - 1 },
      next: { windowStart: now, count: 1 },
    };
  }

  if (previous.count < limit) {
    return {
      result: { allowed: true, retryAfterSeconds: 0, remaining: limit - (previous.count + 1) },
      next: { windowStart: previous.windowStart, count: previous.count + 1 },
    };
  }

  const retryAfterMs = previous.windowStart + WINDOW_MS - now;
  return {
    result: {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
      remaining: 0,
    },
    next: previous,
  };
}

/** Module-level store: `${bucket}:${uid}` -> window state. */
const store = new Map<string, WindowState>();

// Probability of running a full stale-entry sweep on any given call. Keeps
// average-case cost O(1) while still bounding total memory over time,
// without a timer (see file header).
const SWEEP_PROBABILITY = 0.01;

function sweepStale(now: number): void {
  for (const [key, state] of store) {
    if (now - state.windowStart >= WINDOW_MS) {
      store.delete(key);
    }
  }
}

/**
 * Check (and record) a request against the given uid+bucket's rate limit.
 * `now` is injectable for tests; defaults to `Date.now()` in production use.
 */
export function checkRateLimit(
  uid: string,
  bucket: RateLimitBucket,
  now: number = Date.now()
): RateLimitResult {
  const key = `${bucket}:${uid}`;
  const previous = store.get(key);

  const { result, next } = evaluateRateLimit(previous, now, LIMITS[bucket]);
  store.set(key, next);

  if (Math.random() < SWEEP_PROBABILITY) {
    sweepStale(now);
  }

  return result;
}

/** Test-only escape hatch to reset module state between test cases. */
export function __resetRateLimitStoreForTests(): void {
  store.clear();
}
