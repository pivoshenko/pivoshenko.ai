---
name: sync-branch
description: Fetch the latest base branch and rebase (or merge) the current branch onto it, surfacing conflicts clearly. Use when the user asks to sync, rebase, update from main, pull latest changes, or /sync-branch. Runs immediately without asking for confirmation.
---

# Sync Branch

Bring the current branch up to date with its base branch — rebase by default, merge on request — and surface conflicts cleanly when they happen.

## Workflow

1. Run in parallel:
   - `git status --porcelain`
   - `git branch --show-current`
   - `git rev-parse --abbrev-ref --symbolic-full-name @{u}` (upstream, if any)
2. Determine the base branch: default `main`, fall back to `master` if `main` does not exist. If the user names a different base, use it verbatim.
3. If the working tree is dirty, stash with `git stash push -u -m "sync-branch auto-stash"` and remember to pop afterwards. If stashing isn't safe (e.g. unresolved merge), stop and tell the user.
4. If currently on the base branch, `git pull --ff-only origin <base>` and stop — there's nothing to rebase.
5. Otherwise:
   - `git fetch origin <base>`
   - Rebase: `git rebase origin/<base>` (default).
   - Merge mode (only when the user asks): `git merge --no-ff origin/<base>`.
6. If conflicts appear:
   - Run `git status` and list the conflicted paths.
   - Stop and surface them to the user — do **not** attempt to auto-resolve.
   - Tell the user how to continue: resolve files, `git add <paths>`, then `git rebase --continue` (or `git merge --continue`). Mention `git rebase --abort` as the escape hatch.
7. On a clean rebase result, pop the stash if one was created (`git stash pop`).
8. Print a one-line summary: branch name, base, commits replayed, and whether a force-push is needed.

## Rules

- Default to **rebase**. Only merge when the user explicitly asks (or when the branch is shared and rewriting history would be unsafe — in that case, ask first).
- Never force-push as part of this skill. After a successful rebase of a previously pushed branch, tell the user a `git push --force-with-lease` is needed and let them run it.
- Never run `git rebase --skip` or drop commits to "make it work" — surface the conflict instead.
- Never use `--no-verify` or skip hooks.
- If the upstream tracking branch is missing, sync against `origin/<base>` directly and note that the branch isn't pushed yet.
- Always pop a stash you created, even if the rebase fails — unless popping itself would conflict, in which case leave it stashed and tell the user.
