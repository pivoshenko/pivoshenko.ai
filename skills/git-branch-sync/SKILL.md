---
name: git-branch-sync
description: Fetch the latest base branch and rebase the current branch onto it, surfacing conflicts clearly. Use when the user asks to sync, rebase, update from main, pull latest changes, or /git-branch-sync. Also trigger on "catch up with main", "rebase onto main", "update my branch", or whenever the user signals their branch is stale vs base. Runs immediately without asking for confirmation.
tags: [git]
updated_at: 2026-08-31
---

# Sync Branch

Catch current branch up to base. Rebase only. Surface conflicts.

## Flow

1. Parallel:
   - `git status --porcelain`
   - `git branch --show-current`
   - `git rev-parse --abbrev-ref --symbolic-full-name @{u}` (upstream if any)
2. Base: user names one -> verbatim. Else detect: `git symbolic-ref --short refs/remotes/origin/HEAD` -> strip the `origin/`; ref missing -> `git remote set-head origin -a`, re-read; no remote -> `main`, fall back `master`. Why -> rebasing onto `main` in a `develop`-based repo replays the branch onto the wrong parent and manufactures conflicts that aren't real.
3. Dirty -> stash: `git stash push -u -m "sync-branch auto-stash"`. Pop later. Unsafe (unresolved merge) -> stop + tell user.
4. On base -> `git pull --ff-only origin <base>`. Fails (local base diverged) -> stop + tell user. No auto-rebase of base itself.
5. Else:
   - `git fetch origin <base>`
   - `git rebase origin/<base>`.
6. Conflicts:
   - `git status` -> list conflicted paths.
   - Stop + surface. **No** auto-resolve.
   - Tell user: resolve, `git add <paths>`, `git rebase --continue`. Mention `git rebase --abort` escape.
   - Leave stash in place. Tell user to pop after resolve.
7. Rebase done (clean or aborted) -> pop stash if created.
8. Print one-liner: branch, base, commits replayed, force-push needed?
   - 0 commits replayed (already up to date) -> say so explicitly; don't mention force-push (nothing rewritten).

## Rules

- Always **rebase**, never merge. Why -> user workflow preference; linear history. Don't offer merge as alternative even on shared branches; surface the risk (`force-push needed`) and let user decide.
- Never force-push here. Pushed branch rebased -> tell user `git push --force-with-lease`. Let user run.
- Never `git rebase --skip` / drop commits to "make it work". Surface conflict.
- Never `--no-verify`. Why -> hooks gate broken state; skipping just defers the failure.
- No upstream -> sync vs `origin/<base>`. Note branch not pushed.
- Pop stash you made on rebase clean OR abort. Pop blocked by conflicts -> leave stashed + tell user.
