---
name: sync-branch
description: Fetch the latest base branch and rebase (or merge) the current branch onto it, surfacing conflicts clearly. Use when the user asks to sync, rebase, update from main, pull latest changes, or /sync-branch. Runs immediately without asking for confirmation.
tags: [git]
---

# Sync Branch

Bring current branch up to date with base. Rebase default. Merge on request. Surface conflicts clean.

## Workflow

1. Parallel:
   - `git status --porcelain`
   - `git branch --show-current`
   - `git rev-parse --abbrev-ref --symbolic-full-name @{u}` (upstream if any)
2. Pick base: default `main`. Fall back `master` if no `main`. User names other -> use verbatim.
3. Dirty tree -> stash: `git stash push -u -m "sync-branch auto-stash"`. Remember to pop. Stash unsafe (e.g. unresolved merge) -> stop + tell user.
4. On base branch -> `git pull --ff-only origin <base>` + stop. Nothing to rebase.
5. Else:
   - `git fetch origin <base>`
   - Rebase: `git rebase origin/<base>` (default).
   - Merge mode (user asks): `git merge --no-ff origin/<base>`.
6. Conflicts:
   - `git status` -> list conflicted paths.
   - Stop + surface. **No** auto-resolve.
   - Tell user how to continue: resolve, `git add <paths>`, `git rebase --continue` (or `git merge --continue`). Mention `git rebase --abort` as escape.
7. Clean rebase -> pop stash if created (`git stash pop`).
8. Print one-liner: branch, base, commits replayed, force-push needed?

## Rules

- Default **rebase**. Merge only if user asks (or shared branch + history rewrite unsafe -> ask first).
- Never force-push here. After rebase of pushed branch -> tell user `git push --force-with-lease` needed. Let user run.
- Never `git rebase --skip` / drop commits to "make it work". Surface conflict.
- Never `--no-verify` / skip hooks.
- No upstream -> sync against `origin/<base>` direct. Note branch not pushed yet.
- Always pop stash you created, even on rebase fail. Pop conflicts -> leave stashed + tell user.
