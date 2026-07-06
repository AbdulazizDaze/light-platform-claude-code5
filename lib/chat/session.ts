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
 * block untouched) and mark the session `completed`. Batched so the session
 * and profile writes are atomic.
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

  const messages: ChatMessage[] = [...priorMessages];
  if (userMessageContent !== null && userMessageContent.length > 0) {
    messages.push(newMessage("user", userMessageContent));
  }
  if (assistantReply.length > 0 || assistantQuickReplies.length > 0) {
    messages.push(newMessage("assistant", assistantReply, assistantQuickReplies));
  }

  const status: ChatSessionStatus = cvGenerated ? "completed" : "active";

  const sessionRef = db.collection("chat_sessions").doc(uid).withConverter(chatSessionsAdminConverter);
  const batch = db.batch();

  batch.set(
    sessionRef,
    {
      messages,
      status,
      type: sessionType,
      ...(cvData ? { cv_data: cvData } : {}),
    } as never,
    { merge: true },
  );

  if (cvGenerated && cvData) {
    const profileRef = db
      .collection("candidate_profiles")
      .doc(uid)
      .withConverter(candidateProfilesAdminConverter);
    const profileSnap = await profileRef.get();
    const existingProfile = profileSnap.data();

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

    // Merge ONLY CV content fields — `personal` (identity) is never written
    // here (CLAUDE.md §3.4): it stays server-owned from registration.
    batch.set(
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

  await batch.commit();

  return { status, messages };
}
