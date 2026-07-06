import type { LocalizedString } from "../index";

/**
 * Landing page copy — v3 screen redesign (PRD §9, docs/design-system.md §10).
 * Full dark-navy page with an "alive" energy: pulsing badge, self-typing chat
 * demo, alternating journey steps. Arabic is the displayed default (site is
 * ar/RTL first) — English is data-complete for future locale support, not a
 * translation afterthought. Professional register throughout — no cheese,
 * per PRD §5.1 tone guidance (applies to marketing copy too).
 */
export const landingStrings = {
  // Nav
  navForSeekers: { en: "For job seekers", ar: "للباحثين عن عمل" } satisfies LocalizedString,
  navForEmployers: { en: "For employers", ar: "لأصحاب العمل" } satisfies LocalizedString,
  navFeatures: { en: "Features", ar: "المميزات" } satisfies LocalizedString,
  navContact: { en: "Contact", ar: "تواصل" } satisfies LocalizedString,
  navCtaStart: { en: "Get started", ar: "ابدأ الآن" } satisfies LocalizedString,
  comingSoonBadge: { en: "Coming soon", ar: "قريباً" } satisfies LocalizedString,
  comingSoonTooltip: {
    en: "The employer experience launches in the next milestone.",
    ar: "تجربة أصحاب العمل بتنطلق في المرحلة القادمة.",
  } satisfies LocalizedString,

  // Hero
  heroBadge: {
    en: "Powered by AI",
    ar: "مدعوم بالذكاء الاصطناعي",
  } satisfies LocalizedString,
  heroHeadlineLine1: { en: "Stop searching.", ar: "خلّ الفرص" } satisfies LocalizedString,
  heroHeadlineLine2: { en: "Let opportunity find you.", ar: "تدوّر عليك." } satisfies LocalizedString,
  heroSubcopy: {
    en: "Have a natural conversation in Saudi Arabic, and Light builds your professional bilingual CV — then keeps matching you with opportunities in the background.",
    ar: "تحدث بطبيعية بالعامية السعودية، ولايت يبني لك سيرة ذاتية احترافية بالعربي والإنجليزي — ثم يستمر يدوّر لك على الفرص المناسبة.",
  } satisfies LocalizedString,
  ctaSeekersPrimary: { en: "For job seekers", ar: "للباحثين عن عمل" } satisfies LocalizedString,
  ctaEmployersSecondary: { en: "For employers", ar: "لأصحاب العمل" } satisfies LocalizedString,

  // Self-typing chat demo (PRD §5.1 golden conversation, compressed)
  demoAiGreeting: {
    en: "Hi — tell me about your education and experience, in your own words.",
    ar: "هلا، حدثني عن تعليمك وخبراتك بأسلوبك الخاص.",
  } satisfies LocalizedString,
  demoUserMessage: {
    en: "I'm studying business administration at King Saud University, and I worked for a year at Jarir as a salesperson — hit target more than once.",
    ar: "ادرس إدارة أعمال بجامعة الملك سعود واشتغلت سنة في جرير كبائع وحققت التارقت أكثر من مرة.",
  } satisfies LocalizedString,
  demoTick1: { en: "Education saved", ar: "التعليم انحفظ" } satisfies LocalizedString,
  demoTick2: { en: "Jarir experience added", ar: "خبرة جرير انضافت" } satisfies LocalizedString,
  demoTick3: { en: "5 skills inferred", ar: "٥ مهارات استُنتجت" } satisfies LocalizedString,
  demoGenerating: { en: "Building your CV...", ar: "ننشئ سيرتك..." } satisfies LocalizedString,
  demoCvReadyTitle: { en: "Your CV is ready!", ar: "سيرتك جاهزة!" } satisfies LocalizedString,
  demoCvReadyRole: { en: "Sales · Customer Service", ar: "مبيعات · خدمة عملاء" } satisfies LocalizedString,
  demoCvReadyCta: { en: "Ready to download as PDF", ar: "جاهز للتحميل PDF" } satisfies LocalizedString,

  // Problem section
  problemHeading: { en: "Why is hiring so hard?", ar: "ليش التوظيف صعب؟" } satisfies LocalizedString,
  problemSeekersTitle: { en: "For job seekers", ar: "للباحثين عن عمل" } satisfies LocalizedString,
  problemSeekersBody: {
    en: "Forms ask the wrong questions, and a thin CV hides real experience — a year at retail is customer service, sales, and pressure-tested skill, but the form never asks for that.",
    ar: "النماذج تسأل الأسئلة الخطأ، والسيرة الذاتية الضعيفة تخفي خبرة حقيقية — سنة في البيع بالتجزئة فيها خدمة عملاء وبيع وعمل تحت ضغط، لكن النموذج ما يسأل عن هذا.",
  } satisfies LocalizedString,
  problemSeekersBullet1: {
    en: "Generic templates don't capture what you actually did",
    ar: "القوالب الجاهزة ما تعكس اللي سويته فعلاً",
  } satisfies LocalizedString,
  problemSeekersBullet2: {
    en: "Applying everywhere, hearing back from nowhere",
    ar: "تقديم في كل مكان، وردود ما توصل من أي مكان",
  } satisfies LocalizedString,
  problemEmployersTitle: { en: "For employers", ar: "لأصحاب العمل" } satisfies LocalizedString,
  problemEmployersBody: {
    en: "Most SMBs don't have an HR function — screening is manual, job posts are an afterthought, and Nitaqat compliance is tracked in someone's head, if at all.",
    ar: "أغلب المنشآت الصغيرة ما عندها قسم موارد بشرية — الفرز يدوي، والإعلان الوظيفي فكرة ثانوية، والامتثال لنطاقات يتابَع بالذاكرة، إن تابعوه أصلاً.",
  } satisfies LocalizedString,
  problemEmployersBullet1: {
    en: "Hours lost screening candidates manually",
    ar: "ساعات تضيع في فرز المرشحين يدوياً",
  } satisfies LocalizedString,
  problemEmployersBullet2: {
    en: "No visibility into Nitaqat impact before hiring",
    ar: "ما فيه رؤية واضحة لتأثير التوظيف على النطاقات قبل القرار",
  } satisfies LocalizedString,

  // Journey section
  journeyEyebrow: { en: "Your journey with Light", ar: "رحلتك مع لايت" } satisfies LocalizedString,
  journeyHeadlineLine1: { en: "Stop searching.", ar: "لا تدوّر." } satisfies LocalizedString,
  journeyHeadlineLine2: {
    en: "Let opportunity find you.",
    ar: "خلّ الفرص تلقاك.",
  } satisfies LocalizedString,
  journeyStep1Title: {
    en: "Talk, or upload your CV",
    ar: "تحدث أو ارفع سيرتك",
  } satisfies LocalizedString,
  journeyStep1Body: {
    en: "Tell Light about your education and experience naturally — or upload an existing CV and let it pick up the gaps.",
    ar: "احكِ للايت عن تعليمك وخبراتك بطبيعية — أو ارفع سيرتك الحالية وخلّه يكتشف النواقص.",
  } satisfies LocalizedString,
  journeyStep2Title: {
    en: "A professional CV, instantly",
    ar: "سيرة احترافية فوراً",
  } satisfies LocalizedString,
  journeyStep2Body: {
    en: "Light extracts every fact, infers the skills you didn't think to mention, and writes a bilingual CV ready to download.",
    ar: "لايت يستخرج كل التفاصيل، ويستنتج المهارات اللي ما خطر ببالك تذكرها، ويكتب سيرة ذاتية بلغتين جاهزة للتحميل.",
  } satisfies LocalizedString,
  journeyStep3Title: {
    en: "Passive job hunting",
    ar: "التوظيف السلبي",
  } satisfies LocalizedString,
  journeyStep3Body: {
    en: "Once your profile is live, Light keeps scanning for matching opportunities in the background — no more endless applying.",
    ar: "بعد ما يصير ملفك مفعّل، لايت يستمر يدور عنك على فرص مناسبة — بدون ما تقدّم بنفسك كل مرة.",
  } satisfies LocalizedString,
  journeyStep4Title: {
    en: "Interview calls come to you",
    ar: "استقبل مكالمات المقابلات",
  } satisfies LocalizedString,
  journeyStep4Body: {
    en: "When a real match appears, employers reach out to you directly — you focus on interviews, not inboxes.",
    ar: "لما تظهر فرصة مناسبة فعلاً، أصحاب العمل يتواصلون معك مباشرة — تركّز على المقابلة، مو على صندوق الوارد.",
  } satisfies LocalizedString,

  // Trust strip
  trustBilingualTitle: { en: "Bilingual by default", ar: "ثنائي اللغة تلقائياً" } satisfies LocalizedString,
  trustBilingualBody: {
    en: "Every CV is generated in Arabic and English together, ready for the Saudi market.",
    ar: "كل سيرة ذاتية تُنشأ بالعربي والإنجليزي مع بعض، جاهزة لسوق العمل السعودي.",
  } satisfies LocalizedString,
  trustMatchingTitle: { en: "Smart matching", ar: "مطابقة ذكية" } satisfies LocalizedString,
  trustMatchingBody: {
    en: "Deterministic scoring with Nitaqat awareness — matches you can trust, explained plainly.",
    ar: "مطابقة دقيقة تراعي النطاقات — نتائج تقدر تثق فيها ومفسّرة بوضوح.",
  } satisfies LocalizedString,
  trustRealtimeTitle: { en: "Real-time updates", ar: "تحديثات فورية" } satisfies LocalizedString,
  trustRealtimeBody: {
    en: "Your profile stays live — completeness, discoverability, and new matches update as you go.",
    ar: "ملفك يبقى فعّال دائماً — الاكتمال وحالة الظهور والفرص الجديدة تتحدث أول بأول.",
  } satisfies LocalizedString,

  // Final CTA band
  finalCtaHeadline: {
    en: "Your next step starts with a conversation.",
    ar: "خطوتك الجاية بدايتها محادثة.",
  } satisfies LocalizedString,
  finalCtaButton: { en: "Get started free", ar: "ابدأ الآن مجاناً" } satisfies LocalizedString,

  // Footer
  footerTagline: {
    en: "Your AI co-pilot for the Saudi job market.",
    ar: "مساعدك الذكي لسوق العمل السعودي.",
  } satisfies LocalizedString,
  footerPrivacyNote: {
    en: "Your data stays in-region, inside Saudi Arabia.",
    ar: "بياناتك داخل المملكة العربية السعودية.",
  } satisfies LocalizedString,
  footerRights: { en: "All rights reserved.", ar: "جميع الحقوق محفوظة." } satisfies LocalizedString,
} satisfies Record<string, LocalizedString>;
