<!--
=== Scope: rust ===
Audience: agents and humans applying the repository-hygiene standard.
Purpose:  Own Cargo.toml canonical sections + src layout for rust-cli.
Read-when: scope=rust is invoked; or when the user asks about Cargo, clippy lints, release profile, or rust-cli layout.
=== end ===
-->

# Scope: rust

Subpath-aware. Canon covers `[package]` metadata shape, `[dev-dependencies]`, `[lints.*]`, `[profile.release]`. Per-repository owns `[dependencies]`, `[[bin]]`, and `version`.

## Owns

At repository root OR `subpaths[rust-cli]`:

- `Cargo.toml` — canon sections: `[package]` metadata, `[dev-dependencies]`, `[lints.rust]`, `[lints.clippy]`, `[profile.release]`

Per-repository (preserve when scaffolding): `[dependencies]`, `[[bin]]` entries, `[package].version`.

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
- `[dev-dependencies]` -> `assert_cmd`, `predicates`, `tempfile`, `pretty_assertions` (per-repository may extend with `insta`, `rstest`, `criterion`)

`cliff.toml` owned by [[release]] scope, not here.

## Stack matrix

| Stack tag    | Applies? | Notes          |
| ------------ | -------- | -------------- |
| `rust-cli`   | yes      | primary target |
| every other  | no       |                |

Composite -> single canonical `Cargo.toml` at root or `subpaths[rust-cli]`.

## Scaffolding notes

- Lands at root or `subpaths[rust-cli]`; substitute name / description / homepage / documentation / keywords / license
- Merge into existing `Cargo.toml` section-by-section — preserve `[dependencies]`, `[[bin]]`, `[package].version`
- License flip MIT -> dual must coordinate with [[codebase-structure]] (LICENSE files); canon does not flip both sides automatically
- Workspace (multi-crate) layouts not covered today — fall back to root template and adapt by hand

## Things to know

- Layout: `src/main.rs` is canonical; additional binaries live at `src/bin/<name>.rs`
- Unit tests inline via `#[cfg(test)]`; integration tests under `tests/`
- `rustfmt.toml` / `clippy.toml` not part of canon — lints live in `Cargo.toml`; leave any present files alone
- `[dev-dependencies]` are additive — extend freely; don't drop the canonical set
- `Cargo.lock` committed for `[[bin]]` crates but not owned by this scope
