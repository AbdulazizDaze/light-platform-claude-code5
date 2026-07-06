/**
 * cv-state.fixtures.ts — shared, non-test fixtures for the v3 turn engine.
 *
 * Kept out of any `*.test.ts` file so importing these fixtures does NOT
 * re-register another file's `describe`/`it` blocks (which would double-run
 * them). Used by cv-state.test.ts, conversation.test.ts, and the qa-test
 * handoff fixtures.
 */

import type { PartialCv } from "./cv-state";

/**
 * The PRD v3 §5.1 golden-example state AFTER both candidate messages — the
 * canonical CV-ready fixture (education+field, experience, ≥6 skills, a
 * language with a level, and a target role).
 */
export const GOLDEN_STATE: PartialCv = {
  education: [
    {
      institution: "جامعة الملك سعود",
      degree: "بكالوريوس",
      field: "إدارة أعمال",
      start_year: 2021,
      end_year: 2026,
      status: "طالب",
      achievements: [],
    },
  ],
  experience: [
    {
      company: "مكتبة جرير",
      title: "بائع",
      start_date: "2024-01",
      end_date: "2025-02",
      is_current: false,
      achievements: [],
    },
  ],
  projects: [],
  skills: [
    { name: "التعامل مع العملاء", inferred: false },
    { name: "تحقيق الأهداف", inferred: false },
    { name: "خدمة العملاء", category: "soft", inferred: true },
    { name: "البيع", category: "soft", inferred: true },
    { name: "الإقناع", category: "soft", inferred: true },
    { name: "العمل تحت الضغط", category: "soft", inferred: true },
    { name: "أنظمة نقاط البيع", category: "technical", inferred: true },
    { name: "العرض والإلقاء", category: "soft", inferred: false },
    { name: "PowerPoint", category: "technical", inferred: false },
  ],
  languages: [
    { language: "العربية", proficiency: "native" },
    { language: "الإنجليزية", proficiency: "conversational" },
  ],
  certifications: [],
  volunteer_work: [],
  target_role: "أخصائي مبيعات",
};

/**
 * The FIRST golden message's expected extraction (PRD §5.1) — captures
 * education + experience + stated/inferred retail skills, but NOT yet a
 * language-with-level or a target role, so it is deliberately NOT server-ready.
 */
export const GOLDEN_TURN_1_STATE: PartialCv = {
  education: [
    {
      institution: "جامعة الملك سعود",
      degree: "بكالوريوس",
      field: "إدارة أعمال",
      start_year: 2021,
      end_year: 2026,
      status: "طالب",
      achievements: [],
    },
  ],
  experience: [
    {
      company: "مكتبة جرير",
      title: "بائع",
      start_date: "2024-01",
      end_date: "2025-02",
      is_current: false,
      achievements: [],
    },
  ],
  projects: [],
  skills: [
    { name: "التعامل مع العملاء", inferred: false },
    { name: "تحقيق الأهداف", inferred: false },
    { name: "خدمة العملاء", category: "soft", inferred: true },
    { name: "البيع", category: "soft", inferred: true },
    { name: "الإقناع", category: "soft", inferred: true },
    { name: "العمل تحت الضغط", category: "soft", inferred: true },
    { name: "أنظمة نقاط البيع", category: "technical", inferred: true },
  ],
  languages: [],
  certifications: [],
  volunteer_work: [],
};
