"use client";

/**
 * Client-side data hooks for the candidate dashboard (docs/design-system.md
 * §10; PRD §6.1 steps 7-9). Subscribes with `onSnapshot` (not one-shot reads)
 * so the dashboard reflects returning-user state live: a CV finished
 * generating in another tab, a chat session completing, etc.
 *
 * Deliberately thin: reads go through the typed converters in
 * `lib/firebase/converters.ts` (docs/conventions.md "Access through typed
 * converters ... No ad-hoc doc.data() casting"). No writes happen here.
 */

import * as React from "react";
import { doc, onSnapshot, type FirestoreError } from "firebase/firestore";

import { db } from "./client";
import {
  candidateProfilesClientConverter,
  chatSessionsClientConverter,
} from "./converters";
import type { CandidateProfile } from "@/lib/schemas/profile";
import type { ChatSession } from "@/lib/schemas/chat";

export interface FirestoreDocState<T> {
  data: T | null;
  /** True only while waiting on the first snapshot. */
  loading: boolean;
  error: FirestoreError | null;
}

/**
 * Subscribes to `candidate_profiles/{uid}` for the given uid. Pass
 * `user?.uid` from `useAuth()`; while `uid` is falsy the hook stays in the
 * loading state and does not attach a listener (there's nothing to read yet
 * — e.g. auth is still resolving).
 */
export function useCandidateProfile(uid: string | null | undefined): FirestoreDocState<CandidateProfile> {
  const [state, setState] = React.useState<FirestoreDocState<CandidateProfile>>({
    data: null,
    loading: true,
    error: null,
  });

  React.useEffect(() => {
    if (!uid) {
      setState({ data: null, loading: true, error: null });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    const ref = doc(db, "candidate_profiles", uid).withConverter(candidateProfilesClientConverter);
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        setState({ data: snapshot.exists() ? snapshot.data() : null, loading: false, error: null });
      },
      (error) => {
        setState({ data: null, loading: false, error });
      },
    );

    return unsubscribe;
  }, [uid]);

  return state;
}

/**
 * Subscribes to `chat_sessions/{uid}` for the given uid. Same contract as
 * `useCandidateProfile` — falsy `uid` keeps it in the loading state.
 */
export function useChatSession(uid: string | null | undefined): FirestoreDocState<ChatSession> {
  const [state, setState] = React.useState<FirestoreDocState<ChatSession>>({
    data: null,
    loading: true,
    error: null,
  });

  React.useEffect(() => {
    if (!uid) {
      setState({ data: null, loading: true, error: null });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    const ref = doc(db, "chat_sessions", uid).withConverter(chatSessionsClientConverter);
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        setState({ data: snapshot.exists() ? snapshot.data() : null, loading: false, error: null });
      },
      (error) => {
        setState({ data: null, loading: false, error });
      },
    );

    return unsubscribe;
  }, [uid]);

  return state;
}

export interface CandidateData {
  profile: FirestoreDocState<CandidateProfile>;
  chatSession: FirestoreDocState<ChatSession>;
}

/**
 * Combined hook for surfaces (like the dashboard) that need both documents
 * at once. Just composes the two single-doc hooks — kept as a convenience
 * so callers don't repeat the uid plumbing.
 */
export function useCandidateData(uid: string | null | undefined): CandidateData {
  const profile = useCandidateProfile(uid);
  const chatSession = useChatSession(uid);
  return { profile, chatSession };
}
