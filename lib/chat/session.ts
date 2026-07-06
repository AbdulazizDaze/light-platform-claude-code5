/**
 * chat_sessions/{uid} load/create + turn-persistence (PRD §6.1 steps 3-8,
 * §9.7; docs/data-models.md). Pure(-ish) work functions the `/api/chat` and
 * `/api/cv-upload` routes delegate to per the `nextjs-api-route` skill.
 *
 * Identity integrity (CLAUDE.md §3.4): every write here is keyed by the
 * caller's own `uid` (from the verified token), never the request body.
 * `candidate_profiles/{uid}.personal` is never touched by the CV merge — only
 * CV *content* fields are written.
 */

import { FieldValue, type Firestore } from "firebase-admin/firestore";
import { randomUUID } from "node:crypto";
import {
  chatSessionsAdminConverter,
  candidateProfilesAdminConverter,
} from "@/lib/firebase/converters";
import type { ChatMessage, ChatSession, ChatSessionStatusSchema, ChatSessionTypeSchema } from "@/lib/schemas/chat";
import type { Cv } from "@/lib/schemas/cv";
import { computeProfileCompleteness } from "@/lib/profile/completeness";
import type { z } from "zod";

type ChatSessionStatus = z.infer<typeof ChatSessionStatusSchema>;
type ChatSessionType = z.infer<typeof ChatSessionTypeSchema>;

export interface LoadOrCreateSessionResult {
  session: ChatSession;
  /** True if this call created a brand-new session document. */
  created: boolean;
}

/**
 * Load `chat_sessions/{uid}`, creating it if absent. A brand-new session's
 * `type` is `"returning"` when the candidate's profile already has CV
 * content (professional_summary in both languages), else `"new"`. Callers
 * that just uploaded a CV should override the type to `"cv_upload"`
 * themselves (see `createCvUploadSession`) rather than relying on this
 * default.
 */
export async function loadOrCreateSession(
  db: Firestore,
  uid: string,
): Promise<LoadOrCreateSessionResult> {
  const ref = db.collection("chat_sessions").doc(uid).withConverter(chatSessionsAdminConverter);
  const snapshot = await ref.get();

  if (snapshot.exists) {
    return { session: snapshot.data()!, created: false };
  }

  const profileSnap = await db
    .collection("candidate_profiles")
    .doc(uid)
    .withConverter(candidateProfilesAdminConverter)
    .get();
  const profile = profileSnap.data();
  const hasExistingCv = Boolean(
    profile?.professional_summary?.en && profile?.professional_summary?.ar,
  );

  const initial: ChatSession = {
    messages: [],
    status: "active",
    type: hasExistingCv ? "returning" : "new",
  };

  await ref.set(initial as never);
  return { session: initial, created: true };
}

/** Force-create (or reset) the session as a `cv_upload` session — used by POST /api/cv-upload. */
export async function createCvUploadSession(db: Firestore, uid: string): Promise<ChatSession> {
  const ref = db.collection("chat_sessions").doc(uid).withConverter(chatSessionsAdminConverter);
  const initial: ChatSession = {
    messages: [],
    status: "active",
    type: "cv_upload",
  };
  await ref.set(initial as never);
  return initial;
}

/**
 * Hard cap on messages persisted in `chat_sessions/{uid}.messages`. Keeps the
 * document bounded regardless of how long a conversation runs — the client
 * only ever needs recent history for context/display, and unbounded growth
 * both costs more (document size) and risks the 1MiB Firestore document
 * limit on a very long-running session. When the array would exceed this,
 * only the most recent `MAX_PERSISTED_MESSAGES` are kept.
 */
export const MAX_PERSISTED_MESSAGES = 80;

function trimMessages(messages: ChatMessage[]): ChatMessage[] {
  if (messages.length <= MAX_PERSISTED_MESSAGES) return messages;
  return messages.slice(messages.length - MAX_PERSISTED_MESSAGES);
}

function newMessage(
  role: "user" | "assistant",
  content: string,
  quickReplies?: string[],
): ChatMessage {
  return {
    id: randomUUID(),
    role,
    content,
    ...(quickReplies && quickReplies.length > 0 ? { quick_replies: quickReplies } : {}),
    // `TimestampSchema` types as the Firestore-Timestamp shape but structurally
    // accepts a `Date` at runtime too (lib/schemas/common.ts) — cast is needed
    // only to satisfy the stricter inferred type here, matching the pattern
    // used for FieldValue sentinels elsewhere (lib/users/register-candidate.ts).
    timestamp: new Date() as unknown as ChatMessage["timestamp"],
  };
}

export interface PersistTurnParams {
  uid: string;
  /** Messages already in the session BEFORE this turn (used to compute the new array + message count). */
  priorMessages: ChatMessage[];
  /** The candidate's message this turn, or null to skip appending one (e.g. the initial greeting request). */
  userMessageContent: string | null;
  assistantReply: string;
  assistantQuickReplies: string[];
  cvGenerated: boolean;
  cvData: Cv | null;
  sessionType: ChatSessionType;
}

export interface PersistTurnResult {
  status: ChatSessionStatus;
  messages: ChatMessage[];
}

/**
 * Append this turn's messages to `chat_sessions/{uid}` and, when a CV was
 * generated, merge its content into `candidate_profiles/{uid}` (identity
 * block untouched) and mark the session `completed`.
 *
 * Runs inside a Firestore transaction rather than a plain batch: a batch's
 * writes are unconditional, so two concurrent turns (e.g. a double-submit or
 * overlapping retries) racing on `priorMessages` would both blind-write their
 * own `[...priorMessages, ...]` array and the loser's message(s) would be
 * silently dropped (a lost update). The transaction instead re-reads the
 * session doc AT COMMIT TIME, appends this turn onto whatever is actually
 * there, and its write is aborted/retried by the SDK if the doc changed
 * since the read — so concurrent turns compose instead of clobbering.
 */
export async function persistTurn(
  db: Firestore,
  params: PersistTurnParams,
): Promise<PersistTurnResult> {
  const {
    uid,
    priorMessages,
    userMessageContent,
    assistantReply,
    assistantQuickReplies,
    cvGenerated,
    cvData,
    sessionType,
  } = params;

  const status: ChatSessionStatus = cvGenerated ? "completed" : "active";

  const sessionRef = db.collection("chat_sessions").doc(uid).withConverter(chatSessionsAdminConverter);
  const profileRef = db
    .collection("candidate_profiles")
    .doc(uid)
    .withConverter(candidateProfilesAdminConverter);

  const messages = await db.runTransaction(async (tx) => {
    // Firestore transactions require ALL reads before ANY write — read the
    // session and (when merging a CV) the profile up front, then write.
    // Re-reading the session inside the transaction means a concurrent
    // turn's append (if any) is composed onto, not overwritten. Fall back to
    // the caller-supplied `priorMessages` if the doc vanished between the
    // caller's own read and this transaction (shouldn't happen in practice,
    // but keeps this function total).
    const sessionSnap = await tx.get(sessionRef);
    const profileSnap = cvGenerated && cvData ? await tx.get(profileRef) : null;

    const currentMessages = sessionSnap.exists ? sessionSnap.data()!.messages : priorMessages;

    const nextMessages: ChatMessage[] = [...currentMessages];
    if (userMessageContent !== null && userMessageContent.length > 0) {
      nextMessages.push(newMessage("user", userMessageContent));
    }
    if (assistantReply.length > 0 || assistantQuickReplies.length > 0) {
      nextMessages.push(newMessage("assistant", assistantReply, assistantQuickReplies));
    }
    const trimmedMessages = trimMessages(nextMessages);

    tx.set(
      sessionRef,
      {
        messages: trimmedMessages,
        status,
        type: sessionType,
        ...(cvData ? { cv_data: cvData } : {}),
      } as never,
      { merge: true },
    );

    if (cvGenerated && cvData) {
      const existingProfile = profileSnap?.data();

      const completeness = computeProfileCompleteness({
        professional_summary: cvData.professional_summary,
        education: cvData.education,
        experience: cvData.experience,
        projects: cvData.projects,
        skills: cvData.skills,
        languages: cvData.languages,
        certifications: cvData.certifications,
        volunteer_work: cvData.volunteer_work,
        preferences: existingProfile?.preferences ?? null,
        cv_generated: true,
      });

      // Merge ONLY CV content fields — `personal` (identity) is never
      // written here (CLAUDE.md §3.4): it stays server-owned from registration.
      tx.set(
        profileRef,
        {
          professional_summary: cvData.professional_summary,
          education: cvData.education,
          experience: cvData.experience,
          projects: cvData.projects,
          skills: cvData.skills,
          languages: cvData.languages,
          certifications: cvData.certifications,
          volunteer_work: cvData.volunteer_work,
          profile_completeness: completeness,
          last_active: FieldValue.serverTimestamp(),
        } as never,
        { merge: true },
      );
    }

    return trimmedMessages;
  });

  return { status, messages };
}
