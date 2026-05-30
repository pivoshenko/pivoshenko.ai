<!--
=== CI contract ===
Audience: agents and humans applying the repository-hygiene standard.
Purpose:  Define the recipe-based CI contract — workflows call `just <recipe>` only, tool swaps stay invisible to CI.
Read-when: Writing or auditing `.github/workflows/`, adding a new recipe, or touching the `workflows` / `justfile` scopes.
=== end ===
-->

# CI contract

Workflows in `.github/workflows/*.yaml` call **only `just <recipe>`**. Never `ruff`, `cargo`, `pnpm`, `pytest` directly. Tool swaps are invisible to CI.

## Canonical recipes (every applicable variant must provide)

| Recipe                  | Purpose                                      | Variants                                            |
| ----------------------- | -------------------------------------------- | --------------------------------------------------- |
| `just install`          | Install deps for local dev                   | all                                                 |
| `just format`           | Auto-fix formatting                          | all                                                 |
| `just lint`             | Static analysis only (no build)              | all                                                 |
| `just check`            | Full CI gate (lint + build where applicable) | all                                                 |
| `just test`             | Test suite                                   | `python-lib`, `rust-cli`                            |
| `just update`           | Bump deps                                    | all                                                 |
| `just build`            | Production build                             | `next-site`, `rust-cli`, `shared-pkg`               |
| `just dev`              | Local dev server                             | `next-site`                                         |
| `just start`            | Production start (local)                     | `next-site`                                         |
| `just release <semver>` | Tag + publish                                | `python-lib`, `rust-cli`, `shared-pkg`, `next-site` |

## Recipe contract

- Recipes are stable names. Renaming is a coordinated change: bump the recipe in `justfile` scope canon + re-apply `justfile` + `workflows` scope to all repositories in one pass.
- Recipes never accept positional args except where listed (`just release <semver>`).
- Recipes exit non-zero on failure. CI relies on exit codes only.
- Recipes never write outside the repository root.

## Secrets (workflow-owned)

These secret names are reserved for workflows. Language scope configs reference them by name but never define them.

- `GITHUB_TOKEN` — built-in
- `GH_TOKEN` — PAT for cross-workflow pushes (release flows that push tags/commits)
- `PYPI_TOKEN` — Python publish
- `CARGO_REGISTRY_TOKEN` — Rust publish
- `NPM_TOKEN` — shared-pkg, only if/when published

## Artifacts

Recipes produce artifacts at known paths. Workflows know where to look:

- Python: `dist/*.whl`, `dist/*.tar.gz`
- Rust: `target/release/<binary>`
- Next-site: `.next/` (not uploaded — Vercel handles deploy)
- Shared-pkg: `dist/` (git-tag distribution, no upload)

## What CI does NOT do

- Run formatters in CI as a gate (formatters are local-only; CI only checks they were run via `just lint`).
- Install language toolchains outside of the `setup-*` actions in `action-versions.yaml`.
- Hardcode tool versions — those live in `pyproject.toml`, `Cargo.toml`, `package.json`, never in workflow yml.
