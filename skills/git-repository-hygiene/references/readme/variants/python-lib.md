<!--
=== Variant: python-lib ===
Audience: agents and humans applying the git-repository-hygiene standard.
Purpose:  README rules and hero template for python library repositories.
Read-when: Writing or auditing a README in a repository tagged `python-lib`.
=== end ===
-->

# Variant: python-lib

Signal: `pyproject.toml` with `[project]` table + PyPI publish workflow.

## Badge row

License -> Python version -> PyPI version -> CI -> Ruff -> StandWithUkraine.

## Sections (in order)

1. Hero (H1 + optional logo `height=200`)
2. Badge row (`<p align="center">` if logo, else `<p align="left">`)
3. Tagline (only if logo)
4. `## Overview` — what + problem solved, 1–2 paras
5. `### Features` — required, bold lead-in bullets
6. `## Installation` — uv tool / pipx / pip stack
7. `## Usage` — code fences with `shell` / `python` tags
8. `## Examples` — optional, larger walkthrough
9. `## About the name` — if non-English name
10. `## Thanks` — optional

## Installation block (canonical)

````markdown
## Installation

```shell
uv tool install <pkg>
```

Or via pipx:

```shell
pipx install <pkg>
```

Or via pip:

```shell
pip install <pkg>
```
````

## Hero template

```markdown
# <pkg>

<div align="center">
  <img src="https://github.com/<owner>/<repository>/blob/main/assets/logo.svg?raw=true" height="200" alt="<pkg> logo">
</div>

<p align="center">
  <a href="https://github.com/<owner>/<repository>/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/pypi/l/<pkg>?style=flat-square&color=0A6847&label=License"></a>
  <a href="https://pypi.org/project/<pkg>/"><img alt="Python" src="https://img.shields.io/pypi/pyversions/<pkg>?style=flat-square&color=4856CD&logo=python&logoColor=white&label=Python"></a>
  <a href="https://pypi.org/project/<pkg>/"><img alt="PyPI" src="https://img.shields.io/pypi/v/<pkg>?style=flat-square&color=4856CD&logo=pypi&logoColor=white&label=PyPI"></a>
  <a href="https://github.com/<owner>/<repository>/actions"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/<owner>/<repository>/ci.yaml?style=flat-square&color=0A6847&logo=githubactions&logoColor=white&label=CI&branch=main"></a>
  <a href="https://github.com/astral-sh/ruff"><img alt="Ruff" src="https://img.shields.io/badge/Style-ruff-D7FF64?style=flat-square&logo=ruff&logoColor=black"></a>
  <a href="https://stand-with-ukraine.pp.ua/"><img alt="StandWithUkraine" src="https://img.shields.io/badge/Support-Ukraine-FFC93C?style=flat-square&labelColor=07689F"></a>
</p>

<p align="center"><em>One-line value prop.</em></p>
```
