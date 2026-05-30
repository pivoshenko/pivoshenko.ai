<!--
=== Scope: workflows ===
Audience: agents and humans applying the repository-hygiene standard.
Purpose:  Sole owner of .github/workflows/*.yaml across every scope. Enforce action pin table + CI contract.
Read-when: scope=workflows is invoked; or when the user asks about GitHub Actions, CI, release workflows, or action version pinning.
=== end ===
-->

# Scope: workflows

Single owner for every file under `.github/workflows/`. Other scopes' workflows (e.g. labels sync) ship from this scope so install is atomic and CI moves in lockstep.

## Owns

- ALL files under `.github/workflows/*.yaml`

Includes workflows logically belonging to other scopes (e.g. `labels.yaml`) — those scopes own the data file, this scope owns the workflow yml.

## Canon

- `assets/workflows/labels.yaml`
- `assets/workflows/python/ci.yaml`
- `assets/workflows/python/release.yaml`
- `assets/workflows/rust/ci.yaml`
- `assets/workflows/rust/release.yaml` — single-binary canon
- `assets/workflows/rust/release.distribution.yaml` — multi-target + Homebrew + Scoop variant
- `assets/workflows/next/ci.yaml`
- `assets/workflows/next/release.yaml` — git-tag + GitHub Release (Vercel handles deploy)
- `assets/workflows/shared-pkg/release.yaml` — git-tag + GitHub Release (no registry publish)

Tokens: `{{name}}`, `{{repository}}`, `{{module}}` (python).

All `uses:` lines reference `references/action-versions.yaml`. Refuse to write if a referenced action is absent from that pin table.

## Stack matrix

| Stack tag    | Applies? | Files shipped                                                                    |
| ------------ | -------- | -------------------------------------------------------------------------------- |
| `python-lib` | yes      | python/ci, python/release, labels                                                |
| `rust-cli`   | yes      | rust/ci, rust/release (or release.distribution if distribution flag set), labels |
| `next-site`  | yes      | next/ci, next/release, labels                                                    |
| `shared-pkg` | yes      | next/ci (lint+build), shared-pkg/release, labels                                 |

Composite -> ONE root `.github/workflows/` directory. Per-stack workflows use `working-directory:` keyed off the subpath. Never nest `.github/` per subpath.

## Drift detection

- `missing` -> required workflow file absent for this variant
- `drift` -> byte diff vs canon (after token + working-directory substitution)
- `extra` -> repository-specific workflows beyond canon -> preserved, never pruned
- `external` -> canonical workflow needs a secret that is absent on GitHub (e.g. `PYPI_API_TOKEN`, `CARGO_REGISTRY_TOKEN`, `CODECOV_TOKEN`, `GH_TOKEN`) -> surfaced with instructions; `fixable: true` only if `gh secret set` is acceptable

## Edge cases

- File extension MUST be `.yaml` not `.yml` — `.yml` flagged as `drift` (rename on fix)
- CI contract: workflow steps call ONLY `just <recipe>`. Exception: setup actions (`astral-sh/setup-uv`, `dtolnay/rust-toolchain`, `pnpm/action-setup`, `actions/setup-*`) bootstrap the environment
- Action version drift -> NEVER inline a version; bump the pin table and re-apply this scope
- Distribution workflow (rust) gated by `distribution: true` per-repository flag
- Concurrency group canon: `group: ${{ github.workflow }}-${{ github.ref }}`, `cancel-in-progress: true` on CI; release workflows do NOT cancel
- Permissions block canon: `contents: read` minimum; `contents: write` only on release jobs
