import type { LocalizedString } from "../index";

/**
 * Landing page copy (PRD §6.1, §10; docs/design-system.md §10). Arabic is
 * the displayed default (site is ar/RTL first) — English is data-complete
 * for future locale support, not a translation afterthought.
 */
export const landingStrings = {
  navForSeekers: {
    en: "For job seekers",
    ar: "للباحثين عن عمل",
  },
  navForEmployers: {
    en: "For employers",
    ar: "لأصحاب العمل",
  },

  heroEyebrow: {
    en: "Where opportunities find you",
    ar: "خلي الفرص تدوّر عليك",
  },
  heroHeadline: {
    en: "Build your CV once, in a conversation — then let opportunities come to you.",
    ar: "انشئ ملفك الشخصي مرة واحدة من خلال محادثة ذكية — ثم دع الفرص تجد طريقها إليك",
  },
  heroSubcopy: {
    en: "Talk to Light in Saudi Arabic and get a professional, bilingual CV — no forms, no templates. Once your profile is ready, Light keeps matching you with jobs in the background.",
    ar: "تحدث مع لايت بالعامية السعودية واحصل على سيرة ذاتية احترافية بالعربي والإنجليزي — بدون نماذج ولا قوالب. وبعد ما يصير ملفك جاهز، لايت يستمر يدوّر لك على وظائف مناسبة.",
  },
  ctaSeekersPrimary: {
    en: "For job seekers",
    ar: "للباحثين عن عمل",
  },
  ctaEmployersSecondary: {
    en: "For employers",
    ar: "لأصحاب العمل",
  },
  comingSoonBadge: {
    en: "Coming soon",
    ar: "قريباً",
  },
  comingSoonTooltip: {
    en: "The employer experience launches in the next milestone.",
    ar: "تجربة أصحاب العمل بتنطلق في المرحلة القادمة.",
  },

  mockupAiName: {
    en: "Light",
    ar: "لايت",
  },
  mockupAiMessage: {
    en: "Hey Sarah, tell me about your last job — even a part-time one counts.",
    ar: "هلا سارة، حدثيني عن آخر شغلة اشتغلتيها — حتى لو دوام جزئي تكفي.",
  },
  mockupUserMessage: {
    en: "I worked as a cashier at a bookstore for a year.",
    ar: "اشتغلت كاشير في مكتبة لمدة سنة.",
  },
  mockupCvBadge: {
    en: "CV generating…",
    ar: "جارٍ إنشاء السيرة الذاتية…",
  },
  mockupCvName: {
    en: "Sarah Al-Otaibi",
    ar: "سارة العتيبي",
  },
  mockupCvRole: {
    en: "Customer Service · Riyadh",
    ar: "خدمة عملاء · الرياض",
  },

  trustConversationalTitle: {
    en: "Conversational CV",
    ar: "سيرة ذاتية بالمحادثة",
  },
  trustConversationalBody: {
    en: "No forms or templates — just talk, and Light writes a professional CV for you.",
    ar: "بدون نماذج ولا قوالب — بس تحدث، ولايت يكتب لك سيرة ذاتية احترافية.",
  },
  trustBilingualTitle: {
    en: "Bilingual by default",
    ar: "ثنائية اللغة تلقائياً",
  },
  trustBilingualBody: {
    en: "Every CV is generated in Arabic and English together, ready for the Saudi market.",
    ar: "كل سيرة ذاتية تُنشأ بالعربي والإنجليزي مع بعض، جاهزة لسوق العمل السعودي.",
  },
  trustPassiveTitle: {
    en: "Opportunities find you",
    ar: "الفرص تدوّر عليك",
  },
  trustPassiveBody: {
    en: "Once your profile is active, Light keeps matching you with jobs — no more endless applying.",
    ar: "بعد ما يصير ملفك مفعّل، لايت يستمر يدوّر لك على وظائف — بدون ما تتقدم بنفسك كل مرة.",
  },

  footerTagline: {
    en: "Light — a conversational recruitment platform for Saudi Arabia.",
    ar: "لايت — منصة توظيف تفاعلية للسوق السعودي.",
  },
  footerPrivacyNote: {
    en: "Your data stays in-region and is never shared without your consent.",
    ar: "بياناتك تُخزَّن داخل المملكة ولا تُشارك إلا بموافقتك.",
  },
  footerRights: {
    en: "All rights reserved.",
    ar: "جميع الحقوق محفوظة.",
  },
} satisfies Record<string, LocalizedString>;
