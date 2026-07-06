import { describe, expect, it } from "vitest";
import { CandidateRegistrationSchema, parseUser, UserSchema } from "./user";

function validUser() {
  return {
    uid: "uid_123",
    name: "Sarah Al-Qahtani",
    email: "sarah@example.com",
    phone: "+966500000001",
    role: "candidate",
    gender: "female",
    city: "Riyadh",
    nationality: "saudi",
    lang_pref: "ar",
    notification_prefs: { push: true, email: false },
    created_at: new Date(),
    updated_at: new Date(),
  };
}

describe("UserSchema", () => {
  it("accepts a valid candidate user", () => {
    const result = parseUser(validUser());
    expect(result.success).toBe(true);
  });

  it("accepts a user without an optional email", () => {
    const user = validUser() as Record<string, unknown>;
    delete user.email;
    const result = parseUser(user);
    expect(result.success).toBe(true);
  });

  it("rejects a missing required field (phone)", () => {
    const user = validUser() as Record<string, unknown>;
    delete user.phone;
    const result = parseUser(user);
    expect(result.success).toBe(false);
  });

  it("rejects an invalid role", () => {
    const user = { ...validUser(), role: "admin" };
    const result = parseUser(user);
    expect(result.success).toBe(false);
  });

  it("rejects an invalid gender", () => {
    const user = { ...validUser(), gender: "other" };
    const result = parseUser(user);
    expect(result.success).toBe(false);
  });

  it("rejects a city outside the supported Saudi cities enum", () => {
    const user = { ...validUser(), city: "Cairo" };
    const result = parseUser(user);
    expect(result.success).toBe(false);
  });

  it("rejects an invalid nationality value", () => {
    const user = { ...validUser(), nationality: "egyptian" };
    const result = parseUser(user);
    expect(result.success).toBe(false);
  });

  it("rejects an invalid lang_pref", () => {
    const user = { ...validUser(), lang_pref: "fr" };
    const result = parseUser(user);
    expect(result.success).toBe(false);
  });

  it("rejects a malformed email", () => {
    const user = { ...validUser(), email: "not-an-email" };
    const result = parseUser(user);
    expect(result.success).toBe(false);
  });

  it("accepts Timestamp-shaped created_at/updated_at (Firestore duck type)", () => {
    const user = {
      ...validUser(),
      created_at: { seconds: 1700000000, nanoseconds: 0 },
      updated_at: { seconds: 1700000000, nanoseconds: 0 },
    };
    const result = parseUser(user);
    expect(result.success).toBe(true);
  });
});

describe("CandidateRegistrationSchema", () => {
  function validRegistration() {
    return {
      name: "Sarah Al-Qahtani",
      phone: "+966500000001",
      city: "Jeddah",
      gender: "female",
      nationality: "saudi",
      consent_accepted: true as const,
    };
  }

  it("accepts the minimal registration payload (name, phone, city, consent)", () => {
    const result = CandidateRegistrationSchema.safeParse(validRegistration());
    expect(result.success).toBe(true);
    if (result.success) {
      // default lang_pref
      expect(result.data.lang_pref).toBe("ar");
    }
  });

  it("rejects registration without explicit PDPL consent", () => {
    const payload = validRegistration() as Record<string, unknown>;
    delete payload.consent_accepted;
    const result = CandidateRegistrationSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("rejects consent_accepted: false (must be literal true)", () => {
    const result = CandidateRegistrationSchema.safeParse({
      ...validRegistration(),
      consent_accepted: false,
    });
    expect(result.success).toBe(false);
  });

  it("FAILS LOUDLY (does not silently strip) when a client sends identity fields like uid or role", () => {
    const result = CandidateRegistrationSchema.safeParse({
      ...validRegistration(),
      uid: "should-not-be-here",
      role: "candidate",
    });
    // .strict() rejects unknown keys outright — a spoofing attempt or client
    // bug must surface as a 400, not be quietly ignored.
    expect(result.success).toBe(false);
  });

  it("rejects any other unknown field (strict schema)", () => {
    const result = CandidateRegistrationSchema.safeParse({
      ...validRegistration(),
      extra_field: "not allowed",
    });
    expect(result.success).toBe(false);
  });
});
