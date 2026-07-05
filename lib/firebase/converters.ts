/**
 * Typed Firestore converters for the M1 candidate collections: `users`,
 * `candidate_profiles`, `chat_sessions`.
 *
 * docs/conventions.md: "Access through typed converters in lib/firebase/.
 * No ad-hoc doc.data() casting." This file is the only place that casts
 * Firestore document data — everywhere else should read/write through a
 * `.withConverter(...)` reference and get a typed `User` / `CandidateProfile`
 * / `ChatSession` back.
 *
 * Client vs. Admin SDK: `firebase/firestore` (client) and
 * `firebase-admin/firestore` (Admin) both expose a `FirestoreDataConverter`
 * with the same `toFirestore`/`fromFirestore` shape, but the client's
 * `fromFirestore` additionally accepts a `SnapshotOptions` second argument
 * (for server-timestamp resolution semantics) that the Admin SDK's does
 * not. We only ever import *types* from each SDK here (no runtime code),
 * so this module has zero bundling cost either direction and stays safe to
 * import from both client components and server-only code — but callers
 * should still only construct the converter variant that matches the SDK
 * instance they're using (`usersClientConverter` with `db` from
 * `lib/firebase/client.ts`, `usersAdminConverter` with `adminDb()` from
 * `lib/firebase/admin.ts`).
 *
 * Read policy: tolerant. See `lib/firebase/schema-bridge.ts` for why reads
 * log-and-pass-through on schema mismatch rather than throwing. Writes are
 * assumed pre-validated at the API-route boundary (Zod), so converters do
 * not re-validate on write.
 */

import type {
  FirestoreDataConverter as ClientFirestoreDataConverter,
  QueryDocumentSnapshot as ClientQueryDocumentSnapshot,
  SnapshotOptions,
  DocumentData as ClientDocumentData,
} from "firebase/firestore";
import type {
  FirestoreDataConverter as AdminFirestoreDataConverter,
  QueryDocumentSnapshot as AdminQueryDocumentSnapshot,
  DocumentData as AdminDocumentData,
} from "firebase-admin/firestore";

import { UserSchema, type User } from "@/lib/schemas/user";
import { CandidateProfileSchema, type CandidateProfile } from "@/lib/schemas/profile";
import { ChatSessionSchema, type ChatSession } from "@/lib/schemas/chat";
import { readTolerant, writeAsIs } from "./schema-bridge";

/** Client-SDK converter for `users/{uid}`. */
export const usersClientConverter: ClientFirestoreDataConverter<User, ClientDocumentData> = {
  toFirestore(modelObject) {
    return writeAsIs(modelObject) as ClientDocumentData;
  },
  fromFirestore(
    snapshot: ClientQueryDocumentSnapshot<ClientDocumentData, ClientDocumentData>,
    options?: SnapshotOptions,
  ): User {
    return readTolerant(UserSchema, snapshot.data(options), snapshot.ref.path);
  },
};

/** Admin-SDK converter for `users/{uid}`. */
export const usersAdminConverter: AdminFirestoreDataConverter<User, AdminDocumentData> = {
  toFirestore(modelObject) {
    return writeAsIs(modelObject) as AdminDocumentData;
  },
  fromFirestore(snapshot: AdminQueryDocumentSnapshot<AdminDocumentData>): User {
    return readTolerant(UserSchema, snapshot.data(), snapshot.ref.path);
  },
};

/** Client-SDK converter for `candidate_profiles/{uid}`. */
export const candidateProfilesClientConverter: ClientFirestoreDataConverter<
  CandidateProfile,
  ClientDocumentData
> = {
  toFirestore(modelObject) {
    return writeAsIs(modelObject) as ClientDocumentData;
  },
  fromFirestore(
    snapshot: ClientQueryDocumentSnapshot<ClientDocumentData, ClientDocumentData>,
    options?: SnapshotOptions,
  ): CandidateProfile {
    return readTolerant(CandidateProfileSchema, snapshot.data(options), snapshot.ref.path);
  },
};

/** Admin-SDK converter for `candidate_profiles/{uid}`. */
export const candidateProfilesAdminConverter: AdminFirestoreDataConverter<
  CandidateProfile,
  AdminDocumentData
> = {
  toFirestore(modelObject) {
    return writeAsIs(modelObject) as AdminDocumentData;
  },
  fromFirestore(snapshot: AdminQueryDocumentSnapshot<AdminDocumentData>): CandidateProfile {
    return readTolerant(CandidateProfileSchema, snapshot.data(), snapshot.ref.path);
  },
};

/** Client-SDK converter for `chat_sessions/{uid}`. */
export const chatSessionsClientConverter: ClientFirestoreDataConverter<
  ChatSession,
  ClientDocumentData
> = {
  toFirestore(modelObject) {
    return writeAsIs(modelObject) as ClientDocumentData;
  },
  fromFirestore(
    snapshot: ClientQueryDocumentSnapshot<ClientDocumentData, ClientDocumentData>,
    options?: SnapshotOptions,
  ): ChatSession {
    return readTolerant(ChatSessionSchema, snapshot.data(options), snapshot.ref.path);
  },
};

/** Admin-SDK converter for `chat_sessions/{uid}`. */
export const chatSessionsAdminConverter: AdminFirestoreDataConverter<
  ChatSession,
  AdminDocumentData
> = {
  toFirestore(modelObject) {
    return writeAsIs(modelObject) as AdminDocumentData;
  },
  fromFirestore(snapshot: AdminQueryDocumentSnapshot<AdminDocumentData>): ChatSession {
    return readTolerant(ChatSessionSchema, snapshot.data(), snapshot.ref.path);
  },
};
