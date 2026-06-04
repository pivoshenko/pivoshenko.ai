---
name: git-branches-cleanup
description: Delete local git branches whose remote tracking branch is gone or whose changes are already merged into the base branch. Use when the user asks to clean up branches, prune branches, delete stale branches, or /git-branches-cleanup. Also trigger on "tidy git branches", "remove old branches", "I'm done with these branches", "branch graveyard", or whenever the user complains about local branch clutter. Reports what will be deleted and asks before deleting anything.
tags: [git]
updated_at: 2026-06-04
---

# Cleanup Branches

Prune locals = merged OR remote gone. Destructive -> preview + confirm.

## Flow

0. If user mentioned keep-patterns inline (e.g. "but keep `spike/*`") -> capture them. Else assume none. Don't prompt up front.
1. Parallel:
   - `git fetch --all --prune`
   - `git branch --show-current`
2. Base: default `main`. Fall back `master`. User names other -> use it.
3. Candidates:
   - **Gone**: upstream gone.
     ```
     git for-each-ref --format='%(refname:short) %(upstream:track)' refs/heads \
       | awk '$2 == "[gone]" {print $1}'
     ```
   - **Merged**: fully merged into base.
     ```
     git branch --merged <base> --format='%(refname:short)'
     ```
   - Note: squash-merged PRs leave no merge commit, so they won't appear in **Merged**. Closing the PR deletes the remote -> they show up in **Gone** instead. The Gone bucket is the catch-all for PR-merged work.
   - Union. **Exclude**:
     - current
     - base (`main`/`master`)
     - protected: any long-lived branch the repo treats as non-disposable if present (e.g. `develop`, `release/*`, `staging`). Skip silently if none exist.
     - user keep-patterns from step 0 (if provided).
4. Print grouped by reason (gone vs merged). Ask confirm.
5. On confirm:
   - Merged: `git branch -d <name>`.
   - Gone + unmerged: `git branch -D <name>`. Explicit confirm only.
6. Print summary: deleted + skipped (+ why).

## Rules

- Always preview + confirm. Skip prompt only if user already said "yes delete" / "go ahead" same turn.
- Never delete current / base / `HEAD`.
- Never `-D` unmerged without explicit OK. Unsure -> list + let user decide.
- Never touch remote branches. Local only.
- Never `git reflog expire` / `gc --prune=now`. Deleted stay recoverable via reflog.
- Empty candidate list -> say so + stop.
- User keep-patterns (`wip/*`, `spike/*`) -> off-limits.
