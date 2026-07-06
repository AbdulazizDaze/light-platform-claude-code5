import type { LocalizedString } from "../index";

/**
 * Minimal PDPL-aligned privacy stub (PRD §16.1; CLAUDE.md §3.7). This is a
 * placeholder data-minimization notice linked from the registration consent
 * checkbox — a full legal privacy policy is a future, non-engineering task.
 */
export const privacyStrings = {
  pageTitle: { en: "Privacy Policy", ar: "سياسة الخصوصية" } satisfies LocalizedString,
  intro: {
    en: "Light is built to respect your privacy under Saudi Arabia's Personal Data Protection Law (PDPL).",
    ar: "لايت مصمم لاحترام خصوصيتك بما يتوافق مع نظام حماية البيانات الشخصية السعودي (PDPL).",
  } satisfies LocalizedString,

  minimizationTitle: {
    en: "Data minimization",
    ar: "تقليل جمع البيانات",
  } satisfies LocalizedString,
  minimizationBody: {
    en: "We only collect the information needed to build your CV and match you with relevant jobs: your name, phone number, city, gender, nationality, and the details you share in chat.",
    ar: "نجمع فقط المعلومات اللازمة لبناء سيرتك الذاتية ومطابقتك مع الوظائف المناسبة: اسمك، رقم جوالك، مدينتك، جنسك، جنسيتك، والتفاصيل التي تشاركها معنا بالمحادثة.",
  } satisfies LocalizedString,

  purposeTitle: { en: "Purpose limitation", ar: "الغرض من جمع البيانات" } satisfies LocalizedString,
  purposeBody: {
    en: "Your data is used only to build your profile, generate your CV, and match you with job opportunities — never sold or shared for unrelated purposes.",
    ar: "تُستخدم بياناتك فقط لبناء ملفك الشخصي، وإنشاء سيرتك الذاتية، ومطابقتك مع فرص العمل — ولا تُباع أو تُشارك لأي غرض آخر.",
  } satisfies LocalizedString,

  storageTitle: { en: "In-region storage", ar: "التخزين داخل المملكة" } satisfies LocalizedString,
  storageBody: {
    en: "Your data is stored on servers located in Saudi Arabia (Firestore, me-central1 region).",
    ar: "تُخزَّن بياناتك على خوادم داخل المملكة العربية السعودية (منطقة Firestore، me-central1).",
  } satisfies LocalizedString,

  rightsTitle: { en: "Your rights", ar: "حقوقك" } satisfies LocalizedString,
  rightsBody: {
    en: "You may access, correct, or request deletion of your personal data at any time by contacting us.",
    ar: "يمكنك الوصول إلى بياناتك الشخصية أو تصحيحها أو طلب حذفها في أي وقت عبر التواصل معنا.",
  } satisfies LocalizedString,

  consentTitle: { en: "Consent", ar: "الموافقة" } satisfies LocalizedString,
  consentBody: {
    en: "By creating a profile, you consent to this data collection and processing for the purposes described above.",
    ar: "بإنشائك لملف شخصي، فإنك توافق على جمع ومعالجة بياناتك للأغراض الموضحة أعلاه.",
  } satisfies LocalizedString,

  backToRegister: {
    en: "Back to registration",
    ar: "العودة إلى التسجيل",
  } satisfies LocalizedString,
} as const;
