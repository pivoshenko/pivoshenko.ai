---
name: create-branch
description: Create a new git branch using a conventional naming scheme. Use when the user asks to create a branch, start a new branch, /create-branch, or begin work on a feature/fix. Creates and checks out the branch immediately without asking for confirmation.
tags: [git]
---

# Create Branch

Make + checkout new branch. No confirm.

## Workflow

1. Parallel: `git status` + `git branch --show-current`. Check state + current branch.
2. Dirty tree with unrelated changes -> warn + stop. Else continue.
3. Pick base:
   - Default `main`. Fall back `master` if no `main`.
   - On feature branch + user asks to branch off it -> use current.
4. `git fetch origin <base>` + `git checkout -b <branch-name> origin/<base>`. Fresh from remote tip.
5. Print new branch + base.

## Branch Naming

Format: `<type>/<short-kebab-description>`

Optional scope: `<type>/<scope>-<short-kebab-description>`.

### Type

One of:

| Type         | When to use                                                       |
| ------------ | ----------------------------------------------------------------- |
| **feat**     | A new feature                                                     |
| **fix**      | A bug fix                                                         |
| **perf**     | A performance improvement                                         |
| **refactor** | A code change that neither fixes a bug nor adds a feature         |
| **docs**     | Documentation-only changes                                        |
| **test**     | Adding or correcting tests                                        |
| **build**    | Build system or dependency changes                                |
| **ci**       | CI configuration changes                                          |
| **chore**    | Maintenance work that doesn't fit the other categories            |

### Description

- kebab-case: `add-auth-middleware`. Not `addAuthMiddleware` / `add_auth_middleware`.
- Imperative present: `add`, `fix`, `remove`. Not `added`, `fixes`, `removing`.
- Under ~50 chars.
- No ticket IDs unless asked. If included -> suffix: `feat/add-auth-middleware-PROJ-123`.

### Examples

- `feat/add-oauth-login`
- `fix/api-timeout-on-retry`
- `refactor/extract-user-service`
- `docs/update-readme`
- `ci/cache-pnpm-store`

## Rules

- Derive `type` + desc from user intent + diff if avail.
- User gives name -> use verbatim. No rewrite.
- Never delete/reset existing branches here.
- Never push new branch unless asked.
- Branch exists -> stop. Surface conflict. No overwrite.
