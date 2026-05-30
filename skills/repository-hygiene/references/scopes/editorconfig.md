<!--
=== Scope: editorconfig ===
Audience: agents and humans applying the repository-hygiene standard.
Purpose:  Own a single .editorconfig at repository root for every code-bearing variant.
Read-when: scope=editorconfig is invoked; or when the user asks about indentation, line endings, trailing whitespace, or EOL rules.
=== end ===
-->

# Scope: editorconfig

One file, byte-level canon. Root-only — globs cover subpaths.

## Owns

- `.editorconfig` at repository root

## Canon

- `assets/.editorconfig` — verbatim, no tokens

No substitutions. File ships as-is.

## Stack matrix

Applies to every stack — `python-lib`, `rust-cli`, `next-site`, `shared-pkg`. Composite repositories -> ONE root file. Subpath stacks inherit via existing globs (no per-subpath `.editorconfig`).

Archetype `puzzles`: scope applies normally. Expect extra language blocks in the wild (`[*.{ex,exs}]`, `[*.gleam]`, `[*.ipynb]`, etc.) — these are fine to keep.

## Scaffolding notes

- Lands at repository root only. Don't create per-subpath copies (`site/.editorconfig`, etc.) — root globs cover them.
- Canon enforces LF everywhere except `*.bat`, `*.cmd`. No BOM.
- Safe to overwrite if the existing file matches canon intent; merge if the repository has hand-tuned language blocks worth keeping. If you see a custom block appear in 2+ repositories, upstream it to canon rather than scattering.
- Don't conflate with formatter config (biome, ruff, rustfmt) — those live in their own files.
