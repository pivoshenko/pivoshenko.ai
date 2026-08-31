---
name: git-branches-cleanup
description: Delete local git branches whose remote tracking branch is gone or whose changes are already merged into the base branch. Use when the user asks to clean up branches, prune branches, delete stale branches, or /git-branches-cleanup. Also trigger on "tidy git branches", "remove old branches", "I'm done with these branches", "branch graveyard", or whenever the user complains about local branch clutter. Reports what will be deleted and asks before deleting anything.
tags: [git]
updated_at: 2026-08-31
---

# Cleanup Branches

Prune locals = merged OR remote gone. Destructive -> preview + confirm.

## Flow

0. If user mentioned keep-patterns inline (e.g. "but keep `spike/*`") -> capture them. Else assume none. Don't prompt up front.
1. Parallel:
   - `git fetch --all --prune`
   - `git branch --show-current`
2. Base: user names one -> use it. Else detect: `git symbolic-ref --short refs/remotes/origin/HEAD` -> strip the `origin/`; ref missing -> `git remote set-head origin -a`, re-read; no remote -> `main`, fall back `master`. Why -> this is a delete path, and `--merged <wrong-base>` misclassifies live branches as merged. Compare against `origin/<base>`, not the local ref -> the local base is often stale or absent entirely (`git-branch-create` branches off `origin/<base>` without ever creating it), so a local-ref check either errors or reports branches as unmerged that the remote already has.
3. Candidates:
   - **Gone**: upstream gone.
     ```
     git for-each-ref --format='%(refname:short) %(upstream:track)' refs/heads \
       | awk '$2 == "[gone]" {print $1}'
     ```
   - **Merged**: fully merged into the remote base (step 1 already fetched + pruned).
     ```
     git branch --merged origin/<base> --format='%(refname:short)'
     ```
   - Note: squash-merged PRs leave no merge commit, so they won't appear in **Merged**. Closing the PR deletes the remote -> they show up in **Gone** instead. The Gone bucket is the catch-all for PR-merged work.
   - Union. **Exclude**:
     - current
     - base (`main`/`master`)
     - protected: any long-lived branch the repo treats as non-disposable if present (e.g. `develop`, `release/*`, `staging`). Skip silently if none exist.
     - user keep-patterns from step 0 (if provided).
4. Print grouped by reason (gone vs merged), one line per branch, no prose. Ask confirm.
5. On confirm:
   - Merged: `git branch -d <name>`. `-d` re-checks against HEAD/upstream, not `origin/<base>`, so it can refuse a branch the Merged bucket listed -> that's a safe refusal, not a bug: report it as skipped, don't reach for `-D`.
   - Gone + unmerged: `git branch -D <name>`. Explicit confirm only.
6. Print summary: counts + one line per skipped branch (+ why). No recap of what was already listed.

## Rules

- Always preview + confirm. Skip prompt only if user already said "yes delete" / "go ahead" same turn.
- Never delete current / base / `HEAD`.
- Never `-D` unmerged without explicit OK. Unsure -> list + let user decide.
- Never touch remote branches. Local only.
- Never `git reflog expire` / `gc --prune=now`. Deleted stay recoverable via reflog.
- Empty candidate list -> say so + stop.
- User keep-patterns (`wip/*`, `spike/*`) -> off-limits.
