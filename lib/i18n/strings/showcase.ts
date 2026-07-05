import type { LocalizedString } from "../index";

/**
 * Strings for the internal /showcase dev reference route (docs/design-system.md).
 * Not a production user-facing screen, but still bilingual per CLAUDE.md §3.1 —
 * the showcase itself demonstrates correct AR/EN + RTL behavior.
 */
export const showcaseStrings = {
  pageTitle: { en: "Design system showcase", ar: "معرض نظام التصميم" } satisfies LocalizedString,
  pageSubtitle: {
    en: "Every token and primitive, themed to Light and RTL-audited.",
    ar: "كل الرموز والمكوّنات الأساسية، بألوان لايت ومدقّقة للاتجاه من اليمين لليسار.",
  } satisfies LocalizedString,
  toggleLabel: { en: "Language", ar: "اللغة" } satisfies LocalizedString,

  sectionColors: { en: "Colors", ar: "الألوان" } satisfies LocalizedString,
  sectionType: { en: "Typography", ar: "الطباعة" } satisfies LocalizedString,
  sectionSpacing: { en: "Spacing", ar: "المسافات" } satisfies LocalizedString,
  sectionButtons: { en: "Buttons", ar: "الأزرار" } satisfies LocalizedString,
  sectionInputs: { en: "Inputs, select, textarea", ar: "الحقول والقوائم والنص" } satisfies LocalizedString,
  sectionBadges: { en: "Badges", ar: "الشارات" } satisfies LocalizedString,
  sectionCards: { en: "Cards", ar: "البطاقات" } satisfies LocalizedString,
  sectionTabs: { en: "Tabs", ar: "التبويبات" } satisfies LocalizedString,
  sectionDialog: { en: "Dialog", ar: "النافذة المنبثقة" } satisfies LocalizedString,
  sectionDropdown: { en: "Dropdown menu", ar: "القائمة المنسدلة" } satisfies LocalizedString,
  sectionToast: { en: "Toast", ar: "التنبيه" } satisfies LocalizedString,
  sectionSkeleton: { en: "Skeleton (loading state)", ar: "الهيكل العظمي (حالة التحميل)" } satisfies LocalizedString,
  sectionStates: { en: "Empty / loading / error states", ar: "حالات فارغة / تحميل / خطأ" } satisfies LocalizedString,

  samplePrimary: { en: "Primary action", ar: "إجراء أساسي" } satisfies LocalizedString,
  sampleSecondary: { en: "Secondary action", ar: "إجراء ثانوي" } satisfies LocalizedString,
  sampleGhost: { en: "Ghost action", ar: "إجراء شفاف" } satisfies LocalizedString,
  sampleDanger: { en: "Delete", ar: "حذف" } satisfies LocalizedString,
  sampleDisabled: { en: "Disabled", ar: "معطّل" } satisfies LocalizedString,

  labelFullName: { en: "Full name", ar: "الاسم الكامل" } satisfies LocalizedString,
  placeholderFullName: { en: "e.g. Sara Al-Qahtani", ar: "مثال: سارة القحطاني" } satisfies LocalizedString,
  labelCity: { en: "City", ar: "المدينة" } satisfies LocalizedString,
  placeholderCitySelect: { en: "Select a city", ar: "اختر مدينة" } satisfies LocalizedString,
  cityRiyadh: { en: "Riyadh", ar: "الرياض" } satisfies LocalizedString,
  cityJeddah: { en: "Jeddah", ar: "جدة" } satisfies LocalizedString,
  cityDammam: { en: "Dammam", ar: "الدمام" } satisfies LocalizedString,
  labelBio: { en: "Short bio", ar: "نبذة مختصرة" } satisfies LocalizedString,
  placeholderBio: {
    en: "Tell us about your experience...",
    ar: "حدّثنا عن خبرتك...",
  } satisfies LocalizedString,
  errorRequired: { en: "This field is required", ar: "هذا الحقل مطلوب" } satisfies LocalizedString,

  badgeSuccess: { en: "Saudi candidate", ar: "مرشح سعودي" } satisfies LocalizedString,
  badgeWarning: { en: "Yellow Nitaqat", ar: "نطاقات أصفر" } satisfies LocalizedString,
  badgeError: { en: "Expired", ar: "منتهي" } satisfies LocalizedString,
  badgeInfo: { en: "New", ar: "جديد" } satisfies LocalizedString,
  badgeNeutral: { en: "Draft", ar: "مسودة" } satisfies LocalizedString,
  badgeAi: { en: "AI inferred", ar: "AI مستنتج" } satisfies LocalizedString,

  cardTitle: { en: "Card title", ar: "عنوان البطاقة" } satisfies LocalizedString,
  cardDescription: {
    en: "A short supporting description for this card.",
    ar: "وصف مساند مختصر لهذه البطاقة.",
  } satisfies LocalizedString,
  cardBody: {
    en: "Cards use the surface background, lg radius, and e1 elevation per the design system.",
    ar: "تستخدم البطاقات خلفية السطح ونصف قطر كبير وارتفاعاً خفيفاً حسب نظام التصميم.",
  } satisfies LocalizedString,

  tabProfile: { en: "Profile", ar: "الملف الشخصي" } satisfies LocalizedString,
  tabCv: { en: "CV", ar: "السيرة الذاتية" } satisfies LocalizedString,
  tabSettings: { en: "Settings", ar: "الإعدادات" } satisfies LocalizedString,
  tabProfileBody: {
    en: "Profile tab content, aligned to the reading start.",
    ar: "محتوى تبويب الملف الشخصي، محاذى لبداية القراءة.",
  } satisfies LocalizedString,
  tabCvBody: { en: "CV tab content.", ar: "محتوى تبويب السيرة الذاتية." } satisfies LocalizedString,
  tabSettingsBody: { en: "Settings tab content.", ar: "محتوى تبويب الإعدادات." } satisfies LocalizedString,

  dialogTrigger: { en: "Open dialog", ar: "فتح النافذة" } satisfies LocalizedString,
  dialogTitle: { en: "Confirm action", ar: "تأكيد الإجراء" } satisfies LocalizedString,
  dialogDescription: {
    en: "This is a modal dialog themed to Light tokens, xl radius, with a logical-end close button.",
    ar: "هذه نافذة منبثقة بألوان لايت، بنصف قطر كبير جداً، وزر إغلاق في نهاية السطر منطقياً.",
  } satisfies LocalizedString,
  dialogConfirm: { en: "Confirm", ar: "تأكيد" } satisfies LocalizedString,

  dropdownTrigger: { en: "Open menu", ar: "فتح القائمة" } satisfies LocalizedString,
  dropdownLabel: { en: "My account", ar: "حسابي" } satisfies LocalizedString,
  dropdownProfile: { en: "Profile", ar: "الملف الشخصي" } satisfies LocalizedString,
  dropdownSettings: { en: "Settings", ar: "الإعدادات" } satisfies LocalizedString,
  dropdownLogout: { en: "Log out", ar: "تسجيل الخروج" } satisfies LocalizedString,

  toastTrigger: { en: "Show toast", ar: "إظهار التنبيه" } satisfies LocalizedString,
  toastSuccessTitle: { en: "Saved successfully", ar: "تم الحفظ بنجاح" } satisfies LocalizedString,
  toastSuccessDescription: {
    en: "Your changes have been saved.",
    ar: "تم حفظ التغييرات الخاصة بك.",
  } satisfies LocalizedString,
  toastErrorTitle: { en: "Something went wrong", ar: "حدث خطأ ما" } satisfies LocalizedString,
  toastErrorDescription: {
    en: "Please try again in a moment.",
    ar: "الرجاء المحاولة مرة أخرى بعد قليل.",
  } satisfies LocalizedString,

  emptyStateTitle: { en: "No matches yet", ar: "لا توجد مطابقات بعد" } satisfies LocalizedString,
  emptyStateBody: {
    en: "Start a conversation with Light to build your profile.",
    ar: "ابدأ محادثتك مع لايت لبناء ملفك الشخصي.",
  } satisfies LocalizedString,
  emptyStateCta: { en: "Start chatting", ar: "ابدأ المحادثة" } satisfies LocalizedString,
  errorStateTitle: { en: "Couldn't load matches", ar: "تعذّر تحميل المطابقات" } satisfies LocalizedString,
  errorStateBody: {
    en: "Something went wrong. Please try again.",
    ar: "حدث خطأ ما. الرجاء المحاولة مرة أخرى.",
  } satisfies LocalizedString,
} as const;
