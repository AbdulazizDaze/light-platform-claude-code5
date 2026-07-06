import { describe, expect, it } from "vitest";
import { buildPdfRenderPayload, hasRenderableCv, type PdfRequestInput } from "./pdf-payload";
import type { User } from "@/lib/schemas/user";
import type { CandidateProfile } from "@/lib/schemas/profile";

function fixtureUser(): Pick<User, "name" | "phone" | "email" | "city"> {
  return {
    name: "Sarah Al-Qahtani",
    phone: "+966500000001",
    email: "sarah@example.com",
    city: "Riyadh",
  };
}

// `last_active`'s type is a structural Timestamp-like custom Zod schema
// (lib/schemas/common.ts `TimestampLikeSchema`) that a plain `new Date()`
// satisfies at runtime (and via `parseCandidateProfile`/`safeParse`) but not
// through TS's structural inference against that exact custom type — same
// pre-existing quirk already present in lib/ai/conversation.test.ts. The
// fixture is built as a plain object and cast once here rather than loosening
// the schema.
function fixtureProfile(): CandidateProfile {
  return {
    personal: {
      name: "Sarah Al-Qahtani",
      email: "sarah@example.com",
      phone: "+966500000001",
      city: "Riyadh",
      nationality: "saudi",
      gender: "female",
    },
    professional_summary: {
      en: "Sarah is a frontend developer.",
      ar: "سارة مطورة واجهات أمامية.",
    },
    education: [
      {
        institution: "King Saud University",
        degree: "B.Sc.",
        field: "Computer Science",
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
        start_date: "2021",
        is_current: false,
        description: "Handled customer service.",
        achievements: [],
      },
    ],
    projects: [],
    skills: [
      { name: "React", level: 4, category: "technical", inferred: false },
      { name: "JavaScript", level: 4, category: "technical", inferred: false },
      { name: "HTML/CSS", level: 5, category: "technical", inferred: false },
      { name: "Git", level: 3, category: "technical", inferred: false },
      { name: "Communication", level: 4, category: "soft", inferred: true },
      { name: "Teamwork", level: 4, category: "soft", inferred: true },
    ],
    languages: [{ language: "Arabic", proficiency: "native" }],
    certifications: [],
    volunteer_work: [],
    preferences: {
      job_type: ["full_time"],
      work_arrangement: [],
      cities: ["Riyadh"],
      industries: [],
      availability: "immediate",
    },
    cv_template: "classic",
    cv_color_theme: "oxford",
    profile_completeness: 80,
    last_active: new Date(),
  } as unknown as CandidateProfile;
}

describe("hasRenderableCv", () => {
  it("returns false for null/undefined profile", () => {
    expect(hasRenderableCv(null)).toBe(false);
    expect(hasRenderableCv(undefined)).toBe(false);
  });

  it("returns false when professional_summary is empty/missing", () => {
    expect(hasRenderableCv({ professional_summary: { en: "", ar: "" } })).toBe(false);
    expect(hasRenderableCv({} as never)).toBe(false);
  });

  it("returns true when professional_summary has content in at least one locale", () => {
    expect(hasRenderableCv({ professional_summary: { en: "Hi", ar: "" } })).toBe(true);
    expect(hasRenderableCv({ professional_summary: { en: "", ar: "مرحبا" } })).toBe(true);
  });
});

describe("buildPdfRenderPayload", () => {
  it("sources personal/identity fields from the server-side User, not the profile", () => {
    const user = fixtureUser();
    const profile = fixtureProfile();
    const input: PdfRequestInput = { template: "classic", theme: "oxford", locale: "en" };

    const payload = buildPdfRenderPayload(user, profile, input);

    expect(payload.cv.personal).toEqual({
      name: user.name,
      city: user.city,
      phone: user.phone,
      email: user.email,
    });
  });

  it("maps CV content fields through verbatim", () => {
    const profile = fixtureProfile();
    const payload = buildPdfRenderPayload(fixtureUser(), profile, {
      template: "modern",
      theme: "jungle",
      locale: "ar",
    });

    expect(payload.cv.professional_summary).toEqual(profile.professional_summary);
    expect(payload.cv.education).toEqual(profile.education);
    expect(payload.cv.experience).toEqual(profile.experience);
    expect(payload.cv.projects).toEqual(profile.projects);
    expect(payload.cv.skills).toEqual(profile.skills);
    expect(payload.cv.languages).toEqual(profile.languages);
    expect(payload.cv.certifications).toEqual(profile.certifications);
    expect(payload.cv.volunteer_work).toEqual(profile.volunteer_work);
    expect(payload.template).toBe("modern");
    expect(payload.locale).toBe("ar");
  });

  it("passes named themes through as the theme id string", () => {
    const payload = buildPdfRenderPayload(fixtureUser(), fixtureProfile(), {
      template: "classic",
      theme: "burgundy",
      locale: "en",
    });
    expect(payload.theme).toBe("burgundy");
  });

  it("resolves the custom theme into a concrete { primary, accent } hex pair", () => {
    const payload = buildPdfRenderPayload(fixtureUser(), fixtureProfile(), {
      template: "classic",
      theme: "custom",
      custom_colors: { primary: "#112233", accent: "#445566" },
      locale: "en",
    });
    expect(payload.theme).toEqual({ primary: "#112233", accent: "#445566" });
  });

  it("falls back to the oxford default for a missing/invalid custom color channel", () => {
    const payload = buildPdfRenderPayload(fixtureUser(), fixtureProfile(), {
      template: "classic",
      theme: "custom",
      locale: "en",
    });
    expect(payload.theme).toEqual({ primary: "#14213D", accent: "#22AE89" });
  });

  it("defaults a missing user email to an empty string", () => {
    const user = fixtureUser();
    const payload = buildPdfRenderPayload({ ...user, email: undefined }, fixtureProfile(), {
      template: "classic",
      theme: "oxford",
      locale: "en",
    });
    expect(payload.cv.personal.email).toBe("");
  });
});
