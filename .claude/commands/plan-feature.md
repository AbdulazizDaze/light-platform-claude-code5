---
description: Plan a feature or roadmap milestone before coding — delegates to the planner agent for an ordered implementation plan.
argument-hint: <milestone id or feature description>
---

Plan the work for: **$ARGUMENTS**

Delegate to the `planner` agent. Have it load `CLAUDE.md`, `docs/build-roadmap.md`,
`docs/architecture.md`, `docs/data-models.md`, and the relevant `PRD.md` sections, then return an
ordered plan with: goal, scope (in/out), numbered steps (files + responsible agent + skills),
data/contract changes (schemas, rules, indexes — each flagged for the security gate), a test plan for
pure logic, required review gates, and risks/unknowns (note if an ADR is needed).

Do not write product code in this step. Present the plan for approval before implementation.
