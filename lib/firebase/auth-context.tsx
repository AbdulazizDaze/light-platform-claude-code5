"use client";

/**
 * Firebase Anonymous Auth context (CLAUDE.md §2, §3.4; PRD §9.8).
 *
 * Deliberately does NOT sign in on mount. Anonymous auth is cheap but not
 * free — every visitor who never registers would otherwise leave behind a
 * throwaway Firebase user. Instead, the app subscribes to auth state (so it
 * can react to an existing session or a session created elsewhere) and
 * exposes `signInAnonymouslyIfNeeded()` for flows that actually need an
 * identity (registration, chat) to call lazily, on user intent.
 */

import * as React from "react";
import {
  onAuthStateChanged,
  signInAnonymously,
  type User,
} from "firebase/auth";
import { auth } from "./client";

export interface AuthContextValue {
  /** The current Firebase user, or null if signed out. */
  user: User | null;
  /** True until the first `onAuthStateChanged` callback fires. */
  loading: boolean;
  /**
   * Ensures a signed-in (anonymous) user exists and returns it. Safe to call
   * repeatedly — returns the existing user instead of creating a new one.
   * Call this from registration/chat entry points, never from a page-load
   * effect that runs for every visitor.
   */
  signInAnonymouslyIfNeeded: () => Promise<User>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Tracks an in-flight sign-in so concurrent callers (e.g. two components
  // mounting at once) share one request instead of racing signInAnonymously().
  const pendingSignIn = React.useRef<Promise<User> | null>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInAnonymouslyIfNeeded = React.useCallback(async (): Promise<User> => {
    if (auth.currentUser) {
      return auth.currentUser;
    }
    if (pendingSignIn.current) {
      return pendingSignIn.current;
    }

    const promise = signInAnonymously(auth)
      .then((credential) => credential.user)
      .finally(() => {
        pendingSignIn.current = null;
      });
    pendingSignIn.current = promise;
    return promise;
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({ user, loading, signInAnonymouslyIfNeeded }),
    [user, loading, signInAnonymouslyIfNeeded]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth() must be used within an <AuthProvider>.");
  }
  return ctx;
}
