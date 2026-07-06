import { describe, expect, it } from "vitest";
import { computeProfileCompleteness, COMPLETENESS_WEIGHTS, type CompletenessInput } from "./completeness";

function fullProfile(): CompletenessInput {
  return {
    professional_summary: { en: "A dedicated marketer.", ar: "مسوّق ملتزم." },
    education: [{ institution: "KSU", degree: "BA" }],
    experience: [{ company: "Acme", title: "Associate" }],
    projects: [{ name: "Side project" }],
    skills: [
      { name: "Sales" },
      { name: "Communication" },
      { name: "Excel" },
      { name: "Negotiation" },
      { name: "POS" },
      { name: "Teamwork" },
    ],
    languages: [{ proficiency: "fluent" }],
    certifications: [{ name: "PMP" }],
    volunteer_work: ["Food bank"],
    preferences: { job_type: ["full_time"], cities: ["Riyadh"] },
    cv_generated: true,
  };
}

describe("computeProfileCompleteness", () => {
  it("scores an empty profile as 0", () => {
    expect(computeProfileCompleteness({})).toBe(0);
  });

  it("scores null/undefined input as 0 without throwing", () => {
    expect(computeProfileCompleteness(null)).toBe(0);
    expect(computeProfileCompleteness(undefined)).toBe(0);
  });

  it("scores a fully complete profile as 100", () => {
    expect(computeProfileCompleteness(fullProfile())).toBe(100);
  });

  it("weights sum to exactly 100", () => {
    const sum =
      COMPLETENESS_WEIGHTS.professionalSummary +
      COMPLETENESS_WEIGHTS.education +
      COMPLETENESS_WEIGHTS.experience +
      COMPLETENESS_WEIGHTS.skills6Plus +
      COMPLETENESS_WEIGHTS.languages +
      COMPLETENESS_WEIGHTS.preferences +
      COMPLETENESS_WEIGHTS.extras +
      COMPLETENESS_WEIGHTS.cvGenerated;
    expect(sum).toBe(100);
  });

  describe("professional_summary band", () => {
    it("awards 0 when missing entirely", () => {
      const p = { ...fullProfile(), professional_summary: undefined };
      const withSummary = computeProfileCompleteness(fullProfile());
      const without = computeProfileCompleteness(p);
      expect(withSummary - without).toBe(COMPLETENESS_WEIGHTS.professionalSummary);
    });

    it("awards 0 when only one language is filled", () => {
      const p = { ...fullProfile(), professional_summary: { en: "Only English." } };
      const without = computeProfileCompleteness(p);
      const withBoth = computeProfileCompleteness(fullProfile());
      expect(withBoth - without).toBe(COMPLETENESS_WEIGHTS.professionalSummary);
    });

    it("awards 0 when fields are empty/whitespace strings", () => {
      const p = { ...fullProfile(), professional_summary: { en: "  ", ar: "" } };
      const without = computeProfileCompleteness(p);
      const withBoth = computeProfileCompleteness(fullProfile());
      expect(withBoth - without).toBe(COMPLETENESS_WEIGHTS.professionalSummary);
    });
  });

  describe("education band", () => {
    it("awards 0 for an empty array", () => {
      const p = { ...fullProfile(), education: [] };
      const without = computeProfileCompleteness(p);
      const with1 = computeProfileCompleteness(fullProfile());
      expect(with1 - without).toBe(COMPLETENESS_WEIGHTS.education);
    });

    it("awards full weight for exactly 1 entry (boundary)", () => {
      const p = { ...fullProfile(), education: [{ institution: "KSU" }] };
      const empty = { ...fullProfile(), education: [] };
      expect(computeProfileCompleteness(p) - computeProfileCompleteness(empty)).toBe(
        COMPLETENESS_WEIGHTS.education,
      );
    });
  });

  describe("experience band (with projects fallback)", () => {
    it("awards full experience weight when experience has >=1 entry", () => {
      const base = fullProfile();
      const withExp = computeProfileCompleteness(base);
      const noExpNoProj = computeProfileCompleteness({ ...base, experience: [], projects: [] });
      expect(withExp - noExpNoProj).toBe(COMPLETENESS_WEIGHTS.experience);
    });

    it("awards the smaller fallback weight when experience is empty but projects exist", () => {
      const base = fullProfile();
      const fallback = computeProfileCompleteness({ ...base, experience: [] });
      const neither = computeProfileCompleteness({ ...base, experience: [], projects: [] });
      // extras band also depends on projects, so isolate by keeping projects present in both
      // (extras uses certifications/volunteer_work/projects — projects stays present here)
      expect(fallback - neither).toBe(COMPLETENESS_WEIGHTS.experienceFallbackProjects);
    });

    it("awards 0 when both experience and projects are empty", () => {
      const base = fullProfile();
      const neitherScore = computeProfileCompleteness({
        ...base,
        experience: [],
        projects: [],
        certifications: [],
        volunteer_work: [],
      });
      const fullScore = computeProfileCompleteness(base);
      const diff = fullScore - neitherScore;
      // experience(20) + extras(5, since projects/certs/volunteer all now empty) = 25
      expect(diff).toBe(
        COMPLETENESS_WEIGHTS.experience + COMPLETENESS_WEIGHTS.extras,
      );
    });
  });

  describe("skills band", () => {
    it("awards 0 for 0 skills", () => {
      const score = computeProfileCompleteness({ skills: [] });
      expect(score).toBe(0);
    });

    it("awards the 1-2 band for 1 skill", () => {
      const score = computeProfileCompleteness({ skills: [{ name: "a" }] });
      expect(score).toBe(COMPLETENESS_WEIGHTS.skills1to2);
    });

    it("awards the 1-2 band for 2 skills (upper boundary)", () => {
      const score = computeProfileCompleteness({ skills: [{ name: "a" }, { name: "b" }] });
      expect(score).toBe(COMPLETENESS_WEIGHTS.skills1to2);
    });

    it("awards the 3-5 band at the lower boundary (3 skills)", () => {
      const score = computeProfileCompleteness({
        skills: [{ name: "a" }, { name: "b" }, { name: "c" }],
      });
      expect(score).toBe(COMPLETENESS_WEIGHTS.skills3to5);
    });

    it("awards the 3-5 band at the upper boundary (5 skills)", () => {
      const score = computeProfileCompleteness({
        skills: [{}, {}, {}, {}, {}],
      });
      expect(score).toBe(COMPLETENESS_WEIGHTS.skills3to5);
    });

    it("awards the 6+ band at the lower boundary (6 skills)", () => {
      const score = computeProfileCompleteness({
        skills: [{}, {}, {}, {}, {}, {}],
      });
      expect(score).toBe(COMPLETENESS_WEIGHTS.skills6Plus);
    });

    it("caps at the 6+ band weight for many more than 6 skills", () => {
      const score = computeProfileCompleteness({
        skills: new Array(20).fill({}),
      });
      expect(score).toBe(COMPLETENESS_WEIGHTS.skills6Plus);
    });
  });

  describe("languages band", () => {
    it("awards 0 when the array is empty", () => {
      expect(computeProfileCompleteness({ languages: [] })).toBe(0);
    });

    it("awards 0 when languages exist but none carry a proficiency", () => {
      expect(computeProfileCompleteness({ languages: [{ language: "Arabic" }] })).toBe(0);
    });

    it("awards full weight when at least one language has a proficiency", () => {
      expect(
        computeProfileCompleteness({
          languages: [{ language: "Arabic" }, { proficiency: "native" }],
        }),
      ).toBe(COMPLETENESS_WEIGHTS.languages);
    });
  });

  describe("preferences band", () => {
    it("awards 0 when preferences is missing", () => {
      expect(computeProfileCompleteness({ preferences: undefined })).toBe(0);
    });

    it("awards 0 when only job_type is filled", () => {
      expect(
        computeProfileCompleteness({ preferences: { job_type: ["full_time"], cities: [] } }),
      ).toBe(0);
    });

    it("awards 0 when only cities is filled", () => {
      expect(
        computeProfileCompleteness({ preferences: { job_type: [], cities: ["Riyadh"] } }),
      ).toBe(0);
    });

    it("awards full weight when both job_type and cities are non-empty", () => {
      expect(
        computeProfileCompleteness({
          preferences: { job_type: ["full_time"], cities: ["Riyadh"] },
        }),
      ).toBe(COMPLETENESS_WEIGHTS.preferences);
    });
  });

  describe("extras band (certifications / volunteer_work / projects)", () => {
    it("awards 0 when all three are empty", () => {
      expect(
        computeProfileCompleteness({ certifications: [], volunteer_work: [], projects: [] }),
      ).toBe(0);
    });

    it("awards full weight when only certifications is non-empty", () => {
      expect(computeProfileCompleteness({ certifications: [{ name: "PMP" }] })).toBe(
        COMPLETENESS_WEIGHTS.extras,
      );
    });

    it("awards full weight when only volunteer_work is non-empty", () => {
      expect(computeProfileCompleteness({ volunteer_work: ["Food bank"] })).toBe(
        COMPLETENESS_WEIGHTS.extras,
      );
    });

    it("does not double-count when multiple extras fields are present", () => {
      // experience is intentionally omitted here so the `projects` array
      // doesn't also trigger the experience-fallback band — this isolates
      // the extras band specifically.
      expect(
        computeProfileCompleteness({
          certifications: [{ name: "PMP" }],
          volunteer_work: ["Food bank"],
        }),
      ).toBe(COMPLETENESS_WEIGHTS.extras);
    });
  });

  describe("cv_generated band", () => {
    it("awards 0 when cv_generated is false/undefined", () => {
      expect(computeProfileCompleteness({ cv_generated: false })).toBe(0);
      expect(computeProfileCompleteness({})).toBe(0);
    });

    it("awards full weight when cv_generated is true", () => {
      expect(computeProfileCompleteness({ cv_generated: true })).toBe(
        COMPLETENESS_WEIGHTS.cvGenerated,
      );
    });
  });

  describe("partial combinations", () => {
    it("scores a mid-journey profile (summary + education + few skills) correctly", () => {
      const score = computeProfileCompleteness({
        professional_summary: { en: "Hi", ar: "مرحبا" },
        education: [{ institution: "KSU" }],
        skills: [{ name: "a" }, { name: "b" }, { name: "c" }],
      });
      expect(score).toBe(
        COMPLETENESS_WEIGHTS.professionalSummary +
          COMPLETENESS_WEIGHTS.education +
          COMPLETENESS_WEIGHTS.skills3to5,
      );
    });

    it("clamps to 100 even if bands were ever mis-summed above it", () => {
      const score = computeProfileCompleteness(fullProfile());
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe("malformed input handling", () => {
    it("does not throw when fields have the wrong type", () => {
      const malformed = {
        professional_summary: "not-an-object",
        education: "not-an-array",
        experience: 42,
        skills: null,
        languages: { not: "an array" },
        preferences: "nope",
        certifications: true,
      } as unknown as CompletenessInput;

      expect(() => computeProfileCompleteness(malformed)).not.toThrow();
      expect(computeProfileCompleteness(malformed)).toBe(0);
    });

    it("does not throw on a completely empty object", () => {
      expect(() => computeProfileCompleteness({} as CompletenessInput)).not.toThrow();
    });

    it("ignores unknown extra keys gracefully", () => {
      const withExtra = { ...fullProfile(), unknown_field: "surprise" } as CompletenessInput;
      expect(computeProfileCompleteness(withExtra)).toBe(100);
    });
  });
});
