<!--
=== Scope: rust ===
Audience: agents and humans applying the repository-hygiene standard.
Purpose:  Own Cargo.toml canonical sections + src layout for rust-cli.
Read-when: scope=rust is invoked; or when the user asks about Cargo, clippy lints, release profile, or rust-cli layout.
=== end ===
-->

# Scope: rust

Subpath-aware. Canon owns `[package]` metadata shape, `[dev-dependencies]`, `[lints.*]`, `[profile.release]`. Per-repository keeps `[dependencies]`, `[[bin]]`, and `version`.

## Owns

At repository root OR `subpaths[rust-cli]`:

- `Cargo.toml` — canon-owned sections: `[package]` metadata, `[dev-dependencies]`, `[lints.rust]`, `[lints.clippy]`, `[profile.release]`

Per-repository (NOT canon-owned, preserved on fix): `[dependencies]`, `[[bin]]` entries, `[package].version`.

## Canon

- `assets/cargo/Cargo.toml` — template

Tokens:

- `{{name}}` — crate name
- `{{description}}` — one-liner
- `{{homepage}}` — typically `https://github.com/<owner>/<name>`
- `{{documentation}}` — typically `https://docs.rs/<name>`
- `{{keywords}}` — TOML array
- `{{license}}` — `"MIT"` or `"MIT OR Apache-2.0"`

Hard-coded canon:

- `edition = "2021"`
- `authors` per canon
- `[lints.rust] unsafe_code = "forbid"`
- `[lints.clippy] dbg_macro = "warn"`, `todo = "warn"`
- `[profile.release]` -> `codegen-units = 1`, `lto = "fat"`, `panic = "abort"`, `strip = "symbols"`
- `[dev-dependencies]` -> `assert_cmd`, `predicates`, `tempfile`, `pretty_assertions` (per-repository may extend with `insta`, `rstest`, `criterion`; may not remove canonical entries)

`cliff.toml` owned by release scope, not here.

## Stack matrix

| Stack tag    | Applies? | Notes          |
| ------------ | -------- | -------------- |
| `rust-cli`   | yes      | primary target |
| every other  | no       |                |

Composite -> single canonical `Cargo.toml` at root or `subpaths[rust-cli]`.

## Drift detection

- `missing` -> no `Cargo.toml` at expected path
- `drift` -> canon-owned section diff (lints relaxed, profile.release weakened, dev-dep removed, edition wrong)
- `extra` -> repository-added sections (workspace, features beyond canon) -> preserved, flagged
- `external` -> `Cargo.lock` absent for a `[[bin]]` crate -> warning (committed but not owned)

## Edge cases

- Per-repository fields owned: `version`, `dependencies`, `[[bin]]` table entries
- Layout: `src/main.rs` is canonical; additional binaries live at `src/bin/<name>.rs`
- Unit tests inline via `#[cfg(test)]`; integration tests under `tests/` directory
- Workspace repositories (multi-crate) -> not yet covered; fall back to root canon, flag composite layout for upstream
- `rustfmt.toml` / `clippy.toml` -> not owned today (lints live in `Cargo.toml`); files present -> `extra`
- License string flips MIT -> dual: must coordinate with codebase-structure scope (LICENSE files) — canon does not flip automatically
- `[dev-dependencies]` extension allowed (additive); removal of canonical entries -> `drift`
