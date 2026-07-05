import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, otherLocale, t, type LocalizedString } from "./index";
import { dirFor, pickByDir } from "./dir";

describe("t()", () => {
  const both: LocalizedString = { en: "Hello", ar: "مرحبا" };

  it("returns the Arabic string for locale 'ar'", () => {
    expect(t(both, "ar")).toBe("مرحبا");
  });

  it("returns the English string for locale 'en'", () => {
    expect(t(both, "en")).toBe("Hello");
  });

  it("defaults to Arabic when no locale is passed", () => {
    expect(DEFAULT_LOCALE).toBe("ar");
    expect(t(both)).toBe("مرحبا");
  });

  it("falls back to English when Arabic is empty", () => {
    const arEmpty: LocalizedString = { en: "Hello", ar: "" };
    expect(t(arEmpty, "ar")).toBe("Hello");
  });

  it("falls back to Arabic when English is empty", () => {
    const enEmpty: LocalizedString = { en: "", ar: "مرحبا" };
    expect(t(enEmpty, "en")).toBe("مرحبا");
  });

  it("returns empty string when both are empty", () => {
    const bothEmpty: LocalizedString = { en: "", ar: "" };
    expect(t(bothEmpty, "en")).toBe("");
  });
});

describe("otherLocale()", () => {
  it("flips ar to en", () => {
    expect(otherLocale("ar")).toBe("en");
  });

  it("flips en to ar", () => {
    expect(otherLocale("en")).toBe("ar");
  });
});

describe("dirFor()", () => {
  it("returns rtl for ar", () => {
    expect(dirFor("ar")).toBe("rtl");
  });

  it("returns ltr for en", () => {
    expect(dirFor("en")).toBe("ltr");
  });
});

describe("pickByDir()", () => {
  it("picks the rtl value for ar", () => {
    expect(pickByDir("ar", "start", "end")).toBe("start");
  });

  it("picks the ltr value for en", () => {
    expect(pickByDir("en", "start", "end")).toBe("end");
  });
});
