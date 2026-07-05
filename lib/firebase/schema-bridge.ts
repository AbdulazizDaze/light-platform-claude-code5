/**
 * Schema <-> Firestore document bridge, shared by the client and admin
 * converters (lib/firebase/converters.client.ts, converters.admin.ts).
 *
 * Deliberately dependency-light: no import of `firebase/firestore` or
 * `firebase-admin/firestore` here, so this module (and the Zod schemas it
 * wraps) can be unit-tested and reused from both SDKs without pulling in
 * either one. The two converter files supply the SDK-specific
 * `FirestoreDataConverter` shape and delegate the actual validation here.
 *
 * Read-path policy: "tolerant" — a document that fails schema validation is
 * logged (console.error, includes the doc path and Zod issues) and passed
 * through as loosely-typed data rather than thrown. Firestore does not
 * enforce a schema, so a stale/partial document (e.g. mid-migration) must
 * not crash the app; callers that need strict guarantees should re-validate
 * with the exported `safeParse`-based helpers in `lib/schemas/*` and handle
 * the failure explicitly. Writes are NOT validated here — schema validation
 * for writes happens at the API-route boundary (docs/conventions.md "API
 * routes") before the typed object ever reaches a converter.
 */

import type { ZodType } from "zod";

export function readTolerant<T>(schema: ZodType<T>, raw: unknown, path: string): T {
  const result = schema.safeParse(raw);
  if (result.success) {
    return result.data;
  }

  // eslint-disable-next-line no-console -- intentional observability for data-integrity drift
  console.error(
    `[firestore-converter] Document at "${path}" failed schema validation:`,
    result.error.issues,
  );
  // Tolerant pass-through: return the raw data typed as T so reads don't
  // crash the app on legacy/partial documents. Callers that need a
  // guarantee should call the schema's `parse*` helper themselves.
  return raw as T;
}

export function writeAsIs<T extends object>(modelObject: T): T {
  // No transformation needed: Zod validation for writes happens at the API
  // route boundary before data is handed to `setDoc`/`.set()`. The
  // converter's job is typing, not re-validation, to avoid double work and
  // to keep this module SDK-agnostic (FieldValue sentinels like
  // `arrayUnion()`/`serverTimestamp()` aren't valid Zod input shapes).
  return modelObject;
}
