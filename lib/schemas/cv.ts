/**
 * CV JSON contract — the AI-generated CV data contract (cv-schema skill,
 * docs/data-models.md "CV JSON contract", PRD §9.7/§15).
 *
 * THIS IS A SECURITY-CRITICAL SCHEMA. Gemini output is untrusted input.
 * `CvSchema` must never accept identity fields (uid, role, name, email,
 * phone, created_at, updated_at) — those are server-authoritative, sourced
 * from `users/{uid}` (see lib/schemas/user.ts), never from AI output or the
 * request body (CLAUDE.md §3.4/§7).
 *
 * Enforcement is two-layered on purpose:
 *  1. `.strict()` on every object in the tree — unknown keys are rejected
 *     outright, so an identity key injected anywhere in the JSON fails parse
 *     before we even inspect which key it was.
 *  2. An explicit `FORBIDDEN_IDENTITY_KEYS` refinement at the top level,
 *     which exists to make the intent self-documenting and testable even if
 *     a future edit relaxes `.strict()` on the top-level object by mistake.
 */

import { z } from "zod";
import { LocalizedStringSchema } from "./common";

/** Identity/contact/system fields that must never come from AI-generated CV JSON. */
export const FORBIDDEN_IDENTITY_KEYS = [
  "uid",
  "role",
  "name",
  "email",
  "phone",
  "created_at",
  "updated_at",
] as const;

export const SkillSchema = z
  .object({
    name: z.string().min(1),
    level: z.number().int().min(1).max(5),
    category: z.string().min(1),
    inferred: z.boolean(),
  })
  .strict();
export type CvSkill = z.infer<typeof SkillSchema>;

export const ExperienceSchema = z
  .object({
    company: z.string().min(1),
    title: z.string().min(1),
    city: z.string().min(1),
    start_date: z.string().min(1),
    end_date: z.string().optional(),
    is_current: z.boolean(),
    description: z.string().min(1),
    achievements: z.array(z.string()).default([]),
  })
  .strict();
export type CvExperience = z.infer<typeof ExperienceSchema>;

export const EducationSchema = z
  .object({
    institution: z.string().min(1),
    degree: z.string().min(1),
    field: z.string().min(1),
    start_year: z.number().int(),
    end_year: z.number().int().optional(),
    gpa: z.number().optional(),
    achievements: z.array(z.string()).default([]),
  })
  .strict();
export type CvEducation = z.infer<typeof EducationSchema>;

export const ProjectSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().min(1),
    technologies: z.array(z.string()).default([]),
    url: z.string().url().optional(),
    highlights: z.array(z.string()).default([]),
  })
  .strict();
export type CvProject = z.infer<typeof ProjectSchema>;

export const CvLanguageSchema = z
  .object({
    language: z.string().min(1),
    proficiency: z.enum(["basic", "conversational", "fluent", "native"]),
  })
  .strict();
export type CvLanguage = z.infer<typeof CvLanguageSchema>;

export const CertificationSchema = z
  .object({
    name: z.string().min(1),
    issuer: z.string().min(1),
    date: z.string().min(1),
    url: z.string().url().optional(),
  })
  .strict();
export type CvCertification = z.infer<typeof CertificationSchema>;

export const CvSchema = z
  .object({
    professional_summary: LocalizedStringSchema,
    // PRD §6.1 generation threshold: the base prompt already requires
    // education completeness before a CV is produced — validation must match
    // (docs/data-models.md "CV JSON contract").
    education: z.array(EducationSchema).min(1),
    experience: z.array(ExperienceSchema).default([]),
    projects: z.array(ProjectSchema).default([]),
    // PRD §6.1 / cv-schema skill generation threshold: 6+ skills before a CV is produced.
    skills: z.array(SkillSchema).min(6),
    languages: z.array(CvLanguageSchema).min(1),
    certifications: z.array(CertificationSchema).default([]),
    volunteer_work: z.array(z.string()).default([]),
  })
  // Hard block on identity injection: unknown top-level keys (uid, role,
  // name, email, phone, created_at, updated_at, or anything else) fail parse.
  .strict()
  .refine(
    (data) => !FORBIDDEN_IDENTITY_KEYS.some((key) => key in data),
    {
      message: "CV data must not contain identity fields; they are server-authoritative.",
    },
  );

export type Cv = z.infer<typeof CvSchema>;

export type ParsedCv =
  | { success: true; data: Cv }
  | { success: false; error: z.ZodError };

/** Safe-parse wrapper for Gemini CV output. Never throws. */
export function parseCvData(json: unknown): ParsedCv {
  const result = CvSchema.safeParse(json);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Bounded-retry helper for CV generation call sites (ai-prompt-engineer owns
 * the actual Gemini call; this just enforces "validate then trust, retry on
 * failure, never store invalid output" from the cv-schema skill).
 */
export async function generateValidatedCv(
  run: (attempt: number) => Promise<unknown>,
  maxAttempts = 3,
): Promise<Cv> {
  let lastError: z.ZodError | undefined;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const raw = await run(attempt);
    const parsed = parseCvData(raw);
    if (parsed.success) return parsed.data;
    lastError = parsed.error;
  }
  throw new Error(
    `CV_VALIDATION_FAILED${lastError ? `: ${lastError.message}` : ""}`,
  );
}
