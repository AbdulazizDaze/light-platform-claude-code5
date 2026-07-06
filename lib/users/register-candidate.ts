/**
 * Candidate registration write path (PRD §6.1 step 2, §9.8, §16.1;
 * docs/data-models.md `users/{userId}` + `candidate_profiles/{userId}`).
 *
 * This is the pure(-ish) work function the API route delegates to per the
 * `nextjs-api-route` skill. It takes an already-Zod-validated registration
 * payload and the caller's uid (from the verified token, never the body),
 * and performs the idempotent create-or-update batch write.
 *
 * Identity integrity (CLAUDE.md §3.4): `uid` and `role` are set here from
 * the function's own parameters/constants, never read off `input`. On an
 * existing user doc, only non-identity fields are updated — `uid`, `role`,
 * `phone`, `created_at`, and `consent_accepted_at` are preserved from the
 * initial registration (mirrors firestore.rules' `unchanged(['uid','role',
 * 'phone'])` guard for direct client writes; this server path is
 * additionally careful not to let a second POST silently move the recorded
 * consent timestamp). `phone` is the persistent identifier for a candidate —
 * a legitimate phone-number change is a dedicated, verified flow (not yet
 * built), never an implicit side effect of re-submitting the registration
 * form. Likewise `profile.personal.phone` is never touched by the update
 * path — only set once at first registration.
 */

import { FieldValue, type Firestore } from "firebase-admin/firestore";
import { usersAdminConverter, candidateProfilesAdminConverter } from "@/lib/firebase/converters";
import type { CandidateRegistration } from "@/lib/schemas/user";

export interface RegisterCandidateResult {
  /** True if this call created new `users/{uid}` + `candidate_profiles/{uid}` docs. */
  created: boolean;
}

/**
 * Create (or update) `users/{uid}` and, on first registration, an
 * empty-shell `candidate_profiles/{uid}`, in a single atomic batch.
 */
export async function registerCandidate(
  db: Firestore,
  uid: string,
  input: CandidateRegistration
): Promise<RegisterCandidateResult> {
  const usersRef = db.collection("users").doc(uid).withConverter(usersAdminConverter);
  const profileRef = db
    .collection("candidate_profiles")
    .doc(uid)
    .withConverter(candidateProfilesAdminConverter);

  const existing = await usersRef.get();
  const batch = db.batch();

  if (!existing.exists) {
    // --- First registration: create both docs. ---
    batch.set(usersRef, {
      uid,
      name: input.name,
      phone: input.phone,
      role: "candidate",
      gender: input.gender,
      city: input.city,
      nationality: input.nationality,
      lang_pref: input.lang_pref,
      ...(input.email ? { email: input.email } : {}),
      notification_prefs: { push: false, email: false },
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
      // PDPL consent capture (CLAUDE.md §3.7, PRD §16.1) — server-side
      // timestamp, recorded once at first registration.
      consent_accepted_at: FieldValue.serverTimestamp(),
    } as never); // FieldValue sentinels aren't valid `User` shape pre-round-trip; see schema-bridge.ts writeAsIs().

    batch.set(profileRef, {
      personal: {
        name: input.name,
        phone: input.phone,
        city: input.city,
        nationality: input.nationality,
        gender: input.gender,
        ...(input.email ? { email: input.email } : {}),
      },
      professional_summary: { en: "", ar: "" },
      education: [],
      experience: [],
      projects: [],
      skills: [],
      languages: [],
      certifications: [],
      volunteer_work: [],
      preferences: {
        job_type: [],
        work_arrangement: [],
        cities: [],
        industries: [],
        availability: "not_looking",
      },
      cv_template: "classic",
      cv_color_theme: "oxford",
      profile_completeness: 0,
      last_active: FieldValue.serverTimestamp(),
    } as never);

    await batch.commit();
    return { created: true };
  }

  // --- Idempotent re-registration: update non-identity fields only. ---
  // uid/role/phone/created_at/consent_accepted_at are intentionally never touched.
  batch.set(
    usersRef,
    {
      name: input.name,
      gender: input.gender,
      city: input.city,
      nationality: input.nationality,
      lang_pref: input.lang_pref,
      ...(input.email ? { email: input.email } : {}),
      updated_at: FieldValue.serverTimestamp(),
    } as never,
    { merge: true }
  );

  batch.set(
    profileRef,
    {
      personal: {
        name: input.name,
        city: input.city,
        nationality: input.nationality,
        gender: input.gender,
        ...(input.email ? { email: input.email } : {}),
      },
      last_active: FieldValue.serverTimestamp(),
    } as never,
    { merge: true }
  );

  await batch.commit();
  return { created: false };
}
