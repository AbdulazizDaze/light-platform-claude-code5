# Workflow — Autopilot + Local Testing + Version Control

How to drive Claude Code to build Light on near-autopilot, committing straight to `main`, so you can
run and test each milestone locally in your browser before moving on.

## The model in one line

Claude Code builds a whole **milestone** on `main` — implementing, committing in small steps, pushing,
testing, and self-reviewing — then **hands it to you to run locally** with a browser checklist. You
test, approve, and it **tags** the checkpoint, then starts the next milestone.

```
/plan-feature M1  → you approve the plan
/build-feature M1 → agents implement → commit×N → push to main → /test → /review
/ship M1          → Definition-of-Done gate → tells you how to run it locally
   ── you run `npm run dev`, test in the browser, approve ──
/tag-release v1.0-candidate
        ▼
/plan-feature M2  → … same loop for Recruiter + Matching …
```

Two milestones only (see `docs/build-roadmap.md`):
1. **M1 — Full Candidate Experience** (register → chat → bilingual CV → PDF → dashboard).
2. **M2 — Full Recruiter Experience + Matching** (job posts → matching engine → match surfaces →
   notifications → Nitaqat).

---

## 1. One-time setup

Do this once. The checks are safe if you're unsure whether it's already done.

**a. Install Claude Code** (if needed): `npm install -g @anthropic-ai/claude-code`

**b. Verify Git identity:**
```bash
git --version
git config --global user.name  "Abdulaziz Aljandal"
git config --global user.email "AbdulazizAljandalDS@hotmail.com"
```

**c. Initialize the repo** (in the `Dev Framework` folder — this project root):
```bash
git init
printf "node_modules/\n.next/\n.env\n.env.*\n*service-account*.json\ndist/\nout/\n" > .gitignore
git add .
git commit -m "chore: bootstrap Light build framework"
```

**d. Connect to GitHub and push `main`.** Fresh build — use a clean repo (don't reuse the old
`light-platform`). Either:
```bash
gh repo create light --private --source=. --remote=origin --push   # if you have the gh CLI
```
or with plain git:
```bash
git branch -M main
git remote add origin https://github.com/<you>/light.git
git push -u origin main
```

**e. Secrets in `.env.local`** (gitignored) — never committed. Claude Code needs these to run the app
locally; add them before testing M1:
```
GEMINI_API_KEY=...
NEXT_PUBLIC_FIREBASE_API_KEY=...            # + the other 6 NEXT_PUBLIC_FIREBASE_* values
FIREBASE_SERVICE_ACCOUNT_JSON=...           # server (Admin SDK)
PDF_SERVICE_URL=...                         # once the Cloud Run PDF service exists (M1.5)
RESEND_API_KEY=...        # or SENDGRID_API_KEY (M2 notifications)
```
The hooks refuse to write secret files and `settings.json` denies reading `.env*`, so keys never leak
into commits or the model's context.

**f. Open the folder in Claude Code.** The `.claude/` config loads automatically.

---

## 2. The build loop (per milestone)

1. **Plan** — `/plan-feature M1`
   The `planner` returns an ordered plan (files, agents, tests). **Read it, approve or tweak.** This is
   your main steering moment — a couple of minutes here prevents wrong turns.

2. **Build** — `/build-feature M1`
   Claude Code implements via the right agents, commits in small Conventional-Commit steps, pushes to
   `main`, runs the test gate, and self-reviews. Runs largely unattended. Let it finish the milestone.

3. **Ship** — `/ship M1`
   Runs the Definition-of-Done gate, makes sure `npm run build`/`typecheck`/`lint` pass, then prints
   the **local-test checklist** and exactly how to run it. It stops and waits for you.

4. **Test locally (you).** Follow the printed steps:
   ```bash
   npm install        # if deps changed
   npm run dev        # → http://localhost:3000
   ```
   Walk the milestone's checklist in the browser (candidate flow for M1). If something's wrong, tell
   Claude Code plainly ("the AR/EN toggle doesn't switch the summary") — it fixes and pushes to `main`.

5. **Tag** — when you're happy, `/tag-release v1.0-candidate` marks the checkpoint.

Then `/plan-feature M2` and repeat for Recruiter + Matching.

---

## 3. Running it locally — what you'll need

- **M1 (Candidate):** Node 18+, `.env.local` with `GEMINI_API_KEY` + `NEXT_PUBLIC_FIREBASE_*` +
  `FIREBASE_SERVICE_ACCOUNT_JSON`, then `npm run dev`. For the PDF download, the Cloud Run Puppeteer
  service (built in M1.5) runs remotely via `PDF_SERVICE_URL`, or Claude will provide a local run
  command for `services/pdf/` so you can test PDFs without deploying.
- **M2 (Recruiter + Matching):** same, plus an email key for notifications, and — because matching is
  triggered by Firestore writes — the **Firestore emulator** for local trigger testing. Claude will
  wire `firebase emulators:start` and a local `/api/match` trigger so you can test matching without
  cloud functions deployed.

Claude Code lists the exact commands in the `/ship` handoff each time, so you never have to guess.

---

## 4. Version control you can revise later

- **Everything on `main`,** small Conventional Commits — clean, readable history.
- **A tag per milestone:** `v1.0-candidate`, `v2.0-marketplace`. Tags are rollback points —
  `git checkout v1.0-candidate` restores that exact state; `git diff v1.0-candidate v2.0-marketplace`
  shows everything M2 added.
- Because commits are small and milestones are tagged, you can always find and undo a specific change.

To inspect later: `git log --oneline`, `git tag`, or check out any tag to branch from an earlier state.

---

## 5. What keeps unattended building safe

- **Test gate** — `qa-test-engineer` blocks a milestone if core logic (matching math, schemas, i18n)
  isn't covered and green.
- **Review gates** — `code-reviewer` on the diff; `security-reviewer` whenever auth, Firestore rules,
  or PII are touched.
- **Hooks** — auto-format + typecheck signal on every edit; a pre-write guard refuses to touch secret
  files; a reminder fires when security-sensitive files change.
- **Permissions** (`.claude/settings.json`) — Claude can commit, push to `main`, and tag, but
  **deploys** (`vercel`, `firebase deploy`, `gcloud`), **force-push**, `reset --hard`, and `rm -rf`
  are **denied**. So autopilot can't ship to production or rewrite history — only you deploy.
- **Your local test** — the real acceptance gate before each tag.

---

## 6. Tuning autonomy

- **More cautious:** move `Bash(git push origin main)` and/or `Bash(git commit *)` into an `ask` list
  in `settings.json` to confirm each push/commit.
- **Even more hands-off:** run Claude Code in a mode that auto-accepts allow-listed actions; the deny
  list still blocks deploys and destructive git.
- **Add deploys later:** when you're ready to go live, add the specific deploy command you use (e.g.
  `Bash(vercel --prod)`) to `allow` — but keep it out until you've tested locally and want production.

---

## 7. Quick reference

| You type | What happens |
|---|---|
| `/plan-feature M1` | Ordered plan for a milestone (no code). Your approval gate. |
| `/build-feature M1` | Implement → commit×N → push to `main` → test → self-review. |
| `/new-api-route <path>` | Secure API route (canonical shape). |
| `/new-component <name>` | RTL-first bilingual component. |
| `/test` | Vitest gate on pure logic. |
| `/review` | Code review (+ security review when needed). |
| `/ship M1` | DoD gate → push → print local-test instructions → wait for you. |
| `/tag-release v1.0-candidate` | Tag the approved milestone on `main`. |
| `/sync-prd <change>` | Reconcile docs/code after a PRD change. |

Start with one-time setup (§1), then **`/plan-feature M1`**.
