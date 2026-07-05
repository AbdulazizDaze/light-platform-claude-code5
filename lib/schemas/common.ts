/**
 * Shared Zod building blocks for Light's Firestore schemas.
 *
 * Per docs/conventions.md: localized fields are always `{ en, ar }` objects
 * (never `field_en` / `field_ar`), and types are inferred from Zod schemas.
 */

import { z } from "zod";

/** `{ en, ar }` — the canonical shape for any bilingual, user-facing text. */
export const LocalizedStringSchema = z.object({
  en: z.string().min(1),
  ar: z.string().min(1),
});
export type LocalizedStringInput = z.infer<typeof LocalizedStringSchema>;

/**
 * Firestore `Timestamp` handling.
 *
 * Both the client SDK (`firebase/firestore`) and the Admin SDK
 * (`firebase-admin/firestore`) expose a `Timestamp` class with the same
 * duck-typed shape: `{ seconds, nanoseconds, toDate(): Date, toMillis(): number }`.
 * `lib/schemas` must stay dependency-light and usable from both client and
 * server code, so we do NOT import either SDK's concrete `Timestamp` class
 * here. Instead we structurally validate "anything Timestamp-shaped", and
 * also accept a `Date` or an ISO string so schemas remain usable in tests
 * and in contexts where a plain JS value stands in for a Firestore Timestamp
 * (e.g. before a converter has round-tripped it, or in Vitest fixtures).
 *
 * Firestore converters (lib/firebase/converters.ts) are responsible for the
 * concrete `Timestamp` <-> `Date` translation at the read/write boundary;
 * this schema only guards shape.
 */
const TimestampLikeSchema = z.custom<{ seconds: number; nanoseconds: number }>(
  (val) => {
    if (val instanceof Date) return true;
    if (typeof val === "string" && !Number.isNaN(Date.parse(val))) return true;
    if (
      typeof val === "object" &&
      val !== null &&
      "seconds" in val &&
      "nanoseconds" in val &&
      typeof (val as { seconds: unknown }).seconds === "number" &&
      typeof (val as { nanoseconds: unknown }).nanoseconds === "number"
    ) {
      return true;
    }
    return false;
  },
  { message: "Expected a Firestore Timestamp, Date, or ISO date string" },
);

export const TimestampSchema = TimestampLikeSchema;
export type TimestampInput = z.infer<typeof TimestampSchema>;

/** The 18 Saudi cities Light supports at launch (PRD §18.B). */
export const SAUDI_CITIES = [
  "Riyadh",
  "Jeddah",
  "Dammam",
  "Makkah",
  "Madinah",
  "Khobar",
  "Dhahran",
  "Tabuk",
  "Abha",
  "Taif",
  "Hail",
  "Jazan",
  "Najran",
  "Al Baha",
  "Yanbu",
  "Al Jubail",
  "Buraidah",
  "Khamis Mushait",
] as const;

export const CitySchema = z.enum(SAUDI_CITIES);
export type City = z.infer<typeof CitySchema>;

/** Shared enums referenced across users / profiles / cv contracts. */
export const GenderSchema = z.enum(["male", "female"]);
export const NationalitySchema = z.enum(["saudi", "non_saudi"]);
export const LangPrefSchema = z.enum(["ar", "en"]);
export const JobTypeSchema = z.enum(["full_time", "part_time", "contract", "internship"]);
export const WorkArrangementSchema = z.enum(["remote", "on_site", "hybrid"]);
export const LanguageProficiencySchema = z.enum([
  "basic",
  "conversational",
  "fluent",
  "native",
]);
