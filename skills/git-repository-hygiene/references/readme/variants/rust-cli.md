<!--
=== Variant: rust-cli ===
Audience: agents and humans applying the git-repository-hygiene standard.
Purpose:  README rules and hero template for rust CLI repositories.
Read-when: Writing or auditing a README in a repository tagged `rust-cli`.
=== end ===
-->

# Variant: rust-cli

Signal: `Cargo.toml` + release workflow.

## Badge row

License -> Rust -> Release -> CI -> Coverage (if any) -> StandWithUkraine.

## Sections (in order)

1. Hero (H1 + optional logo `height=200`)
2. Badge row
3. Tagline (only if logo)
4. Demo asset (centered GIF) if visible UX
5. `## Overview`
6. `### Features` — required
7. `## Installation` — brew / scoop / curl / cargo stack
8. `## Usage` — code fences with `shell` tags
9. `## Commands` or `## Available destinations` — if multi-command CLI
10. `## About the name` — if non-English name
11. `## Thanks` — optional

## Installation block (canonical)

````markdown
## Installation

Via Homebrew:

```shell
brew install <owner>/tap/<binary>
```

Via Scoop:

```shell
scoop install <binary>
```

Via install script:

```shell
curl -fsSL https://raw.githubusercontent.com/<owner>/<repository>/main/install.sh | sh
```

Via cargo:

```shell
cargo install <binary>
```
````

Drop installers the repository doesn't actually support. Don't list `brew` if no tap exists.

## Hero template

```markdown
# <binary>

<p align="left">
  <a href="https://github.com/<owner>/<repository>/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/badge/License-MIT-0A6847?style=flat-square&logo=opensourceinitiative&logoColor=white"></a>
  <a href="https://www.rust-lang.org"><img alt="Rust" src="https://img.shields.io/badge/Rust-Stable-F74C00?style=flat-square&logo=rust&logoColor=white"></a>
  <a href="https://github.com/<owner>/<repository>/releases/latest"><img alt="Release" src="https://img.shields.io/github/v/release/<owner>/<repository>?style=flat-square&color=4856CD&logo=github&logoColor=white&label=Release"></a>
  <a href="https://github.com/<owner>/<repository>/actions"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/<owner>/<repository>/ci.yaml?style=flat-square&color=0A6847&logo=githubactions&logoColor=white&label=CI&branch=main"></a>
  <a href="https://stand-with-ukraine.pp.ua/"><img alt="StandWithUkraine" src="https://img.shields.io/badge/Support-Ukraine-FFC93C?style=flat-square&labelColor=07689F"></a>
</p>
```
