<!--
=== Scope: codebase-structure ===
Audience: agents and humans applying the repository-hygiene standard.
Purpose:  Own the legal + community + ignore baseline — LICENSE(s), CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, .gitignore.
Read-when: scope=codebase-structure is invoked; or when the user asks about licenses, dual-licensing, .gitignore, or community health files.
=== end ===
-->

# Scope: codebase-structure

Legal + community health + ignore baseline. Single owner for `.gitignore` (composes baseline + per-language blocks).

## Owns

- `LICENSE` (single-license) OR `LICENSE-MIT` + `LICENSE-APACHE` + `LICENSE` pointer (dual-license)
- `CONTRIBUTING.md`
- `SECURITY.md`
- `CODE_OF_CONDUCT.md`
- `.gitignore` (entire file — single owner)

## Canon

- `assets/LICENSE-MIT` — MIT canon
- `assets/LICENSE-APACHE` — Apache-2.0 canon
- `assets/LICENSE-dual` — pointer LICENSE referencing both
- `assets/CONTRIBUTING.md`
- `assets/SECURITY.md` — contact `contact@pivoshenko.dev` baked in as default; overridable per-repository
- `assets/CODE_OF_CONDUCT.md`
- `assets/.gitignore.base` — universal baseline (OS, editors, env files)
- `assets/gitignore/<lang>.gitignore` — per-language blocks (python, rust, node)

Tokens: `{{owner}}`, `{{year}}` in license headers.

## Stack matrix

| Stack tag    | Applies? | Notes                                       |
| ------------ | -------- | ------------------------------------------- |
| `python-lib` | yes      | python.gitignore block                      |
| `rust-cli`   | yes      | rust.gitignore block; consider dual-license |
| `next-site`  | yes      | node.gitignore block                        |
| `shared-pkg` | yes      | node.gitignore block                        |

Dual-license decision: per-repository opt-in -> ship MIT + APACHE + pointer; else single LICENSE from MIT.

## Drift detection

- `missing` -> any owned file absent (license, CONTRIBUTING, SECURITY, COC, .gitignore)
- `drift` -> file diff vs canon; for `.gitignore`: missing/altered baseline or language block
- `extra` -> user blocks between canonical `### <Lang> ###` markers are preserved; hand-edits INSIDE a marked block flagged + warned (overwritten on fix)
- `external` -> n/a

## Edge cases

- `.gitignore` composition order: baseline first, then language blocks in alphabetical order, each wrapped in `### <Lang> ###` / `### End <Lang> ###` markers (gitignore.io style)
- Block replacement is idempotent — re-running fix never duplicates markers
- User content between blocks (outside markers) preserved verbatim
- `CHANGELOG.md` is NOT owned here — release scope owns format; this scope only checks presence on bootstrap
- License switch (MIT -> dual) is a manual decision; agent surfaces drift but does not auto-switch without explicit confirmation
- SECURITY.md contact override -> per-repository file becomes `extra`, canon comparison disabled for that file
