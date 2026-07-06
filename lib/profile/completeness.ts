/**
 * Profile completeness scoring (PRD §6.1 step 9, §11.1 "profile completeness
 * score" KPI; docs/design-system.md §10 dashboard "Profile completeness" card).
 *
 * PURE, deterministic, framework-free — no Firebase/React imports so it stays
 * unit-testable and reusable both client-side (dashboard fallback display)
 * and server-side (whenever `candidate_profiles/{uid}.profile_completeness`
 * is (re)computed on write, e.g. after CV generation).
 *
 * The rubric intentionally accepts a loosely-typed, partial input shape
 * (`CompletenessInput`) rather than the full `CandidateProfile` Zod type:
 * callers may need to score a Firestore document mid-migration, a
 * pre-validation draft, or a client-side snapshot that hasn't round-tripped
 * through the converter yet. Every field access is defensive (optional
 * chaining + `Array.isArray` guards) so malformed/missing input degrades to
 * a lower score instead of throwing.
 */

/** Minimal, defensive shape this function reads from — a subset of `CandidateProfile`. */
export interface CompletenessInput {
  professional_summary?: { en?: unknown; ar?: unknown } | null;
  education?: unknown[] | null;
  experience?: unknown[] | null;
  projects?: unknown[] | null;
  skills?: unknown[] | null;
  languages?: Array<{ proficiency?: unknown } | unknown> | null;
  certifications?: unknown[] | null;
  volunteer_work?: unknown[] | null;
  preferences?: {
    job_type?: unknown[] | null;
    cities?: unknown[] | null;
  } | null;
  /**
   * True once a CV has actually been generated/customized (i.e. the
   * candidate took a deliberate template/theme action), not merely because
   * `cv_template` carries its Zod default of `"classic"`. Callers that only
   * have the raw Firestore doc and no separate "CV exists" signal should
   * pass `Boolean(chatSession?.cv_data)` or equivalent.
   */
  cv_generated?: boolean | null;
}

/**
 * Weighted rubric, exported so the score is self-documenting and testable
 * band-by-band. Weights sum to exactly 100.
 */
export const COMPLETENESS_WEIGHTS = {
  professionalSummary: 20,
  education: 15,
  experience: 20,
  experienceFallbackProjects: 10,
  skills6Plus: 15,
  skills3to5: 10,
  skills1to2: 5,
  languages: 10,
  preferences: 10,
  extras: 5,
  cvGenerated: 5,
} as const;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNonEmptyArray(value: unknown): value is unknown[] {
  return Array.isArray(value) && value.length > 0;
}

function scoreProfessionalSummary(summary: CompletenessInput["professional_summary"]): number {
  if (!summary || typeof summary !== "object") return 0;
  const hasEn = isNonEmptyString((summary as { en?: unknown }).en);
  const hasAr = isNonEmptyString((summary as { ar?: unknown }).ar);
  return hasEn && hasAr ? COMPLETENESS_WEIGHTS.professionalSummary : 0;
}

function scoreEducation(education: CompletenessInput["education"]): number {
  return isNonEmptyArray(education) ? COMPLETENESS_WEIGHTS.education : 0;
}

function scoreExperience(
  experience: CompletenessInput["experience"],
  projects: CompletenessInput["projects"],
): number {
  if (isNonEmptyArray(experience)) return COMPLETENESS_WEIGHTS.experience;
  if (isNonEmptyArray(projects)) return COMPLETENESS_WEIGHTS.experienceFallbackProjects;
  return 0;
}

function scoreSkills(skills: CompletenessInput["skills"]): number {
  const count = Array.isArray(skills) ? skills.length : 0;
  if (count >= 6) return COMPLETENESS_WEIGHTS.skills6Plus;
  if (count >= 3) return COMPLETENESS_WEIGHTS.skills3to5;
  if (count >= 1) return COMPLETENESS_WEIGHTS.skills1to2;
  return 0;
}

function scoreLanguages(languages: CompletenessInput["languages"]): number {
  if (!Array.isArray(languages) || languages.length === 0) return 0;
  const hasProficiency = languages.some(
    (lang) =>
      lang !== null &&
      typeof lang === "object" &&
      isNonEmptyString((lang as { proficiency?: unknown }).proficiency),
  );
  return hasProficiency ? COMPLETENESS_WEIGHTS.languages : 0;
}

function scorePreferences(preferences: CompletenessInput["preferences"]): number {
  if (!preferences || typeof preferences !== "object") return 0;
  const hasJobType = isNonEmptyArray(preferences.job_type);
  const hasCities = isNonEmptyArray(preferences.cities);
  return hasJobType && hasCities ? COMPLETENESS_WEIGHTS.preferences : 0;
}

function scoreExtras(input: CompletenessInput): number {
  const hasAny =
    isNonEmptyArray(input.certifications) ||
    isNonEmptyArray(input.volunteer_work) ||
    isNonEmptyArray(input.projects);
  return hasAny ? COMPLETENESS_WEIGHTS.extras : 0;
}

function scoreCvGenerated(input: CompletenessInput): number {
  return input.cv_generated ? COMPLETENESS_WEIGHTS.cvGenerated : 0;
}

/**
 * Computes the 0-100 profile completeness score. Deterministic and total
 * (never throws) — malformed/partial/missing input simply scores 0 on the
 * affected bands rather than raising.
 */
export function computeProfileCompleteness(input: CompletenessInput | null | undefined): number {
  const safeInput: CompletenessInput = input && typeof input === "object" ? input : {};

  const total =
    scoreProfessionalSummary(safeInput.professional_summary) +
    scoreEducation(safeInput.education) +
    scoreExperience(safeInput.experience, safeInput.projects) +
    scoreSkills(safeInput.skills) +
    scoreLanguages(safeInput.languages) +
    scorePreferences(safeInput.preferences) +
    scoreExtras(safeInput) +
    scoreCvGenerated(safeInput);

  return Math.max(0, Math.min(100, Math.round(total)));
}
