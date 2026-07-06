import type { LocalizedString } from "../index";

/**
 * Strings for the full CV customization page (`/cv`, docs/design-system.md
 * §10, PRD §6.1 step 7 / §18.A). Distinct from `chat.ts`'s inline CvCard
 * strings — this page adds template/theme controls, custom colors, and the
 * PDF download flow. Saudi-appropriate, professional register.
 */
export const cvStrings = {
  // Page chrome
  pageTitle: { en: "Customize your CV", ar: "تخصيص سيرتك الذاتية" } satisfies LocalizedString,
  previewHeading: { en: "Live preview", ar: "معاينة مباشرة" } satisfies LocalizedString,
  controlsHeading: { en: "Customization", ar: "التخصيص" } satisfies LocalizedString,

  // Auth / redirect
  redirecting: {
    en: "Redirecting to registration...",
    ar: "جارٍ التحويل إلى صفحة التسجيل...",
  } satisfies LocalizedString,

  // Empty state (no CV yet)
  emptyTitle: {
    en: "Your CV isn't ready yet",
    ar: "سيرتك الذاتية لسه ما جهزت",
  } satisfies LocalizedString,
  emptyBody: {
    en: "Chat with Light for a few minutes and we'll build a professional bilingual CV you can customize here.",
    ar: "تكلم مع لايت كم دقيقة وبنجهز لك سيرة ذاتية احترافية بالعربي والإنجليزي تقدر تخصصها هنا.",
  } satisfies LocalizedString,
  emptyCta: { en: "Go to chat", ar: "روح للمحادثة" } satisfies LocalizedString,

  // Error state
  loadErrorTitle: {
    en: "Couldn't load your profile",
    ar: "تعذّر تحميل ملفك الشخصي",
  } satisfies LocalizedString,
  loadErrorBody: {
    en: "Something went wrong while loading your CV. Please try again.",
    ar: "حدث خطأ أثناء تحميل سيرتك الذاتية. الرجاء المحاولة مرة أخرى.",
  } satisfies LocalizedString,
  retry: { en: "Retry", ar: "إعادة المحاولة" } satisfies LocalizedString,

  // AR/EN toggle
  toggleAr: { en: "AR", ar: "عربي" } satisfies LocalizedString,
  toggleEn: { en: "EN", ar: "English" } satisfies LocalizedString,

  // Templates
  templateLabel: { en: "Template", ar: "القالب" } satisfies LocalizedString,
  templateClassic: { en: "Classic", ar: "كلاسيكي" } satisfies LocalizedString,
  templateClassicDesc: {
    en: "Centered header, clean underlined sections",
    ar: "عنوان في المنتصف وأقسام مرتبة بخطوط فاصلة",
  } satisfies LocalizedString,
  templateModern: { en: "Modern", ar: "عصري" } satisfies LocalizedString,
  templateModernDesc: {
    en: "Colored sidebar with contact info",
    ar: "شريط جانبي ملوّن يحتوي بيانات التواصل",
  } satisfies LocalizedString,
  templateExecutive: { en: "Executive", ar: "تنفيذي" } satisfies LocalizedString,
  templateExecutiveDesc: {
    en: "Bold header bar, compact dense layout",
    ar: "شريط علوي بارز وتنسيق مضغوط",
  } satisfies LocalizedString,
  templateMinimal: { en: "Minimal", ar: "بسيط" } satisfies LocalizedString,
  templateMinimalDesc: {
    en: "Ultra-clean with maximum whitespace",
    ar: "تصميم بسيط بمساحات بيضاء واسعة",
  } satisfies LocalizedString,

  // Themes
  themeLabel: { en: "Color theme", ar: "نمط الألوان" } satisfies LocalizedString,
  themeOxford: { en: "Oxford", ar: "أكسفورد" } satisfies LocalizedString,
  themeJungle: { en: "Jungle", ar: "أخضر غابة" } satisfies LocalizedString,
  themeOrange: { en: "Orange", ar: "برتقالي" } satisfies LocalizedString,
  themeSlate: { en: "Slate", ar: "رمادي أزرق" } satisfies LocalizedString,
  themeBurgundy: { en: "Burgundy", ar: "عنابي" } satisfies LocalizedString,
  themeTeal: { en: "Teal", ar: "أزرق مخضر" } satisfies LocalizedString,
  themeCustom: { en: "Custom", ar: "مخصص" } satisfies LocalizedString,

  // Custom colors
  customPrimaryLabel: { en: "Primary color", ar: "اللون الأساسي" } satisfies LocalizedString,
  customAccentLabel: { en: "Accent color", ar: "لون التمييز" } satisfies LocalizedString,
  customColorInvalid: {
    en: "Enter a valid hex color, e.g. #14213D",
    ar: "أدخل لون هيكس صحيح، مثل ‎#14213D",
  } satisfies LocalizedString,

  // Download
  downloadPdf: { en: "Download PDF", ar: "تحميل PDF" } satisfies LocalizedString,
  preparing: { en: "Preparing...", ar: "جارٍ التحضير..." } satisfies LocalizedString,

  // Download errors
  downloadRateLimitTitle: {
    en: "Slow down a little",
    ar: "تمهّل شوي",
  } satisfies LocalizedString,
  downloadRateLimitBody: {
    en: "You're requesting PDFs too fast. Please try again shortly.",
    ar: "أنت تطلب ملفات PDF بسرعة كبيرة. الرجاء المحاولة مرة أخرى بعد قليل.",
  } satisfies LocalizedString,
  downloadErrorTitle: {
    en: "Download failed",
    ar: "تعذّر التحميل",
  } satisfies LocalizedString,
  downloadErrorBody: {
    en: "Something went wrong while preparing your PDF. Please try again.",
    ar: "حدث خطأ أثناء تجهيز ملف PDF. الرجاء المحاولة مرة أخرى.",
  } satisfies LocalizedString,

  // Saved indicator
  savedLabel: { en: "Saved", ar: "تم الحفظ" } satisfies LocalizedString,
  savingLabel: { en: "Saving...", ar: "جارٍ الحفظ..." } satisfies LocalizedString,
  saveErrorBody: {
    en: "Couldn't save your customization. It'll retry automatically.",
    ar: "تعذّر حفظ التخصيص. سيتم المحاولة مرة أخرى تلقائياً.",
  } satisfies LocalizedString,

  // CV section headings (mirrors chat.ts CvCard headings for the full preview)
  sectionSummary: { en: "Professional summary", ar: "الملخص المهني" } satisfies LocalizedString,
  sectionExperience: { en: "Experience", ar: "الخبرات" } satisfies LocalizedString,
  sectionEducation: { en: "Education", ar: "التعليم" } satisfies LocalizedString,
  sectionSkills: { en: "Skills", ar: "المهارات" } satisfies LocalizedString,
  sectionLanguages: { en: "Languages", ar: "اللغات" } satisfies LocalizedString,
  sectionCertifications: { en: "Certifications", ar: "الشهادات" } satisfies LocalizedString,
  sectionProjects: { en: "Projects", ar: "المشاريع" } satisfies LocalizedString,
  sectionVolunteer: { en: "Volunteer work", ar: "العمل التطوعي" } satisfies LocalizedString,
  aiBadge: { en: "AI", ar: "AI" } satisfies LocalizedString,
  currentBadge: { en: "Current", ar: "حالياً" } satisfies LocalizedString,
  contactHeading: { en: "Contact", ar: "التواصل" } satisfies LocalizedString,
} as const;
