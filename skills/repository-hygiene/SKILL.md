---
name: repository-hygiene
description: Personal wiki of canonical repository conventions (README, editorconfig, labels, justfile, language configs, CI, release, GitHub meta) + a scaffolder that drops canonical files into a target repository on request. Use when the user says "what's my canonical justfile / README / gitignore / workflow", "remind me how I structure Y", "show me my standard for Z", "look up our convention for ...", "bring this repository up to standard", "bootstrap a new project", "add CI", "set up labels", "scaffold a fresh python lib", "drop in CONTRIBUTING / SECURITY / CODE_OF_CONDUCT", "set up release pipeline", "fix my readme", or anything that touches the structural / configurational / conventional layer of a repository.
tags: [hygiene, standard, wiki, reference, meta, github, devops]
updated_at: 2026-05-30
---

# Repository Hygiene

Engineering standard for repositories. Wiki of canonical asset files + a scaffolder that drops them into a target repository.

Canon assets are drop-in for `pivoshenko/*` repositories. Canon is a STARTING POINT — deviation in a real repository is fine and expected.

## How to apply

Two operations only:

- **Show canon.** User asks "what's my canonical X look like?" → open `references/scopes/<X>.md` (or `readme/<file>.md` for README sub-topics), quote canon + relevant `assets/` files. No repository scan. No diff. No writes.
- **Scaffold canon.** User asks "drop in my standard X" / "set up labels" / "add CI" / "bring this repository up to standard" → write canon files into the target repository. No diff report first. If a target file already exists, ask before overwriting (or write alongside with a suffix) — never silently replace user-authored content.

That's it. No mode flag, no drift report, no audit step. The skill does what the user asked.

### Scaffold workflow

1. **Detect stack tags.** Read repository-root signals (see [Stack detection](#stack-detection)). A repository carries a SET of tags.
2. **Pick scopes.** The user named them ("labels", "CI", "release") OR said "bring this up to standard" → every applicable scope for the detected tags.
3. **For each scope:**
   - Read its doc at `references/scopes/<scope>.md`
   - Check scope applies to the repository's tags
   - For each canon file: if absent, write it; if present, ask the user before overwriting
4. **Print what was written.** No commit, no push, no PR. User reviews + commits.

## Stack detection

Stacks are **tags** (sets), not single labels. Detected from repository-root signals. Stack-oriented — the skill standardises *technical stacks*, not repository types (dotfile bundles, theme ports, etc. are out of scope).

Quick map:

| Signal                                                    | Tag          |
| --------------------------------------------------------- | ------------ |
| `pyproject.toml` with `[project]`                         | `python-lib` |
| `Cargo.toml` with `[[bin]]`                               | `rust-cli`   |
| `next.config.{ts,js}` + `app/`                            | `next-site`  |
| `package.json` w/o publish workflow, git-tag distribution | `shared-pkg` |

Composite repositories carry multiple tags (`[python-lib, rust-cli]`, etc.). Subpaths declared inline when a stack scope operates against a subdirectory.

**Archetypes** layer on top of stack tags and mark scopes that simply don't apply for non-product repositories. Today the only archetype is `puzzles` (adventofcode / leetcode / kaggle / exercism / codewars / `*-solutions`) — `release` and the `release` justfile recipe are not scaffolded for puzzle repositories.

Full tag definitions + composite rules + archetype applicability + root-only vs subpath-aware scope split → [[variants]].

## Scopes

Each scope owns a slice of the repository. Per-scope canon + asset list at `references/scopes/<scope>.md`.

### readme — `README.md`

Hero + badges (shields.io `flat-square` only, StandWithUkraine last + always present) + canonical section order per stack. Voice rules (no hype words, `## Installation` not `## Install`, lowercase H1, no standalone `## License`, no TOC). Stack templates under `references/readme/variants/`. → `references/scopes/readme.md`

### editorconfig — `.editorconfig`

Single canon file. Universal baseline (UTF-8, LF, 2-space, 120-char) + Python 4-space override. → `references/scopes/editorconfig.md`

### labels — `.github/labels.yaml` + sync workflow

15 labels across `type:` / `priority:` / `status:` namespaces. No `area:` (encode in commit scope). Sync workflow uses `crazy-max/ghaction-github-labeler` (additive by default). → `references/scopes/labels.md`

### issue-templates — `.github/ISSUE_TEMPLATE/*` + `PULL_REQUEST_TEMPLATE.md`

GitHub form-schema YAML for bug / feature / docs + `config.yaml` disabling blank issues + PR template. Triple-dash filename prefix forces sort. → `references/scopes/issue-templates.md`

### codebase-structure — `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `.gitignore`

Meta files at repository root. Dual-license setups ship `LICENSE-MIT` + `LICENSE-APACHE` + pointer. `.gitignore` uses gitignore.io `### <Lang> ###` markers (idempotent block replacement). → `references/scopes/codebase-structure.md`

### justfile — `justfile`

Canonical recipe vocabulary: `install`, `format`, `lint`, `test`, `check`, `update`, `dev`, `build`, `start`, `release <semver>`. Canon ships a structural template only; implementations are repository-owned. Scaffolding inserts missing recipe headers with TODO bodies; never overwrites existing implementations. → `references/scopes/justfile.md`

### python — `pyproject.toml`, `.python-version`, `src/<pkg>/`, `tests/`

uv + hatchling + ruff + ty + pytest stack. ruff line-length 100, `required-imports = ["from __future__ import annotations"]`. Canon-owned: `[build-system]`, `[dependency-groups]`, `[tool.*]`. Per-repository: `[project.dependencies]`, `[project.scripts]`, `[project.urls]`, version. → `references/scopes/python.md`

### rust — `Cargo.toml`, `src/`

Edition 2021, `[lints.rust] unsafe_code = "forbid"`, `[profile.release]` (lto=fat, codegen=1, panic=abort, strip=symbols). Canon `[dev-dependencies]`: assert_cmd + predicates + tempfile + pretty_assertions. Per-repository: `[dependencies]`, `[[bin]]`, version. → `references/scopes/rust.md`

### next — `package.json`, `biome.json`, `next.config.ts`, `tsconfig.json`, `vercel.json`

Biome (no ESLint/Prettier). `engines.node: ">=22"`, `packageManager: "pnpm@10.30.3"`. Canonical scripts: dev / build / start / lint / format / check. shared-pkg adds exports + peerDeps + files. → `references/scopes/next.md`

### workflows — `.github/workflows/*.yaml`

Single owner across scopes (other scopes' workflows ship from here for atomic install). `.yaml` not `.yml`. All action `uses:` lines reference `references/action-versions.yaml`. Workflows call ONLY `just <recipe>` (setup actions excepted). Composite repositories use `working-directory:` for subpaths. → `references/scopes/workflows.md`

### release — `cliff.toml`, `CHANGELOG.md` presence

Single tool: **git-cliff** everywhere (language-agnostic). SemVer: `feat:` → MINOR, `feat!:` / `BREAKING CHANGE:` → MAJOR, `fix:`/`perf:`/`refactor:` → PATCH, others none. Tag = `v<semver>`. Publish per-stack (`uv publish` for python-lib, `cargo publish` for rust-cli, git-tag + GitHub Release for shared-pkg + next-site; Vercel deploys next-site independently on push to main). → `references/scopes/release.md`

### github-meta — repository settings via `gh api`

Settings: default branch `main`, squash-only merge, `delete_branch_on_merge`, `allow_auto_merge`, `has_projects=false`, `has_wiki=false`, `has_discussions=false`. No `FUNDING.yaml`, no `CODEOWNERS` — neither belongs in the standard. → `references/scopes/github-meta.md`

## CI contract

Workflows call ONLY `just <recipe>` — never `ruff`, `cargo`, `pnpm`, `pytest` directly. Tool swaps stay invisible to CI. Canonical recipe vocab + secrets + artifacts → [[ci-contract]].

## Action versions

`references/action-versions.yaml` is the single pin table. Workflows scope reads it; refuses to write a workflow that references an action not in the table. Bump there → re-scaffold workflows across consumer repositories → CI moves in lockstep.

## Voice / brand

Inherit from `pivoshenko-brand`. Practical, no hype. Hard terminology rules:

- Never "repo" / "repos" → always "repository" / "repositories".
- Public contact = `contact@pivoshenko.dev`. Never the user's personal email.
- Always rebase, never merge. Don't offer merge as an alternative.

## Hard rules

- **All canonical content stored as real files in `assets/`.** SKILL.md + reference docs describe + point; canon never inlined in prose beyond <5-line snippets.
- **Scaffolding is opt-in per scope.** Never bulk-write without the user naming what they want — exception: an explicit catch-all like "bring this repository up to standard" authorises every applicable scope.
- **Never overwrite user-authored content silently.** Ask before replacing an existing file, or write alongside with a suffix. Justfile recipe bodies are NEVER overwritten — only missing headers are inserted with TODO bodies.
- **Never auto-commit, push, or open a PR.** Scaffolding writes files, prints a list, stops. User commits.
- **Respect subpaths.** Composite repositories route language scopes per declared subpath.
- **No GitHub Actions version drift.** Workflows scope refuses to write if a referenced action is missing from the pin table.
- **Assets are drop-in.** Header preambles are the only prose inside assets; body stays minimal so consumers can paste verbatim.

## Index

- `references/scopes/<scope>.md` × 12 — per-scope canon, stack matrix
- `references/readme/{structure,badges}.md` + `readme/variants/<stack>.md` × 4 — README spec
- `references/variants.md` — stack tag taxonomy + composite + subpath rules + archetype applicability
- `references/ci-contract.md`, `references/action-versions.yaml` — CI conventions + pinned action versions
- `assets/ASSETS.md` — full canonical asset inventory
- `evals/evals.json` — test prompts
