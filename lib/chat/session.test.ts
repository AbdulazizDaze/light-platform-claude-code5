import { beforeEach, describe, expect, it, vi } from "vitest";
import { FakeFirestore, SERVER_TIMESTAMP_SENTINEL } from "@/lib/firebase/test-fakes/fake-admin-firestore";
import type { ChatMessage } from "@/lib/schemas/chat";
import type { Cv } from "@/lib/schemas/cv";
import type { PartialCv } from "@/lib/schemas/cv-state";
import { MAX_PERSISTED_MESSAGES } from "./session";

// `session.ts` imports `FieldValue` from `firebase-admin/firestore` at module
// scope purely for `FieldValue.serverTimestamp()` sentinels — stub it so this
// test never initializes a real Admin SDK connection.
vi.mock("firebase-admin/firestore", () => ({
  FieldValue: {
    serverTimestamp: () => SERVER_TIMESTAMP_SENTINEL,
  },
}));

// randomUUID is used for message ids — stub for deterministic assertions.
let uuidCounter = 0;
vi.mock("node:crypto", () => ({
  randomUUID: () => `uuid-${++uuidCounter}`,
}));

const { loadOrCreateSession, createCvUploadSession, persistTurn } = await import("./session");

const partialState: PartialCv = {
  education: [{ institution: "جامعة الملك سعود", field: "إدارة أعمال", achievements: [] }],
  experience: [],
  projects: [],
  skills: [{ name: "خدمة العملاء", inferred: true }],
  languages: [],
  certifications: [],
  volunteer_work: [],
  target_role: "أخصائي مبيعات",
};

const validCv: Cv = {
  professional_summary: { en: "Summary.", ar: "ملخص." },
  education: [
    { institution: "KSU", degree: "Bachelor", field: "CS", start_year: 2019, end_year: 2023, achievements: [] },
  ],
  experience: [],
  projects: [],
  skills: [
    { name: "Customer Service", level: 3, category: "soft", inferred: true },
    { name: "Sales", level: 3, category: "soft", inferred: true },
    { name: "Communication", level: 3, category: "soft", inferred: true },
    { name: "Teamwork", level: 3, category: "soft", inferred: true },
    { name: "POS Systems", level: 3, category: "technical", inferred: true },
    { name: "Inventory", level: 3, category: "operations", inferred: true },
  ],
  languages: [{ language: "Arabic", proficiency: "native" }],
  certifications: [],
  volunteer_work: [],
};

describe("loadOrCreateSession", () => {
  let db: FakeFirestore;

  beforeEach(() => {
    db = new FakeFirestore();
    uuidCounter = 0;
  });

  it("returns the existing session unmodified when one already exists", async () => {
    db.seed("chat_sessions/uid-1", { messages: [], status: "active", type: "returning" });

    const result = await loadOrCreateSession(db as never, "uid-1");

    expect(result.created).toBe(false);
    expect(result.session.type).toBe("returning");
  });

  it("creates a new session with type 'new' when no profile CV content exists", async () => {
    const result = await loadOrCreateSession(db as never, "uid-1");

    expect(result.created).toBe(true);
    expect(result.session.type).toBe("new");
    expect(result.session.status).toBe("active");
    expect(result.session.messages).toEqual([]);
  });

  it("creates a new session with type 'returning' when the profile already has a bilingual CV summary", async () => {
    db.seed("candidate_profiles/uid-1", {
      professional_summary: { en: "Existing.", ar: "موجود." },
    });

    const result = await loadOrCreateSession(db as never, "uid-1");

    expect(result.created).toBe(true);
    expect(result.session.type).toBe("returning");
  });

  it("creates a new session with type 'new' when only one language of the summary is present", async () => {
    db.seed("candidate_profiles/uid-1", {
      professional_summary: { en: "Existing.", ar: "" },
    });

    const result = await loadOrCreateSession(db as never, "uid-1");

    expect(result.session.type).toBe("new");
  });
});

describe("createCvUploadSession", () => {
  it("force-creates a session with type 'cv_upload' and empty messages", async () => {
    const db = new FakeFirestore();
    db.seed("chat_sessions/uid-1", {
      messages: [{ id: "x", role: "user", content: "hi", timestamp: new Date() }],
      status: "completed",
      type: "returning",
    });

    const session = await createCvUploadSession(db as never, "uid-1");

    expect(session.type).toBe("cv_upload");
    expect(session.status).toBe("active");
    expect(session.messages).toEqual([]);

    const stored = db.raw("chat_sessions/uid-1") as Record<string, unknown>;
    expect(stored.type).toBe("cv_upload");
  });
});

describe("persistTurn", () => {
  let db: FakeFirestore;

  beforeEach(() => {
    db = new FakeFirestore();
    uuidCounter = 0;
  });

  it("appends a user + assistant message pair and keeps status 'active' when no CV was generated", async () => {
    const result = await persistTurn(db as never, {
      uid: "uid-1",
      priorMessages: [],
      userMessageContent: "أنا خريج",
      assistantReply: "ممتاز!",
      assistantQuickReplies: ["أ", "ب"],
      cvState: partialState,
      cvGenerated: false,
      cvData: null,
      sessionType: "new",
    });

    expect(result.status).toBe("active");
    expect(result.messages).toHaveLength(2);
    expect(result.messages[0]).toMatchObject({ role: "user", content: "أنا خريج" });
    expect(result.messages[1]).toMatchObject({
      role: "assistant",
      content: "ممتاز!",
      quick_replies: ["أ", "ب"],
    });

    // cv_state persisted on the session for the next turn (PRD v3 §5.2).
    const session = db.raw("chat_sessions/uid-1") as Record<string, unknown>;
    expect(session.cv_state).toEqual(partialState);

    // candidate_profiles must NOT be touched when no CV was generated.
    expect(db.raw("candidate_profiles/uid-1")).toBeUndefined();
  });

  it("skips appending a user message when userMessageContent is null (initial greeting)", async () => {
    const result = await persistTurn(db as never, {
      uid: "uid-1",
      priorMessages: [],
      userMessageContent: null,
      assistantReply: "أهلاً وسهلاً!",
      assistantQuickReplies: [],
      cvState: null,
      cvGenerated: false,
      cvData: null,
      sessionType: "new",
    });

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0]?.role).toBe("assistant");
  });

  it("marks the session 'completed' and merges ONLY CV content fields into candidate_profiles, never personal", async () => {
    db.seed("candidate_profiles/uid-1", {
      personal: { name: "أحمد", phone: "+966500000000", city: "Riyadh", nationality: "saudi", gender: "male" },
      professional_summary: { en: "", ar: "" },
      preferences: { job_type: ["full_time"], cities: ["Riyadh"] },
    });

    const result = await persistTurn(db as never, {
      uid: "uid-1",
      priorMessages: [],
      userMessageContent: null,
      assistantReply: "",
      assistantQuickReplies: [],
      cvState: null,
      cvGenerated: true,
      cvData: validCv,
      sessionType: "new",
    });

    expect(result.status).toBe("completed");

    const profile = db.raw("candidate_profiles/uid-1") as Record<string, unknown>;
    // Identity block untouched.
    expect(profile.personal).toEqual({
      name: "أحمد",
      phone: "+966500000000",
      city: "Riyadh",
      nationality: "saudi",
      gender: "male",
    });
    // CV content merged in.
    expect(profile.professional_summary).toEqual(validCv.professional_summary);
    expect(profile.skills).toEqual(validCv.skills);
    expect(profile.education).toEqual(validCv.education);

    const session = db.raw("chat_sessions/uid-1") as Record<string, unknown>;
    expect(session.status).toBe("completed");
    expect(session.cv_data).toEqual(validCv);
  });

  it("computes profile_completeness from the generated CV + existing preferences", async () => {
    db.seed("candidate_profiles/uid-1", {
      preferences: { job_type: ["full_time"], cities: ["Riyadh"] },
    });

    await persistTurn(db as never, {
      uid: "uid-1",
      priorMessages: [],
      userMessageContent: null,
      assistantReply: "",
      assistantQuickReplies: [],
      cvState: null,
      cvGenerated: true,
      cvData: validCv,
      sessionType: "new",
    });

    const profile = db.raw("candidate_profiles/uid-1") as Record<string, unknown>;
    // professional_summary(20) + education(15) + experience via projects: neither present(0)
    // + skills6Plus(15) + languages(10) + preferences(10) + cvGenerated(5) = 75
    // (experience=[] and projects=[] on validCv, so experience band scores 0; extras band
    // also 0 since certifications/volunteer_work/projects are all empty)
    expect(profile.profile_completeness).toBe(75);
  });

  it("never sets cv_data or touches candidate_profiles when cvGenerated is true but cvData is null", async () => {
    const result = await persistTurn(db as never, {
      uid: "uid-1",
      priorMessages: [],
      userMessageContent: null,
      assistantReply: "reply",
      assistantQuickReplies: [],
      cvState: null,
      cvGenerated: true,
      cvData: null,
      sessionType: "new",
    });

    // Status logic is keyed only on cvGenerated, independent of cvData presence.
    expect(result.status).toBe("completed");
    expect(db.raw("candidate_profiles/uid-1")).toBeUndefined();
    const session = db.raw("chat_sessions/uid-1") as Record<string, unknown>;
    expect(session).not.toHaveProperty("cv_data");
  });

  it("preserves prior messages and appends new ones in order", async () => {
    const prior: ChatMessage[] = [
      { id: "p1", role: "user", content: "hi", timestamp: new Date() as unknown as ChatMessage["timestamp"] },
    ];

    const result = await persistTurn(db as never, {
      uid: "uid-1",
      priorMessages: prior,
      userMessageContent: "second message",
      assistantReply: "reply",
      assistantQuickReplies: [],
      cvState: null,
      cvGenerated: false,
      cvData: null,
      sessionType: "returning",
    });

    expect(result.messages).toHaveLength(3);
    expect(result.messages[0]).toBe(prior[0]);
    expect(result.messages[1]?.content).toBe("second message");
    expect(result.messages[2]?.content).toBe("reply");
  });

  it(`trims persisted messages to the most recent ${String(MAX_PERSISTED_MESSAGES)} when the turn would exceed the cap`, async () => {
    const prior: ChatMessage[] = Array.from({ length: MAX_PERSISTED_MESSAGES }, (_, i) => ({
      id: `p${i}`,
      role: i % 2 === 0 ? "user" : "assistant",
      content: `message ${i}`,
      timestamp: new Date() as unknown as ChatMessage["timestamp"],
    }));

    const result = await persistTurn(db as never, {
      uid: "uid-1",
      priorMessages: prior,
      userMessageContent: "new user message",
      assistantReply: "new assistant reply",
      assistantQuickReplies: [],
      cvState: null,
      cvGenerated: false,
      cvData: null,
      sessionType: "returning",
    });

    // 80 prior + 2 new = 82, trimmed down to the most recent 80.
    expect(result.messages).toHaveLength(MAX_PERSISTED_MESSAGES);
    expect(result.messages[0]?.content).toBe("message 2");
    expect(result.messages[result.messages.length - 2]?.content).toBe("new user message");
    expect(result.messages[result.messages.length - 1]?.content).toBe("new assistant reply");

    const stored = db.raw("chat_sessions/uid-1") as Record<string, unknown>;
    expect((stored.messages as unknown[]).length).toBe(MAX_PERSISTED_MESSAGES);
  });

  it("does not trim when the turn's total message count is exactly at the cap", async () => {
    const prior: ChatMessage[] = Array.from({ length: MAX_PERSISTED_MESSAGES - 1 }, (_, i) => ({
      id: `p${i}`,
      role: i % 2 === 0 ? "user" : "assistant",
      content: `message ${i}`,
      timestamp: new Date() as unknown as ChatMessage["timestamp"],
    }));

    const result = await persistTurn(db as never, {
      uid: "uid-1",
      priorMessages: prior,
      userMessageContent: null,
      assistantReply: "final reply",
      assistantQuickReplies: [],
      cvState: null,
      cvGenerated: false,
      cvData: null,
      sessionType: "returning",
    });

    expect(result.messages).toHaveLength(MAX_PERSISTED_MESSAGES);
    expect(result.messages[0]?.content).toBe("message 0");
    expect(result.messages[result.messages.length - 1]?.content).toBe("final reply");
  });
});
