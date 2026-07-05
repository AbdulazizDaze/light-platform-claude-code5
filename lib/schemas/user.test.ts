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
  it("accepts the minimal registration payload (name, phone, city)", () => {
    const result = CandidateRegistrationSchema.safeParse({
      name: "Sarah Al-Qahtani",
      phone: "+966500000001",
      city: "Jeddah",
      gender: "female",
      nationality: "saudi",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      // default lang_pref
      expect(result.data.lang_pref).toBe("ar");
    }
  });

  it("does not accept identity fields like uid or role client-side", () => {
    const result = CandidateRegistrationSchema.safeParse({
      name: "Sarah",
      phone: "+966500000001",
      city: "Jeddah",
      gender: "female",
      nationality: "saudi",
      uid: "should-not-be-here",
      role: "candidate",
    });
    // .strict() is not on this schema by default object behavior in Zod 4
    // ignores unknown keys unless made strict; assert the parsed output
    // never carries them through regardless.
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as Record<string, unknown>).uid).toBeUndefined();
      expect((result.data as Record<string, unknown>).role).toBeUndefined();
    }
  });
});
