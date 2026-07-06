/**
 * cv-state.ts — the ACCUMULATING extraction state (PRD v3 §5.2 turn engine).
 *
 * This is the structured `cv_state` the conversation engine builds up turn by
 * turn. It is the SAME shape family as `CvSchema` (lib/schemas/cv.ts), but
 * everything is optional/partial: on any given turn the model has only seen
 * part of the picture, so a valid state can be almost empty (early turns) or
 * nearly complete (right before CV generation). The final, polished
 * bilingual `CvSchema` is produced by a separate dedicated call
 * (cv-generation-prompt.ts) from a complete state — NOT by this schema.
 *
 * SECURITY (CLAUDE.md §3.4/§3.5/§7): this validates UNTRUSTED Gemini output.
 * Enforcement mirrors CvSchema, two-layered:
 *  1. `.strict()` on every object — unknown keys (including any identity key
 *     injected anywhere in the tree) fail parse outright.
 *  2. An explicit `FORBIDDEN_IDENTITY_KEYS` refinement at the top level — the
 *     same list CvSchema uses — so the intent is self-documenting and testable
 *     even if a future edit relaxes `.strict()`.
 *
 * Difference from CvSchema, deliberately:
 *  - `professional_summary` is OPTIONAL and may be partial (`{ en?, ar? }`) —
 *    the chat turn should not be forced to author a polished bilingual summary;
 *    that is the generation call's job.
 *  - all arrays `.default([])` so a sparse state round-trips cleanly.
 *  - all scalar leaves that CvSchema requires are optional here (e.g. an
 *    experience the candidate only half-described).
 */

import { z } from "zod";
import { FORBIDDEN_IDENTITY_KEYS } from "./cv";

/**
 * A partial skill. `name` still must be a non-empty string when present (never
 * an `{ en, ar }` object — skill names are plain strings, per CvSchema), but
 * level/category/inferred are optional while the picture is incomplete.
 */
export const PartialSkillSchema = z
  .object({
    name: z.string().min(1),
    level: z.number().int().min(1).max(5).optional(),
    category: z.string().min(1).optional(),
    inferred: z.boolean().optional(),
  })
  .strict();
export type PartialCvSkill = z.infer<typeof PartialSkillSchema>;

export const PartialExperienceSchema = z
  .object({
    company: z.string().min(1),
    title: z.string().min(1).optional(),
    city: z.string().min(1).optional(),
    start_date: z.string().min(1).optional(),
    end_date: z.string().min(1).optional(),
    is_current: z.boolean().optional(),
    description: z.string().min(1).optional(),
    achievements: z.array(z.string()).default([]),
  })
  .strict();
export type PartialCvExperience = z.infer<typeof PartialExperienceSchema>;

export const PartialEducationSchema = z
  .object({
    institution: z.string().min(1),
    degree: z.string().min(1).optional(),
    field: z.string().min(1).optional(),
    start_year: z.number().int().optional(),
    end_year: z.number().int().optional(),
    gpa: z.number().optional(),
    /** Free-text status marker the engine tracks, e.g. "طالب" / "خريج". */
    status: z.string().min(1).optional(),
    achievements: z.array(z.string()).default([]),
  })
  .strict();
export type PartialCvEducation = z.infer<typeof PartialEducationSchema>;

export const PartialProjectSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().min(1).optional(),
    technologies: z.array(z.string()).default([]),
    url: z.string().url().optional(),
    highlights: z.array(z.string()).default([]),
  })
  .strict();
export type PartialCvProject = z.infer<typeof PartialProjectSchema>;

export const PartialLanguageSchema = z
  .object({
    language: z.string().min(1),
    proficiency: z.enum(["basic", "conversational", "fluent", "native"]).optional(),
  })
  .strict();
export type PartialCvLanguage = z.infer<typeof PartialLanguageSchema>;

export const PartialCertificationSchema = z
  .object({
    name: z.string().min(1),
    issuer: z.string().min(1).optional(),
    date: z.string().min(1).optional(),
    url: z.string().url().optional(),
  })
  .strict();
export type PartialCvCertification = z.infer<typeof PartialCertificationSchema>;

/** Partial bilingual summary — either language may still be missing mid-conversation. */
export const PartialSummarySchema = z
  .object({
    en: z.string().min(1).optional(),
    ar: z.string().min(1).optional(),
  })
  .strict();
export type PartialSummary = z.infer<typeof PartialSummarySchema>;

/**
 * The accumulating extraction state. Everything optional/partial; arrays
 * default to []. `.strict()` throughout + identity refinement at the top.
 * `target_role` and `preferences_note` are engine-only scratch fields (they
 * are NOT part of CvSchema) that drive readiness and the eventual generation
 * call — they carry no identity.
 */
export const PartialCvSchema = z
  .object({
    professional_summary: PartialSummarySchema.optional(),
    education: z.array(PartialEducationSchema).default([]),
    experience: z.array(PartialExperienceSchema).default([]),
    projects: z.array(PartialProjectSchema).default([]),
    skills: z.array(PartialSkillSchema).default([]),
    languages: z.array(PartialLanguageSchema).default([]),
    certifications: z.array(PartialCertificationSchema).default([]),
    volunteer_work: z.array(z.string()).default([]),
    /** The candidate's stated target role / aspiration (engine-only, not in CvSchema). */
    target_role: z.string().min(1).optional(),
    /** Free-text notes on job preferences the candidate mentioned (engine-only). */
    preferences_note: z.string().min(1).optional(),
  })
  .strict()
  .refine(
    (data) => !FORBIDDEN_IDENTITY_KEYS.some((key) => key in data),
    {
      message: "CV state must not contain identity fields; they are server-authoritative.",
    },
  );

export type PartialCv = z.infer<typeof PartialCvSchema>;

/**
 * The full turn response the chat model must emit as a single JSON object
 * (jsonMode). PRD v3 §5.2:
 *  - `reply`     — natural Arabic (or mirrored English) reflection + gaps.
 *  - `quick_replies` — 0–3 short suggestions, only when genuinely useful.
 *  - `state`     — the FULL updated PartialCv (idempotent, not a diff).
 *  - `ready`     — the model's ADVISORY judgment the state is CV-ready. The
 *                  SERVER re-checks deterministically (checkReadiness).
 */
export const TurnResponseSchema = z
  .object({
    reply: z.string().min(1),
    quick_replies: z.array(z.string()).max(3).default([]),
    state: PartialCvSchema,
    ready: z.boolean(),
  })
  .strict();

export type TurnResponse = z.infer<typeof TurnResponseSchema>;

export type ParsedTurnResponse =
  | { success: true; data: TurnResponse }
  | { success: false; error: z.ZodError };

/** Safe-parse wrapper for the chat turn's JSON output. Never throws. */
export function parseTurnResponse(json: unknown): ParsedTurnResponse {
  const result = TurnResponseSchema.safeParse(json);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

export type ParsedPartialCv =
  | { success: true; data: PartialCv }
  | { success: false; error: z.ZodError };

/** Safe-parse wrapper for a bare PartialCv (e.g. a persisted cv_state). Never throws. */
export function parsePartialCv(json: unknown): ParsedPartialCv {
  const result = PartialCvSchema.safeParse(json);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
