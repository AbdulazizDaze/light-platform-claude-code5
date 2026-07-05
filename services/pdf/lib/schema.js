import { z } from 'zod';

// This is a deliberately LOOSE shape. The Next.js side (`lib/schemas/cv.ts`,
// the `cv-schema` skill) owns strict CV validation before it ever reaches
// this service. Here we only guard against malformed requests reaching
// Puppeteer (missing arrays, wrong types) — we do not re-litigate business
// rules (min skills, etc.).

// Accepts either a plain string or a `{ en, ar }` localized object, since
// some fields (institution, company names) may be single-language in
// practice while summary/labels are bilingual.
const LocalizedOrString = z.union([
  z.string(),
  z.object({ en: z.string().optional(), ar: z.string().optional() }).partial(),
]);

const Skill = z.object({
  name: LocalizedOrString,
  level: z.number().int().min(1).max(5).optional(),
  category: z.string().optional(),
  inferred: z.boolean().optional().default(false),
});

const Experience = z.object({
  company: z.string().optional().default(''),
  title: LocalizedOrString.optional(),
  city: z.string().optional().default(''),
  start_date: z.string().optional().default(''),
  end_date: z.string().nullable().optional(),
  is_current: z.boolean().optional().default(false),
  description: z.string().optional().default(''),
  achievements: z.array(z.string()).optional().default([]),
});

const Education = z.object({
  institution: z.string().optional().default(''),
  degree: z.string().optional().default(''),
  field: z.string().optional().default(''),
  start_year: z.union([z.number(), z.string()]).optional(),
  end_year: z.union([z.number(), z.string()]).optional(),
  gpa: z.union([z.number(), z.string()]).optional(),
  achievements: z.array(z.string()).optional().default([]),
});

const Project = z.object({
  name: z.string().optional().default(''),
  description: z.string().optional().default(''),
  technologies: z.array(z.string()).optional().default([]),
  url: z.string().optional(),
  highlights: z.array(z.string()).optional().default([]),
});

const Language = z.object({
  language: z.string(),
  proficiency: z.string().optional().default(''),
});

const Certification = z.object({
  name: z.string(),
  issuer: z.string().optional().default(''),
  date: z.string().optional().default(''),
  url: z.string().optional(),
});

// Display-only identity/header fields — supplied by the proxy from the
// server-side profile, never trusted as "the schema" for identity (that
// integrity rule lives in the Next.js API route / Firestore profile).
const Personal = z.object({
  name: z.string().optional().default(''),
  title: LocalizedOrString.optional(),
  city: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  email: z.string().optional().default(''),
  nationality: z.string().optional(),
  linkedin_url: z.string().optional(),
  portfolio_url: z.string().optional(),
  github_url: z.string().optional(),
});

export const CvInputSchema = z.object({
  personal: Personal.optional().default({}),
  professional_summary: LocalizedOrString.optional(),
  education: z.array(Education).optional().default([]),
  experience: z.array(Experience).optional().default([]),
  projects: z.array(Project).optional().default([]),
  skills: z.array(Skill).optional().default([]),
  languages: z.array(Language).optional().default([]),
  certifications: z.array(Certification).optional().default([]),
  volunteer_work: z.array(z.string()).optional().default([]),
});

const CustomColors = z.object({
  primary: z.string().regex(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/).optional(),
  accent: z.string().regex(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/).optional(),
});

export const RenderRequestSchema = z.object({
  cv: CvInputSchema,
  template: z.enum(['classic', 'modern', 'executive', 'minimal']).default('classic'),
  theme: z.union([
    z.enum(['oxford', 'jungle', 'orange', 'slate', 'burgundy', 'teal']),
    CustomColors,
  ]).optional().default('oxford'),
  locale: z.enum(['ar', 'en']).default('ar'),
});
