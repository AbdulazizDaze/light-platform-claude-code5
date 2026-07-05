/**
 * skill-inference.ts — a small DETERMINISTIC skill-inference helper.
 *
 * In production, the LLM does the real, nuanced inference during the
 * conversation (see base-prompt.ts "IMPLICIT SKILL INFERENCE"). This pure map
 * exists for TESTING and as a fallback / seed for future features: it turns the
 * canonical PRD §18.C role mentions into a stable, testable set of skills so
 * behavior is consistent and verifiable without a live model.
 *
 * Skill names are bilingual { en, ar } (docs/conventions.md); every skill here
 * is inferred, so callers building CV JSON tag them inferred: true.
 */

import type { LocalizedString } from "@/lib/i18n";

export interface InferredSkill {
  name: LocalizedString;
  /** Coarse grouping used by the CV skills list (technical|soft|operations|...). */
  category: string;
}

/** A keyword group: any matching keyword yields this group's skills. */
interface InferenceEntry {
  /** Lower-cased match terms (Arabic + English) that trigger this group. */
  keywords: string[];
  skills: InferredSkill[];
}

const RETAIL: InferenceEntry = {
  keywords: [
    "جرير",
    "بائع",
    "بائعة",
    "مبيعات",
    "تجزئة",
    "jarir",
    "retail",
    "sales",
    "salesperson",
    "sales associate",
    "cashier",
  ],
  skills: [
    { name: { en: "Customer Service", ar: "خدمة العملاء" }, category: "soft" },
    { name: { en: "Sales", ar: "المبيعات" }, category: "soft" },
    { name: { en: "Communication", ar: "التواصل" }, category: "soft" },
    {
      name: { en: "Working Under Pressure", ar: "العمل تحت الضغط" },
      category: "soft",
    },
    { name: { en: "Goal Achievement", ar: "تحقيق الأهداف" }, category: "soft" },
    { name: { en: "POS Systems", ar: "أنظمة نقاط البيع" }, category: "technical" },
    {
      name: { en: "Inventory Awareness", ar: "إدارة المخزون" },
      category: "operations",
    },
  ],
};

const BARISTA: InferenceEntry = {
  keywords: [
    "باريستا",
    "ستاربكس",
    "قهوة",
    "مقهى",
    "نادل",
    "barista",
    "starbucks",
    "coffee",
    "waiter",
    "cafe",
  ],
  skills: [
    { name: { en: "Customer Service", ar: "خدمة العملاء" }, category: "soft" },
    {
      name: { en: "Fast-Paced Environment", ar: "بيئة العمل السريعة" },
      category: "soft",
    },
    { name: { en: "Teamwork", ar: "العمل الجماعي" }, category: "soft" },
    {
      name: { en: "Cleanliness Standards", ar: "معايير النظافة" },
      category: "operations",
    },
    { name: { en: "Cash Handling", ar: "التعامل مع النقد" }, category: "operations" },
    { name: { en: "Multitasking", ar: "تعدد المهام" }, category: "soft" },
  ],
};

const WEB_DEVELOPER: InferenceEntry = {
  keywords: [
    "مطور ويب",
    "مطور",
    "مبرمج",
    "برمجة",
    "web developer",
    "developer",
    "programmer",
    "software",
    "frontend",
    "full stack",
  ],
  skills: [
    { name: { en: "HTML/CSS", ar: "HTML/CSS" }, category: "technical" },
    { name: { en: "JavaScript", ar: "جافاسكريبت" }, category: "technical" },
    {
      name: { en: "Responsive Design", ar: "التصميم المتجاوب" },
      category: "technical",
    },
    { name: { en: "Version Control", ar: "إدارة الإصدارات" }, category: "technical" },
    { name: { en: "Problem Solving", ar: "حل المشكلات" }, category: "soft" },
    { name: { en: "Debugging", ar: "تصحيح الأخطاء" }, category: "technical" },
    { name: { en: "API Integration", ar: "تكامل الواجهات البرمجية" }, category: "technical" },
  ],
};

const ACCOUNTANT: InferenceEntry = {
  keywords: [
    "محاسب",
    "محاسبة",
    "مالية",
    "مالي",
    "accountant",
    "accounting",
    "bookkeeper",
    "finance",
    "financial analyst",
  ],
  skills: [
    { name: { en: "Financial Analysis", ar: "التحليل المالي" }, category: "technical" },
    { name: { en: "Microsoft Excel", ar: "مايكروسوفت إكسل" }, category: "technical" },
    { name: { en: "Budgeting", ar: "إعداد الميزانيات" }, category: "technical" },
    {
      name: { en: "Attention to Detail", ar: "الدقة والانتباه للتفاصيل" },
      category: "soft",
    },
    { name: { en: "SAP/Oracle", ar: "SAP/Oracle" }, category: "technical" },
    {
      name: { en: "Regulatory Compliance", ar: "الامتثال التنظيمي" },
      category: "operations",
    },
  ],
};

/** Ordered so the most specific role phrases are considered first. */
const INFERENCE_MAP: InferenceEntry[] = [
  RETAIL,
  BARISTA,
  WEB_DEVELOPER,
  ACCOUNTANT,
];

/**
 * Infer skills from a free-text role/experience mention. Returns the union of
 * skills for every keyword group that matches, de-duplicated by English name.
 * Deterministic and pure — safe for tests and fallback use. The LLM handles the
 * real, nuanced inference in conversation.
 */
export function inferSkillsFromText(text: string): InferredSkill[] {
  const haystack = text.toLowerCase();
  const seen = new Set<string>();
  const result: InferredSkill[] = [];

  for (const entry of INFERENCE_MAP) {
    const matches = entry.keywords.some((kw) => haystack.includes(kw));
    if (!matches) continue;

    for (const skill of entry.skills) {
      const key = skill.name.en.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(skill);
    }
  }

  return result;
}
