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

## Drift detection

- `missing` -> no `.editorconfig` at root
- `drift` -> byte diff vs canon (any change loses; canon wins on fix)
- `extra` -> user-added sections (e.g. `[*.custom]`) -> `fixable: false`; surfaced for upstream decision
- `external` -> n/a

## Edge cases

- Per-subpath `.editorconfig` files (e.g. `site/.editorconfig`) -> flag as `extra`, recommend deletion; root globs already cover them
- Hand-tuned indent overrides -> `extra`; if the language genuinely needs it, upstream to canon rather than per-repository drift
- LF vs CRLF: canon enforces LF everywhere except `*.bat`, `*.cmd`
- BOM handling: canon forbids BOM; fix mode rewrites without BOM
- Don't conflate with formatter config (biome, ruff, rustfmt) — those live in their own files
