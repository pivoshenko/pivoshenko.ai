---
name: repository-hygiene
description: Personal wiki + applier of an opinionated engineering standard for repositories — README, editorconfig, labels, issue templates, license/contributing/security meta files, justfile recipe contract, language configs (python/rust/next), CI/release workflows, GitHub repository settings. Doubles as the canonical reference for "what does my standard X look like" lookups. Use when the user says "what's my canonical justfile / README / gitignore / workflow", "remind me how I structure Y", "show me my standard for Z", "look up our convention for ...", "bring this repository up to standard", "audit hygiene", "bootstrap a new project", "add CI", "set up labels", "scaffold a fresh python lib", "make this on brand", "fix my readme", "add the standard meta files", "drop in CONTRIBUTING / SECURITY / CODE_OF_CONDUCT", "set up release pipeline", or anything that touches the structural / configurational / conventional layer of a repository. Four modes — `lookup` (read canon for one scope, no diff, no write), `audit` (default; read-only drift report), `fix` (write canonical files), `bootstrap` (apply all applicable scopes to a fresh repository, explicit opt-in).
tags: [hygiene, standard, wiki, reference, meta, github, devops]
updated_at: 2026-05-30
---

# Repository Hygiene

Engineering standard for repositories. Wiki of canonical asset files + the rules for applying them.

Personal engineering standard. Canon assets are drop-in for `pivoshenko/*` repositories.

## How to apply

Four modes:

- **lookup** — wiki mode. User asks "what does my canonical X look like?" → jump straight to `references/scopes/<X>.md` (or `readme/<file>.md` for README sub-topics) and recite/quote canon. No repository scan, no diff, no writes. Reach for this whenever the user just wants the convention, not an audit.
- **audit** (default for repository-scoped requests) — read repository, diff vs canon, emit drift report. No writes.
- **fix** — write canon files in place. No auto-commit, no push.
- **bootstrap** — fresh / empty repository → apply every applicable scope, commit on `chore/bootstrap-hygiene` branch. Explicit opt-in only; never inferred.

### Workflow

1. **Detect stack tags.** Read repository-root signals (see [Stack detection](#stack-detection)). A repository carries a SET of tags.
2. **Pick scope set.** `--scope=<name>` for one scope, `--scope=all` (default) for every applicable scope. Per-invocation skips: `--skip=<name>,<name>`.
3. **For each scope:**
   - Read its doc at `references/scopes/<scope>.md`
   - Check scope applies to any of this repository's tags
   - Diff canon (under `assets/`) vs current repository files
   - audit → append drifts to report; fix → write canon; bootstrap → write all
4. **Emit drift JSON + human-readable summary table.**

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

Full tag definitions + composite rules + root-only vs subpath-aware scope split → `references/variants.md`.

## Scopes

Each scope owns a slice of the repository. Full details per scope in `references/scopes/<scope>.md`.

### readme — `README.md`

Hero + badges (shields.io `flat-square` only, StandWithUkraine last + always present) + canonical section order per stack. Voice rules (no hype words, `## Installation` not `## Install`, lowercase H1, no standalone `## License`, no TOC). Stack templates under `references/readme/variants/`. → `references/scopes/readme.md`

### editorconfig — `.editorconfig`

Single canon file. Universal baseline (UTF-8, LF, 2-space, 120-char) + Python 4-space override. Byte-level diff; canon wins. → `references/scopes/editorconfig.md`

### labels — `.github/labels.yaml` + sync workflow

15 labels across `type:` / `priority:` / `status:` namespaces. No `area:` (encode in commit scope). Sync workflow uses `crazy-max/ghaction-github-labeler` (additive by default). → `references/scopes/labels.md`

### issue-templates — `.github/ISSUE_TEMPLATE/*` + `PULL_REQUEST_TEMPLATE.md`

GitHub form-schema YAML for bug / feature / docs + `config.yaml` disabling blank issues + PR template. Triple-dash filename prefix forces sort. → `references/scopes/issue-templates.md`

### codebase-structure — `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `.gitignore`

Meta files at repository root. Dual-license setups ship `LICENSE-MIT` + `LICENSE-APACHE` + pointer. `.gitignore` is single-owner with gitignore.io `### <Lang> ###` markers (idempotent block replacement). → `references/scopes/codebase-structure.md`

### justfile — `justfile`

Canonical recipe vocabulary: `install`, `format`, `lint`, `test`, `check`, `update`, `dev`, `build`, `start`, `release <semver>`. Canon ships structural template only; implementations are repository-owned. Fix-mode inserts missing recipe headers with TODO bodies, never overwrites existing implementations. → `references/scopes/justfile.md`

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

### github-meta — `.github/FUNDING.yaml`, `CODEOWNERS`, repository settings via `gh api`

Settings: default branch `main`, squash-only merge, `delete_branch_on_merge`, `allow_auto_merge`, `has_projects=false`, `has_wiki=false`, `has_discussions=false`. FUNDING = `github: pivoshenko`. CODEOWNERS opt-in. → `references/scopes/github-meta.md`

## Drift JSON schema

Every scope emits the same shape:

```json
{
  "scope": "editorconfig",
  "repository": "<name>",
  "drifts": [{ "path": ".editorconfig", "status": "drift", "reason": "..." }],
  "fixable": true
}
```

Status enum:

- **`ok`** — matches canon. Omitted unless verbose.
- **`missing`** — file absent in repository.
- **`drift`** — present but differs from canon. Canon wins on fix.
- **`extra`** — repository has content beyond canon (e.g. user-added blocks). `fixable: false` by default — surface for review.
- **`external`** — state outside the tree (GitHub repository setting, label on UI). `fixable: true` only when `gh` CLI can change it.

`fixable: false` blocks fix mode for that drift; rest of report proceeds.

### Worked example

User: *"audit ~/code/my-utils (python-lib) — readme + editorconfig only"*

Detect: `pyproject.toml` with `[project]` → tag `python-lib`. Scopes requested: `readme`, `editorconfig`. Run diffs, emit:

```json
[
  {
    "scope": "readme",
    "repository": "my-utils",
    "drifts": [
      { "path": "README.md", "status": "drift", "reason": "H1 is `# My Utils`; possessive prefix not allowed (structure.md §1)" },
      { "path": "README.md", "status": "drift", "reason": "StandWithUkraine badge missing from row" },
      { "path": "README.md", "status": "missing", "reason": "no `## Installation` section" }
    ],
    "fixable": true
  },
  {
    "scope": "editorconfig",
    "repository": "my-utils",
    "drifts": [
      { "path": ".editorconfig", "status": "drift", "reason": "indent_size=4 at root; canon is 2 (Python override stays 4)" }
    ],
    "fixable": true
  }
]
```

Then a human-readable summary table. No files written (audit mode).

For a `lookup` invocation — *"what's my canonical justfile look like?"* — skip detection + diff entirely; read `references/scopes/justfile.md` + `assets/justfile`, quote them back, stop.

## CI contract

Workflows call ONLY `just <recipe>` — never `ruff`, `cargo`, `pnpm`, `pytest` directly. Tool swaps stay invisible to CI. Canonical recipe vocab + secrets + artifacts → `references/ci-contract.md`.

## Action versions

`references/action-versions.yaml` is the single pin table. Workflows scope reads it; refuses to write a workflow that references an action not in the table. Bump there → re-apply workflows across consumer repositories → CI moves in lockstep.

## Voice / brand

Inherit from `pivoshenko-brand`. Practical, no hype. Hard terminology rules:

- Never "repo" / "repos" → always "repository" / "repositories".
- Public contact = `contact@pivoshenko.dev`. Never the user's personal email.
- Always rebase, never merge. Don't offer merge as an alternative.

## Hard rules

- **All canonical content stored as real files in `assets/`.** SKILL.md + reference docs describe + point; canon never inlined in prose beyond <5-line snippets.
- **Lookup mode is read-only.** Never offer to write or audit unprompted — the user asked for the canon, deliver it and stop.
- **Audit mode never writes.** Even when drift is trivial.
- **Fix mode never auto-pushes / opens PR.** Writes files, prints status, stops. User commits.
- **Bootstrap is explicit opt-in.** Never inferred from phrasing like "new project" alone — require the user to say "bootstrap" or accept a confirmation. Commits land on a dedicated branch (`chore/bootstrap-hygiene`). User reviews + opens PR (or rebases).
- **Respect `--skip` always.** Per-scope opt-out is real.
- **Subpath-aware where declared.** Composite repositories route language scopes per subpath.
- **No GitHub Actions version drift.** Workflows scope refuses to write if a referenced action is missing from the pin table.
- **Assets are drop-in.** Header preambles are the only prose inside assets; body stays minimal so consumers can paste verbatim.

## Index

- `references/scopes/<scope>.md` × 12 — per-scope canon, stack matrix, drift rules
- `references/readme/{structure,badges}.md` + `readme/variants/<stack>.md` × 4 — README spec
- `references/variants.md` — stack tag taxonomy + composite + subpath rules
- `references/ci-contract.md`, `references/action-versions.yaml` — CI conventions + pinned action versions
- `assets/ASSETS.md` — full canonical asset inventory
- `evals/evals.json` — test prompts
