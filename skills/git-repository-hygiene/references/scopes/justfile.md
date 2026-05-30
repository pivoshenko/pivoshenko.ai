<!--
=== Scope: justfile ===
Audience: agents and humans applying the git-repository-hygiene standard.
Purpose:  Own the just-recipe vocabulary across every variant. CI calls only `just <recipe>`.
Read-when: scope=justfile is invoked; or when the user asks about just recipes, task runner, or CI -> recipe mapping.
=== end ===
-->

# Scope: justfile

Canon owns recipe NAMES + signatures, not implementations. Implementations are repository-owned (user fills body for their toolchain). See [[ci-contract]] for the recipe vocab.

## Owns

- `justfile` at repository root, OR
- `subpaths[lang]/justfile` for composite repositories with subpath-aware language stack

## Canon

- `assets/justfile` — recipe headers only (vocabulary reference, no bodies)

No tokens. Recipe presence is what matters; bodies are user-authored.

## Stack matrix

| Stack tag    | Applies? | Required recipes                                                         |
| ------------ | -------- | ------------------------------------------------------------------------ |
| `python-lib` | yes      | install, format, lint, check, test, audit, update                        |
| `rust-cli`   | yes      | install, format, lint, check, test, audit, build, update, release        |
| `next-site`  | yes      | install, dev, format, lint, check, audit, build, start, update           |
| `shared-pkg` | yes      | install, format, lint, check, audit, build, update, release              |

Archetype `puzzles`: `release` is never required. Required set collapses to `install` (if non-trivial), `format`, `lint`, `test`, `update`. Bespoke recipes (e.g. `just day 1`) are expected and welcome.

Composite -> root `justfile` may exist for cross-cutting recipes; per-stack `justfile` lives at `subpaths[tag]`.

## Scaffolding notes

- Lands at repository root, or per-subpath for composite repositories. Merge into existing `justfile` — never overwrite bodies.
- When merging, insert any MISSING required recipe headers with TODO bodies (`# TODO: implement`); leave existing implementations alone.
- Recipes never accept positional args except where listed (`just release <semver>`). Recipes never write outside repository root.
- Composite root fan-out (`just lint` -> calls each subpath's `just lint`) is allowed; canon does not mandate the fan-out body.
- Aliases (e.g. `alias fmt := format`) are fine, never required.
- Renaming a canonical recipe is a coordinated cross-repository change — bump canon + re-apply `justfile` + `workflows` scope in one pass.
