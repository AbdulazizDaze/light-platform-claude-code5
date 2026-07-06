import type { LocalizedString } from "../index";

/**
 * Strings for /dashboard (docs/design-system.md §10 "Dashboards"; PRD §6.1
 * steps 7-9, §11.1 profile-completeness KPI). Saudi-appropriate, friendly,
 * encouraging register — this is the candidate's "home base" after CV
 * generation, not a cold admin panel.
 */
export const dashboardStrings = {
  // Header nav (see app/dashboard/page.tsx decision note: header nav, not a
  // sidebar, for M1's 3-destination scope).
  navDashboard: { en: "Dashboard", ar: "لوحتي" } satisfies LocalizedString,
  navChat: { en: "Chat", ar: "المحادثة" } satisfies LocalizedString,
  navCv: { en: "My CV", ar: "سيرتي الذاتية" } satisfies LocalizedString,

  pageTitle: { en: "Your dashboard", ar: "لوحتك الشخصية" } satisfies LocalizedString,
  welcomeBack: { en: "Welcome back", ar: "أهلاً بعودتك" } satisfies LocalizedString,
  lastActivityPrefix: { en: "Last activity", ar: "آخر نشاط" } satisfies LocalizedString,

  redirecting: {
    en: "Redirecting to registration...",
    ar: "جارٍ التحويل إلى صفحة التسجيل...",
  } satisfies LocalizedString,

  // CV status card
  cvCardTitle: { en: "Your CV", ar: "سيرتك الذاتية" } satisfies LocalizedString,
  cvStatusReady: { en: "Your CV is ready", ar: "سيرتك الذاتية جاهزة" } satisfies LocalizedString,
  cvStatusMissing: {
    en: "You haven't built a CV yet",
    ar: "لسه ما بنيت سيرتك الذاتية",
  } satisfies LocalizedString,
  cvTemplateThemeSummary: {
    en: "Template: {template} · Theme: {theme}",
    ar: "القالب: {template} · اللون: {theme}",
  } satisfies LocalizedString,
  cvLastUpdated: { en: "Last updated", ar: "آخر تحديث" } satisfies LocalizedString,
  cvViewCta: { en: "View CV", ar: "عرض السيرة" } satisfies LocalizedString,
  cvContinueChatCta: {
    en: "Continue the conversation",
    ar: "أكمل المحادثة",
  } satisfies LocalizedString,

  // Profile completeness card
  completenessCardTitle: {
    en: "Profile completeness",
    ar: "اكتمال الملف الشخصي",
  } satisfies LocalizedString,
  completenessDescriptionHigh: {
    en: "Your profile is in great shape.",
    ar: "ملفك الشخصي بحالة ممتازة.",
  } satisfies LocalizedString,
  completenessDescriptionMid: {
    en: "You're close — a few more details will help.",
    ar: "قربت خلاص — كم تفصيل إضافي بيفرق.",
  } satisfies LocalizedString,
  completenessDescriptionLow: {
    en: "Let's finish building your profile.",
    ar: "خلّنا نكمل بناء ملفك الشخصي.",
  } satisfies LocalizedString,

  // Discoverability card
  discoverabilityCardTitle: {
    en: "Discoverability",
    ar: "حالة الظهور للفرص",
  } satisfies LocalizedString,
  discoverabilityActive: {
    en: "Your profile is ready to be discovered",
    ar: "ملفك جاهز للاكتشاف",
  } satisfies LocalizedString,
  discoverabilityInactive: {
    en: "Finish your profile to become discoverable",
    ar: "أكمل ملفك ليصبح قابلاً للاكتشاف",
  } satisfies LocalizedString,
  discoverabilityNote: {
    en: "Matching opportunities will reach you soon.",
    ar: "ستصلك الفرص المطابقة قريباً.",
  } satisfies LocalizedString,

  // Quick actions card
  quickActionsCardTitle: { en: "Quick actions", ar: "إجراءات سريعة" } satisfies LocalizedString,
  actionUpdateCv: { en: "Update my CV", ar: "تحديث السيرة" } satisfies LocalizedString,
  actionDownloadPdf: { en: "Download PDF", ar: "تحميل PDF" } satisfies LocalizedString,
  actionCustomize: { en: "Customize design", ar: "تعديل التخصيص" } satisfies LocalizedString,

  // Empty state (no profile/CV yet)
  emptyStateTitle: {
    en: "You haven't started your CV yet",
    ar: "لسه ما بدأت سيرتك الذاتية",
  } satisfies LocalizedString,
  emptyStateBody: {
    en: "Chat with Light for a few minutes and we'll build a professional, bilingual CV for you.",
    ar: "تحدث مع لايت بضع دقائق وبنجهّز لك سيرة ذاتية احترافية بالعربي والإنجليزي.",
  } satisfies LocalizedString,
  emptyStateCta: {
    en: "Start chatting with Light",
    ar: "ابدأ محادثتك مع لايت",
  } satisfies LocalizedString,

  // Error state
  errorTitle: {
    en: "We couldn't load your dashboard",
    ar: "تعذّر تحميل لوحتك",
  } satisfies LocalizedString,
  errorBody: {
    en: "Something went wrong. Please try again.",
    ar: "حدث خطأ ما. الرجاء المحاولة مرة أخرى.",
  } satisfies LocalizedString,
  retry: { en: "Retry", ar: "إعادة المحاولة" } satisfies LocalizedString,
} as const;

/**
 * Display labels for `cv_template` (lib/schemas/profile.ts CvTemplateSchema).
 * Kept here rather than in cv strings since the dashboard is currently the
 * only surface that needs a human label for the stored enum value.
 */
export const cvTemplateLabels: Record<"classic" | "modern" | "executive" | "minimal", LocalizedString> = {
  classic: { en: "Classic", ar: "كلاسيكي" },
  modern: { en: "Modern", ar: "عصري" },
  executive: { en: "Executive", ar: "تنفيذي" },
  minimal: { en: "Minimal", ar: "بسيط" },
};

/** Display labels for `cv_color_theme` (CvColorThemeSchema). */
export const cvColorThemeLabels: Record<
  "oxford" | "jungle" | "orange" | "slate" | "burgundy" | "teal" | "custom",
  LocalizedString
> = {
  oxford: { en: "Oxford", ar: "أكسفورد" },
  jungle: { en: "Jungle", ar: "أخضر غابي" },
  orange: { en: "Orange", ar: "برتقالي" },
  slate: { en: "Slate", ar: "رمادي" },
  burgundy: { en: "Burgundy", ar: "عنّابي" },
  teal: { en: "Teal", ar: "تركواز" },
  custom: { en: "Custom", ar: "مخصص" },
};
