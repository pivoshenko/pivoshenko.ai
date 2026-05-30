<!--
=== Scope: release ===
Audience: agents and humans applying the repository-hygiene standard.
Purpose:  Own declarative release config (cliff.toml) + CHANGELOG.md presence. v1 is declarative-only; execution lives in workflows + just release.
Read-when: scope=release is invoked; or when the user asks about cliff, changelog, semver, tagging, PyPI/crates.io publish, or release strategy.
=== end ===
-->

# Scope: release

v1 owns CONFIG, not EXECUTION. Cutting a release is `just release <semver>` (recipe owned by `justfile` scope) calling `release.yaml` (owned by `workflows` scope). One tool everywhere: git-cliff.

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

## Drift detection

- `missing` -> `cliff.toml` absent (or `CHANGELOG.md` absent on bootstrap)
- `drift` -> byte diff vs canon
- `extra` -> legacy `[tool.semantic_release]` in pyproject, `release-please-config.json`, `.releaserc*` -> surfaced for removal (`fixable: false` until user confirms migration)
- `external` -> publish token (PYPI / CARGO_REGISTRY) absent on GitHub -> deferred to workflows scope

## Edge cases

- `CHANGELOG.md` content is generated, NEVER hand-edited — manual edits flagged + reverted on next release
- shared-pkg has no registry publish — `just release` only tags + pushes; consumers pin by git tag
- next-site has no registry publish either — the release flow creates version markers (tags + GitHub Release) for rollback/audit; Vercel handles the actual deploy on push to `main` independently of the tag
- `feat!:` and `BREAKING CHANGE:` both honored; either triggers MAJOR
- Pre-1.0 repositories: MINOR bump for breaking changes is acceptable convention but canon does NOT downgrade — `feat!:` always means MAJOR
- Re-release of an existing tag is refused by the recipe (`gh release view v<x>` non-empty)
- `cliff.toml` regex updates (commit parsing) -> bump canon once, re-apply across portfolio
