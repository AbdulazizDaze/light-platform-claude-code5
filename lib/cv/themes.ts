/**
 * CV color theme PREVIEW constants (client-side only).
 *
 * Source of truth for these six palettes is `services/pdf/lib/themes.js`
 * (`THEMES`) — the PDF service is what actually prints the CV, so if the two
 * ever drift the PDF wins. This file mirrors those hex values so the
 * in-browser live preview (`components/cv/cv-preview.tsx`) can render an
 * approximation without importing a `.js` service file into the Next.js
 * client bundle.
 *
 * This is DATA, not styling — see CLAUDE.md §4 / docs/design-system.md §2
 * ("reference semantic tokens, never raw hex"). Theme swatches are a
 * deliberate, documented exception (like app/globals.css): the six palettes
 * themselves are branded design data the user picks between, not arbitrary
 * per-component styling. No other file may hardcode hex — extend this
 * constant instead.
 *
 * `lib/schemas/profile.ts` exports the Zod schemas (`CvTemplateSchema`,
 * `CvColorThemeSchema`) but not their inferred types — per
 * docs/conventions.md ("types are inferred from Zod schemas"), we derive
 * them here rather than duplicating the literal union by hand. Other CV
 * components import `CvTemplate` / `CvColorTheme` from this module.
 */

import type { z } from "zod";
import type { CvColorThemeSchema, CvTemplateSchema } from "@/lib/schemas/profile";

export type CvTemplate = z.infer<typeof CvTemplateSchema>;
export type CvColorTheme = z.infer<typeof CvColorThemeSchema>;

export interface CvThemeColors {
  primary: string;
  accent: string;
}

/** Keep in sync with services/pdf/lib/themes.js THEMES. */
export const CV_THEMES: Record<Exclude<CvColorTheme, "custom">, CvThemeColors> = {
  oxford: { primary: "#14213D", accent: "#22AE89" }, // brand default
  jungle: { primary: "#134E36", accent: "#22AE89" },
  orange: { primary: "#14213D", accent: "#FCA311" },
  slate: { primary: "#334155", accent: "#0EA5E9" },
  burgundy: { primary: "#4C1D24", accent: "#B0384D" },
  teal: { primary: "#0F3D3E", accent: "#14B8A6" },
};

export const DEFAULT_CV_THEME_ID: Exclude<CvColorTheme, "custom"> = "oxford";

/**
 * Platinum border/disabled token (CLAUDE.md §4). Exported here — themes.ts is
 * the documented hex-exception file (see file header) — for the one UI
 * fallback that needs a literal swatch color rather than a semantic
 * `border-*` Tailwind class: `CustomSwatchButton` in cv-customizer.tsx uses
 * it as the gradient fallback when a custom hex input is invalid/empty.
 */
export const PLATINUM_BORDER = "#E3E3E3";

export const CV_THEME_IDS = Object.keys(CV_THEMES) as Array<
  Exclude<CvColorTheme, "custom">
>;

const HEX_RE = /^#([0-9a-fA-F]{6})$/;

export function isValidHex(value: string): boolean {
  return HEX_RE.test(value);
}

/**
 * Resolve a theme id + optional custom colors into a concrete
 * `{ primary, accent }` pair for the live preview. Mirrors
 * `resolveTheme()` in services/pdf/lib/themes.js so preview and print
 * agree whenever the custom colors are valid.
 */
export function resolveCvThemeColors(
  theme: CvColorTheme,
  customColors?: { primary?: string; accent?: string } | null
): CvThemeColors {
  if (theme === "custom") {
    const primary =
      customColors?.primary && isValidHex(customColors.primary)
        ? customColors.primary
        : CV_THEMES[DEFAULT_CV_THEME_ID].primary;
    const accent =
      customColors?.accent && isValidHex(customColors.accent)
        ? customColors.accent
        : CV_THEMES[DEFAULT_CV_THEME_ID].accent;
    return { primary, accent };
  }

  return CV_THEMES[theme] ?? CV_THEMES[DEFAULT_CV_THEME_ID];
}
