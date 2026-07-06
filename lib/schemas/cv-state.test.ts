import { describe, expect, it } from "vitest";
import {
  PartialCvSchema,
  TurnResponseSchema,
  parseTurnResponse,
  parsePartialCv,
} from "./cv-state";
import { GOLDEN_STATE } from "./cv-state.fixtures";

// ---------------------------------------------------------------------------
// PartialCvSchema — the accumulating extraction state.
// ---------------------------------------------------------------------------

describe("PartialCvSchema", () => {
  it("accepts a completely empty object (arrays default to [])", () => {
    const result = PartialCvSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.education).toEqual([]);
      expect(result.data.experience).toEqual([]);
      expect(result.data.skills).toEqual([]);
      expect(result.data.languages).toEqual([]);
      expect(result.data.volunteer_work).toEqual([]);
    }
  });

  it("accepts a sparse, half-described state", () => {
    const result = PartialCvSchema.safeParse({
      education: [{ institution: "جامعة الملك سعود" }], // field/degree/dates missing
      experience: [{ company: "مكتبة جرير" }], // title/dates missing
      skills: [{ name: "خدمة العملاء" }], // level/category/inferred missing
      languages: [{ language: "العربية" }], // proficiency missing
      target_role: "أخصائي مبيعات",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a full golden-example state", () => {
    const result = PartialCvSchema.safeParse(GOLDEN_STATE);
    expect(result.success).toBe(true);
  });

  it("rejects an unknown key anywhere in the tree (.strict())", () => {
    const result = PartialCvSchema.safeParse({
      education: [{ institution: "KSU", degreee: "typo" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown top-level key", () => {
    const result = PartialCvSchema.safeParse({ foo: "bar" });
    expect(result.success).toBe(false);
  });

  it.each(["name", "phone", "email", "uid", "role", "created_at", "updated_at"])(
    "rejects the forbidden identity key %s at the top level",
    (key) => {
      const result = PartialCvSchema.safeParse({ [key]: "x" });
      expect(result.success).toBe(false);
    },
  );

  it("rejects a skill name that is an { en, ar } object (names are plain strings)", () => {
    const result = PartialCvSchema.safeParse({
      skills: [{ name: { en: "Sales", ar: "المبيعات" } }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an out-of-range skill level", () => {
    const result = PartialCvSchema.safeParse({
      skills: [{ name: "Sales", level: 9 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid language proficiency enum value", () => {
    const result = PartialCvSchema.safeParse({
      languages: [{ language: "English", proficiency: "expert" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a partial professional_summary (one language only)", () => {
    const result = PartialCvSchema.safeParse({
      professional_summary: { ar: "ملخص مبدئي" },
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// TurnResponseSchema — the per-turn JSON envelope.
// ---------------------------------------------------------------------------

describe("TurnResponseSchema", () => {
  it("accepts a valid turn with empty quick_replies default", () => {
    const result = TurnResponseSchema.safeParse({
      reply: "تمام، وش تخصصك؟",
      state: {},
      ready: false,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.quick_replies).toEqual([]);
  });

  it("rejects an empty reply", () => {
    const result = TurnResponseSchema.safeParse({ reply: "", state: {}, ready: false });
    expect(result.success).toBe(false);
  });

  it("rejects more than 3 quick_replies", () => {
    const result = TurnResponseSchema.safeParse({
      reply: "x",
      quick_replies: ["a", "b", "c", "d"],
      state: {},
      ready: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing ready flag", () => {
    const result = TurnResponseSchema.safeParse({ reply: "x", state: {} });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown top-level key on the envelope (.strict())", () => {
    const result = TurnResponseSchema.safeParse({
      reply: "x",
      state: {},
      ready: false,
      cv_data: {},
    });
    expect(result.success).toBe(false);
  });

  it("rejects identity smuggled into state via the envelope", () => {
    const result = TurnResponseSchema.safeParse({
      reply: "x",
      state: { name: "أحمد" },
      ready: false,
    });
    expect(result.success).toBe(false);
  });
});

describe("parseTurnResponse / parsePartialCv", () => {
  it("parseTurnResponse returns success:true with data on valid input", () => {
    const parsed = parseTurnResponse({ reply: "x", state: {}, ready: false });
    expect(parsed.success).toBe(true);
  });

  it("parseTurnResponse returns success:false with a ZodError on invalid input", () => {
    const parsed = parseTurnResponse("not an object");
    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(parsed.error.issues.length).toBeGreaterThan(0);
  });

  it("parsePartialCv round-trips the golden state", () => {
    const parsed = parsePartialCv(GOLDEN_STATE);
    expect(parsed.success).toBe(true);
  });
});
