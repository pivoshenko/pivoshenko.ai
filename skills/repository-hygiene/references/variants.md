<!--
=== Stacks ===
Audience: agents and humans applying the repository-hygiene standard.
Purpose:  Define the stack tag taxonomy, composite-detection rules, and subpath handling so scopes can be routed per repository.
Read-when: Classifying a repository, deciding which scopes apply.
=== end ===
-->

# Stacks

The skill is **stack-oriented** — it standardises *technical stacks* (python, rust, next, shared-pkg), not repository archetypes (dotfile bundles, theme ports, profile READMEs, etc.). Repositories outside the four stacks are out of scope.

Stacks = **tags**, not labels. Each repository carries a SET of tags. Detected from repository-root signals at invocation time. Scopes apply per-tag: "does this scope apply to any of this repository's tags?" — not "what is this repository's single variant?".

## Tags

| Tag          | Signal                                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------------------------- |
| `python-lib` | `pyproject.toml` with `[project]` table                                                                         |
| `rust-cli`   | `Cargo.toml` with `[[bin]]`                                                                                     |
| `next-site`  | `next.config.{ts,js}` + `app/` directory                                                                        |
| `shared-pkg` | `package.json` w/o publish workflow, distributed by git tag (consumers pin `github:<owner>/<repository>#<tag>`) |

## Composite detection

Multiple tags per repository is normal. Examples:

- `[python-lib, rust-cli]` — a repository that ships both a Python lib and a Rust CLI from the same codebase
- `[next-site, shared-pkg]` — a Next.js site with an embedded shared component package (subpath for the package)

Scope application logic: "if scope `X` applies to ANY tag in this repository's tag set AND scope `X` is not skipped, apply scope `X`."

## Subpath handling

Composite repositories may operate stack scopes against subdirectories rather than root. Declare per-tag subpaths inline when invoking the skill:

```yaml
subpaths:
  shared-pkg: packages/ui
```

### Root-only scopes (always operate at repository root, ignore subpaths)

- `editorconfig` — one `.editorconfig` at root; globs cover subpaths
- `codebase-structure` — `LICENSE`, `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, top-level `.gitignore`
- `github-meta` — `CODEOWNERS`, `FUNDING.yaml`, repository settings
- `labels` — `.github/` is one-per-repository
- `issue-templates` — same
- `release` — one release line per repository

### Subpath-aware scopes (operate at `subpaths[tag]` when set, else root)

- `python`, `rust`, `next`, `shared-pkg`, `justfile`

A composite carries one canonical manifest per stack at its subpath. Root `justfile` may exist alongside subpath justfiles for cross-cutting recipes.

### Workflows (matrix-aware)

`workflows` scope writes ONE root `.github/workflows/` directory. For composite repositories, generates per-stack workflows with `working-directory:` keyed off the subpath. Never nested `.github/` per subpath.

## Opt-outs

Per-invocation `--skip=<scope>,<scope>`.
