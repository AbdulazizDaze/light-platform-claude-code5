---
description: Tag a completed, user-approved milestone on main as a version checkpoint.
argument-hint: <version, e.g. v1.0-candidate>
---

Tag the checkpoint: **$ARGUMENTS**

Run only **after** the user has tested the milestone locally and approved it. Steps:
1. Ensure `main` is up to date and clean (`git status`, `git pull`).
2. Annotated tag: `git tag -a <version> -m "<milestone>: <summary>"`.
3. Push it: `git push origin <version>` (or `git push origin --tags`).
4. Record the tag next to the completed milestone in `docs/build-roadmap.md`.

Checkpoints: `v1.0-candidate` (M1), `v2.0-marketplace` (M2). Tags are your rollback/revision points —
`git checkout <tag>` restores that exact state. After tagging M1, proceed to `/plan-feature M2`.
