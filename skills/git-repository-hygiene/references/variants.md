<!--
=== Stacks ===
Audience: agents and humans applying the git-repository-hygiene standard.
Purpose:  Define the stack tag taxonomy, composite-detection rules, and subpath handling so scopes can be routed per repository.
Read-when: Classifying a repository, deciding which scopes apply.
=== end ===
-->

# Stacks

The skill is **stack-oriented** — it standardises *technical stacks* (python, rust, next, shared-pkg), not repository archetypes (dotfile bundles, theme ports, profile READMEs, etc.). Repositories outside the four stacks are out of scope.

Stacks = **tags**, not labels. Each repository carries a SET of tags. Detected from repository-root signals at invocation time. Scopes apply per-tag: "does this scope apply to any of this repository's tags?" — not "what is this repository's single variant?".

Some repositories also carry an **archetype** tag (additive — marks scopes that don't apply; see [Archetypes](#archetypes)). Today the only archetype is `puzzles` (adventofcode / leetcode / kaggle / exercism — solution sets, not products).

## Tags

| Tag          | Signal                                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------------------------- |
| `python-lib` | `pyproject.toml` with `[project]` table                                                                         |
| `rust-cli`   | `Cargo.toml` with `[[bin]]`                                                                                     |
| `next-site`  | `next.config.{ts,js}` + `app/` directory                                                                        |
| `shared-pkg` | `package.json` w/o publish workflow, distributed by git tag (consumers pin `github:<owner>/<repository>#<tag>`) |

## Composite detection

Multiple tags per repository is normal. Examples:

- `[python-lib, rust-cli]` — a repository that ships both a Python lib and a Rust CLI from the same codebase
- `[next-site, shared-pkg]` — a Next.js site with an embedded shared component package (subpath for the package)

Scope application logic: "if scope `X` applies to ANY tag in this repository's tag set, scaffold scope `X` when asked."

## Subpath handling

Composite repositories may operate stack scopes against subdirectories rather than root. Declare per-tag subpaths inline when invoking the skill:

```yaml
subpaths:
  shared-pkg: packages/ui
```

### Root-only scopes (always operate at repository root, ignore subpaths)

- `editorconfig` — one `.editorconfig` at root; globs cover subpaths
- `codebase-structure` — `LICENSE`, `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, top-level `.gitignore`
- `github-meta` — repository settings (no in-tree files)
- `labels` — `.github/` is one-per-repository
- `issue-templates` — same
- `release` — one release line per repository

### Subpath-aware scopes (operate at `subpaths[tag]` when set, else root)

- `python`, `rust`, `next`, `shared-pkg`, `justfile`

A composite carries one canonical manifest per stack at its subpath. Root `justfile` may exist alongside subpath justfiles for cross-cutting recipes.

### Workflows (matrix-aware)

`workflows` scope writes ONE root `.github/workflows/` directory. For composite repositories, generates per-stack workflows with `working-directory:` keyed off the subpath. Never nested `.github/` per subpath.

## Archetypes

Archetype tags layer on TOP of stack tags. They mark scopes that simply don't apply for repositories that aren't shipped products.

### `puzzles`

Solution sets — Advent of Code, LeetCode, Kaggle, Exercism, codewars, etc. Code is per-problem and disposable; the repository is a notebook, not a library.

**Detection signals (any):**

- Repository name matches `adventofcode`, `leetcode`, `kaggle`, `exercism`, `codewars`, `*-solutions`, `*-puzzles`
- Year-named top-level directories (`2024/`, `2025/`) combined with day-/problem-style subdirs (`day_01/`, `part_01.py`)
- Mixed-language tree where each language is a sibling top-level directory (`python/`, `elixir/`, `gleam/`) and none looks like a library

**Scope applicability under `puzzles`:**

| Scope                | Applies?  | Notes                                                                                  |
| -------------------- | --------- | -------------------------------------------------------------------------------------- |
| `readme`             | yes       | Opaque-slug H1 fine. Section list usually a one-liner + link table.                    |
| `editorconfig`       | yes       | Canon baseline only. Non-canon language blocks (Elixir, Gleam, notebooks) live freely. |
| `labels`             | yes       |                                                                                        |
| `issue-templates`    | yes       |                                                                                        |
| `codebase-structure` | yes       |                                                                                        |
| `justfile`           | partial   | `release` recipe NOT scaffolded. `format` / `lint` / `test` / `update` only.           |
| `python`             | partial   | `requires-python` per-repo (puzzles chase newest features). Flat layout fine.          |
| `rust`               | partial   | Per-problem binaries, not a published crate.                                           |
| `next`               | no        | Out of scope for puzzles.                                                              |
| `shared-pkg`         | no        | Out of scope for puzzles.                                                              |
| `workflows`          | partial   | CI workflows per language sibling fine. Release workflow NOT scaffolded.               |
| `release`            | no        | Not scaffolded. No `cliff.toml`, no `CHANGELOG.md`, no tags.                           |
| `github-meta`        | yes       | Settings still apply.                                                                  |

Non-canon languages inside a puzzles repository (Elixir, Gleam, Haskell, etc.) remain **out of scope** — the skill only owns python, rust, next, shared-pkg. Sibling language trees are left alone.

## Opt-outs

Don't scaffold a scope the user didn't ask for. Catch-all phrasing ("bring this repository up to standard") authorises every applicable scope; anything narrower restricts to the named scopes.
