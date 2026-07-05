# Light — Claude Code Build Framework

This repository is set up as an **operating system for building [Light](./PRD.md) with Claude Code** —
an AI-powered, conversational, bilingual (Arabic/English) recruitment platform for the Saudi market.

Open this folder in Claude Code and the whole system activates automatically: the project memory, a
team of specialized agents, reusable skills, workflow commands, and safety hooks.

## What's in here

```
.
├─ CLAUDE.md                 # Master project memory — read every session. Principles, stack, DoD.
├─ PRD.md                    # Full product spec.
├─ docs/                     # On-demand references (loaded when a task needs them)
│  ├─ architecture.md        #   System design, service boundaries, env, repo layout, ADRs
│  ├─ conventions.md         #   Coding standards, naming, testing, git rules
│  ├─ data-models.md         #   Firestore collections, Zod contracts, the matching math
│  ├─ build-roadmap.md       #   Ordered milestones M0→M9 + "Current state" you keep updated
│  └─ agent-playbook.md      #   How the agent system is organized and driven
└─ .claude/
   ├─ settings.json          # Permissions + hooks
   ├─ agents/                # 12 subagents (roles + domain experts)
   ├─ skills/                # 8 reusable skills (procedures + code templates)
   ├─ commands/              # 8 slash commands (workflow entry points)
   └─ hooks/                 # format/typecheck + secret & security guards
```

## The system at a glance

**Hybrid orchestration** — role-based agents run the build loop and delegate to domain experts:

- **Roles:** `planner`, `frontend-engineer`, `backend-engineer`, `code-reviewer`,
  `qa-test-engineer`, `security-reviewer`.
- **Domain experts:** `ai-prompt-engineer`, `matching-engine-engineer`, `firebase-data-engineer`,
  `rtl-arabic-specialist`, `pdf-service-engineer`, `notifications-engineer`.

**Skills** (`cv-schema`, `bilingual-content`, `gemini-prompt`, `matching-algorithm`,
`firestore-rules`, `rtl-component`, `nitaqat-rules`, `nextjs-api-route`) carry the "how-to" and code
templates the agents apply.

**Commands** are how you drive it:

| Command | Does |
|---|---|
| `/plan-feature <milestone>` | Turn a roadmap item into an ordered plan (no code yet) |
| `/build-feature <desc>` | Full loop: plan → implement → test → review → ship |
| `/new-api-route <path>` | Scaffold a secure API route (canonical shape) |
| `/new-component <name>` | Scaffold an RTL-first bilingual component |
| `/test` | Run the test gate (Vitest, pure logic) |
| `/review` | Code review (+ security review if auth/rules/PII) |
| `/ship` | Definition-of-Done gate, commit, roadmap update |
| `/sync-prd <change>` | Reconcile docs/code with a PRD change |

## How to start building

1. Open this folder in Claude Code.
2. Say: **`/plan-feature M0`** — the planner scaffolds the Next.js foundation plan.
3. Approve, then **`/build-feature M0`** to execute the loop.
4. Continue milestone by milestone through `docs/build-roadmap.md`. Each ends at a `/ship` gate that
   updates the roadmap's **Current state**.

## Guardrails baked in

Bilingual by construction · RTL-first · Saudi-dialect, gender-aware · server-owned identity ·
Zod-validated AI output · deterministic zero-cost matching · PDPL data minimization · security rules
updated with every model change · tests for all pure logic. See `CLAUDE.md §3` and `§7`.

Hooks block writes to secret files, remind you to run the security gate when auth/rules/PII files
change, and auto-format + typecheck edits. `git push`, deploys, and destructive commands are denied
by default in `.claude/settings.json` (adjust to taste).

## Notes

- This is a **fresh greenfield build**; the old `light-platform` repo is not reused.
- Keep `docs/build-roadmap.md`'s **Current state** current at the end of each session — it's how the
  next session knows where to resume.
