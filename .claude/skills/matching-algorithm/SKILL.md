---
name: matching-algorithm
description: Use when implementing or modifying the matching engine — hard filters, weighted soft scoring, cosine similarity on embeddings, Nitaqat and freshness boosts, fairness constraints, and template-based explanations. Trigger for any scoring, ranking, or match-record work. Must stay deterministic and zero-cost per match.
---

# Matching Algorithm

Authoritative math lives in `docs/data-models.md` and `PRD.md §9.5`. Implement in `lib/matching/` as
pure functions (plain data in, plain data out) so it is exhaustively unit-testable.

## Pipeline
1. **Hard filters** (all must pass) — cheap Firestore compound query first:
   location (candidate cities ∩ job city, or willing to relocate), language (meets minimum), job type
   (job type ∈ candidate preferred), work arrangement (job arrangement ∈ candidate preferred).
2. **Soft score 0–100** — weighted sum:

```ts
const WEIGHTS = { skills: 0.35, experience: 0.30, education: 0.15, preferences: 0.10, quality: 0.10 };

export function softScore(c: Scored) {
  return (
    c.skills * WEIGHTS.skills +
    c.experience * WEIGHTS.experience +
    c.education * WEIGHTS.education +
    c.preferences * WEIGHTS.preferences +
    c.quality * WEIGHTS.quality
  );
}
```
   - **skills**: `cosine(candidateEmbedding, jobEmbedding)` mapped to 0–100.
   - **experience**: years vs requirement, industry overlap, title similarity, recency weighting.
   - **education**: degree-level match (exact/over/under), field relevance.
   - **preferences**: industry/benefits/company-size/growth-vs-stability alignment.
   - **quality**: completeness, freshness, verified vs inferred skills.

3. **Boosts**:
```ts
export function freshnessBoost(daysSinceCreation: number) {
  return 1.0 + 0.1 * Math.max(0, 14 - daysSinceCreation) / 14;   // day0=1.10, day7=1.05, day14=1.00
}
export function nitaqatMultiplier(isSaudi: boolean, status: NitaqatColor) {
  return isSaudi && (status === "yellow" || status === "red") ? 1.15 : 1.0;
}
export function totalScore(base: number, isSaudi: boolean, status: NitaqatColor, days: number) {
  const raw = base * nitaqatMultiplier(isSaudi, status) * freshnessBoost(days);
  return Math.min(100, raw);                                       // cap at 100
}
```

4. **Cosine** (pure math, no API):
```ts
export function cosine(a: number[], b: number[]) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}
```

5. **Fairness**: max 10 active match slots per candidate; no duplicate active candidate-job pair; aim
   for ≥5 distinct companies among a candidate's slots.

6. **Explanations** — template-based, **no LLM per match**:
```json
{ "total_score": 82, "strengths": ["..."], "gaps": ["..."],
  "nitaqat_note": "مرشح سعودي — التوظيف يحسّن تصنيف النطاقات",
  "component_scores": { "skills": 88, "experience": 79, "education": 72, "preferences": 85, "profile_quality": 91 } }
```

## Embedding inputs (generate once, store on doc)
- **Candidate**: `[Summary EN] | Skills: [...] | Experience: [title at company (duration), ...] |
  Education: [degree in field from institution] | Industries: [...] | Looking for: [types, arrangements]`
- **Job**: `[Title EN] | [Description EN] | Required Skills: [...] | Experience: [level] |
  Industry: [industry] | Type: [type] | Arrangement: [arrangement]`

## Rules
- Deterministic and side-effect-free scoring — `qa-test-engineer` asserts exact numbers.
- No per-match LLM calls; no per-run embedding regeneration.
- Keep Firestore I/O and notification dispatch at the edges, out of the scoring core.

## Related
`nitaqat-rules`, `gemini-prompt` (embeddings), `firestore-rules` (indexes for hard filters), `cv-schema`.
