import type { LocalizedString } from "../index";

/**
 * Strings for the candidate chat surface (/chat) and the inline CvCard
 * (docs/design-system.md §6/§10, PRD §6.1). Saudi-appropriate, conversational
 * Arabic for chat chrome; professional register for CV section headings.
 */
export const chatStrings = {
  // Composer
  composerPlaceholder: {
    en: "Type your message...",
    ar: "اكتب رسالتك...",
  } satisfies LocalizedString,
  send: { en: "Send", ar: "إرسال" } satisfies LocalizedString,

  // Loading / typing
  typingLabel: { en: "Light is typing...", ar: "لايت يكتب الآن..." } satisfies LocalizedString,

  // Errors
  retry: { en: "Retry", ar: "إعادة المحاولة" } satisfies LocalizedString,
  sendErrorTitle: {
    en: "Message didn't send",
    ar: "تعذّر إرسال الرسالة",
  } satisfies LocalizedString,
  sendErrorBody: {
    en: "Something went wrong. Please try again.",
    ar: "حدث خطأ ما. الرجاء المحاولة مرة أخرى.",
  } satisfies LocalizedString,
  rateLimitTitle: {
    en: "Slow down a little",
    ar: "تمهّل شوي",
  } satisfies LocalizedString,
  rateLimitBody: {
    en: "You're sending messages too fast. Please try again shortly.",
    ar: "أنت ترسل رسائل بسرعة كبيرة. الرجاء المحاولة مرة أخرى بعد قليل.",
  } satisfies LocalizedString,
  authRequiredBody: {
    en: "Your session expired. Please refresh and try again.",
    ar: "انتهت جلستك. الرجاء تحديث الصفحة والمحاولة مرة أخرى.",
  } satisfies LocalizedString,

  // Page chrome
  pageTitle: { en: "Chat with Light", ar: "محادثة مع لايت" } satisfies LocalizedString,

  // CvCard
  cvHeading: { en: "Your CV", ar: "سيرتك الذاتية" } satisfies LocalizedString,
  cvGeneratingTitle: {
    en: "Building your CV...",
    ar: "جاري إعداد سيرتك الذاتية...",
  } satisfies LocalizedString,
  cvToggleAr: { en: "AR", ar: "عربي" } satisfies LocalizedString,
  cvToggleEn: { en: "EN", ar: "English" } satisfies LocalizedString,
  cvSectionSummary: { en: "Professional summary", ar: "الملخص المهني" } satisfies LocalizedString,
  cvSectionExperience: { en: "Experience", ar: "الخبرات" } satisfies LocalizedString,
  cvSectionEducation: { en: "Education", ar: "التعليم" } satisfies LocalizedString,
  cvSectionSkills: { en: "Skills", ar: "المهارات" } satisfies LocalizedString,
  cvSectionLanguages: { en: "Languages", ar: "اللغات" } satisfies LocalizedString,
  cvSectionCertifications: {
    en: "Certifications",
    ar: "الشهادات",
  } satisfies LocalizedString,
  cvSectionProjects: { en: "Projects", ar: "المشاريع" } satisfies LocalizedString,
  cvSectionVolunteer: {
    en: "Volunteer work",
    ar: "العمل التطوعي",
  } satisfies LocalizedString,
  cvAiBadge: { en: "AI", ar: "AI" } satisfies LocalizedString,
  cvDownloadPdf: { en: "Download PDF", ar: "تحميل PDF" } satisfies LocalizedString,
  cvCustomize: { en: "Customize", ar: "تخصيص" } satisfies LocalizedString,
  cvCurrentBadge: { en: "Current", ar: "حالياً" } satisfies LocalizedString,

  // Empty / auth redirect
  redirecting: {
    en: "Redirecting to registration...",
    ar: "جارٍ التحويل إلى صفحة التسجيل...",
  } satisfies LocalizedString,
} as const;
