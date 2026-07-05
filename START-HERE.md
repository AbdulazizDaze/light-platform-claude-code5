# START HERE — Running Light with Claude Code

## 1. Open Claude Code in this folder

```bash
cd "path/to/Dev Framework"
claude
```

The `.claude/` config (agents, skills, commands, hooks, permissions) loads automatically. `CLAUDE.md`
is read as project memory.

## 2. One-time setup (do once, before the first build)

**Already done for you:** `.gitignore`, `.env.example`, and **`.env.local`** (with your Firebase +
Gemini keys) are created in this folder. You still need to add `FIREBASE_SERVICE_ACCOUNT_JSON` to
`.env.local` before M1.3 (server-side auth) — it's marked in the file.

**Git init must run on your machine** (git can't initialize over the cloud-synced folder from the
assistant's sandbox). Open a terminal **in this folder** and run these once. First remove the partial
`.git` that the sandbox left behind:

PowerShell:
```powershell
Remove-Item -Recurse -Force .git   # clears the broken partial .git (ignore "not found")
git init
git branch -M main
git add .
git commit -m "chore: bootstrap Light build framework"
gh repo create light --private --source=. --remote=origin --push   # needs gh auth login
```

Git Bash / WSL equivalent:
```bash
rm -rf .git
git init && git branch -M main
git add . && git commit -m "chore: bootstrap Light build framework"
gh repo create light --private --source=. --remote=origin --push
```

No `gh` CLI? Create an empty repo on github.com, then:
`git remote add origin https://github.com/<you>/light.git && git push -u origin main`.

> Tip: because Claude Code itself runs natively on your machine, you can also just let **it** do this —
> paste the kickoff prompt below and it will run the git setup as its first step (it has permission to
> commit and push to `main`; it will ask you once for the GitHub repo-create step).

**Verify `.env.local` is ignored before pushing:** `git check-ignore .env.local` should print
`.env.local`. (It is, via `.gitignore`.)

## 3. Paste this kickoff prompt into Claude Code

> You are building **Light** using the framework in this repository. Before doing anything, read
> `CLAUDE.md`, then `PRD.md`, then `docs/build-roadmap.md`, `docs/design-system.md`,
> `docs/agent-playbook.md`, and `docs/workflow.md`. Confirm in 5–6 lines that you understand: the
> product, the two-milestone scope (M1 Candidate, then M2 Recruiter + Matching), the hybrid agent
> system, and the non-negotiables (bilingual + RTL, Saudi dialect + gender-aware, server-owned
> identity, Zod-validated AI output, deterministic zero-cost matching, PDPL, shadcn/ui + the design
> system).
>
> Then begin **Milestone 1**. First run `/plan-feature M1` and present the ordered plan (files,
> responsible agents, skills, tests, gates). **Stop and wait for my approval of the plan.**
>
> After I approve, execute the full M1 loop per `docs/workflow.md`: implement via the right agents,
> delegating to domain experts; commit in small Conventional-Commit steps and push each to `main`;
> keep `main` green and runnable (`npm run dev`) throughout; run the `/test` gate (exhaustive tests
> for pure logic) and the `/review` gate (`code-reviewer`, plus `security-reviewer` for
> auth/rules/PII). Build all of M1 without stopping for routine confirmations — only pause if you hit
> a real decision, a blocker, or a missing secret/credential.
>
> When M1 is complete, run `/ship M1`: verify the Definition of Done, then give me the exact commands
> to run it locally plus the browser test checklist, and **stop there. Do not start M2** — I will test
> in my browser first.

## 4. What you do next

- Claude shows the **plan** → you approve (your main steering moment).
- Claude builds all of **M1**, committing to `main` as it goes.
- Claude stops at **`/ship M1`** and hands you run commands + a browser checklist.
- You run `npm run dev`, test at `http://localhost:3000`. Report any issues in plain language; Claude
  fixes and pushes.
- When happy: tell Claude **`/tag-release v1.0-candidate`**, then **`/plan-feature M2`** to start the
  recruiter + matching milestone (same loop).

## Tips

- **Fully hands-off:** remove the "wait for my approval of the plan" line from the prompt. (Keeping it
  is recommended — it's a 2-minute check that prevents wrong turns.)
- **New session later?** Just say: `Read CLAUDE.md and docs/build-roadmap.md, tell me the Current
  state, and continue.` The roadmap's "Current state" note is how it resumes.
- **Design check before building screens?** Ask: `Before building UI, mock up the key M1 screens per
  docs/design-system.md so I can approve the look.`
- Claude commits/pushes to `main` on its own but **cannot deploy, force-push, or reset** — those are
  denied in `.claude/settings.json`. You deploy when ready.
