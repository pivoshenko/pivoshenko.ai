<!--
=== Scope: release ===
Audience: agents and humans applying the git-repository-hygiene standard.
Purpose:  Own declarative release config (cliff.toml) + CHANGELOG.md presence. v1 is declarative-only; execution lives in workflows + just release.
Read-when: scope=release is invoked; or when the user asks about cliff, changelog, semver, tagging, PyPI/crates.io publish, or release strategy.
=== end ===
-->

# Scope: release

v1 covers CONFIG, not EXECUTION. Cutting a release is `just release <semver>` (recipe owned by [[justfile]] scope) calling `release.yaml` (owned by [[workflows]] scope). One tool everywhere: git-cliff.

**Not applicable under archetype `puzzles`, full stop.** Solution repositories (adventofcode / leetcode / kaggle / exercism) are not shipped products — this scope does not apply: no `cliff.toml`, no `CHANGELOG.md`, no tag flow.

## Owns

- `cliff.toml` at repository root
- `CHANGELOG.md` presence (format owned; content is generated)

## Canon

- `assets/cliff.toml` — language-agnostic git-cliff config (python, rust, shared-pkg, next)
- `assets/CHANGELOG.template.md` — initial seed for new repositories

Tokens: `{{name}}`, `{{repository}}`.

SemVer rules (encoded in cliff config):

- `feat:` -> MINOR
- `feat!:` / `BREAKING CHANGE:` -> MAJOR
- `fix:` / `perf:` / `refactor:` -> PATCH
- `docs:` / `test:` / `ci:` / `build:` / `chore:` -> no bump (PATCH only via `--bumped-version` override)
- `revert:` -> PATCH (`revert!:` -> MAJOR)

Tag convention: SemVer with leading `v` (`v1.2.3`).

## Stack matrix

| Stack tag    | Applies? | Publish flow (executed by `just release`)                                                                                        |
| ------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `python-lib` | yes      | cliff version -> uv version -> cliff changelog -> tag -> uv build -> uv publish (PyPI)                                           |
| `rust-cli`   | yes      | cliff version -> sed Cargo.toml -> cargo update -> cliff changelog -> tag -> cargo publish (crates.io)                           |
| `shared-pkg` | yes      | cliff version -> jq package.json -> cliff changelog -> tag -> push -> GitHub Release (git-tag only; no registry publish)         |
| `next-site`  | yes      | cliff version -> jq package.json -> cliff changelog -> tag -> push -> GitHub Release (Vercel deploys separately on push to main) |

Root-only. Composite -> ONE `cliff.toml` per repository.

Archetype `puzzles` -> scope NOT APPLICABLE; skip entirely.

## Scaffolding notes

- `cliff.toml` lands at repository root; substitute `{{name}}`, `{{repository}}`
- `CHANGELOG.md` seeded once from template, then NEVER hand-edited — git-cliff regenerates on release
- Existing legacy config (`[tool.semantic_release]` in pyproject, `release-please-config.json`, `.releaserc*`) must be removed first; canon does not auto-migrate
- Publish tokens (`PYPI_API_TOKEN`, `CARGO_REGISTRY_TOKEN`) live in [[workflows]] scope — set via `gh secret set`
- Skip entirely for puzzles archetype

## Things to know

- shared-pkg has no registry publish — `just release` only tags + pushes; consumers pin by git tag
- next-site has no registry publish either — release flow creates version markers (tags + GitHub Release) for rollback/audit; Vercel handles the actual deploy on push to `main` independently
- `feat!:` and `BREAKING CHANGE:` both honored; either triggers MAJOR
- Pre-1.0 repositories: `feat!:` always means MAJOR — canon does not downgrade
- Re-release of an existing tag is refused by the recipe (`gh release view v<x>` non-empty)
- `cliff.toml` regex updates (commit parsing) -> bump canon once, re-apply across portfolio
