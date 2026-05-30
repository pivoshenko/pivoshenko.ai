<!--
=== Scope: python ===
Audience: agents and humans applying the repository-hygiene standard.
Purpose:  Own pyproject.toml (canonical sections), .python-version, src-layout convention.
Read-when: scope=python is invoked; or when the user asks about pyproject, ruff, ty, pytest, uv, or Python project layout.
=== end ===
-->

# Scope: python

Subpath-aware. Canon owns specific pyproject sections; per-repository keeps dependencies + version.

## Owns

At repository root OR `subpaths[python-lib]`:

- `pyproject.toml` — canonical sections: `[project]` (metadata shape), `[build-system]`, `[dependency-groups]`, `[tool.ruff]`, `[tool.ty]`, `[tool.pytest]`, `[tool.coverage]`
- `.python-version`
- `src/<module>/` + `tests/` layout convention

## Canon

- `assets/pyproject/lib.toml` — template

Tokens:

- `{{name}}` — PyPI distribution name
- `{{module}}` — snake_case import name
- `{{description}}` — one-liner
- `{{keywords}}` — JSON array of keyword strings

Hard-coded (non-token) canon: hatchling build backend; ruff + ty linter stack; pyupgrade-style formatter; pytest test stack; ruff `line-length = 100`; `required-imports = ["from __future__ import annotations"]`.

## Stack matrix

| Stack tag    | Applies? | Notes          |
| ------------ | -------- | -------------- |
| `python-lib` | yes      | primary target |
| every other  | no       |                |

Composite -> single canonical pyproject at root or at `subpaths[python-lib]`.

## Drift detection

- `missing` -> `pyproject.toml` or `.python-version` absent
- `drift` -> canonical section diff vs canon (table-level granularity; deps preserved)
- `extra` -> repository-added `[tool.*]` blocks (e.g. mypy, black) -> preserved, flagged for upstream decision
- `external` -> `uv.lock` absent (committed but not owned -> warning only)

## Edge cases

- Per-repository OWNED: `[project].dependencies`, `[project].version`, `[project].optional-dependencies`, `[dependency-groups].dev` content (canon owns SHAPE only)
- Release config (`cliff.toml`) lives in release scope — never `[tool.semantic_release]` in pyproject
- `uv.lock` committed but not byte-diffed — handled by `uv lock` on install
- `src/<module>/` layout is canonical; flat-layout flagged as `drift` (manual migration required, fix mode does not move files)
- `tests/` at root (not under `src/`) is canonical
- `.python-version` content tracks active Python minor (e.g. `3.13`); canon does not pin the patch
- App vs lib: only `lib.toml` template ships today; app variant currently hand-stripped (pending v2)
