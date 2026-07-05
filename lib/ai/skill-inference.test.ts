import { describe, expect, it } from "vitest";
import { inferSkillsFromText } from "./skill-inference";

function englishNames(text: string): string[] {
  return inferSkillsFromText(text).map((s) => s.name.en);
}

describe("inferSkillsFromText — canonical PRD §18.C examples", () => {
  it("infers retail skills from 'بائع في جرير'", () => {
    const names = englishNames("بائع في جرير");
    expect(names).toEqual(
      expect.arrayContaining([
        "Customer Service",
        "Sales",
        "Communication",
        "Working Under Pressure",
        "Goal Achievement",
        "POS Systems",
        "Inventory Awareness",
      ]),
    );
  });

  it("infers barista skills from 'باريستا في ستاربكس'", () => {
    const names = englishNames("باريستا في ستاربكس");
    expect(names).toEqual(
      expect.arrayContaining([
        "Customer Service",
        "Fast-Paced Environment",
        "Teamwork",
        "Cleanliness Standards",
        "Cash Handling",
        "Multitasking",
      ]),
    );
  });

  it("infers web-developer skills from 'مطور ويب'", () => {
    const names = englishNames("مطور ويب");
    expect(names).toEqual(
      expect.arrayContaining([
        "HTML/CSS",
        "JavaScript",
        "Responsive Design",
        "Version Control",
        "Problem Solving",
        "Debugging",
        "API Integration",
      ]),
    );
  });

  it("infers accountant skills from 'محاسب'", () => {
    const names = englishNames("محاسب");
    expect(names).toEqual(
      expect.arrayContaining([
        "Financial Analysis",
        "Microsoft Excel",
        "Budgeting",
        "Attention to Detail",
        "SAP/Oracle",
        "Regulatory Compliance",
      ]),
    );
  });
});

describe("inferSkillsFromText — behavior", () => {
  it("matches English input too (case-insensitive)", () => {
    expect(englishNames("Worked as a Sales Associate")).toContain("Sales");
    expect(englishNames("junior WEB DEVELOPER")).toContain("JavaScript");
  });

  it("every inferred skill carries bilingual { en, ar } names and a category", () => {
    for (const skill of inferSkillsFromText("محاسب")) {
      expect(skill.name.en.length).toBeGreaterThan(0);
      expect(skill.name.ar.length).toBeGreaterThan(0);
      expect(skill.category.length).toBeGreaterThan(0);
    }
  });

  it("de-duplicates overlapping skills across matched groups", () => {
    // Both retail and barista imply Customer Service; it must appear once.
    const names = englishNames("بائع وأيضاً باريستا");
    const customerService = names.filter((n) => n === "Customer Service");
    expect(customerService).toHaveLength(1);
  });

  it("returns an empty list when nothing matches", () => {
    expect(inferSkillsFromText("عامل غير معروف تماماً")).toEqual([]);
  });

  it("produces at least 5 skills for a single canonical role (PRD 5–10 target)", () => {
    expect(inferSkillsFromText("بائع في جرير").length).toBeGreaterThanOrEqual(5);
  });
});
