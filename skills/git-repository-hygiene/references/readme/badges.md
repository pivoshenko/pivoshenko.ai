<!--
=== Badge spec ===
Audience: agents and humans applying the git-repository-hygiene standard.
Purpose:  Canonical shields.io badge URLs, color palette, order, and audit procedure.
Read-when: Writing or auditing a README badge row, or adding a new badge type.
=== end ===
-->

# Badge spec

Provider: **shields.io** only. Style: **`flat-square`** everywhere. Logo color: `logoColor=white` on colored badges.

## Color palette

Opinionated defaults. Use consistently per badge type.

| Hex                             | Use                                  |
| ------------------------------- | ------------------------------------ |
| `4856CD`                        | PyPI, Python, Release (blue family)  |
| `0A6847`                        | CI, License (green family)           |
| `D7FF64`                        | Ruff, style badges                   |
| `F74C00`                        | Rust                                 |
| `FFC93C` on `labelColor=07689F` | StandWithUkraine (Ukrainian flag — sacred, never change) |

## Canonical badge order

1. License
2. Language version (Python / Rust / Node)
3. Package version (PyPI / Release tag)
4. CI status
5. Style (Python: Ruff; others: skip)
6. **StandWithUkraine** (always last, always present)

## Per-badge URLs

Substitute `<pkg>` (PyPI name), `<owner>` (GitHub owner/org), and `<repository>` (GitHub repository name).

### License

PyPI package:

```
https://img.shields.io/pypi/l/<pkg>?style=flat-square&color=0A6847&label=License
```

Non-PyPI:

```
https://img.shields.io/badge/License-MIT-0A6847?style=flat-square&logo=opensourceinitiative&logoColor=white
```

Link: `https://github.com/<owner>/<repository>/blob/main/LICENSE`

### Python version

```
https://img.shields.io/pypi/pyversions/<pkg>?style=flat-square&color=4856CD&logo=python&logoColor=white&label=Python
```

Link: PyPI project URL.

### Rust version

```
https://img.shields.io/badge/Rust-Stable-F74C00?style=flat-square&logo=rust&logoColor=white
```

Link: https://www.rust-lang.org

### PyPI version

```
https://img.shields.io/pypi/v/<pkg>?style=flat-square&color=4856CD&logo=pypi&logoColor=white&label=PyPI
```

Link: `https://pypi.org/project/<pkg>/`

### Release (non-PyPI)

```
https://img.shields.io/github/v/release/<owner>/<repository>?style=flat-square&color=4856CD&logo=github&logoColor=white&label=Release
```

Link: `https://github.com/<owner>/<repository>/releases/latest`

### CI

```
https://img.shields.io/github/actions/workflow/status/<owner>/<repository>/ci.yaml?style=flat-square&color=0A6847&logo=githubactions&logoColor=white&label=CI&branch=main
```

Workflow file may be `ci.yml`, `test.yml`, etc. — verify before writing.

Link: `https://github.com/<owner>/<repository>/actions`

### Ruff (Python style)

```
https://img.shields.io/badge/Style-ruff-D7FF64?style=flat-square&logo=ruff&logoColor=black
```

Link: https://github.com/astral-sh/ruff

### StandWithUkraine — non-negotiable

Use the exact snippet from `../assets/standwithukraine.snippet.md`. Do not retype.

## Layout

Logo present above -> center:

```html
<p align="center">
  <a href="..."><img src="..." alt="..." /></a>
  <a href="..."><img src="..." alt="..." /></a>
  ...
  <!-- StandWithUkraine last -->
</p>
```

No logo (minimal sites) -> left-align:

```html
<p align="left">...</p>
```

Each badge wrapped in its own `<a href>`. One per line in source for readable diffs.

## Audit (normalize-mode)

For each badge:

1. URL returns valid SVG? `curl -sI <url> | grep -i 'image/svg'`
2. CI workflow path matches actual filename in `.github/workflows/`?
3. PyPI name matches `pyproject.toml`?
4. Codecov configured? If no, remove badge.

Broken badge -> remove or fix. Never leave a placeholder.
