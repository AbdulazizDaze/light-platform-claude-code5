# Agent Playbook

How the Light agent system is organized and how to drive it. This is the "operating manual" for the
hybrid orchestration model referenced in `CLAUDE.md §5`.

## The model: hybrid orchestration

Two tiers:

1. **Orchestration roles** — run the build loop and hold *workflow* context, not deep domain detail.
   They plan, implement general work, and gate quality. Keeping them lean preserves context budget.
2. **Domain experts** — narrow, deep subagents. A role delegates to them for anything touching a
   specialized subsystem (Gemini prompts, matching math, Firestore rules, Arabic/RTL, PDF, notifs).

This mirrors a real engineering org: a tech lead (orchestrator/planner) hands specialized tickets to
specialists, and everything passes review and test before shipping. The benefit in Claude Code is
**context isolation** — each subagent works in its own context window, so the main thread stays
focused and cheap, and specialists load only the docs/skills they need.

```
        You (product owner)
              │
        Main thread  ──►  planner  ──►  ordered plan
              │
     ┌────────┼─────────────────────────────┐
     ▼        ▼                              ▼
 frontend  backend  ──delegates to──►  domain experts
 engineer  engineer                    ├─ ai-prompt-engineer
     │        │                        ├─ matching-engine-engineer
     │        │                        ├─ firebase-data-engineer
     │        │                        ├─ rtl-arabic-specialist
     │        │                        ├─ pdf-service-engineer
     │        │                        └─ notifications-engineer
     ▼
  qa-test-engineer  ──►  code-reviewer  ──►  security-reviewer (if auth/rules/PII)
                              │
                              ▼
                           /ship
```

## When to use which agent

| Situation | Agent |
|---|---|
| Break a roadmap milestone into steps | `planner` |
| Build a page/component/client interaction | `frontend-engineer` (+ `rtl-arabic-specialist`) |
| Build an API route / server logic / data write | `backend-engineer` (+ `firebase-data-engineer`) |
| Anything Gemini: prompts, dialect, skill inference, fallback | `ai-prompt-engineer` |
| Matching filters/scoring/embeddings/boosts | `matching-engine-engineer` |
| Firestore schema, converters, rules, indexes | `firebase-data-engineer` |
| RTL layout, bidi bugs, Arabic type, gender copy | `rtl-arabic-specialist` |
| Cloud Run PDF + Arabic print typography | `pdf-service-engineer` |
| FCM / email / notification records | `notifications-engineer` |
| Review a diff before merge | `code-reviewer` |
| Write/run tests, own the test gate | `qa-test-engineer` |
| Auth, security rules, PDPL, identity integrity | `security-reviewer` |

## Skills vs. agents vs. commands

- **Skills** (`.claude/skills/`) are *procedures/knowledge* — reusable, model-invoked when intent
  matches (e.g. writing a new API route pulls in `nextjs-api-route`). They are the "how-to" cards.
- **Agents** (`.claude/agents/`) are *actors* with a role, tools, and a system prompt. They *use*
  skills. Delegated to via the Task tool for isolated, focused work.
- **Commands** (`.claude/commands/`) are *entry points* you type (`/plan-feature`) that kick off a
  scripted workflow, usually orchestrating agents + skills.

## Standard feature loop

1. `/plan-feature <milestone or description>` → `planner` produces an ordered checklist with the
   files to touch, the agents/skills involved, and the test + gate plan.
2. Implement: `frontend-engineer` and/or `backend-engineer` do the work, delegating to domain
   experts. They apply the relevant skills.
3. `/test` → `qa-test-engineer` writes/runs Vitest; blocks on red or missing coverage of pure logic.
4. `/review` → `code-reviewer` checks conventions/correctness/security; `security-reviewer` runs too
   if the change touches auth, Firestore rules, or PII.
5. `/ship` → final DoD checklist (from `CLAUDE.md §6`), commit with Conventional Commit message,
   update `docs/build-roadmap.md` Current state.

## Delegation etiquette

- Give a subagent a **complete, self-contained brief**: the goal, the files, the relevant skill,
  the acceptance criteria. Subagents don't share your conversation memory — spell it out.
- Ask for a **concise result** back (what changed, decisions, follow-ups), not a file dump.
- Run **independent** subagents in parallel (single message, multiple Task calls). Serialize only
  true dependencies.
- The domain experts have deep knowledge of their `PRD.md`/`docs/` sections baked into their prompts,
  so you can brief them tersely on the *task* and trust them on the *domain*.

## Guardrails the whole team enforces

Bilingual coverage · RTL-first · Saudi dialect + gender-aware · server-owned identity · Zod-validate
AI output · deterministic zero-cost matching · PDPL/data-minimization · security rules updated with
every model change · tests for all pure logic. (Mirror of `CLAUDE.md §3` and `§6`.)
