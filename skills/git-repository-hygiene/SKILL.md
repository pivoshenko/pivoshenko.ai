---
name: git-repository-hygiene
description: Personal wiki of canonical repository conventions (README, editorconfig, labels, justfile, language configs, CI, release, GitHub meta) + a scaffolder that drops canonical files into a target repository on request. Use when the user says "what's my canonical justfile / README / gitignore / workflow", "remind me how I structure Y", "show me my standard for Z", "look up our convention for ...", "bring this repository up to standard", "bootstrap a new project", "add CI", "set up labels", "scaffold a fresh python lib", "drop in CONTRIBUTING / SECURITY / CODE_OF_CONDUCT", "set up release pipeline", "fix my readme", or anything that touches the structural / configurational / conventional layer of a repository.
tags: [git, hygiene, standard, wiki, reference, meta, github, devops]
updated_at: 2026-05-30
---

# Repository Hygiene

Wiki of canon files + scaffolder. Drop-in for `pivoshenko/*`. Canon = starting point, deviation OK.

## Two ops

- **Show canon.** "what's my canonical X?" → open `references/scopes/<X>.md` (or `readme/<file>.md`), quote canon + `assets/`. No scan. No diff. No writes.
- **Scaffold.** "drop in X" / "set up labels" / "bring up to standard" → write canon files. Target exists → ask before overwrite (or suffix). Never silent replace.

No mode flag. No drift report. No audit. Do what asked.

### Scaffold flow

1. Detect stack tags from root signals → [Stack detection](#stack-detection).
2. Pick scopes — user-named OR all applicable if "bring up to standard".
3. Per scope: read `references/scopes/<scope>.md` → applies? → per file: absent = write, present = ask.
4. Print written list. No commit / push / PR. User commits.

## Stack detection

Tags (sets), not single labels. From root signals. Tech stacks only — dotfiles / theme ports out of scope.

| Signal                                       | Tag          |
| -------------------------------------------- | ------------ |
| `pyproject.toml` w/ `[project]`              | `python-lib` |
| `Cargo.toml` w/ `[[bin]]`                    | `rust-cli`   |
| `next.config.{ts,js}` + `app/`               | `next-site`  |
| `package.json` no publish wf, git-tag distro | `shared-pkg` |

Composite repos = multi-tag (`[python-lib, rust-cli]`). Subpaths declared inline.

**Archetypes** mark non-applicable scopes. Only one today: `puzzles` (aoc / leetcode / kaggle / exercism / codewars / `*-solutions`) → no `release` scope, no `release` recipe.

**Internal-only repos** (no public release, no published package, no deploy) skip: `readme` badges (license + CI), `release` scope, community files in `codebase-structure` (`LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`), `labels`, `issue-templates`, `workflows/ci.yaml`. License + CI badges + community files = only for repos that ship a release.

Full taxonomy + composite + subpath + archetype rules → [[variants]].

## Scopes

Per-scope canon at `references/scopes/<scope>.md`.

### readme — `README.md`

Hero + badges (shields.io `flat-square`, StandWithUkraine last + always). License + CI badges only if repo ships release. Section order per stack. No hype, `## Installation` not `## Install`, lowercase H1, no `## License` section, no TOC. Templates → `references/readme/variants/`. → `references/scopes/readme.md`

### editorconfig — `.editorconfig`

One file. UTF-8, LF, 2-space, 120-char + Python 4-space. → `references/scopes/editorconfig.md`

### labels — `.github/labels.yaml` + sync wf

15 labels: `type:` / `priority:` / `status:`. No `area:` (use commit scope). Sync = `crazy-max/ghaction-github-labeler` additive. Release repos only. → `references/scopes/labels.md`

### issue-templates — `.github/ISSUE_TEMPLATE/*` + PR template

Form-schema YAML: bug / feature / docs + `config.yaml` blank=off + PR template. `---` filename prefix forces sort. Release repos only. → `references/scopes/issue-templates.md`

### codebase-structure — `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `.gitignore`

Meta files at root. Dual-license = `LICENSE-MIT` + `LICENSE-APACHE` + pointer. `.gitignore` = gitignore.io `### <Lang> ###` markers, idempotent. **`LICENSE` + `CONTRIBUTING.md` + `SECURITY.md` + `CODE_OF_CONDUCT.md` = release repos only**; internal repos ship `.gitignore` only. → `references/scopes/codebase-structure.md`

### justfile — `justfile`

Vocab: `install`, `format`, `lint`, `test`, `check`, `update`, `dev`, `build`, `start`, `release <semver>`. Structural template only — bodies repo-owned. Insert missing headers w/ TODO; never overwrite implementations. → `references/scopes/justfile.md`

### python — `pyproject.toml`, `.python-version`, `src/<pkg>/`, `tests/`

uv + hatchling + ruff + ty + pytest. ruff line=100, `required-imports = ["from __future__ import annotations"]`. Canon: `[build-system]` + `[dependency-groups]` + `[tool.*]`. Repo-owned: deps, scripts, urls, version. → `references/scopes/python.md`

### rust — `Cargo.toml`, `src/`

Edition 2021, `unsafe_code = "forbid"`, `[profile.release]` (lto=fat, codegen=1, panic=abort, strip=symbols). Canon dev-deps: assert_cmd + predicates + tempfile + pretty_assertions. Repo-owned: deps, `[[bin]]`, version. → `references/scopes/rust.md`

### next — `package.json`, `biome.json`, `next.config.ts`, `tsconfig.json`, `vercel.json`

Biome only (no ESLint/Prettier). `engines.node: ">=22"`, `packageManager: "pnpm@10.30.3"`. Scripts: dev / build / start / lint / format / check. shared-pkg adds exports + peerDeps + files. → `references/scopes/next.md`

### workflows — `.github/workflows/*.yaml`

Single owner — other scopes' workflows ship from here (atomic install). `.yaml` not `.yml`. `uses:` lines pinned via `references/action-versions.yaml`. Workflows call ONLY `just <recipe>` (setup actions excepted). Composite = `working-directory:`. Release repos only. → `references/scopes/workflows.md`

### release — `cliff.toml`, `CHANGELOG.md`

**git-cliff** everywhere. SemVer: `feat:` → MINOR, `feat!:` / `BREAKING CHANGE:` → MAJOR, `fix:`/`perf:`/`refactor:` → PATCH. Tag = `v<semver>`. Publish: python-lib = `uv publish`, rust-cli = `cargo publish`, shared-pkg + next-site = git-tag + GH Release; next-site → Vercel auto on push main. → `references/scopes/release.md`

### github-meta — settings via `gh api`

`main` default, squash-only, `delete_branch_on_merge`, `allow_auto_merge`, `has_projects=false`, `has_wiki=false`, `has_discussions=false`. No `FUNDING.yaml`, no `CODEOWNERS`. → `references/scopes/github-meta.md`

## CI contract

Workflows call ONLY `just <recipe>` — never `ruff`/`cargo`/`pnpm`/`pytest` direct. Tool swaps invisible to CI. → [[ci-contract]].

## Action versions

`references/action-versions.yaml` = single pin table. Workflows scope refuses writes referencing actions not in table. Bump → re-scaffold consumers → CI lockstep.

## Voice / brand

Inherit `pivoshenko-brand`. No hype.

- Never "repo"/"repos" → "repository"/"repositories".
- Public contact = `contact@pivoshenko.dev`. Never personal email.
- Always rebase. Never merge. Don't offer merge alt.

## Hard rules

- Canon = real files in `assets/`. Prose snippets <5 lines.
- Scaffold opt-in per scope. Exception: "bring up to standard" = all applicable.
- Never silent overwrite. Ask or suffix. Justfile bodies NEVER overwritten — only missing headers w/ TODO.
- Never auto-commit / push / PR. Write → list → stop. User commits.
- Respect subpaths in composite repos.
- No GHA version drift — refuse write if action absent from pin table.
- Assets drop-in. Header preamble only inside assets.
- Internal-only repos skip release-only scopes (see [Stack detection](#stack-detection)).

## Index

- `references/scopes/<scope>.md` × 12 — per-scope canon + matrix
- `references/readme/{structure,badges}.md` + `readme/variants/<stack>.md` × 4
- `references/variants.md` — tags + composite + subpath + archetype + internal-only
- `references/ci-contract.md`, `references/action-versions.yaml`
- `assets/ASSETS.md` — asset inventory
- `evals/evals.json` — test prompts
