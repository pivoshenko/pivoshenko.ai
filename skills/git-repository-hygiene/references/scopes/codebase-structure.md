<!--
=== Scope: codebase-structure ===
Audience: agents and humans applying the git-repository-hygiene standard.
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

Archetype `puzzles`: applies partially. LICENSE + `.gitignore` apply normally. CONTRIBUTING / SECURITY / CODE_OF_CONDUCT typically skipped — puzzle repositories are personal, no external contribution surface.

## Scaffolding notes

- Substitute `{{owner}}` and `{{year}}` in license headers before writing.
- License switch (MIT -> dual) is a manual decision — confirm with user before scaffolding the dual-license set.
- `.gitignore` composition: baseline first, then language blocks in alphabetical order, each wrapped in `### <Lang> ###` / `### End <Lang> ###` markers (gitignore.io style). Re-applying is idempotent — never duplicates markers.
- When merging into an existing `.gitignore`: content between markers gets replaced; user content outside markers is preserved verbatim.
- `SECURITY.md` contact is overridable per-repository — once overridden, treat the local file as authoritative.
- `CHANGELOG.md` is NOT owned here — release scope owns format; this scope only ensures presence at bootstrap time.
