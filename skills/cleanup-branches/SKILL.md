---
name: cleanup-branches
description: Delete local git branches whose remote tracking branch is gone or whose changes are already merged into the base branch. Use when the user asks to clean up branches, prune branches, delete stale branches, or /cleanup-branches. Reports what will be deleted and asks before deleting anything.
---

# Cleanup Branches

Prune local branches that are merged or whose remotes have been deleted. Because branch deletion is destructive, always preview first and confirm before deleting.

## Workflow

1. Run in parallel:
   - `git fetch --all --prune`
   - `git branch --show-current`
2. Determine the base branch: default `main`, fall back to `master` if `main` does not exist. If the user names a different base, use it.
3. Build two candidate lists:
   - **Gone**: local branches whose upstream is gone.
     ```
     git for-each-ref --format='%(refname:short) %(upstream:track)' refs/heads \
       | awk '$2 == "[gone]" {print $1}'
     ```
   - **Merged**: local branches fully merged into the base.
     ```
     git branch --merged <base> --format='%(refname:short)'
     ```
   - Take the union, then **exclude**:
     - the current branch
     - the base branch (`main`/`master`)
     - any protected branches the user mentions (e.g. `develop`, `release/*`)
4. Print the candidate list grouped by reason (gone vs. merged) and ask the user to confirm before deleting. If the user already said something like "yes, delete them" or "go ahead", skip the prompt.
5. Delete each confirmed branch:
   - Merged branches: `git branch -d <name>` (safe delete).
   - Gone branches that aren't merged: `git branch -D <name>` (force delete) — only after explicit confirmation.
6. Print a summary of what was deleted and what was skipped (and why).

## Rules

- Never delete the current branch, the base branch, or `HEAD`.
- Never delete a branch with unmerged commits using `-D` without explicit user confirmation. If unsure, list it and let the user decide.
- Never delete remote branches as part of this skill — local only.
- Never run `git reflog expire` or `git gc --prune=now` here; deleted branches stay recoverable via reflog by default.
- If the candidate list is empty, say so and stop.
- Treat any branch matching a pattern the user calls out as "keep" (e.g. `wip/*`, `spike/*`) as off-limits.
