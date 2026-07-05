/**
 * `authedFetch()` — the only sanctioned way client code talks to Light's own
 * API routes (docs/conventions.md, CLAUDE.md §3.4). Attaches the current
 * Firebase user's ID token as a Bearer token so the server can verify
 * identity itself; the server never trusts a uid/role/name passed in the
 * request body.
 */

import { auth } from "@/lib/firebase/client";

export class AuthedFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthedFetchError";
  }
}

/**
 * Fetch wrapper that attaches `Authorization: Bearer <idToken>` for the
 * current signed-in Firebase user, plus JSON headers by default. Throws
 * `AuthedFetchError` if there is no signed-in user — callers should ensure
 * `signInAnonymouslyIfNeeded()` has resolved before calling this.
 */
export async function authedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const user = auth.currentUser;
  if (!user) {
    throw new AuthedFetchError(
      "authedFetch() called with no signed-in user. Call signInAnonymouslyIfNeeded() first."
    );
  }

  const idToken = await user.getIdToken();

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${idToken}`);
  if (!headers.has("Content-Type") && init.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(input, { ...init, headers });
}
