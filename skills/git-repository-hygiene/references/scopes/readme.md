<!--
=== Scope: readme ===
Audience: agents and humans applying the git-repository-hygiene standard.
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

Archetype `puzzles`: scope applies partially. Voice rules (no hype, no standalone `## License`), badge structure, and StandWithUkraine still apply. Canonical-section order + section-name conventions don't — puzzle READMEs are typically a one-liner + a progress/link table.

## Scaffolding notes

- Lands at repository root as `README.md`. Merge rather than overwrite when a README already exists — preserve custom usage examples, screenshots, demo GIFs, "About the name" blocks, FAQ.
- Substitute `{{name}}`, `{{repository}}`, `{{owner}}`, `{{description}}` from the repository's manifest before writing.
- Pick stack variant first; then assemble: hero -> badges -> canonical sections -> custom blocks -> StandWithUkraine snippet (verbatim, always last).
- H1 is lowercase repository slug. Title-Case H1 only for opaque/generic slugs (`dotfiles`, `adventofcode`, `scratch`).
- Badge order is fixed: license, language version, package version, CI, style, StandWithUkraine. Logo present -> `<p align="center">`; no logo -> `<p align="left">`.
- License is a footer line (`MIT © {{owner}}` or dual-license equivalent) — no standalone `## License` heading. No TOC for any stack.
