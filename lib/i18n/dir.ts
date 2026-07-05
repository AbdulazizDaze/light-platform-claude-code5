import type { Locale } from "./index";

export type Direction = "rtl" | "ltr";

/** RTL for Arabic, LTR for English — RTL is the default per CLAUDE.md §3.2. */
export function dirFor(locale: Locale): Direction {
  return locale === "ar" ? "rtl" : "ltr";
}

/**
 * Pick between two logical-direction values based on locale. Small helper for
 * the rare case a component needs a directional value (not just a CSS
 * logical property, which should be preferred whenever possible).
 */
export function pickByDir<T>(locale: Locale, rtlValue: T, ltrValue: T): T {
  return dirFor(locale) === "rtl" ? rtlValue : ltrValue;
}
