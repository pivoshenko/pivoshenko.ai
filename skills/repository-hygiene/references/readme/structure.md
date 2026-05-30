<!--
=== Canonical README structure ===
Audience: agents and humans applying the repository-hygiene standard.
Purpose:  Define the reader-funnel section order and the rules for each section of a README.
Read-when: Writing or auditing a README, or when a variant doc defers to "see structure.md".
=== end ===
-->

# Canonical section structure

Reader-funnel order: hero -> what -> why-care -> how-install -> how-use -> opinions -> deep dive -> story -> credit. Each cut leaves coherent picture.

## 1. Hero — H1 + optional logo

Default: H1 = repository name verbatim, lowercase: `# <repository-name>`, not a Title-Cased rewrite. Convention for branded repositories: lowercase dotted names (`<owner>.<surface>`, e.g. `<owner>.ui`) — preserve the repository's lowercase form.

Exception: when the repository slug is opaque, generic, or non-descriptive (e.g. `adventofcode`, `dotfiles`, `scratch`), a human-readable Title-Cased H1 is allowed (e.g. `# Advent of Code Solutions`). Rule of thumb: if a reader landing on the README cold cannot tell what the project is from the slug alone, rewrite. Otherwise keep the slug verbatim.

Never add possessives (`My …`), emoji, or version suffixes to the H1.

Logo only if `assets/logo.svg` (or similar) exists. Centered in `<div align="center">`. Height per repository type:

- Python libs / CLIs: `height=200`
- Sites / shared pkgs: `height=250`
- Wide marks: `width=450`

Always `?raw=true` (lowercase) for GitHub raw URLs.

Example:

```markdown
# <repository-name>

<div align="center">
  <img src="https://github.com/<owner>/<repository>/blob/main/assets/logo.svg?raw=true" height="200" alt="<repository-name> logo">
</div>
```

## 2. Badge row

See `badges.md` for full spec. Layout:

- Logo above -> `<p align="center">`
- No logo (minimal sites) -> `<p align="left">`

Always ends with StandWithUkraine. See `../assets/standwithukraine.snippet.md`.

## 3. Tagline (italic, centered)

Only if logo present. One sentence. Mirrors GitHub repository `description` field minus leading emoji.

```html
<p align="center"><em>One-line value prop, no hype.</em></p>
```

No logo -> skip. H1 + GitHub description carry it.

## 4. Demo asset

Optional. Centered GIF or PNG showing UX. Only for repositories with visible UX (CLIs, sites with distinctive UI).

```markdown
<div align="center">
  <img src="https://github.com/<owner>/<repository>/blob/main/assets/demo.gif?raw=true" alt="demo">
</div>
```

## 5. `## Overview` — Required

1–3 short paragraphs. Lead with **what it is** + **precise problem it solves**. Backticks around package name. Practitioner voice.

Reference link footnotes allowed:

```markdown
## Overview

`<pkg>` syncs project dependencies to their latest compatible versions, then writes the result back to `pyproject.toml`. Uses [uv][uv] under the hood — no pip resolver, no lockfile drift.

[uv]: https://github.com/astral-sh/uv
```

## 6. `### Features` — Required for libs/tools

Bullet list, bold lead-in:

```markdown
### Features

- **Built for the uv ecosystem** — reuses uv's resolver, respects existing constraints.
- **Atomic writes** — `pyproject.toml` is rewritten in one pass; no half-updated state.
- **Zero-config** — runs in any project with a `pyproject.toml`.
```

Optional for sites. Skip if repository is just a config dump.

## 7. `## Installation` — Required when applicable

NEVER `## Install`. Always `## Installation` (noun-phrase, matches `## Overview` / `## Usage`).

Stack multiple installers in priority order. Python:

````markdown
## Installation

```shell
uv tool install <pkg>
```

Or via pipx:

```shell
pipx install <pkg>
```

Or via pip:

```shell
pip install <pkg>
```
````

Rust: brew -> scoop -> curl -> cargo (in that order).

Sites / shared packages: stack-specific (see `variants/`).

## 8. `## Usage` / `## Examples`

Code fences with explicit language tag (`shell`, `python`, `ts`, `jsonc`, `toml`). Imperative present in step lists.

```markdown
## Usage

Run inside any uv project:

​```shell
<pkg>
​```

Add `--dry-run` to preview without writing.
```

Larger walkthrough -> `## Examples` instead.

## 9. `## Main principles` — Optional

For opinionated repositories where the design philosophy is part of the value (e.g. a shared component package with strict invariants). Bullets stating philosophy:

```markdown
## Main principles

- **Reproducible** — every machine I touch ends up identical.
- **Inspectable** — every config plain-text, in git, readable in 30 seconds.
- **Minimal** — no tool that I don't use weekly.
```

## 10. Stack-specific sections

Defined per stack in `variants/<stack>.md`. Examples:

- `shared-pkg` -> `## Subpaths` + `## Consumption`
- `rust-cli` -> `## Available destinations` / `## Commands`
- `next-site` -> `## Stack`

## 11. `## About the name` — Encouraged for non-English-named repositories

Italic word + IPA-ish pronunciation in brackets + etymology paragraph. Strong brand signal.

```markdown
## About the name

*Morok* [моро́к] — Ukrainian for *gloom* or *deep darkness*. Pure black surfaces, so the name fits.
```

## 12. `## Thanks` / `## Credits` — Optional

Linked inspirations (Catppuccin, uv, etc.).

```markdown
## Thanks

- [Catppuccin](https://github.com/catppuccin) — palette philosophy.
- [astral-sh/uv](https://github.com/astral-sh/uv) — the runtime this builds on.
```

## What's NOT a section

- `## License` — never. License badge in row carries it.
- `## Contributing` — only for repositories that actually accept PRs and have a written process. Otherwise skip.
- `## Roadmap` — link to GitHub issues/milestones instead.
- `## Code of Conduct` — link from CONTRIBUTING.md or repository settings, not README.
- TOC — never. Stacks are too short to need one.
