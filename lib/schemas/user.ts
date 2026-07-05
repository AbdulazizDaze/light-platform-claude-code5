/**
 * `users/{uid}` — the authoritative identity document (docs/data-models.md).
 *
 * Identity fields here (uid, name, email, phone, role) are authoritative:
 * API routes read from this document, never from a client request body
 * (CLAUDE.md §3.4, PRD §9.8).
 */

import { z } from "zod";
import {
  CitySchema,
  GenderSchema,
  LangPrefSchema,
  NationalitySchema,
  TimestampSchema,
} from "./common";

/**
 * M1 only creates candidates through the public registration flow; the
 * `recruiter` role exists in the schema (data model is shared across M1/M2)
 * but nothing in M1 writes it client-side. See firestore.rules.
 */
export const RoleSchema = z.enum(["candidate", "recruiter"]);
export type Role = z.infer<typeof RoleSchema>;

export const NotificationPrefsSchema = z.object({
  push: z.boolean(),
  email: z.boolean(),
});
export type NotificationPrefs = z.infer<typeof NotificationPrefsSchema>;

export const UserSchema = z.object({
  uid: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().min(1),
  role: RoleSchema,
  gender: GenderSchema,
  city: CitySchema,
  nationality: NationalitySchema,
  linkedin_url: z.string().url().optional(),
  lang_pref: LangPrefSchema,
  fcm_token: z.string().optional(),
  notification_prefs: NotificationPrefsSchema,
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
});

export type User = z.infer<typeof UserSchema>;

/**
 * Shape accepted when a candidate registers (PRD §6.1 step 2: name, phone,
 * city only — everything else defaults). Server sets uid/role/created_at/
 * updated_at; this schema validates only the client-supplied subset.
 */
export const CandidateRegistrationSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  city: CitySchema,
  gender: GenderSchema,
  nationality: NationalitySchema,
  lang_pref: LangPrefSchema.default("ar"),
  email: z.string().email().optional(),
});

export type CandidateRegistration = z.infer<typeof CandidateRegistrationSchema>;

export function parseUser(data: unknown) {
  return UserSchema.safeParse(data);
}
