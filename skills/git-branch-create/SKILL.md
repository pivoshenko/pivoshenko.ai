---
name: git-branch-create
description: Create a new git branch using a conventional naming scheme. Use when the user asks to create a branch, start a new branch, /git-branch-create, or begin work on a feature/fix. Also trigger on "start work on X", "spin up a branch for Y", "new ticket", "let's start Z", or whenever the user signals they're beginning a discrete new piece of work. Creates and checks out the branch immediately without asking for confirmation.
tags: [git]
updated_at: 2026-05-30
---

# Create Branch

Make + checkout new branch. No confirm.

## Flow

1. Parallel: `git status` + `git branch --show-current`.
2. Dirty tree -> stop. Tell user to stash or commit first. Why -> `checkout -b` carries staged + unstaged changes into the new branch silently, mixing them with future work.
3. Pick base:
   - Default `main`. Fall back `master`.
   - On feature branch + user wants to branch off it -> use current.
4. `git fetch origin <base>` + `git checkout -b <name> origin/<base>`.
5. Print branch + base.

## Naming

`<type>/<short-kebab-desc>` or `<type>/<scope>-<short-kebab-desc>`.

### Type

Same set + picks as `git-commit`. See that skill's **Type pick** + **Tiebreakers** for disambiguation. Quick list: `feat|fix|perf|refactor|docs|test|build|ci|chore`.

### Desc

- kebab-case. Not camel / snake.
- Imperative present: `add`, `fix`, `remove`. Not `added`, `fixes`.
- < ~50 chars.
- No ticket IDs unless asked. Why -> history readable + tool-agnostic; trackers come+go, branches stay. Asked -> suffix: `feat/add-auth-middleware-PROJ-123`.

### Examples

- `feat/add-oauth-login`
- `fix/api-timeout-on-retry`
- `refactor/extract-user-service`
- `docs/update-readme`
- `ci/cache-pnpm-store`

## Rules

- Derive `type` + desc from intent + diff if avail.
- User gives name -> verbatim. No rewrite.
- Never delete/reset existing branches here.
- Never push new branch unless asked.
- Branch exists -> stop. Surface conflict. No overwrite.
