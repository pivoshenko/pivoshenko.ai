---
name: commit
description: Run git commit using Angular conventional commit format. Use when the user asks to commit, create a commit, /commit, or save changes to git. Stages relevant files and commits immediately without asking for confirmation.
---

# Commit

Create a conventional commit directly — no confirmation prompts, no dry-runs.

## Workflow

1. Run `git status` and `git diff --staged` in parallel to understand current state.
2. If nothing is staged, stage the relevant changed files (prefer specific paths over `git add -A`; never stage `.env`, credentials, or secrets).
3. Run `git diff --staged` (if files were just staged) and `git log --oneline -5` in parallel.
4. Analyze the staged diff and write a commit message following the format below.
5. Commit immediately. Do not ask the user to confirm the message.
6. Show the resulting commit hash and one-line summary.

## Commit Message Format

This format leads to **easier to read commit history** and makes it analyzable for changelog generation.

Each commit message consists of a **header**, a **body**, and a **footer**.

```
<header>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The `header` is mandatory and must conform to the **Commit Message Header** format.

The `body` is mandatory for all commits except for those of type "docs".
When the body is present it must be at least 20 characters long and must conform to the **Commit Message Body** format.

The `footer` is optional. The **Commit Message Footer** format describes what the footer is used for and the structure it must have.

### Commit Message Header

```
<type>(<scope>): <short summary>
  │       │             │
  │       │             └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │       │
  │       └─⫸ Commit Scope: affected area, module, or package (optional)
  │
  └─⫸ Commit Type: build|ci|docs|feat|fix|perf|refactor|test
```

The `<type>` and `<summary>` fields are mandatory, the `(<scope>)` field is optional.

#### Type

Must be one of the following:

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

The scope is optional and should identify the affected area, module, or package (e.g., `auth`, `api`, `config`). Derive it from the changed files when a clear module boundary exists.

#### Summary

Use the summary field to provide a succinct description of the change:
- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No dot (.) at the end

### Commit Message Body

Just as in the summary, use the imperative, present tense: "fix" not "fixed" nor "fixes".

Explain the motivation for the change in the commit message body. This commit message should explain _why_ you are making the change.
You can include a comparison of the previous behavior with the new behavior in order to illustrate the impact of the change.

### Commit Message Footer

The footer can contain information about breaking changes and deprecations and is also the place to reference GitHub issues and other PRs that this commit closes or is related to. For example:

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

Breaking Change section should start with the phrase `BREAKING CHANGE: ` followed by a _brief_ summary of the breaking change, a blank line, and a detailed description of the breaking change that also includes migration instructions.

Similarly, a Deprecation section should start with `DEPRECATED: ` followed by a short description of what is deprecated, a blank line, and a detailed description of the deprecation that also mentions the recommended update path.

## Revert commits

If the commit reverts a previous commit, it should begin with `revert: `, followed by the header of the reverted commit.

The content of the commit message body should contain:
- Information about the SHA of the commit being reverted in the following format: `This reverts commit <SHA>`
- A clear description of the reason for reverting the commit message

## Rules

- Pick the most specific `type` — prefer `fix` over `refactor` when a bug is resolved, `perf` over `refactor` when the motivation is performance
- One logical change per commit. If the diff contains unrelated changes, ask the user whether to split
- Never use `--no-verify` or `--no-gpg-sign` unless the user explicitly requests it
- If a pre-commit hook fails, fix the issue, re-stage, and create a **new** commit (do not amend)
