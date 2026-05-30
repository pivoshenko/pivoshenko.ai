<!--
=== Scope: justfile ===
Audience: agents and humans applying the repository-hygiene standard.
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

| Stack tag    | Applies? | Required recipes                                            |
| ------------ | -------- | ----------------------------------------------------------- |
| `python-lib` | yes      | install, format, lint, check, test, update                  |
| `rust-cli`   | yes      | install, format, lint, check, test, build, update, release  |
| `next-site`  | yes      | install, dev, format, lint, check, build, start, update     |
| `shared-pkg` | yes      | install, format, lint, check, build, update, release        |

Composite -> root `justfile` may exist for cross-cutting recipes; per-stack `justfile` lives at `subpaths[tag]`.

## Drift detection

- `missing` -> no `justfile` at expected path
- `drift` -> required recipe header absent for this variant
- `extra` -> repository-specific recipes -> preserved, never pruned
- `external` -> n/a

## Edge cases

- Fix mode inserts MISSING recipe headers with TODO bodies (`# TODO: implement`) — never overwrites existing implementations
- Renaming a canonical recipe is a coordinated cross-repository change — bump canon + re-apply `justfile` + `workflows` scope in one pass
- Recipes never accept positional args except where listed (`just release <semver>`)
- Recipes never write outside repository root
- Composite root justfile fan-out (`just lint` -> calls each subpath's `just lint`) is allowed; canon does not mandate the fan-out body
- Aliases (e.g. `alias fmt := format`) are `extra`, allowed, never required
