import type { LocalizedString } from "../index";

/**
 * Shared, app-wide strings. Keep Saudi-appropriate, professional Arabic
 * (not MSA-stiff, not slang) — see CLAUDE.md §3.3.
 */
export const appName: LocalizedString = {
  en: "Light",
  ar: "لايت",
};

export const commonStrings = {
  save: { en: "Save", ar: "حفظ" } satisfies LocalizedString,
  cancel: { en: "Cancel", ar: "إلغاء" } satisfies LocalizedString,
  download: { en: "Download", ar: "تحميل" } satisfies LocalizedString,
  retry: { en: "Retry", ar: "إعادة المحاولة" } satisfies LocalizedString,
  loading: { en: "Loading…", ar: "جارٍ التحميل…" } satisfies LocalizedString,
  error: {
    en: "Something went wrong. Please try again.",
    ar: "حدث خطأ ما. الرجاء المحاولة مرة أخرى.",
  } satisfies LocalizedString,
  continue: { en: "Continue", ar: "متابعة" } satisfies LocalizedString,
  back: { en: "Back", ar: "رجوع" } satisfies LocalizedString,
  close: { en: "Close", ar: "إغلاق" } satisfies LocalizedString,
} as const;
