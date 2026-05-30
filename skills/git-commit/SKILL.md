---
name: git-commit
description: Run git commit using Angular conventional commit format. Use when the user asks to commit, create a commit, /git-commit, or save changes to git. Also trigger on "snapshot this", "save my work", "check in changes", "wrap up", "ship this locally", or whenever the user finishes a logical unit of work and the tree is dirty. Stages relevant files and commits immediately without asking for confirmation.
tags: [git]
updated_at: 2026-05-30
---

# Commit

Conventional commit. No confirm. No dry-run.

## Flow

1. Parallel: `git status` + `git diff --staged`.
2. Nothing staged -> stage relevant. Paths > `-A`. Never `.env` / creds / secrets.
3. Parallel: `git diff --staged` (if just staged) + `git log --oneline -5`.
4. Read diff -> one commit or many (see **Atomic**) -> write msg.
5. Commit now. Many groups + already mass-staged -> `git reset` to unstage, then stage+commit per group. Loop til clean.
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

`header` required. `body` required except `docs`; min 20 chars. `footer` optional.

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

| Type         | Use when                                           | Examples                                                             |
| ------------ | -------------------------------------------------- | -------------------------------------------------------------------- |
| **feat**     | New user-visible capability or API                 | new endpoint, new CLI flag, new component, new public function       |
| **fix**      | Restoring intended behavior after a defect         | crash on null input, wrong calc, regression repair                   |
| **perf**     | Same behavior, measurably faster / lighter         | cache hot path, drop O(n²) loop, lazy-load                           |
| **refactor** | Code shape changes; behavior identical             | rename, extract, inline, move file, dedupe — no API or output change |
| **test**     | Test files only                                    | add coverage, fix flake, rename test                                 |
| **docs**     | Docs / comments / `README` / changelog only        | prose edits, JSDoc, ADRs, doc-only typos                             |
| **build**    | Build system, deps, lockfiles, packaging           | `package.json` deps, `uv.lock`, Dockerfile, bundler config           |
| **ci**       | CI/CD pipeline config                              | GH Actions workflow, release pipeline, branch protection scripts     |
| **chore**    | Repository maintenance with no code/build/CI/docs effect | `.gitignore`, editor config, tooling configs not tied to build |

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

- Imperative present, same voice as summary.
- Explain **why**, not what (diff shows what). Old vs new -> show user-visible impact, constraint, or bug being undone.
- Wrap ~72 chars per line. Blank line between paragraphs.
- Bullets OK (`- ` prefix), one idea each. Don't bullet a single line.
- No play-by-play ("first I changed X, then Y"). No "this commit does …". No file lists. No code dumps unless a snippet clarifies a subtle point.
- Min 20 chars when present. Skip body entirely for trivial `docs`/`chore`/`build` bumps where the header says everything.

### Footer

Trailers only. One per line, `Token: value`, after a single blank line below the body. Order: breaking change → deprecation → refs.

Allowed tokens:

- `BREAKING CHANGE: <summary>` — exact spelling (Angular spec). Detail + migration steps follow on subsequent lines.
- `DEPRECATED: <what>` — same shape; include upgrade path.
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

`revert: ` + reverted header. Body:

- `This reverts commit <SHA>`
- reason

## Rules

- One logical change per commit. Else split.
- Never `--no-verify` / `--no-gpg-sign` unless asked. Why -> hooks catch real failures (lint, type, secret scan); skipping = shipping broken code.
- Pre-commit hook fail -> fix + re-stage + **new** commit. No amend. Why -> hook fail means the commit didn't happen; `--amend` would modify the **previous** (unrelated) commit and silently rewrite it.
