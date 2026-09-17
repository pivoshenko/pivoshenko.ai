# Contributing

- [Contributing](#contributing)
  - [Reporting Bugs](#reporting-bugs)
    - [How to Submit a Bug Report](#how-to-submit-a-bug-report)
  - [Suggesting Enhancements](#suggesting-enhancements)
    - [How to Submit an Enhancement](#how-to-submit-an-enhancement)
  - [Code Contributions](#code-contributions)
    - [Local Development](#local-development)
    - [Authoring Skills](#authoring-skills)
    - [CI/CD](#cicd)
    - [Branches](#branches)
    - [Commits](#commits)
    - [Pull Requests](#pull-requests)

Thank you for taking the time to contribute.

These guidelines are intended to make contributions consistent and easy to review across repositories. They are guidance, not hard instructions, and maintainers may adapt them when needed.

## Reporting Bugs

Before creating a bug report, search existing issues to avoid duplicates.

When opening a bug report, include enough context for someone else to reproduce the issue and understand the impact.

> [!NOTE]
> If you find a closed issue that looks similar, open a new issue and link the previous one.

### How to Submit a Bug Report

Open a bug report and provide the following:

- A clear, descriptive title
- Reproduction steps (minimal and reliable if possible)
- Current behavior and expected behavior
- Relevant environment details (for example OS, runtime, browser, framework versions)
- Logs, stack traces, screenshots, or recordings when useful

If the issue is intermittent, describe how often it happens and known triggers.
If the issue appeared after a change, mention the last known working version or commit if available.

## Suggesting Enhancements

Before submitting an enhancement, check whether a similar request already exists.

Enhancement requests can include new features, changes to existing behavior, usability improvements, or performance improvements.

### How to Submit an Enhancement

Open a feature request and provide the following:

- A clear problem statement
- The proposed solution
- Alternatives considered or current workarounds
- Expected impact (who benefits and how)

Concrete examples, API sketches, UI mockups, or references are helpful when relevant.

## Code Contributions

### Local Development

This repository's `site/` directory is a Next.js application managed with pnpm and linted/formatted with Biome, all orchestrated through `just`.

This project uses [`just`](https://github.com/casey/just) as its task runner. Run `just --list` for the full set; these are the ones you need day to day:

| Command | What it does |
| --- | --- |
| `just install` | Installs `site/` dependencies with pnpm |
| `just format` | Formats `site/` and applies Biome's safe lint fixes in place |
| `just lint` | Runs every linter: the three content linters, then `lint-next` |
| `just lint-skills` | Validates every `SKILL.md` in `skills/` and `archive/skills/` |
| `just lint-mcps` | Validates every server definition in `mcps/` against `kasetto.yaml` |
| `just lint-instructions` | Validates every rule in `instructions/` and `archive/instructions/` |
| `just lint-next` | Lints `site/` with Biome without changing files |
| `just test` | Skips while the `.no-tests` sentinel file is present; without it the recipe fails, prompting you to add tests |
| `just check` | Runs `lint`, then `test`, then `build` in sequence |
| `just update` | Updates `site/` dependencies with pnpm |
| `just build` | Builds the Next.js site |
| `just run-dev-server` | Starts the Next.js dev server |
| `just run-prod-server` | Builds the site, then starts the Next.js production server |

1. Fork the repository and clone your fork locally
2. Create a branch following the naming pattern below and run `just install`
3. Make your changes and run `just check` before opening a pull request

> [!IMPORTANT]
> Behavioral code changes should include or update tests.

### Authoring Skills

A skill is a directory under `skills/` holding a `SKILL.md` and, when it needs them, `references/`, `scripts/`, `assets/`, and `preview/` subdirectories.

`SKILL.md` carries instructions and nothing else - prose, rules, numbered flow steps, and the short inline commands those steps run. Every artifact an agent copies out, fills in, or matches its own output against lives in a subdirectory and is referenced from `SKILL.md` by relative path:

| Directory | What goes there |
| --- | --- |
| `references/` | Body templates, report formats, output shapes, syntax tables, and any long-form background the flow links rather than inlines |
| `scripts/` | Executable helpers the flow invokes |
| `assets/` | Files shipped as-is - CSS, HTML templates, images, fonts |
| `preview/` | Renderable demos of what the skill produces |

The test for a fenced block: if an agent would copy it out or match against it, it is an artifact and it moves, however short. A snippet that only illustrates the rule in the sentence above it may stay inline, under roughly ten lines.

Why this matters: `SKILL.md` is loaded in full every time the skill triggers, while a reference is read only when the step that needs it runs. An inlined template costs context on every invocation and buries the flow it interrupts.

Link a reference the way the existing skills do - `Full table -> [references/callouts.md](references/callouts.md)` - so the agent knows what it will get before spending a read.

### CI/CD

Workflows live in `.github/workflows`:

| Workflow | Trigger | What it does |
| --- | --- | --- |
| CI | Push to `main`, pull requests, `workflow_dispatch` | Single `ci` job on `ubuntu-24.04-arm` using `just`, pnpm, and Node 24 with the pnpm cache keyed on `site/pnpm-lock.yaml`; installs the site's dependencies, then lints the catalog and the site, tests, and builds it |

CI must be green before a pull request is merged.

### Branches

Branch names follow the pattern `<type>/<short-description>` using the same type prefixes as commits.
The description should be lowercase kebab-case, brief, and specific enough to identify the change at a glance.

Examples:

```
feat/github-token-refresh
fix/private-repo-archive-auth
docs/update-sync-flow-diagram
refactor/mcps-schema-alignment
```

A branch covering multiple unrelated changes should be split. One concern per branch makes review and bisect much easier.

### Commits

Use clear, focused commits with descriptive messages.

This project follows [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

**Format**

```
<type>(<scope>): <subject>

[optional body]
```

- **type** - one of the prefixes from the table below
- **scope** - the module, command, or area being changed (e.g. `sync`, `mcps`, `github`, `landing`, `config`); omit when the change is truly cross-cutting
- **subject** - imperative mood, lowercase, no trailing period, 72 characters or fewer
- **body** - optional; use it to explain *why*, not *what*; wrap at 72 characters

**Type prefixes**

| Prefix     | When to use                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| `feat`     | A new feature or user-facing capability                                                                 |
| `fix`      | A bug fix that corrects incorrect behavior                                                              |
| `docs`     | Changes to documentation only (README, comments, guides)                                                |
| `refactor` | Code restructuring that does not change external behavior (renaming, extracting functions, simplifying) |
| `test`     | Adding, updating, or fixing tests without changing production code                                      |
| `chore`    | Maintenance tasks that don't affect source code or tests (dependency bumps, config tweaks, .gitignore)  |
| `ci`       | Changes to CI/CD configuration and scripts (GitHub Actions, workflows, pipelines)                       |
| `build`    | Changes to the build system or external dependencies (Cargo.toml, build scripts, Makefile)              |
| `perf`     | A code change that improves performance without altering functionality                                  |
| `style`    | Formatting-only changes (whitespace, semicolons, linting) with no logic changes                         |
| `design`   | Changes to visual or UI design assets and layout                                                        |
| `revert`   | Reverts a previous commit (reference the reverted commit hash in the body)                              |

**Examples**

```
feat(sync): support skills source sub-directory selection
fix(github): url-encode git refs in API tarball endpoint
refactor(mcps): align mcps[] schema with skills[]
docs(config): document browser URL auto-rewriting for --config
```

### Pull Requests

- Fill out the pull request template completely
- Keep the pull request focused and scoped to one change set
- Ensure tests and checks pass before requesting review
- Update documentation when behavior or interfaces change
- Respond to review feedback and keep the branch up to date with the target branch

Maintainers may ask for changes, additional tests, or scope adjustments before merging.
