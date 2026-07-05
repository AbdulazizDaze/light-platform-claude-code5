// Localized section headings + small UI strings for the CV PDF.
// Kept intentionally small/self-contained (the PDF service does not import
// the Next.js app's lib/i18n — it is a standalone Cloud Run service).

export const LABELS = {
  professional_summary: { en: 'Professional Summary', ar: 'الملخص المهني' },
  experience: { en: 'Experience', ar: 'الخبرات العملية' },
  education: { en: 'Education', ar: 'التعليم' },
  projects: { en: 'Projects', ar: 'المشاريع' },
  skills: { en: 'Skills', ar: 'المهارات' },
  languages: { en: 'Languages', ar: 'اللغات' },
  certifications: { en: 'Certifications', ar: 'الشهادات' },
  volunteer_work: { en: 'Volunteer Work', ar: 'العمل التطوعي' },
  contact: { en: 'Contact', ar: 'التواصل' },
  present: { en: 'Present', ar: 'حتى الآن' },
  ai_inferred: { en: 'AI', ar: 'ذكاء اصطناعي' },
};

export function t(key, locale) {
  const entry = LABELS[key];
  if (!entry) return key;
  return locale === 'ar' ? entry.ar : entry.en;
}

export function dir(locale) {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

// Minimal HTML-escaping for any user-controlled string field before
// interpolating into template markup.
export function esc(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Pick the localized string out of a `{ en, ar }` object, tolerating a plain
// string (defensive — proxy should already normalize, but templates should
// not crash on slightly-loose input).
export function loc(value, locale, fallback = '') {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  const primary = value[locale];
  const other = value[locale === 'ar' ? 'en' : 'ar'];
  return primary || other || fallback;
}
