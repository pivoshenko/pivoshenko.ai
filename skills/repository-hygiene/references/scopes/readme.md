<!--
=== Scope: readme ===
Audience: agents and humans applying the repository-hygiene standard.
Purpose:  Govern README.md — hero, badges, section order, voice — per variant.
Read-when: scope=readme is invoked; or when the user asks about README, hero, badges, or sections.
=== end ===
-->

# Scope: readme

Single owner of `README.md`. Content shape varies by stack; structural rules (badges flat-square, StandWithUkraine last, lowercase H1) are universal.

## Owns

- `README.md` at repository root

## Canon

- `references/readme/structure.md` — full canonical section list + order + naming
- `references/readme/badges.md` — badge URL templates + pinned palette + style rules
- `references/readme/variants/<stack>.md` — per-stack body template (python-lib, rust-cli, next-site, shared-pkg)
- `assets/readme/standwithukraine.snippet.md` — required trailing block, verbatim

Tokens (substituted into canon at write time):

- `{{name}}` — repository name (lowercase, kebab-case)
- `{{repository}}` — `<owner>/<name>` slug
- `{{owner}}` — GitHub owner
- `{{description}}` — one-line description from `pyproject` / `Cargo.toml` / `package.json`

## Stack matrix

| Stack tag    | Applies? | Notes                         |
| ------------ | -------- | ----------------------------- |
| `python-lib` | yes      | uses `variants/python-lib.md` |
| `rust-cli`   | yes      | uses `variants/rust-cli.md`   |
| `next-site`  | yes      | uses `variants/next-site.md`  |
| `shared-pkg` | yes      | uses `variants/shared-pkg.md` |

Composite -> pick dominant stack (next-site > shared-pkg > rust-cli > python-lib by default; override per-repository if needed). Subpath repositories still keep ONE root README.

## Drift detection

- `missing` -> no README.md at root
- `drift` -> any of:
  - H1 violates `structure.md` §1 (possessive prefix like `My …`, emoji, version suffix, or Title-Case rewrite when the repository slug is already descriptive). Title-Case H1 is allowed for opaque/generic slugs (`dotfiles`, `adventofcode`, `scratch`)
  - badge style not `flat-square`
  - badge row alignment mismatch (logo present → must be `<p align="center">`; no logo → must be `<p align="left">`)
  - StandWithUkraine absent or not last block
  - canonical sections out of order
  - section name mismatch (e.g. `## Install` not `## Installation`)
  - code fences untagged
  - hype words present (`blazing`, `cutting-edge`, `seamless`, etc.)
  - standalone `## License` heading (license -> footer line only)
  - TOC present (no TOC for any stack — too short to need one)
- `extra` -> custom blocks beyond canon (preserved, flagged `fixable: false`)
- `external` -> n/a

## Edge cases

- Preserve unique content: custom usage examples, screenshots, demo GIFs, "About the name" block, FAQ -> kept as `extra`, never deleted on fix
- Composite repository -> dominant stack picks template; non-dominant stack content folded as appended section if non-trivial
- Subpath next-site -> README lives at root; subpath has no README of its own
- Migration from legacy `## License` heading -> demote to footer line `MIT © {{owner}}` (or dual-license equivalent)
- Badge order is fixed (license, language version, package version, CI, style, StandWithUkraine) — reorder counts as `drift`
- StandWithUkraine snippet is verbatim — any local edit reverts on fix
