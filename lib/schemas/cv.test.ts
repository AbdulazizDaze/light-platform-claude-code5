import { describe, expect, it } from "vitest";
import { CvSchema, FORBIDDEN_IDENTITY_KEYS, parseCvData } from "./cv";

function validCv() {
  return {
    professional_summary: {
      en: "Ahmed is a fresh graduate from KSU with strong customer service and sales skills.",
      ar: "أحمد خريج جديد من جامعة الملك سعود يتمتع بمهارات قوية في خدمة العملاء والمبيعات.",
    },
    education: [
      {
        institution: "King Saud University",
        degree: "Bachelor",
        field: "Business Administration",
        start_year: 2019,
        end_year: 2023,
        achievements: [],
      },
    ],
    experience: [
      {
        company: "Jarir Bookstore",
        title: "Sales Associate",
        city: "Riyadh",
        start_date: "2022-01",
        end_date: "2023-01",
        is_current: false,
        description: "Assisted customers and managed inventory.",
        achievements: ["Employee of the month twice"],
      },
    ],
    projects: [],
    skills: [
      { name: "Customer Service", level: 4, category: "soft", inferred: true },
      { name: "Sales", level: 4, category: "soft", inferred: true },
      { name: "Communication", level: 4, category: "soft", inferred: true },
      { name: "POS Systems", level: 3, category: "technical", inferred: true },
      { name: "Inventory Management", level: 3, category: "operations", inferred: true },
      { name: "Microsoft Excel", level: 3, category: "technical", inferred: false },
    ],
    languages: [
      { language: "Arabic", proficiency: "native" },
      { language: "English", proficiency: "fluent" },
    ],
    certifications: [],
    volunteer_work: [],
  };
}

describe("CvSchema", () => {
  it("accepts a valid bilingual CV", () => {
    const result = parseCvData(validCv());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.professional_summary.en).toContain("Ahmed");
      expect(result.data.skills).toHaveLength(6);
    }
  });

  it("preserves the inferred flag on skills", () => {
    const result = parseCvData(validCv());
    expect(result.success).toBe(true);
    if (result.success) {
      const inferred = result.data.skills.filter((s) => s.inferred);
      const stated = result.data.skills.filter((s) => !s.inferred);
      expect(inferred).toHaveLength(5);
      expect(stated).toHaveLength(1);
    }
  });

  it("rejects fewer than 6 skills", () => {
    const cv = validCv();
    cv.skills = cv.skills.slice(0, 5);
    const result = parseCvData(cv);
    expect(result.success).toBe(false);
  });

  it("rejects missing professional_summary.ar", () => {
    const cv = validCv() as Record<string, unknown>;
    cv.professional_summary = { en: "Only English here." };
    const result = parseCvData(cv);
    expect(result.success).toBe(false);
  });

  it("rejects missing professional_summary.en", () => {
    const cv = validCv() as Record<string, unknown>;
    cv.professional_summary = { ar: "بالعربي فقط هنا." };
    const result = parseCvData(cv);
    expect(result.success).toBe(false);
  });

  it("rejects unknown top-level keys", () => {
    const cv = { ...validCv(), extra_field: "not allowed" };
    const result = parseCvData(cv);
    expect(result.success).toBe(false);
  });

  it("rejects unknown keys nested inside array items", () => {
    const cv = validCv();
    (cv.skills[0] as Record<string, unknown>).verified_by = "someone";
    const result = parseCvData(cv);
    expect(result.success).toBe(false);
  });

  describe("identity field rejection", () => {
    const identityFieldFixtures: Record<(typeof FORBIDDEN_IDENTITY_KEYS)[number], unknown> = {
      uid: "abc123",
      role: "candidate",
      name: "Ahmed Al-Otaibi",
      email: "ahmed@example.com",
      phone: "+966500000000",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    for (const key of FORBIDDEN_IDENTITY_KEYS) {
      it(`rejects "${key}" injected at the top level`, () => {
        const cv = { ...validCv(), [key]: identityFieldFixtures[key] };
        const result = parseCvData(cv);
        expect(result.success).toBe(false);
      });
    }

    it("FORBIDDEN_IDENTITY_KEYS covers the full identity surface", () => {
      expect(FORBIDDEN_IDENTITY_KEYS).toEqual(
        expect.arrayContaining([
          "uid",
          "role",
          "name",
          "email",
          "phone",
          "created_at",
          "updated_at",
        ]),
      );
    });
  });

  it("CvSchema.strict() alone (without the refine) already blocks identity keys", () => {
    // Belt-and-suspenders check: even if the top-level .strict() were the
    // only guard (refine removed), unknown/identity keys must still fail.
    const base = CvSchema.safeParse({ ...validCv(), uid: "should-fail" });
    expect(base.success).toBe(false);
  });
});
