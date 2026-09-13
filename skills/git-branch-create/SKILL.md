---
name: git-branch-create
description: Create a new git branch using a conventional naming scheme. Use when the user asks to create a branch, start a new branch, /git-branch-create, or begin work on a feature/fix. Also trigger on "start work on X", "spin up a branch for Y", "new ticket", "let's start Z", or whenever the user signals they're beginning a discrete new piece of work. Creates and checks out the branch immediately without asking for confirmation.
tags: [git]
updated_at: 2026-09-11
---

# Create Branch

Make + checkout new branch. No confirm.

## Flow

0. User named an issue (`#42`, "the oauth issue", "start 42") -> stop, this is `git-issue-start`'s flow: it assigns the issue, derives the type from its `type: *` label, and branches using the naming rules below. Why -> branching from an issue without assigning it leaves the tracker claiming nobody picked the work up.
1. Parallel: `git status` + `git branch --show-current`.
2. Dirty tree -> stop. Tell user to stash or commit first. Why -> `checkout -b` carries staged + unstaged changes into the new branch silently, mixing them with future work.
3. Pick base:
   - Detect, don't assume: `git symbolic-ref --short refs/remotes/origin/HEAD` -> strip the `origin/`. Ref missing (never fetched) -> `git remote set-head origin -a`, re-read. No remote -> `main`, fall back `master`. Why -> a repo based on `develop` or `trunk` gets branched off the wrong parent otherwise, and the mistake surfaces at PR time as a diff full of other people's commits.
   - On feature branch + user wants to branch off it -> use current. Skip step 4's fetch; go to step 5 "off current" variant.
4. Exists? `git show-ref --verify --quiet refs/heads/<name>` -> 0 = stop, surface conflict, no overwrite. Why -> `checkout -b` errors anyway, but check early so message is clean + no half-state.
5. Create:
   - Off `<base>` (default): `git fetch origin <base>` + `git checkout -b <name> origin/<base>`.
   - Off current: `git checkout -b <name>` (no fetch, no remote ref — current HEAD is the base).
6. Print branch + base.

## Naming

`<type>/<short-kebab-desc>` or `<type>/<scope>-<short-kebab-desc>`.

Whole name ≤ 60 chars.

### Type

Same set + picks as `git-commit`. See that skill's **Type pick** + **Tiebreakers** for disambiguation. Quick list: `feat|fix|perf|refactor|docs|test|build|ci|chore`.

### Desc

- kebab-case. Not camel / snake.
- Imperative present: `add`, `fix`, `remove`. Not `added`, `fixes`.
- < ~50 chars, and keeps the whole name ≤ 60. Over -> drop the scope segment first, then cut modifiers, then pick a shorter verb. Never truncate mid-word: `feat/add-oauth-log` reads like a different feature.
- No ticket IDs unless asked. Why -> history readable + tool-agnostic; trackers come+go, branches stay. Asked -> suffix: `feat/add-auth-middleware-PROJ-123`.

### Examples

- `feat/add-oauth-login`
- `fix/api-timeout-on-retry`
- `refactor/extract-user-service`
- `docs/update-readme`
- `ci/cache-pnpm-store`

## Rules

- Derive `type` + desc from intent + diff if avail.
- Issue number given -> hand to `git-issue-start`. Don't branch from an issue here.
- User gives name -> verbatim. No rewrite.
- Never delete/reset existing branches here.
- Never push new branch unless asked.
- Branch exists -> stop. Surface conflict. No overwrite.
