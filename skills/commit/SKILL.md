---
name: commit
description: Run git commit using Angular conventional commit format. Use when the user asks to commit, create a commit, /commit, or save changes to git. Stages relevant files and commits immediately without asking for confirmation.
---

# Commit

Conventional commit. No confirm. No dry-run.

## Workflow

1. Parallel: `git status` + `git diff --staged`.
2. Nothing staged -> stage relevant files. Specific paths > `git add -A`. Never stage `.env`, creds, secrets.
3. Parallel: `git diff --staged` (if just staged) + `git log --oneline -5`.
4. Read diff -> decide one commit or many (see **Atomic commits**) -> write msg per format below.
5. Commit now. No confirm. Many groups -> stage + commit each group in turn, repeat til clean.
6. Print hash(es) + one-line summary per commit.

## Atomic commits

Lots of changes / mixed concerns -> split into atomic commits. No mega-commit.

Group by:

- **type** — `feat` vs `fix` vs `docs` vs `refactor` vs `test` never share commit
- **scope** — different modules/pkgs = different commits
- **logical unit** — one feature / one bugfix / one refactor per commit. Each must build + pass tests alone.

Heuristics:

- Touches > 1 unrelated area -> split
- Diff mixes behavior + formatting/rename -> split (formatting first or last, never mixed)
- Summary need "and" / "also" / "+" -> split
- Unsure -> ask user how to group before staging.

## Commit Message Format

Format -> readable history + changelog-friendly.

Msg = **header** + **body** + **footer**.

```
<header>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

`header` mandatory. Match **Header** format.

`body` mandatory except `docs`. If present: min 20 chars. Match **Body** format.

`footer` optional. See **Footer**.

### Header

```
<type>(<scope>): <short summary>
  │       │             │
  │       │             └─⫸ Summary present tense. Not capitalized. No trailing period.
  │       │
  │       └─⫸ Scope: affected area/module/pkg (optional)
  │
  └─⫸ Type: build|ci|docs|feat|fix|perf|refactor|test
```

`<type>` + `<summary>` mandatory. `(<scope>)` optional.

#### Type

| Type         | Description                                                                                         |
| ------------ | --------------------------------------------------------------------------------------------------- |
| **build**    | Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm) |
| **ci**       | Changes to our CI configuration files and scripts (examples: GitHub Actions, SauceLabs)             |
| **docs**     | Documentation only changes                                                                          |
| **feat**     | A new feature                                                                                       |
| **fix**      | A bug fix                                                                                           |
| **perf**     | A code change that improves performance                                                             |
| **refactor** | A code change that neither fixes a bug nor adds a feature                                           |
| **test**     | Adding missing tests or correcting existing tests                                                   |

#### Scope

Optional. Affected area/module/pkg (e.g. `auth`, `api`, `config`). Derive from changed files when clear boundary exists.

#### Summary

- Imperative present: "change" not "changed"/"changes"
- No capital first letter
- No trailing `.`

### Body

Imperative present, same as summary: "fix" not "fixed"/"fixes".

Explain **why**. Old vs new behavior -> show impact.

### Footer

Footer = breaking changes, deprecations, issue/PR refs.

```
BREAKING CHANGE: <breaking change summary>
<BLANK LINE>
<breaking change description + migration instructions>
<BLANK LINE>
<BLANK LINE>
Fixes #<issue number>
```

or

```
DEPRECATED: <what is deprecated>
<BLANK LINE>
<deprecation description + recommended update path>
<BLANK LINE>
<BLANK LINE>
Closes #<pr number>
```

Breaking: `BREAKING CHANGE: ` + summary + blank + detail + migration.

Deprecation: `DEPRECATED: ` + short desc + blank + detail + upgrade path.

## Revert commits

Revert -> start `revert: ` + reverted header.

Body must have:
- SHA ref: `This reverts commit <SHA>`
- Reason for revert

## Rules

- Pick most specific `type`. Bug -> `fix` > `refactor`. Perf -> `perf` > `refactor`.
- One logical change per commit. Unrelated -> split (see **Atomic commits**).
- Never `--no-verify` / `--no-gpg-sign` unless user says.
- Pre-commit hook fail -> fix + re-stage + **new** commit. No amend.
