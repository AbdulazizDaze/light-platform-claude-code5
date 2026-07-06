import type { LocalizedString } from "../index";

/**
 * Registration page copy (PRD §6.1 step 2, §10.4; docs/design-system.md
 * §10 "Registration"). Saudi-appropriate, warm, reassuring — this is the
 * very first thing a candidate fills out, so it must feel effortless and
 * trustworthy (free, private, quick).
 */
export const registerStrings = {
  pageTitle: {
    en: "Create your profile",
    ar: "أنشئ ملفك الشخصي",
  },
  pageSubtitle: {
    en: "Just a few details — Light will build the rest with you in chat.",
    ar: "بس بضع تفاصيل — وباقي ملفك بنبنيه سوا بالمحادثة.",
  },
  freeReassurance: {
    en: "Completely free",
    ar: "مجاني تماماً",
  },

  // Value panel bullets (v3 split registration layout)
  valueBullet1: {
    en: "Build a professional CV through conversation, in minutes",
    ar: "ابنِ سيرة ذاتية احترافية من خلال محادثة، خلال دقائق",
  } satisfies LocalizedString,
  valueBullet2: {
    en: "A bilingual CV, generated automatically",
    ar: "سيرة ذاتية ثنائية اللغة، تُنشأ تلقائياً",
  } satisfies LocalizedString,
  valueBullet3: {
    en: "Let matching opportunities find you — no more endless applying",
    ar: "خلّ الفرص المناسبة تلقاك — بدون تقديم متكرر",
  } satisfies LocalizedString,

  // Fields
  nameLabel: { en: "Full name", ar: "الاسم الكامل" } satisfies LocalizedString,
  namePlaceholder: {
    en: "e.g. Sarah Al-Qahtani",
    ar: "مثال: سارة القحطاني",
  } satisfies LocalizedString,

  phoneLabel: { en: "Phone number", ar: "رقم الجوال" } satisfies LocalizedString,
  phonePlaceholder: { en: "05XXXXXXXX", ar: "05XXXXXXXX" } satisfies LocalizedString,
  phoneHint: {
    en: "Saudi mobile number, used to recover your account.",
    ar: "رقم جوال سعودي، يُستخدم لاستعادة حسابك عند الحاجة.",
  } satisfies LocalizedString,

  cityLabel: { en: "City", ar: "المدينة" } satisfies LocalizedString,
  cityPlaceholder: { en: "Select your city", ar: "اختر مدينتك" } satisfies LocalizedString,

  genderLabel: { en: "Gender", ar: "الجنس" } satisfies LocalizedString,
  genderMale: { en: "Male", ar: "ذكر" } satisfies LocalizedString,
  genderFemale: { en: "Female", ar: "أنثى" } satisfies LocalizedString,
  genderHint: {
    en: "Helps Light address you correctly in Arabic.",
    ar: "يساعد لايت يخاطبك بالصيغة الصحيحة بالعربي.",
  } satisfies LocalizedString,

  nationalityLabel: { en: "Nationality", ar: "الجنسية" } satisfies LocalizedString,
  nationalitySaudi: { en: "Saudi", ar: "سعودي" } satisfies LocalizedString,
  nationalityNonSaudi: { en: "Non-Saudi", ar: "غير سعودي" } satisfies LocalizedString,

  emailLabel: { en: "Email (optional)", ar: "البريد الإلكتروني (اختياري)" } satisfies LocalizedString,
  emailPlaceholder: {
    en: "you@example.com",
    ar: "example@email.com",
  } satisfies LocalizedString,

  // Consent
  consentLabel: {
    en: "I agree to Light's data collection and processing as described in the",
    ar: "أوافق على جمع ومعالجة بياناتي كما هو موضح في",
  } satisfies LocalizedString,
  consentLinkText: {
    en: "Privacy Policy",
    ar: "سياسة الخصوصية",
  } satisfies LocalizedString,
  consentRequired: {
    en: "Please accept the privacy policy to continue.",
    ar: "الرجاء الموافقة على سياسة الخصوصية للمتابعة.",
  } satisfies LocalizedString,

  // Actions / states
  submit: { en: "Create my profile", ar: "أنشئ ملفي" } satisfies LocalizedString,
  submitting: { en: "Creating your profile...", ar: "جارٍ إنشاء ملفك..." } satisfies LocalizedString,

  // Field-level validation
  nameRequired: {
    en: "Please enter your full name.",
    ar: "الرجاء إدخال اسمك الكامل.",
  } satisfies LocalizedString,
  phoneRequired: {
    en: "Please enter a valid Saudi phone number.",
    ar: "الرجاء إدخال رقم جوال سعودي صحيح.",
  } satisfies LocalizedString,
  phoneInvalid: {
    en: "Phone number must be a valid Saudi mobile number (e.g. 05XXXXXXXX).",
    ar: "يجب أن يكون رقم الجوال سعودياً وصحيحاً (مثال: 05XXXXXXXX).",
  } satisfies LocalizedString,
  cityRequired: {
    en: "Please select your city.",
    ar: "الرجاء اختيار مدينتك.",
  } satisfies LocalizedString,
  genderRequired: {
    en: "Please select your gender.",
    ar: "الرجاء اختيار الجنس.",
  } satisfies LocalizedString,
  nationalityRequired: {
    en: "Please select your nationality.",
    ar: "الرجاء اختيار الجنسية.",
  } satisfies LocalizedString,
  emailInvalid: {
    en: "Please enter a valid email address.",
    ar: "الرجاء إدخال بريد إلكتروني صحيح.",
  } satisfies LocalizedString,

  // Submit errors
  submitErrorTitle: {
    en: "Couldn't create your profile",
    ar: "تعذّر إنشاء ملفك الشخصي",
  } satisfies LocalizedString,
  submitErrorGeneric: {
    en: "Something went wrong. Please try again.",
    ar: "حدث خطأ ما. الرجاء المحاولة مرة أخرى.",
  } satisfies LocalizedString,
  rateLimitedError: {
    en: "Too many attempts. Please wait a moment and try again.",
    ar: "محاولات كثيرة جداً. الرجاء الانتظار قليلاً والمحاولة مرة أخرى.",
  } satisfies LocalizedString,

  // City display names (bilingual — SAUDI_CITIES enum values are English keys)
  cityNames: {
    Riyadh: { en: "Riyadh", ar: "الرياض" },
    Jeddah: { en: "Jeddah", ar: "جدة" },
    Dammam: { en: "Dammam", ar: "الدمام" },
    Makkah: { en: "Makkah", ar: "مكة المكرمة" },
    Madinah: { en: "Madinah", ar: "المدينة المنورة" },
    Khobar: { en: "Khobar", ar: "الخبر" },
    Dhahran: { en: "Dhahran", ar: "الظهران" },
    Tabuk: { en: "Tabuk", ar: "تبوك" },
    Abha: { en: "Abha", ar: "أبها" },
    Taif: { en: "Taif", ar: "الطائف" },
    Hail: { en: "Hail", ar: "حائل" },
    Jazan: { en: "Jazan", ar: "جازان" },
    Najran: { en: "Najran", ar: "نجران" },
    "Al Baha": { en: "Al Baha", ar: "الباحة" },
    Yanbu: { en: "Yanbu", ar: "ينبع" },
    "Al Jubail": { en: "Al Jubail", ar: "الجبيل" },
    Buraidah: { en: "Buraidah", ar: "بريدة" },
    "Khamis Mushait": { en: "Khamis Mushait", ar: "خميس مشيط" },
  } satisfies Record<string, LocalizedString>,
} as const;
