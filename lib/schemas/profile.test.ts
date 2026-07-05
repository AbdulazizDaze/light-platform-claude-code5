import { describe, expect, it } from "vitest";
import { CandidateProfileSchema, parseCandidateProfile } from "./profile";

function validProfile() {
  return {
    personal: {
      name: "Faisal Al-Dosari",
      email: "faisal@example.com",
      phone: "+966500000002",
      city: "Dammam",
      nationality: "saudi",
      gender: "male",
    },
    professional_summary: {
      en: "Faisal is an early-career marketer with strong digital campaign experience.",
      ar: "فيصل مسوق في بداية مسيرته المهنية يتمتع بخبرة قوية في الحملات الرقمية.",
    },
    education: [],
    experience: [],
    projects: [],
    skills: [],
    languages: [],
    certifications: [],
    volunteer_work: [],
    preferences: {
      job_type: ["full_time"],
      work_arrangement: ["on_site", "hybrid"],
      cities: ["Dammam", "Khobar"],
      industries: ["marketing"],
      availability: "immediate",
    },
    cv_template: "modern",
    cv_color_theme: "oxford",
    profile_completeness: 65,
    last_active: new Date(),
  };
}

describe("CandidateProfileSchema", () => {
  it("accepts a valid candidate profile", () => {
    const result = parseCandidateProfile(validProfile());
    expect(result.success).toBe(true);
  });

  it("requires the personal.phone field", () => {
    const profile = validProfile();
    // @ts-expect-error intentionally deleting a required field for the test
    delete profile.personal.phone;
    const result = parseCandidateProfile(profile);
    expect(result.success).toBe(false);
  });

  it("requires professional_summary in both languages", () => {
    const profile = validProfile() as Record<string, unknown>;
    profile.professional_summary = { en: "Only English." };
    const result = parseCandidateProfile(profile);
    expect(result.success).toBe(false);
  });

  it("rejects profile_completeness below 0", () => {
    const profile = { ...validProfile(), profile_completeness: -1 };
    const result = parseCandidateProfile(profile);
    expect(result.success).toBe(false);
  });

  it("rejects profile_completeness above 100", () => {
    const profile = { ...validProfile(), profile_completeness: 101 };
    const result = parseCandidateProfile(profile);
    expect(result.success).toBe(false);
  });

  it("accepts profile_completeness at the bounds (0 and 100)", () => {
    expect(parseCandidateProfile({ ...validProfile(), profile_completeness: 0 }).success).toBe(
      true,
    );
    expect(parseCandidateProfile({ ...validProfile(), profile_completeness: 100 }).success).toBe(
      true,
    );
  });

  it("does not require embedding_vector (optional in M1)", () => {
    const profile = validProfile() as Record<string, unknown>;
    expect("embedding_vector" in profile).toBe(false);
    const result = parseCandidateProfile(profile);
    expect(result.success).toBe(true);
  });

  it("rejects an embedding_vector that isn't exactly 768 floats", () => {
    const profile = { ...validProfile(), embedding_vector: [0.1, 0.2, 0.3] };
    const result = parseCandidateProfile(profile);
    expect(result.success).toBe(false);
  });

  it("accepts an embedding_vector with exactly 768 floats", () => {
    const profile = { ...validProfile(), embedding_vector: new Array(768).fill(0.01) };
    const result = parseCandidateProfile(profile);
    expect(result.success).toBe(true);
  });

  it("rejects an invalid cv_template", () => {
    const profile = { ...validProfile(), cv_template: "fancy" };
    const result = parseCandidateProfile(profile);
    expect(result.success).toBe(false);
  });

  it("preserves the inferred flag on candidate skills", () => {
    const profile = {
      ...validProfile(),
      skills: [{ name: "Sales", level: 3, category: "soft", inferred: true }],
    };
    const result = CandidateProfileSchema.safeParse(profile);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.skills[0]?.inferred).toBe(true);
    }
  });

  it("rejects an invalid preferences.availability value", () => {
    const profile = validProfile();
    profile.preferences.availability = "someday" as never;
    const result = parseCandidateProfile(profile);
    expect(result.success).toBe(false);
  });
});
