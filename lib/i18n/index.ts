/**
 * Core i18n primitives for Light.
 *
 * Non-negotiable per CLAUDE.md §3.1: every user-facing string exists in both
 * `ar` and `en`. Localized content is always `{ en, ar }`, never `field_en` /
 * `field_ar` — see docs/conventions.md.
 */

export type Locale = "ar" | "en";

export interface LocalizedString {
  en: string;
  ar: string;
}

/** Default locale for Light is Arabic (Saudi-first). */
export const DEFAULT_LOCALE: Locale = "ar";

/**
 * Resolve a localized string for the given locale, falling back to the other
 * language if the requested one is empty/missing. Never returns undefined for
 * a well-formed LocalizedString.
 */
export function t(ls: LocalizedString, locale: Locale = DEFAULT_LOCALE): string {
  const primary = ls[locale];
  if (primary && primary.trim().length > 0) {
    return primary;
  }

  const fallbackLocale: Locale = locale === "ar" ? "en" : "ar";
  const fallback = ls[fallbackLocale];
  return fallback ?? "";
}

/** The non-current locale, useful for language-toggle controls. */
export function otherLocale(locale: Locale): Locale {
  return locale === "ar" ? "en" : "ar";
}
