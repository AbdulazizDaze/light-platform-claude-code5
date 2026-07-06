import { describe, expect, it } from "vitest";
import {
  buildUserContext,
  SOFT_SAFETY_TURN_THRESHOLD,
  type UserContextProfile,
} from "./prompts/user-context";

function profile(overrides: Partial<UserContextProfile> = {}): UserContextProfile {
  return {
    name: "محمد",
    gender: "male",
    sessionType: "new",
    turnCount: 1,
    ...overrides,
  };
}

describe("soft safety threshold (v3 — no message-count pacing)", () => {
  it("adds NO safety note at or below the threshold", () => {
    expect(buildUserContext(profile({ turnCount: SOFT_SAFETY_TURN_THRESHOLD }))).not.toContain(
      "SAFETY NOTE",
    );
    expect(buildUserContext(profile({ turnCount: 5 }))).not.toContain("SAFETY NOTE");
  });

  it("adds the soft safety note only past the threshold", () => {
    const out = buildUserContext(profile({ turnCount: SOFT_SAFETY_TURN_THRESHOLD + 1 }));
    expect(out).toContain("SAFETY NOTE");
    expect(out).toContain("propose generating the CV");
  });

  it("never contains v2 pacing directives", () => {
    const out = buildUserContext(profile({ turnCount: 30 }));
    expect(out).not.toContain("URGENCY");
    expect(out).not.toContain("FORCE CV");
  });
});

describe("gender directive", () => {
  it("uses masculine conjugation cues for a male candidate", () => {
    const out = buildUserContext(profile({ gender: "male" }));
    expect(out).toContain("MALE");
    expect(out).toContain("MASCULINE");
    expect(out).toContain("أنت خريج؟");
  });

  it("uses feminine conjugation cues for a female candidate", () => {
    const out = buildUserContext(profile({ gender: "female", name: "نورة" }));
    expect(out).toContain("FEMALE");
    expect(out).toContain("FEMININE");
    expect(out).toContain("أنتِ خريجة؟");
  });
});

describe("session type directive", () => {
  it("invites the candidate to talk on a new session", () => {
    expect(buildUserContext(profile({ sessionType: "new" }))).toContain("NEW session");
  });

  it("welcomes back and avoids re-asking on a returning session", () => {
    const out = buildUserContext(profile({ sessionType: "returning" }));
    expect(out).toContain("RETURNING");
    expect(out).toContain("do NOT re-ask");
  });

  it("acknowledges the analyzed upload on a cv_upload session", () => {
    expect(buildUserContext(profile({ sessionType: "cv_upload" }))).toContain("UPLOADED");
  });
});

describe("name injection (identity stays out of state)", () => {
  it("includes the candidate name and warns it is not a state/JSON key", () => {
    const out = buildUserContext(profile({ name: "سلمان" }));
    expect(out).toContain("سلمان");
    expect(out).toContain("NEVER as a JSON");
  });
});
