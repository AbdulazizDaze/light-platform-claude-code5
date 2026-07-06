import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildHistoryMessages,
  MAX_HISTORY_MESSAGES,
  parseModelTurn,
  runConversationTurn,
} from "./conversation";
import * as callGeminiModule from "./call-gemini";
import type { ChatMessage } from "@/lib/schemas/chat";
import type { Cv } from "@/lib/schemas/cv";

// ---------------------------------------------------------------------------
// parseModelTurn — pure parser, no I/O.
// ---------------------------------------------------------------------------

describe("parseModelTurn", () => {
  it("parses a normal turn with plain text and no fenced block", () => {
    const result = parseModelTurn("حياك الله! وش تخصصك؟");
    expect(result).toEqual({
      reply: "حياك الله! وش تخصصك؟",
      quickReplies: [],
      isCvTurn: false,
      cvCandidate: null,
    });
  });

  it("parses a normal turn with a trailing quick_replies fenced block", () => {
    const text = [
      "وش مستوى إتقانك للإنجليزي؟",
      "```json",
      '{ "quick_replies": ["مبتدئ", "متوسط", "متقدم"] }',
      "```",
    ].join("\n");

    const result = parseModelTurn(text);
    expect(result.reply).toBe("وش مستوى إتقانك للإنجليزي؟");
    expect(result.quickReplies).toEqual(["مبتدئ", "متوسط", "متقدم"]);
    expect(result.isCvTurn).toBe(false);
    expect(result.cvCandidate).toBeNull();
  });

  it("detects a CV turn from a fenced json block with professional_summary", () => {
    const cvJson = {
      professional_summary: { en: "A summary.", ar: "ملخص." },
      education: [
        { institution: "KSU", degree: "Bachelor", field: "CS", start_year: 2019, end_year: 2023 },
      ],
      skills: [
        { name: "Customer Service", level: 3, category: "soft", inferred: true },
        { name: "Sales", level: 3, category: "soft", inferred: true },
        { name: "Communication", level: 3, category: "soft", inferred: true },
        { name: "Teamwork", level: 3, category: "soft", inferred: true },
        { name: "POS Systems", level: 3, category: "technical", inferred: true },
        { name: "Inventory", level: 3, category: "operations", inferred: true },
      ],
      languages: [{ language: "Arabic", proficiency: "native" }],
    };
    const text = "```json\n" + JSON.stringify(cvJson) + "\n```";

    const result = parseModelTurn(text);
    expect(result.isCvTurn).toBe(true);
    expect(result.reply).toBe("");
    expect(result.quickReplies).toEqual([]);
    expect(result.cvCandidate).toEqual(cvJson);
  });

  it("treats malformed json inside a fenced block as plain text (no crash)", () => {
    const text = [
      "تمام، خلنا نكمل.",
      "```json",
      "{ this is not valid json,,, }",
      "```",
    ].join("\n");

    const result = parseModelTurn(text);
    expect(result.isCvTurn).toBe(false);
    expect(result.quickReplies).toEqual([]);
    expect(result.cvCandidate).toBeNull();
    // The whole raw (trimmed) text is preserved as the reply.
    expect(result.reply).toContain("تمام، خلنا نكمل.");
    expect(result.reply).toContain("this is not valid json");
  });

  it("a CV json that fails CvSchema still signals a CV turn (validation happens downstream)", () => {
    // Missing required fields (education, skills, languages) — this is
    // shape-detected as a CV turn by parseModelTurn (has professional_summary);
    // CvSchema validation/retry is the caller's (runConversationTurn's) job.
    const invalidCv = { professional_summary: { en: "x", ar: "س" } };
    const text = "```json\n" + JSON.stringify(invalidCv) + "\n```";

    const result = parseModelTurn(text);
    expect(result.isCvTurn).toBe(true);
    expect(result.cvCandidate).toEqual(invalidCv);
  });

  it("falls back to surrounding text when the fenced block is neither quick_replies nor CV-shaped", () => {
    const text = ["مرحبا", "```json", '{ "foo": "bar" }', "```"].join("\n");
    const result = parseModelTurn(text);
    expect(result.isCvTurn).toBe(false);
    expect(result.reply).toBe("مرحبا");
  });

  it("detects a CV turn even when surrounded by extra prose text (protocol violation tolerated)", () => {
    const cvJson = {
      professional_summary: { en: "A summary.", ar: "ملخص." },
      education: [],
      skills: [],
      languages: [],
    };
    const text = [
      "تفضل سيرتك الذاتية:",
      "```json",
      JSON.stringify(cvJson),
      "```",
      "وهذا كل شيء!",
    ].join("\n");

    const result = parseModelTurn(text);
    expect(result.isCvTurn).toBe(true);
    // Per protocol a CV turn's reply is always empty, even with stray prose
    // around the fence — downstream validation/storage never sees the prose.
    expect(result.reply).toBe("");
    expect(result.cvCandidate).toEqual(cvJson);
  });

  it("extracts only the FIRST fenced json block when multiple fences are present (nested/consecutive fences)", () => {
    const text = [
      "```json",
      '{ "quick_replies": ["أ", "ب"] }',
      "```",
      "بعض النصوص الإضافية بينهما",
      "```json",
      '{ "quick_replies": ["ج", "د"] }',
      "```",
    ].join("\n");

    const result = parseModelTurn(text);
    expect(result.isCvTurn).toBe(false);
    expect(result.quickReplies).toEqual(["أ", "ب"]);
  });

  it("treats a fenced block containing literal ``` markers inside a JSON string as still-parseable JSON when balanced", () => {
    // The regex is non-greedy up to the first closing ``` fence — a JSON
    // string value that itself contains a "```"-like substring can prematurely
    // terminate the match. This test documents that edge case's actual
    // behavior: the match truncates at the first ``` sequence, which then
    // fails JSON.parse and is treated as plain text (safe: no crash, matches
    // the sentence at the top of the reply).
    const text = [
      "```json",
      '{ "quick_replies": ["أ ``` ب"] }',
      "```",
    ].join("\n");

    const result = parseModelTurn(text);
    // The embedded ``` inside the string breaks the naive fence regex, so this
    // degrades gracefully to a plain-text reply rather than crashing.
    expect(result.isCvTurn).toBe(false);
    expect(result.quickReplies).toEqual([]);
  });

  it("handles a CV turn with no surrounding whitespace/newlines around the fence", () => {
    const cvJson = { professional_summary: { en: "x", ar: "س" }, education: [], skills: [], languages: [] };
    const text = "```json" + JSON.stringify(cvJson) + "```";

    const result = parseModelTurn(text);
    expect(result.isCvTurn).toBe(true);
    expect(result.cvCandidate).toEqual(cvJson);
  });
});

// ---------------------------------------------------------------------------
// buildHistoryMessages — cap + role mapping.
// ---------------------------------------------------------------------------

describe("buildHistoryMessages", () => {
  function msg(role: "user" | "assistant", content: string): ChatMessage {
    return {
      id: `${role}-${content}`,
      role,
      content,
      timestamp: new Date() as unknown as ChatMessage["timestamp"],
    };
  }

  it("maps assistant->model and user->user", () => {
    const history = [msg("user", "hi"), msg("assistant", "hello")];
    const result = buildHistoryMessages(history, null);
    expect(result).toEqual([
      { role: "user", text: "hi" },
      { role: "model", text: "hello" },
    ]);
  });

  it("appends the new user message when provided", () => {
    const result = buildHistoryMessages([], "وش تخصصك؟");
    expect(result).toEqual([{ role: "user", text: "وش تخصصك؟" }]);
  });

  it("does not append anything for the initial-greeting (null) turn", () => {
    const result = buildHistoryMessages([msg("assistant", "hi")], null);
    expect(result).toEqual([{ role: "model", text: "hi" }]);
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
// runConversationTurn — mocked callGemini (never hits the live API).
// ---------------------------------------------------------------------------

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

describe("runConversationTurn", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const baseParams = {
    userContext: {
      name: "أحمد",
      gender: "male" as const,
      messageCount: 2,
      sessionType: "new" as const,
    },
    priorMessages: [] as ChatMessage[],
    newUserMessage: "أنا خريج",
  };

  it("returns a plain-text reply + quick replies for a normal turn", async () => {
    const text = [
      "ممتاز! وش تخصصك؟",
      "```json",
      '{ "quick_replies": ["علوم حاسب", "إدارة أعمال"] }',
      "```",
    ].join("\n");
    vi.spyOn(callGeminiModule, "callGemini").mockResolvedValue({ text, model: "gemini-2.5-flash" });

    const result = await runConversationTurn(baseParams);

    expect(result.reply).toBe("ممتاز! وش تخصصك؟");
    expect(result.quickReplies).toEqual(["علوم حاسب", "إدارة أعمال"]);
    expect(result.cvGenerated).toBe(false);
    expect(result.cvData).toBeNull();
  });

  it("validates and returns cv_data on a valid CV turn", async () => {
    const text = "```json\n" + JSON.stringify(validCv) + "\n```";
    vi.spyOn(callGeminiModule, "callGemini").mockResolvedValue({ text, model: "gemini-2.5-flash" });

    const result = await runConversationTurn(baseParams);

    expect(result.cvGenerated).toBe(true);
    expect(result.cvData).toEqual(validCv);
    expect(result.reply).toBe("");
  });

  it("retries once on invalid CV JSON and succeeds with the corrected version", async () => {
    const invalidCv = { professional_summary: { en: "x", ar: "س" } };
    const invalidText = "```json\n" + JSON.stringify(invalidCv) + "\n```";
    const validText = "```json\n" + JSON.stringify(validCv) + "\n```";

    const spy = vi
      .spyOn(callGeminiModule, "callGemini")
      .mockResolvedValueOnce({ text: invalidText, model: "gemini-2.5-flash" })
      .mockResolvedValueOnce({ text: validText, model: "gemini-2.5-flash" });

    const result = await runConversationTurn(baseParams);

    expect(spy).toHaveBeenCalledTimes(2);
    expect(result.cvGenerated).toBe(true);
    expect(result.cvData).toEqual(validCv);
  });

  it("never returns cv_data when validation still fails after the bounded retry", async () => {
    const invalidCv = { professional_summary: { en: "x", ar: "س" } };
    const invalidText = "```json\n" + JSON.stringify(invalidCv) + "\n```";

    const spy = vi.spyOn(callGeminiModule, "callGemini").mockResolvedValue({
      text: invalidText,
      model: "gemini-2.5-flash",
    });

    const result = await runConversationTurn(baseParams);

    // 1 initial attempt + 1 bounded retry = 2 calls total.
    expect(spy).toHaveBeenCalledTimes(2);
    expect(result.cvGenerated).toBe(false);
    expect(result.cvData).toBeNull();
    expect(result.reply.length).toBeGreaterThan(0);
  });
});
