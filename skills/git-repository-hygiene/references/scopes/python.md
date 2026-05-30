<!--
=== Scope: python ===
Audience: agents and humans applying the git-repository-hygiene standard.
Purpose:  Own pyproject.toml (canonical sections), .python-version, src-layout convention.
Read-when: scope=python is invoked; or when the user asks about pyproject, ruff, ty, pytest, uv, or Python project layout.
=== end ===
-->

# Scope: python

Subpath-aware. Canon covers specific pyproject sections; per-repository owns dependencies + version.

## Owns

At repository root OR `subpaths[python-lib]`:

- `pyproject.toml` — canonical sections: `[project]` (metadata shape), `[project.urls]`, `[build-system]`, `[dependency-groups]`, `[tool.ruff]`, `[tool.ty]`, `[tool.pytest]`, `[tool.coverage]`
- `.python-version`
- `src/<module>/` + `tests/` layout convention
- `src/<module>/__init__.py` exposing `__version__` via `importlib.metadata` (see [Version single-sourcing](#version-single-sourcing))

## Canon

- `assets/pyproject/lib.toml` — template

Tokens:

- `{{name}}` — PyPI distribution name
- `{{module}}` — snake_case import name
- `{{description}}` — one-liner
- `{{keywords}}` — JSON array of keyword strings

Hard-coded (non-token) canon: hatchling build backend; ruff + ty linter stack; pyupgrade-style formatter; pytest test stack; ruff `line-length = 100`; `required-imports = ["from __future__ import annotations"]`.

## Version single-sourcing

`[project].version` in `pyproject.toml` is the only source of truth. The release flow ([[release]] scope) writes it via `uv version <x.y.z>`; `git-cliff` never touches `pyproject.toml` or `src/`.

If the package needs a runtime `__version__` attribute, derive it from installed metadata — never hand-maintain a second copy:

```python
# src/<module>/__init__.py
from importlib.metadata import version

__version__ = version("<name>")
```

Why: `importlib.metadata` reads the installed dist's metadata, which is generated from `[project].version` at build time. The two stay in sync automatically. A hard-coded `__version__ = "1.2.3"` in `__init__.py` will drift the moment `uv version` bumps pyproject.

Anti-patterns (don't use):

- `__version__ = "1.2.3"` literal in `__init__.py`
- `__version__` parsed from `pyproject.toml` at runtime (couples to source layout)
- Bumping `__init__.py` in the release workflow alongside `pyproject.toml` (extra moving part with no benefit over `importlib.metadata`)

## Stack matrix

| Stack tag    | Applies? | Notes          |
| ------------ | -------- | -------------- |
| `python-lib` | yes      | primary target |
| every other  | no       |                |

Composite -> single canonical pyproject at root or at `subpaths[python-lib]`.

## Scaffolding notes

- Lands at root or `subpaths[python-lib]`; substitute `{{name}}`, `{{module}}`, `{{description}}`, `{{keywords}}`
- Merge into existing `pyproject.toml` section-by-section — preserve `[project].dependencies`, `[project].version`, `[project].optional-dependencies`, `[project].requires-python`, `[dependency-groups].dev`
- `.python-version` tracks the active Python minor (e.g. `3.13`); patch is not pinned
- App variant not shipped yet — strip publish bits by hand for now (pending v2)

## Things to know

- Per-repository owns: `version`, `dependencies`, `optional-dependencies`, `requires-python`, `[project.scripts]`, `[dependency-groups].dev` content. Template ships `requires-python = ">=3.10"` as a suggestion — repositories can pin tighter or looser as they need; varies by repo
- `[project.urls]` is canon-owned and substituted from `{{name}}` (owner is hardcoded `pivoshenko`). Ships Homepage, Repository, Issues, Changelog — extra URLs are repo-specific extras, not drift
- Release config (`cliff.toml`) lives in [[release]] scope — never `[tool.semantic_release]` in pyproject
- `uv.lock` is committed but not part of canon — `uv lock` keeps it current
- `src/<module>/` is the canonical layout; flat-layout exists in some repos (notably puzzle solutions) and is fine — scope simply does not apply in those cases
- Puzzle repos (`adventofcode`, `exercism`) often use alt pytest configs (`python_files = ["main.py", "part_*.py"]`, `testpaths = ["."]`) — per-day layout, not per-package; leave alone
- Other repo-added `[tool.*]` blocks (mypy, black, etc.) are not part of canon — leave them where they are
