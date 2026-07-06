import { beforeEach, describe, expect, it, vi } from "vitest";
import { __resetRateLimitStoreForTests, LIMITS } from "@/lib/rate-limit";

const verifyIdToken = vi.fn();
const usersGet = vi.fn();

vi.mock("@/lib/firebase/admin", () => ({
  adminAuth: () => ({ verifyIdToken }),
  adminDb: () => ({
    collection: () => ({
      doc: () => ({
        withConverter: () => ({
          get: usersGet,
        }),
      }),
    }),
  }),
}));

const { requireAuth, requireUserProfile, requireRateLimit, RouteError, toApiErrorResponse } = await import(
  "./route-helpers"
);

function makeRequest(headers: Record<string, string> = {}): Request {
  return new Request("https://light.example/api/x", { headers });
}

describe("requireAuth", () => {
  beforeEach(() => {
    verifyIdToken.mockReset();
  });

  it("throws 'unauthorized' when the Authorization header is missing", async () => {
    await expect(requireAuth(makeRequest() as never)).rejects.toMatchObject({ code: "unauthorized" });
  });

  it("throws 'unauthorized' when the header doesn't start with 'Bearer '", async () => {
    await expect(
      requireAuth(makeRequest({ Authorization: "Basic abc" }) as never),
    ).rejects.toMatchObject({ code: "unauthorized" });
  });

  it("returns the uid on a valid token", async () => {
    verifyIdToken.mockResolvedValue({ uid: "uid-123" });
    const result = await requireAuth(makeRequest({ Authorization: "Bearer good-token" }) as never);
    expect(result).toEqual({ uid: "uid-123" });
    expect(verifyIdToken).toHaveBeenCalledWith("good-token");
  });

  it("throws 'unauthorized' (never leaking the underlying error) when verifyIdToken rejects", async () => {
    verifyIdToken.mockRejectedValue(new Error("some internal Firebase Admin secret detail"));
    await expect(
      requireAuth(makeRequest({ Authorization: "Bearer bad-token" }) as never),
    ).rejects.toMatchObject({ code: "unauthorized" });
  });
});

describe("requireUserProfile", () => {
  beforeEach(() => {
    usersGet.mockReset();
  });

  it("returns the user document when it exists", async () => {
    const user = { uid: "uid-1", name: "أحمد", role: "candidate" };
    usersGet.mockResolvedValue({ exists: true, data: () => user });

    const result = await requireUserProfile("uid-1");
    expect(result).toEqual(user);
  });

  it("throws 'not_found' when no profile document exists", async () => {
    usersGet.mockResolvedValue({ exists: false, data: () => undefined });
    await expect(requireUserProfile("uid-missing")).rejects.toMatchObject({ code: "not_found" });
  });
});

describe("requireRateLimit", () => {
  beforeEach(() => {
    __resetRateLimitStoreForTests();
  });

  it("does not throw while under the bucket limit", () => {
    expect(() => requireRateLimit("uid-rl-1", "chat")).not.toThrow();
  });

  it("throws 'rate_limited' once the bucket limit is exceeded", () => {
    for (let i = 0; i < LIMITS.pdf; i++) {
      requireRateLimit("uid-rl-2", "pdf");
    }
    expect(() => requireRateLimit("uid-rl-2", "pdf")).toThrow(RouteError);
    try {
      requireRateLimit("uid-rl-2", "pdf");
    } catch (error) {
      expect(error).toBeInstanceOf(RouteError);
      expect((error as InstanceType<typeof RouteError>).code).toBe("rate_limited");
    }
  });
});

describe("toApiErrorResponse", () => {
  it("converts a RouteError into its structured response with the original code", async () => {
    const error = new RouteError("not_found", { en: "missing", ar: "مفقود" });
    const response = toApiErrorResponse(error);
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error.code).toBe("not_found");
  });

  it("converts any non-RouteError into a generic 'internal' response without leaking details", async () => {
    const response = toApiErrorResponse(new Error("raw stack trace, secrets, etc"));
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error.code).toBe("internal");
    expect(JSON.stringify(body)).not.toContain("raw stack trace");
  });
});
