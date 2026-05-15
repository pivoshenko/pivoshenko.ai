---
name: cleanup-branches
description: Delete local git branches whose remote tracking branch is gone or whose changes are already merged into the base branch. Use when the user asks to clean up branches, prune branches, delete stale branches, or /cleanup-branches. Reports what will be deleted and asks before deleting anything.
tags: [git]
updated_at: 2026-05-13
---

# Cleanup Branches

Prune local branches = merged OR remote gone. Delete = destructive -> preview + confirm first.

## Workflow

1. Parallel:
   - `git fetch --all --prune`
   - `git branch --show-current`
2. Pick base: default `main`. Fall back `master` if no `main`. User names other -> use it.
3. Build candidate lists:
   - **Gone**: locals with upstream gone.
     ```
     git for-each-ref --format='%(refname:short) %(upstream:track)' refs/heads \
       | awk '$2 == "[gone]" {print $1}'
     ```
   - **Merged**: locals fully merged into base.
     ```
     git branch --merged <base> --format='%(refname:short)'
     ```
   - Union. **Exclude**:
     - current branch
     - base (`main`/`master`)
     - protected branches user names (e.g. `develop`, `release/*`)
4. Print candidates grouped by reason (gone vs merged). Ask confirm. User already said "yes, delete them"/"go ahead" -> skip prompt.
5. Delete confirmed:
   - Merged: `git branch -d <name>` (safe).
   - Gone + unmerged: `git branch -D <name>` (force). Only after explicit confirm.
6. Print summary: deleted + skipped (+ why).

## Rules

- Never delete current branch, base, or `HEAD`.
- Never `-D` unmerged branch without explicit user OK. Unsure -> list + let user decide.
- Never delete remote branches here. Local only.
- Never `git reflog expire` / `git gc --prune=now`. Deleted branches stay recoverable via reflog by default.
- Empty candidate list -> say so + stop.
- User-named keep patterns (e.g. `wip/*`, `spike/*`) -> off-limits.
