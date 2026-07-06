import { describe, expect, it } from "vitest";

import {
  CV_THEMES,
  CV_THEME_IDS,
  DEFAULT_CV_THEME_ID,
  isValidHex,
  resolveCvThemeColors,
} from "./themes";

describe("isValidHex", () => {
  it("accepts well-formed 6-digit hex colors", () => {
    expect(isValidHex("#14213D")).toBe(true);
    expect(isValidHex("#22ae89")).toBe(true);
  });

  it("rejects malformed hex colors", () => {
    expect(isValidHex("14213D")).toBe(false); // missing '#'
    expect(isValidHex("#123")).toBe(false); // 3-digit shorthand not accepted
    expect(isValidHex("#GGGGGG")).toBe(false); // invalid hex digits
    expect(isValidHex("")).toBe(false);
    expect(isValidHex("red")).toBe(false);
  });
});

describe("CV_THEME_IDS / CV_THEMES", () => {
  it("exposes exactly the 6 named themes (mirrors services/pdf/lib/themes.js)", () => {
    expect(CV_THEME_IDS.sort()).toEqual(
      ["oxford", "jungle", "orange", "slate", "burgundy", "teal"].sort()
    );
  });

  it("every named theme has a valid primary and accent hex", () => {
    for (const id of CV_THEME_IDS) {
      expect(isValidHex(CV_THEMES[id].primary)).toBe(true);
      expect(isValidHex(CV_THEMES[id].accent)).toBe(true);
    }
  });

  it("defaults to oxford", () => {
    expect(DEFAULT_CV_THEME_ID).toBe("oxford");
  });
});

describe("resolveCvThemeColors", () => {
  it("resolves a named theme to its known palette", () => {
    expect(resolveCvThemeColors("jungle")).toEqual(CV_THEMES.jungle);
    expect(resolveCvThemeColors("burgundy")).toEqual(CV_THEMES.burgundy);
  });

  it("resolves 'custom' with valid custom colors to those exact colors", () => {
    const result = resolveCvThemeColors("custom", { primary: "#111111", accent: "#222222" });
    expect(result).toEqual({ primary: "#111111", accent: "#222222" });
  });

  it("falls back to the default theme when 'custom' has no custom colors", () => {
    expect(resolveCvThemeColors("custom")).toEqual(CV_THEMES[DEFAULT_CV_THEME_ID]);
    expect(resolveCvThemeColors("custom", null)).toEqual(CV_THEMES[DEFAULT_CV_THEME_ID]);
  });

  it("falls back per-field when only one custom color is invalid", () => {
    const result = resolveCvThemeColors("custom", { primary: "not-a-hex", accent: "#ABCDEF" });
    expect(result).toEqual({ primary: CV_THEMES[DEFAULT_CV_THEME_ID].primary, accent: "#ABCDEF" });
  });
});
