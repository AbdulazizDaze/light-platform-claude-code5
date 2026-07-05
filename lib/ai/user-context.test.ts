import { describe, expect, it } from "vitest";
import {
  buildUserContext,
  PACING_FORCE_CV_AT,
  PACING_URGENCY_AT,
  type UserContextProfile,
} from "./prompts/user-context";

function profile(overrides: Partial<UserContextProfile> = {}): UserContextProfile {
  return {
    name: "محمد",
    gender: "male",
    messageCount: 1,
    sessionType: "new",
    ...overrides,
  };
}

describe("pacing thresholds", () => {
  it("exposes the documented constants", () => {
    expect(PACING_URGENCY_AT).toBe(8);
    expect(PACING_FORCE_CV_AT).toBe(14);
  });

  it("adds NO pacing pressure below the urgency threshold (msg 7)", () => {
    const out = buildUserContext(profile({ messageCount: 7 }));
    expect(out).not.toContain("URGENCY");
    expect(out).not.toContain("FORCE CV NOW");
  });

  it("injects urgency exactly at the urgency threshold (msg 8)", () => {
    const out = buildUserContext(profile({ messageCount: PACING_URGENCY_AT }));
    expect(out).toContain("URGENCY");
    expect(out).not.toContain("FORCE CV NOW");
  });

  it("keeps urgency (not force) between the two thresholds (msg 13)", () => {
    const out = buildUserContext(profile({ messageCount: 13 }));
    expect(out).toContain("URGENCY");
    expect(out).not.toContain("FORCE CV NOW");
  });

  it("forces the CV at the force threshold (msg 14)", () => {
    const out = buildUserContext(profile({ messageCount: PACING_FORCE_CV_AT }));
    expect(out).toContain("FORCE CV NOW");
    expect(out).not.toContain("URGENCY");
  });

  it("still forces the CV well past the threshold (msg 20)", () => {
    const out = buildUserContext(profile({ messageCount: 20 }));
    expect(out).toContain("FORCE CV NOW");
  });
});

describe("gender directive", () => {
  it("uses masculine conjugation cues for a male candidate", () => {
    const out = buildUserContext(profile({ gender: "male" }));
    expect(out).toContain("MALE");
    expect(out).toContain("MASCULINE");
    expect(out).toContain("وش تخصصك؟");
  });

  it("uses feminine conjugation cues for a female candidate", () => {
    const out = buildUserContext(profile({ gender: "female", name: "نورة" }));
    expect(out).toContain("FEMALE");
    expect(out).toContain("FEMININE");
    expect(out).toContain("وش تخصصكِ؟");
  });
});

describe("session type directive", () => {
  it("greets warmly on a new session", () => {
    const out = buildUserContext(profile({ sessionType: "new" }));
    expect(out).toContain("NEW session");
  });

  it("welcomes back and avoids re-asking on a returning session", () => {
    const out = buildUserContext(profile({ sessionType: "returning" }));
    expect(out).toContain("RETURNING");
  });

  it("analyzes the upload on a cv_upload session", () => {
    const out = buildUserContext(profile({ sessionType: "cv_upload" }));
    expect(out).toContain("UPLOADED");
  });
});

describe("name injection", () => {
  it("includes the candidate name and warns it is not a JSON key", () => {
    const out = buildUserContext(profile({ name: "سلمان" }));
    expect(out).toContain("سلمان");
    expect(out).toContain("never as a JSON key");
  });
});
