import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildHistoryMessages,
  checkReadiness,
  mergeState,
  MAX_HISTORY_MESSAGES,
  DEGRADE_REPLY,
  runConversationTurn,
  type RunConversationTurnParams,
} from "./conversation";
import * as callGeminiModule from "./call-gemini";
import type { ChatMessage } from "@/lib/schemas/chat";
import type { Cv } from "@/lib/schemas/cv";
import type { PartialCv } from "@/lib/schemas/cv-state";
import { GOLDEN_STATE, GOLDEN_TURN_1_STATE } from "@/lib/schemas/cv-state.fixtures";

// ---------------------------------------------------------------------------
// buildHistoryMessages — cap + role mapping.
// ---------------------------------------------------------------------------

function msg(role: "user" | "assistant", content: string): ChatMessage {
  return {
    id: `${role}-${content}`,
    role,
    content,
    timestamp: new Date() as unknown as ChatMessage["timestamp"],
  };
}

describe("buildHistoryMessages", () => {
  it("maps assistant->model and user->user", () => {
    const result = buildHistoryMessages([msg("user", "hi"), msg("assistant", "hello")], null);
    expect(result).toEqual([
      { role: "user", text: "hi" },
      { role: "model", text: "hello" },
    ]);
  });

  it("appends the new user message when provided", () => {
    expect(buildHistoryMessages([], "وش تخصصك؟")).toEqual([{ role: "user", text: "وش تخصصك؟" }]);
  });

  it("does not append anything for the initial-greeting (null) turn", () => {
    expect(buildHistoryMessages([msg("assistant", "hi")], null)).toEqual([
      { role: "model", text: "hi" },
    ]);
  });

  it("caps history to the last MAX_HISTORY_MESSAGES entries", () => {
    const long = Array.from({ length: MAX_HISTORY_MESSAGES + 10 }, (_, i) =>
      msg(i % 2 === 0 ? "user" : "assistant", `m${i}`),
    );
    const result = buildHistoryMessages(long, null);
    expect(result).toHaveLength(MAX_HISTORY_MESSAGES);
    expect(result[0]?.text).toBe(`m${10}`);
    expect(result[result.length - 1]?.text).toBe(`m${long.length - 1}`);
  });
});

// ---------------------------------------------------------------------------
// checkReadiness — the DETERMINISTIC server-side checklist.
// ---------------------------------------------------------------------------

/** A minimal fully-ready state (education+field, experience, 6 skills, language+level, target_role). */
function readyState(): PartialCv {
  return {
    education: [{ institution: "KSU", field: "CS", achievements: [] }],
    experience: [{ company: "Jarir", achievements: [] }],
    projects: [],
    skills: Array.from({ length: 6 }, (_, i) => ({ name: `skill-${i}` })),
    languages: [{ language: "Arabic", proficiency: "native" as const }],
    certifications: [],
    volunteer_work: [],
    target_role: "Sales Specialist",
  };
}

describe("checkReadiness", () => {
  it("returns true for a complete state", () => {
    expect(checkReadiness(readyState())).toBe(true);
  });

  it("returns true when experience is absent but projects satisfy the requirement", () => {
    const s = readyState();
    s.experience = [];
    s.projects = [{ name: "Grad Project", technologies: [], highlights: [] }];
    expect(checkReadiness(s)).toBe(true);
  });

  it("returns false for null/undefined/empty", () => {
    expect(checkReadiness(null)).toBe(false);
    expect(checkReadiness(undefined)).toBe(false);
    expect(checkReadiness({} as PartialCv)).toBe(false);
  });

  it("returns false when education has no institution+field pair", () => {
    const s = readyState();
    s.education = [{ institution: "KSU", achievements: [] }]; // no field
    expect(checkReadiness(s)).toBe(false);
  });

  it("returns false when there is neither experience nor projects", () => {
    const s = readyState();
    s.experience = [];
    s.projects = [];
    expect(checkReadiness(s)).toBe(false);
  });

  it("returns false with only 5 skills (boundary just below MIN)", () => {
    const s = readyState();
    s.skills = Array.from({ length: 5 }, (_, i) => ({ name: `skill-${i}` }));
    expect(checkReadiness(s)).toBe(false);
  });

  it("returns true at exactly 6 skills (boundary)", () => {
    const s = readyState();
    s.skills = Array.from({ length: 6 }, (_, i) => ({ name: `skill-${i}` }));
    expect(checkReadiness(s)).toBe(true);
  });

  it("returns false when a language has no proficiency level", () => {
    const s = readyState();
    s.languages = [{ language: "Arabic" }]; // no proficiency
    expect(checkReadiness(s)).toBe(false);
  });

  it("returns false when target_role is missing", () => {
    const s = readyState();
    delete s.target_role;
    expect(checkReadiness(s)).toBe(false);
  });

  it("accepts the GOLDEN_STATE as ready", () => {
    expect(checkReadiness(GOLDEN_STATE as PartialCv)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// mergeState — defensive union.
// ---------------------------------------------------------------------------

describe("mergeState", () => {
  it("returns the incoming state when there is no previous state", () => {
    const incoming = readyState();
    expect(mergeState(null, incoming)).toMatchObject({ target_role: "Sales Specialist" });
  });

  it("unions arrays by natural key without duplicating", () => {
    const prev: PartialCv = {
      education: [{ institution: "KSU", field: "CS", achievements: [] }],
      experience: [],
      projects: [],
      skills: [{ name: "Sales" }],
      languages: [],
      certifications: [],
      volunteer_work: [],
    };
    const incoming: PartialCv = {
      education: [{ institution: "KSU", field: "Business", achievements: [] }], // same institution, updated field
      experience: [],
      projects: [],
      skills: [{ name: "Sales" }, { name: "Communication" }], // Sales de-duped, Communication new
      languages: [],
      certifications: [],
      volunteer_work: [],
    };
    const merged = mergeState(prev, incoming);
    expect(merged.education).toHaveLength(1);
    expect(merged.education[0]?.field).toBe("Business"); // incoming wins
    expect(merged.skills.map((s) => s.name)).toEqual(["Sales", "Communication"]);
  });

  it("preserves a previous entry the incoming state dropped (model regression guard)", () => {
    const prev: PartialCv = {
      education: [],
      experience: [{ company: "Jarir", achievements: [] }],
      projects: [],
      skills: [],
      languages: [],
      certifications: [],
      volunteer_work: [],
    };
    const incoming: PartialCv = {
      education: [],
      experience: [], // dropped Jarir
      projects: [],
      skills: [],
      languages: [],
      certifications: [],
      volunteer_work: [],
    };
    const merged = mergeState(prev, incoming);
    expect(merged.experience).toHaveLength(1);
    expect(merged.experience[0]?.company).toBe("Jarir");
  });

  it("prefers a non-empty incoming scalar but keeps the previous one when incoming is empty", () => {
    const prev = { ...readyState(), target_role: "Cashier" };
    const incomingKeep: PartialCv = { ...readyState(), target_role: undefined };
    expect(mergeState(prev, incomingKeep).target_role).toBe("Cashier");

    const incomingChange: PartialCv = { ...readyState(), target_role: "Manager" };
    expect(mergeState(prev, incomingChange).target_role).toBe("Manager");
  });
});

// ---------------------------------------------------------------------------
// runConversationTurn — mocked callGemini (never hits the live API).
// ---------------------------------------------------------------------------

function turnJson(obj: unknown): string {
  return JSON.stringify(obj);
}

const validCv: Cv = {
  professional_summary: { en: "Summary.", ar: "ملخص." },
  education: [
    { institution: "جامعة الملك سعود", degree: "بكالوريوس", field: "إدارة أعمال", start_year: 2021, end_year: 2026, achievements: [] },
  ],
  experience: [],
  projects: [],
  skills: [
    { name: "خدمة العملاء", level: 4, category: "soft", inferred: true },
    { name: "البيع", level: 4, category: "soft", inferred: true },
    { name: "الإقناع", level: 3, category: "soft", inferred: true },
    { name: "العمل تحت الضغط", level: 4, category: "soft", inferred: true },
    { name: "أنظمة نقاط البيع", level: 3, category: "technical", inferred: true },
    { name: "العرض والإلقاء", level: 4, category: "soft", inferred: false },
  ],
  languages: [{ language: "العربية", proficiency: "native" }],
  certifications: [],
  volunteer_work: [],
};

const baseParams: RunConversationTurnParams = {
  userContext: {
    name: "أحمد",
    gender: "male",
    sessionType: "new",
    turnCount: 2,
  },
  currentState: null,
  priorMessages: [],
  newUserMessage:
    "باقي ادرس في جامعة الملك سعود. تخصصي ادارة اعمال. باقي لي سنة واتخرج 2026 بديت 2021 واشتغلت في جرير كبائع من 2024-01 الى 2025-02",
};

describe("runConversationTurn", () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it("extracts the golden message-1 state, generates no CV, readiness false", async () => {
    const modelReply = "سنة كاملة في جرير مع تحقيق التارقت — خبرة بيع حقيقية. وش مستواك بالإنجليزي، وأي وظيفة تستهدف؟";
    const text = turnJson({
      reply: modelReply,
      quick_replies: [],
      state: GOLDEN_TURN_1_STATE,
      ready: false,
    });
    const spy = vi
      .spyOn(callGeminiModule, "callGemini")
      .mockResolvedValue({ text, model: "gemini-2.5-flash" });

    const result = await runConversationTurn(baseParams);

    // Exactly one call — no generation call because not ready.
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0]?.[0]?.jsonMode).toBe(true);
    expect(result.reply).toBe(modelReply);
    expect(result.cvGenerated).toBe(false);
    expect(result.cvData).toBeNull();
    expect(result.modelReady).toBe(false);
    expect(checkReadiness(result.state)).toBe(false);
    // State merged and captured the employer + major.
    expect(result.state.experience[0]?.company).toBe("مكتبة جرير");
    expect(result.state.education[0]?.field).toBe("إدارة أعمال");
    expect(result.state.skills.length).toBeGreaterThanOrEqual(6);
  });

  it("fires the generation call and returns cv_data when model.ready && server-ready", async () => {
    const turnText = turnJson({
      reply: "أشوف إن عندنا كل اللي نحتاجه — أجهّز لك سيرتك الحين؟",
      quick_replies: ["أجل", "لسه فيه إضافات"],
      state: GOLDEN_STATE,
      ready: true,
    });
    const cvText = turnJson(validCv);

    const spy = vi
      .spyOn(callGeminiModule, "callGemini")
      .mockResolvedValueOnce({ text: turnText, model: "gemini-2.5-flash" }) // turn call
      .mockResolvedValueOnce({ text: cvText, model: "gemini-2.5-flash" }); // generation call

    const result = await runConversationTurn({
      ...baseParams,
      currentState: GOLDEN_STATE as PartialCv,
      newUserMessage: "كويس بالانقليزي وكل المهارات تنطبق علي، احب الالقاء وبوربوينت",
    });

    expect(spy).toHaveBeenCalledTimes(2);
    expect(result.cvGenerated).toBe(true);
    expect(result.cvData).toEqual(validCv);
    expect(result.reply).toContain("أجهّز");
  });

  it("does NOT generate when the model says ready but the server checklist disagrees", async () => {
    // model claims ready, but state lacks languages+level and target_role.
    const turnText = turnJson({
      reply: "تمام",
      quick_replies: [],
      state: GOLDEN_TURN_1_STATE, // not server-ready
      ready: true,
    });
    const spy = vi
      .spyOn(callGeminiModule, "callGemini")
      .mockResolvedValue({ text: turnText, model: "gemini-2.5-flash" });

    const result = await runConversationTurn(baseParams);

    expect(spy).toHaveBeenCalledTimes(1); // no generation call
    expect(result.cvGenerated).toBe(false);
    expect(result.modelReady).toBe(true);
  });

  it("retries once on invalid turn JSON and succeeds with the corrected version", async () => {
    const invalidTurn = turnJson({ reply: "", state: {}, ready: false }); // empty reply invalid
    const validTurn = turnJson({
      reply: "تمام، وش مستواك بالإنجليزي؟",
      state: GOLDEN_TURN_1_STATE,
      ready: false,
    });
    const spy = vi
      .spyOn(callGeminiModule, "callGemini")
      .mockResolvedValueOnce({ text: invalidTurn, model: "gemini-2.5-flash" })
      .mockResolvedValueOnce({ text: validTurn, model: "gemini-2.5-flash" });

    const result = await runConversationTurn(baseParams);

    expect(spy).toHaveBeenCalledTimes(2);
    expect(result.reply).toBe("تمام، وش مستواك بالإنجليزي؟");
    expect(result.cvGenerated).toBe(false);
  });

  it("degrades to reply-only and keeps the previous state after a second parse failure", async () => {
    const garbage = "this is not json at all";
    const spy = vi
      .spyOn(callGeminiModule, "callGemini")
      .mockResolvedValue({ text: garbage, model: "gemini-2.5-flash" });

    const prior = GOLDEN_TURN_1_STATE as PartialCv;
    const result = await runConversationTurn({ ...baseParams, currentState: prior });

    // 1 initial + 1 corrective retry = 2 calls.
    expect(spy).toHaveBeenCalledTimes(2);
    expect(result.reply).toBe(DEGRADE_REPLY);
    expect(result.cvGenerated).toBe(false);
    expect(result.cvData).toBeNull();
    // Previous state preserved unchanged (extract nothing on degrade).
    expect(result.state).toBe(prior);
  });

  it("returns reply but no cv_data when generation fails validation twice (retry next turn)", async () => {
    const turnText = turnJson({
      reply: "أجهّز لك سيرتك؟",
      state: GOLDEN_STATE,
      ready: true,
    });
    const invalidCv = turnJson({ professional_summary: { en: "x", ar: "س" } }); // missing required fields

    const spy = vi
      .spyOn(callGeminiModule, "callGemini")
      .mockResolvedValueOnce({ text: turnText, model: "gemini-2.5-flash" }) // turn call
      .mockResolvedValueOnce({ text: invalidCv, model: "gemini-2.5-flash" }) // gen attempt 1
      .mockResolvedValueOnce({ text: invalidCv, model: "gemini-2.5-flash" }); // gen retry

    const result = await runConversationTurn({
      ...baseParams,
      currentState: GOLDEN_STATE as PartialCv,
    });

    // turn(1) + generation(2) = 3 calls.
    expect(spy).toHaveBeenCalledTimes(3);
    expect(result.cvGenerated).toBe(false);
    expect(result.cvData).toBeNull();
    expect(result.reply).toBe("أجهّز لك سيرتك؟"); // conversational reply still returned
  });

  it("passes inline data (uploaded PDF) onto the user turn", async () => {
    const text = turnJson({ reply: "قريت سيرتك", state: GOLDEN_TURN_1_STATE, ready: false });
    const spy = vi
      .spyOn(callGeminiModule, "callGemini")
      .mockResolvedValue({ text, model: "gemini-2.5-flash" });

    await runConversationTurn({
      ...baseParams,
      newUserMessage: "analyze this CV",
      inlineData: { mimeType: "application/pdf", dataBase64: "QkFTRTY0" },
    });

    const sentMessages = spy.mock.calls[0]?.[0]?.messages ?? [];
    const last = sentMessages[sentMessages.length - 1];
    expect(last?.inlineData).toEqual({ mimeType: "application/pdf", dataBase64: "QkFTRTY0" });
  });
});
