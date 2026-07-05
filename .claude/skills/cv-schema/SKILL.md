---
name: cv-schema
description: Use when defining, validating, or consuming the CV data contract — the Zod schema for AI-generated bilingual CVs, inferred-skill tagging, and rejection of identity fields. Trigger for CV JSON generation, CvCard, PDF rendering input, or profile writes.
---

# CV Schema

The CV is AI-generated JSON that must be Zod-validated before it is stored, displayed, or rendered to
PDF. This skill defines the contract. Localized fields are `{ en, ar }`.

## Principles
- **Validate then trust.** Parse Gemini output with `CvSchema.safeParse`. Invalid → retry (max 2) →
  graceful error. Never store invalid output.
- **Reject identity fields.** The schema must not accept `uid`, `role`, `created_at`, or `updated_at`
  from the model. Identity comes from the server-side `users` profile.
- **Tag inference.** Skills the AI inferred (not stated by the user) carry `inferred: true`.
- **Bilingual by construction.** `professional_summary` and any display copy are `{ en, ar }`.

## Canonical schema (lib/schemas/cv.ts)
```ts
import { z } from "zod";

const Localized = z.object({ en: z.string().min(1), ar: z.string().min(1) });

export const SkillSchema = z.object({
  name: z.string().min(1),
  level: z.number().int().min(1).max(5),
  category: z.string().min(1),
  inferred: z.boolean(),
});

export const ExperienceSchema = z.object({
  company: z.string(), title: z.string(), city: z.string(),
  start_date: z.string(), end_date: z.string().optional(),
  is_current: z.boolean(),
  description: z.string(),
  achievements: z.array(z.string()).default([]),
});

export const EducationSchema = z.object({
  institution: z.string(), degree: z.string(), field: z.string(),
  start_year: z.number().int(), end_year: z.number().int().optional(),
  gpa: z.number().optional(),
  achievements: z.array(z.string()).default([]),
});

export const CvSchema = z.object({
  professional_summary: Localized,
  education: z.array(EducationSchema),
  experience: z.array(ExperienceSchema).default([]),
  projects: z.array(z.object({
    name: z.string(), description: z.string(),
    technologies: z.array(z.string()).default([]),
    url: z.string().url().optional(),
    highlights: z.array(z.string()).default([]),
  })).default([]),
  skills: z.array(SkillSchema).min(6),          // PRD threshold: 6+ skills
  languages: z.array(z.object({
    language: z.string(), proficiency: z.string(),
  })).min(1),
  certifications: z.array(z.object({
    name: z.string(), issuer: z.string(), date: z.string(),
    url: z.string().url().optional(),
  })).default([]),
  volunteer_work: z.array(z.string()).default([]),
})
// Hard block on identity injection:
.strict();

export type Cv = z.infer<typeof CvSchema>;
```

## Validate-with-retry helper
```ts
export async function generateValidatedCv(run: () => Promise<unknown>) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const raw = await run();
    const parsed = CvSchema.safeParse(raw);
    if (parsed.success) return parsed.data;
    // log parsed.error.issues for observability; loop retries (max 2 retries)
  }
  throw new Error("CV_VALIDATION_FAILED");
}
```

## Generation thresholds (from PRD §6.1)
Only produce a CV when: education complete, 6+ skills, languages with proficiency, and a target role.
Otherwise keep conversing (respecting pacing: nudge at msg 8+, force at msg 14+).

## Related
`gemini-prompt` (produces the JSON), `matching-algorithm` (consumes skills/experience),
`pdf-service-engineer` (renders it), `bilingual-content` (localized copy).
