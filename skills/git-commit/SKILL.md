---
name: git-commit
description: Run git commit using Angular conventional commit format. Use when the user asks to commit, create a commit, /git-commit, or save changes to git. Also trigger on "snapshot this", "save my work", "check in changes", "wrap up", "ship this locally", or whenever the user finishes a logical unit of work and the tree is dirty. Stages relevant files and commits immediately without asking for confirmation.
tags: [git]
updated_at: 2026-08-31
---

# Commit

Conventional commit. No confirm. No dry-run.

## Flow

1. Parallel: `git status` + `git diff --staged`.
2. Nothing staged -> stage relevant. Paths > `-A`. Never `.env` / creds / secrets.
3. Parallel: `git diff --staged` (if just staged) + `git log --oneline -5`.
4. Read diff -> one commit or many (see **Atomic**) -> write msg.
5. Commit now. Many groups + already mass-staged -> `git restore --staged .` to unstage (modern idiom; `git reset HEAD` also fine), then stage+commit per group. Loop til clean.
6. Print hash + one-liner per commit.

## Atomic

Mixed concerns -> split. No mega-commit.

Group by:

- **type** — `feat` / `fix` / `docs` / `refactor` / `test` never share
- **scope** — diff modules/pkgs = diff commits
- **logical unit** — one thing per commit. Each builds + tests alone.

Split signals:

- > 1 unrelated area
- behavior + format/rename mixed (format separate)
- summary needs "and" / "also" / "+"
- unsure -> ask user how to group

## Msg format

```
<header>

<body>

<footer>
```

`header` required. `body` only when the header leaves a real "why" unanswered. `footer` optional.

Default = header only. Most commits ship with no body.

### Header

```
<type>(<scope>): <short summary>
```

- type: `build|chore|ci|docs|feat|fix|perf|refactor|test`
- scope: optional. Affected area/module/pkg. Lowercase, kebab/short noun. One scope only — pick the dominant one, else omit.
- summary: imperative present ("add" not "added"/"adds"), lowercase, no trailing `.`
- whole header ≤ 72 chars. Tighter is better; aim ≤ 50 for the summary itself.
- no ticket IDs in header (go in footer). No emoji. No `[WIP]`.

#### Type pick

Pick the most specific. Behavior change > non-behavior. User-visible > internal.

SemVer bump column is the canonical mapping used by `cliff.toml` across all repositories. `feat!:` / `BREAKING CHANGE:` footer always -> MAJOR regardless of type.

| Type         | SemVer | Use when                                           | Examples                                                             |
| ------------ | ------ | -------------------------------------------------- | -------------------------------------------------------------------- |
| **feat**     | MINOR  | New user-visible capability or API                 | new endpoint, new CLI flag, new component, new public function       |
| **fix**      | PATCH  | Restoring intended behavior after a defect         | crash on null input, wrong calc, regression repair                   |
| **perf**     | PATCH  | Same behavior, measurably faster / lighter         | cache hot path, drop O(n²) loop, lazy-load                           |
| **refactor** | PATCH  | Code shape changes; behavior identical             | rename, extract, inline, move file, dedupe — no API or output change |
| **test**     | none   | Test files only                                    | add coverage, fix flake, rename test                                 |
| **docs**     | none   | Docs / comments / `README` / changelog only        | prose edits, JSDoc, ADRs, doc-only typos                             |
| **build**    | none   | Build system, deps, lockfiles, packaging           | `package.json` deps, `uv.lock`, Dockerfile, bundler config           |
| **ci**       | none   | CI/CD pipeline config                              | GH Actions workflow, release pipeline, branch protection scripts     |
| **chore**    | none   | Repository maintenance with no code/build/CI/docs effect | `.gitignore`, editor config, tooling configs not tied to build |

#### Tiebreakers

- Bug -> `fix` > `refactor` > `chore`.
- Perf -> `perf` > `refactor`.
- New feature ships with its tests -> single `feat` commit. Tests for **existing** code -> `test`.
- README typo -> `docs`. README rewrite that ships new product info -> still `docs` (no code).
- Bumping a dep that fixes a bug here -> `fix` (your bug) or `build` (just the bump). Pick by user-visible effect.
- Lockfile-only churn from `install` -> `build`. Tooling config like `biome.json` formatting rules -> `chore`. CI workflow YAML -> `ci`.
- Renaming for clarity -> `refactor`. Renaming to land a new API -> part of the `feat`.
- Formatting / whitespace -> separate `chore` commit.
- Revert -> `revert:` prefix, never one of the above (see **Revert**).

### Body

**Hard cap: 3 lines.** One short paragraph, or ≤ 3 bullets. Never both. Never a second paragraph.

Write one only if a reviewer would ask "why?" after reading the header alone. Answer that, stop.

- Imperative present, same voice as summary. Wrap ~72 chars.
- **Why**, not what — the diff shows what. Name the constraint, the bug undone, or the user-visible impact.
- No restating the header. No play-by-play ("first I changed X, then Y"). No "this commit does …". No file lists, no code dumps, no summary of the diff.
- Nothing to say -> no body. Silence beats filler.

Skip when: header is self-explanatory, `docs`/`chore`/`build`/`test` churn, dep bumps, formatting, renames, revert of an obvious mistake.

Good:

```
fix(auth): reject tokens issued before a password reset

Sessions survived a reset, so a stolen token stayed valid after the
user rotated their password.
```

Bad — restates the diff, pads to paragraphs:

```
fix(auth): reject tokens issued before a password reset

This commit updates the token validation logic in the auth module.
Previously, the validateToken function did not check the issuedAt
timestamp against the user's passwordChangedAt field.

Changes:
- Add passwordChangedAt to the User model
- Compare iat against passwordChangedAt in validateToken
- Update the auth tests to cover the new case

This improves the security of the application.
```

### Footer

Trailers only. One per line, `Token: value`, after a single blank line below the body. Order: breaking change -> deprecation -> refs.

Allowed tokens:

- `BREAKING CHANGE: <summary>` — exact spelling (Angular spec). Detail + migration steps follow on subsequent lines, ≤ 5 lines.
- `DEPRECATED: <what>` — same shape; include upgrade path. ≤ 5 lines.
- `Fixes #<n>` / `Closes #<n>` / `Resolves #<n>` — issue auto-close. Multiple -> one per line or comma-separated.
- `Refs: #<n>` / `See: <url>` — non-closing references.

```
BREAKING CHANGE: <summary>

<detail + migration>

Fixes #<n>
```

```
DEPRECATED: <what>

<detail + upgrade path>

Closes #<n>
```

Footer rules:

- No `Co-Authored-By:` / "Generated with Claude" / tool-attribution trailers ever, unless user explicitly asks. Why -> standing user policy.
- No `Signed-off-by:` unless the repository's `CONTRIBUTING` requires DCO.
- No empty/placeholder trailers. No footer at all is fine.
- Breaking change without migration steps -> ask user before committing. Reviewers need the upgrade path.

## Revert

`revert: ` + reverted header. Body, 2 lines max:

- `This reverts commit <SHA>`
- reason, one line

## Rules

- One logical change per commit. Else split.
- Never `--no-verify` / `--no-gpg-sign` unless asked. Why -> hooks catch real failures (lint, type, secret scan); skipping = shipping broken code.
- Pre-commit hook fail -> fix + re-stage + **new** commit. No amend. Why -> hook fail means the commit didn't happen; `--amend` would modify the **previous** (unrelated) commit and silently rewrite it.
