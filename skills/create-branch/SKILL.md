---
name: create-branch
description: Create a new git branch using a conventional naming scheme. Use when the user asks to create a branch, start a new branch, /create-branch, or begin work on a feature/fix. Creates and checks out the branch immediately without asking for confirmation.
---

# Create Branch

Create and check out a new git branch directly — no confirmation prompts.

## Workflow

1. Run `git status` and `git branch --show-current` in parallel to confirm a clean-enough state and the current branch.
2. If the working tree has uncommitted changes that don't belong to the new work, warn the user and stop. Otherwise continue.
3. Determine the base branch:
   - Default to `main` (fall back to `master` if `main` does not exist).
   - If already on a feature branch and the user asks to branch off it, use the current branch.
4. Run `git fetch origin <base>` and `git checkout -b <branch-name> origin/<base>` to create the branch from the latest remote tip.
5. Print the new branch name and the base it was created from.

## Branch Naming

Format: `<type>/<short-kebab-description>`

Optional scope: `<type>/<scope>-<short-kebab-description>`.

### Type

Must be one of:

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

- Use kebab-case: `add-auth-middleware`, not `addAuthMiddleware` or `add_auth_middleware`
- Imperative, present tense: `add`, `fix`, `remove` — not `added`, `fixes`, `removing`
- Keep it under ~50 characters
- Don't include ticket IDs unless the user asks; if included, append as a suffix: `feat/add-auth-middleware-PROJ-123`

### Examples

- `feat/add-oauth-login`
- `fix/api-timeout-on-retry`
- `refactor/extract-user-service`
- `docs/update-readme`
- `ci/cache-pnpm-store`

## Rules

- Derive `type` and description from the user's stated intent and, if available, the staged or unstaged diff.
- If the user provides a name explicitly, use it verbatim — do not rewrite it.
- Never delete or reset existing branches as part of this skill.
- Never push the new branch unless the user asks.
- If the branch already exists, stop and surface the conflict instead of overwriting.
