import { describe, expect, it } from "vitest";
import { ChatMessageSchema, ChatSessionSchema, parseChatSession } from "./chat";

function validMessage(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "msg_1",
    role: "assistant",
    content: "هلا والله! وش تسوي هذي الأيام؟",
    quick_replies: ["طالب", "خريج", "أشتغل حالياً"],
    timestamp: new Date(),
    ...overrides,
  };
}

function validSession() {
  return {
    messages: [validMessage({ id: "msg_1", role: "assistant" }), validMessage({ id: "msg_2", role: "user", content: "خريج جديد" })],
    status: "active",
    type: "new",
  };
}

describe("ChatMessageSchema", () => {
  it("accepts a valid assistant message with quick_replies", () => {
    const result = ChatMessageSchema.safeParse(validMessage());
    expect(result.success).toBe(true);
  });

  it("accepts a message without quick_replies (optional)", () => {
    const message = validMessage();
    delete (message as Record<string, unknown>).quick_replies;
    const result = ChatMessageSchema.safeParse(message);
    expect(result.success).toBe(true);
  });

  it("rejects an invalid role", () => {
    const result = ChatMessageSchema.safeParse(validMessage({ role: "system" }));
    expect(result.success).toBe(false);
  });

  it("rejects empty content", () => {
    const result = ChatMessageSchema.safeParse(validMessage({ content: "" }));
    expect(result.success).toBe(false);
  });

  it("requires a timestamp", () => {
    const message = validMessage();
    delete (message as Record<string, unknown>).timestamp;
    const result = ChatMessageSchema.safeParse(message);
    expect(result.success).toBe(false);
  });
});

describe("ChatSessionSchema", () => {
  it("accepts a valid active session with no cv_data yet", () => {
    const result = parseChatSession(validSession());
    expect(result.success).toBe(true);
  });

  it("rejects an invalid status", () => {
    const result = parseChatSession({ ...validSession(), status: "paused" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid session type", () => {
    const result = parseChatSession({ ...validSession(), type: "walk_in" });
    expect(result.success).toBe(false);
  });

  it("defaults messages to an empty array when omitted", () => {
    const session = validSession() as Record<string, unknown>;
    delete session.messages;
    const result = ChatSessionSchema.safeParse(session);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.messages).toEqual([]);
    }
  });

  it("rejects cv_data missing required bilingual professional_summary", () => {
    const session = {
      ...validSession(),
      status: "completed",
      cv_data: { professional_summary: { en: "only english" } },
    };
    const result = parseChatSession(session);
    expect(result.success).toBe(false);
  });

  it("rejects cv_data carrying an identity field (uid)", () => {
    const session = {
      ...validSession(),
      status: "completed",
      cv_data: {
        uid: "should-fail",
        professional_summary: { en: "Summary", ar: "ملخص" },
        education: [
          {
            institution: "KFUPM",
            degree: "Bachelor",
            field: "CS",
            start_year: 2018,
            achievements: [],
          },
        ],
        experience: [],
        projects: [],
        skills: [
          { name: "A", level: 3, category: "c", inferred: false },
          { name: "B", level: 3, category: "c", inferred: false },
          { name: "C", level: 3, category: "c", inferred: false },
          { name: "D", level: 3, category: "c", inferred: false },
          { name: "E", level: 3, category: "c", inferred: false },
          { name: "F", level: 3, category: "c", inferred: false },
        ],
        languages: [{ language: "Arabic", proficiency: "native" }],
        certifications: [],
        volunteer_work: [],
      },
    };
    const result = parseChatSession(session);
    expect(result.success).toBe(false);
  });
});
