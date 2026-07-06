/**
 * Pure payload-composition for `POST /api/pdf` (CLAUDE.md §3.4, §9.3;
 * services/pdf/README.md "Request contract").
 *
 * `app/api/pdf/route.ts` is a thin proxy: it verifies auth, loads the
 * server-side identity (`users/{uid}`) and CV substance
 * (`candidate_profiles/{uid}`), validates the client's template/theme/locale
 * choice, and hands both to `buildPdfRenderPayload` here to produce the exact
 * body `services/pdf` expects (`services/pdf/lib/schema.js`'s
 * `RenderRequestSchema`). Kept out of the route so it's unit-testable
 * without mocking Firestore/HTTP.
 *
 * Identity mapping: `personal.name/phone/email/city` come ONLY from the
 * server-side `User` document, never from the client body or the candidate
 * profile's own `personal` block being trusted blindly — `CandidateProfile`
 * happens to mirror `users/{uid}` for these fields (per
 * lib/schemas/profile.ts's `PersonalSchema` doc comment), but this function
 * takes `User` as the identity source explicitly so that contract stays
 * obvious and doesn't silently drift if the two ever diverge.
 */

import type { User } from "@/lib/schemas/user";
import type { CandidateProfile } from "@/lib/schemas/profile";
import type { CvTemplate, CvColorTheme } from "@/lib/cv/themes";
import { resolveCvThemeColors } from "@/lib/cv/themes";
import type { Locale } from "@/lib/i18n";

export interface PdfRequestInput {
  template: CvTemplate;
  theme: CvColorTheme;
  custom_colors?: { primary: string; accent: string };
  locale: Locale;
}

/** Shape `POST {PDF_SERVICE_URL}/render` expects (services/pdf/lib/schema.js `RenderRequestSchema`). */
export interface PdfRenderPayload {
  cv: {
    personal: {
      name: string;
      city: string;
      phone: string;
      email: string;
    };
    professional_summary: CandidateProfile["professional_summary"];
    education: CandidateProfile["education"];
    experience: CandidateProfile["experience"];
    projects: CandidateProfile["projects"];
    skills: CandidateProfile["skills"];
    languages: CandidateProfile["languages"];
    certifications: CandidateProfile["certifications"];
    volunteer_work: CandidateProfile["volunteer_work"];
  };
  template: CvTemplate;
  theme: Exclude<CvColorTheme, "custom"> | { primary: string; accent: string };
  locale: Locale;
}

/**
 * Whether a candidate profile has enough CV substance to render a PDF from.
 * Mirrors the "generate a CV first" gate the chat flow already uses
 * (`professional_summary` is the first field Gemini's CV generation produces
 * — see lib/schemas/cv.ts's `CvSchema` — so its absence means no CV exists
 * yet, regardless of what the rest of the document looks like).
 */
export function hasRenderableCv(
  profile: Pick<CandidateProfile, "professional_summary"> | null | undefined
): boolean {
  if (!profile) return false;
  const summary = profile.professional_summary;
  return Boolean(summary && (summary.en?.trim() || summary.ar?.trim()));
}

/**
 * Compose the exact `services/pdf` `/render` request body from the
 * server-side `User` identity doc, the candidate's CV data, and the
 * client's validated template/theme/locale choice.
 *
 * Theme mapping: named themes (`oxford`, `jungle`, ...) pass through as the
 * theme id string, matching `services/pdf/lib/themes.js`'s `THEMES` keys
 * exactly. `"custom"` resolves through `resolveCvThemeColors` (same helper
 * the live preview uses) into a concrete `{ primary, accent }` hex pair,
 * which is the shape `RenderRequestSchema`'s `CustomColors` union branch
 * expects instead of a theme id.
 */
export function buildPdfRenderPayload(
  user: Pick<User, "name" | "phone" | "email" | "city">,
  profile: CandidateProfile,
  input: PdfRequestInput
): PdfRenderPayload {
  const theme: PdfRenderPayload["theme"] =
    input.theme === "custom"
      ? resolveCvThemeColors("custom", input.custom_colors)
      : input.theme;

  return {
    cv: {
      personal: {
        name: user.name,
        city: user.city,
        phone: user.phone,
        email: user.email ?? "",
      },
      professional_summary: profile.professional_summary,
      education: profile.education,
      experience: profile.experience,
      projects: profile.projects,
      skills: profile.skills,
      languages: profile.languages,
      certifications: profile.certifications,
      volunteer_work: profile.volunteer_work,
    },
    template: input.template,
    theme,
    locale: input.locale,
  };
}
