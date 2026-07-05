/**
 * `candidate_profiles/{uid}` (docs/data-models.md, PRD §9.7).
 *
 * `personal` is server-populated from `users/{uid}` at write time (never
 * trust client body for it — see CLAUDE.md §3.4). The rest of the document
 * is built from AI-generated `Cv` data (lib/schemas/cv.ts) plus
 * candidate-editable preferences/customization fields.
 */

import { z } from "zod";
import {
  CitySchema,
  GenderSchema,
  JobTypeSchema,
  LocalizedStringSchema,
  NationalitySchema,
  TimestampSchema,
  WorkArrangementSchema,
} from "./common";
import {
  CertificationSchema,
  EducationSchema,
  ExperienceSchema,
  ProjectSchema,
  CvLanguageSchema,
  SkillSchema,
} from "./cv";

/** Server-populated identity/contact block — mirrors `users/{uid}`, never client-supplied. */
export const PersonalSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().min(1),
  city: CitySchema,
  nationality: NationalitySchema,
  gender: GenderSchema,
  linkedin_url: z.string().url().optional(),
  portfolio_url: z.string().url().optional(),
  github_url: z.string().url().optional(),
});
export type Personal = z.infer<typeof PersonalSchema>;

export const AvailabilitySchema = z.enum([
  "immediate",
  "two_weeks",
  "one_month",
  "not_looking",
]);

export const PreferencesSchema = z.object({
  job_type: z.array(JobTypeSchema).default([]),
  work_arrangement: z.array(WorkArrangementSchema).default([]),
  cities: z.array(CitySchema).default([]),
  industries: z.array(z.string()).default([]),
  availability: AvailabilitySchema,
});
export type Preferences = z.infer<typeof PreferencesSchema>;

export const CvTemplateSchema = z.enum(["classic", "modern", "executive", "minimal"]);
/**
 * Theme ids match services/pdf/lib/themes.js THEMES exactly (single source of
 * truth for the 6 named palettes), plus "custom" which uses cv_custom_colors.
 */
export const CvColorThemeSchema = z.enum([
  "oxford",
  "jungle",
  "orange",
  "slate",
  "burgundy",
  "teal",
  "custom",
]);

/** Custom color override, only meaningful when cv_color_theme === "custom". */
export const CvCustomColorsSchema = z
  .object({
    primary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  })
  .optional();

/**
 * `embedding_vector` is intentionally OPTIONAL in M1 — matching (and
 * therefore embedding generation) is an M2 concern (docs/build-roadmap.md).
 * When present it must be exactly 768 floats (text-embedding-004).
 */
export const EmbeddingVectorSchema = z.array(z.number()).length(768).optional();

export const CandidateProfileSchema = z.object({
  personal: PersonalSchema,
  professional_summary: LocalizedStringSchema,
  education: z.array(EducationSchema).default([]),
  experience: z.array(ExperienceSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  skills: z.array(SkillSchema).default([]),
  languages: z.array(CvLanguageSchema).default([]),
  certifications: z.array(CertificationSchema).default([]),
  volunteer_work: z.array(z.string()).default([]),
  preferences: PreferencesSchema,
  embedding_vector: EmbeddingVectorSchema,
  cv_template: CvTemplateSchema.default("classic"),
  cv_color_theme: CvColorThemeSchema.default("oxford"),
  cv_custom_colors: CvCustomColorsSchema,
  profile_completeness: z.number().int().min(0).max(100),
  last_active: TimestampSchema,
  profile_freshness_score: z.number().min(0).max(100).optional(),
});

export type CandidateProfile = z.infer<typeof CandidateProfileSchema>;

export function parseCandidateProfile(data: unknown) {
  return CandidateProfileSchema.safeParse(data);
}
