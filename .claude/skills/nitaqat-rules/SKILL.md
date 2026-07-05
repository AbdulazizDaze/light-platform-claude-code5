---
name: nitaqat-rules
description: Use when implementing Saudization (Nitaqat) logic — nationality handling, Saudization badges, the Nitaqat matching boost, compliance flags in job generation, and hire-impact preview. Trigger for any nationality/Nitaqat feature on candidate or recruiter side.
---

# Nitaqat (Saudization) Rules

Nitaqat is the #1 hiring pressure for Saudi SMBs and a core Light differentiator. See `PRD.md §8`.

## Categories
| Category | Color | Meaning |
|---|---|---|
| Platinum | green | Exceeds requirements significantly |
| Green | green | Meets requirements |
| Yellow | yellow | Below requirements — limited visa/service access |
| Red | red | Significantly below — penalties, visa freezes |

Type: `type NitaqatColor = "platinum" | "green" | "yellow" | "red";`

## Candidate side
- `nationality: "saudi" | "non_saudi"` on the profile (collected at registration or inferred in
  conversation).
- **Saudization badge**: flag Saudi candidates visibly in match results.

## Recruiter side
- Company optionally provides `nitaqat_category`, size, industry, `saudi_employee_count`,
  `total_employee_count`.
- **Nitaqat boost** (matching): when company is **Yellow or Red**, Saudi candidates get a **1.15×**
  multiplier on total score, capped at 100, logged `nitaqat_boost: true`. Shown to recruiter as
  "يحسّن النطاقات" (Improves Nitaqat) with the match explanation. See `matching-algorithm`.
- **Compliance guidance**: the job-post generator flags when a description would attract primarily
  non-Saudi candidates and suggests adjustments.
- **Hire-impact preview**: show how hiring a specific candidate (Saudi vs non-Saudi) shifts the ratio.

## Boost implementation
```ts
export function nitaqatMultiplier(isSaudi: boolean, status: NitaqatColor): number {
  return isSaudi && (status === "yellow" || status === "red") ? 1.15 : 1.0;
}
```
Apply inside `totalScore` (cap at 100). Record `nitaqat_boost` on the match for fairness auditing.

## Localized notes (bilingual-content)
```ts
const nitaqatNote = {
  ar: "مرشح سعودي — التوظيف يحسّن تصنيف النطاقات",
  en: "Saudi candidate — hiring improves your Nitaqat standing",
};
```

## Fairness & audit
The boost is capped, applied only when warranted (Yellow/Red), visible to the recruiter, and logged.
Quarterly review checks it isn't distorting outcomes unfairly.

## Related
`matching-algorithm`, `bilingual-content`, `firestore-rules` (company fields), `gemini-prompt`
(job-post compliance flags).
