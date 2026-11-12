# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Read First

- `instructions/` is the source of truth for the author's **global** agent rules - Kasetto syncs each file into `~/.claude/CLAUDE.md` as a managed block, so editing one changes how every agent session behaves, everywhere. Higher-stakes than a skill edit
- A malformed frontmatter block, or a skill directory without a `SKILL.md`, breaks the whole site build in `pivoshenko.sites`, not just one card

## What This Repository Is

A catalog of agent **skills**, **MCPs**, and **instructions**, distributed to local agent configs by [Kasetto](https://github.com/pivoshenko/kasetto). The catalog is rendered at `ai.pivoshenko.dev` by a site that lives elsewhere (see Site). The README has the full picture.

It is a content-only repository. The parts:

- **Content** - `skills/`, `mcps/`, `instructions/`, `kasetto.yaml` and `tags.json`. Markdown and JSON, no build step, consumed by Kasetto and the site. Retired content is deleted rather than kept aside - git history holds it
- **Scripts** - `scripts/`, stdlib-only Python 3 linters that check the content contract. They run from the repository root with whatever `python3` is on PATH, so there is no virtualenv, lockfile or third-party import - the hand-rolled frontmatter and `kasetto.yaml` parsers in `lib.py` exist for that reason. Each linter is run as `python3 scripts/lint_<kind>.py`, which puts `scripts/` on `sys.path` so `lib` resolves

The content is the product. The site is a viewer for it, and it is not in this repository.

## Commands

`just --list` for the full set, `just check` (lint, then test) is the pre-PR gate and reproduces CI; the table is in `CONTRIBUTING.md`. Two recipes need a note:

- `just test` is a no-op only while the `.no-tests` sentinel at the repository root exists; delete the sentinel when tests are added and the recipe fails loudly until a real command replaces it
- `just lint` is the aggregate of the three content linters: `lint-skills`, `lint-mcps` and `lint-instructions`

## Content Architecture

### Skills

One directory per skill under `skills/`, each with a `SKILL.md` and optional `references/`, `scripts/`, `assets/`, `preview/` subdirectories. `SKILL.md` holds instructions only - any artifact an agent copies out or matches its output against (body template, report format, worker brief, task shape) belongs in `references/` and is linked by relative path, because `SKILL.md` loads in full on every trigger while a reference is read only when its step runs. The rule is in `CONTRIBUTING.md`. The `SKILL.md` frontmatter is the contract the site and Kasetto both read, enforced by `just lint-skills` - copy its shape from an existing skill:

- `description` is a routing document, not a summary - it must enumerate the literal phrases that should trigger the skill, and name the boundary against any neighbouring skill it could be confused with
- `tags` drives the site's filter UI; local skills use frontmatter tags, external ones fall back to the `skills` (per slug) and `sources` (per repository) tables in `tags.json`, and local MCPs take theirs from its `mcps` table. The site reads `tags.json` at build, and `just lint-skills` warns when an external skill named in `kasetto.yaml` matches neither table - it would otherwise render as a card with no chips and be unreachable by any filter
- `updated_at` is the site's primary sort key, newest first

Body style across existing skills is terse and imperative: an `## Flow` of numbered steps, `->` for consequence, bolded section refs, and a `Why -> ...` clause attached to any rule whose reason is non-obvious. Match it rather than writing prose.

### Instructions

One Markdown file per rule under `instructions/`, same frontmatter shape minus the directory. Descriptions are framed as guardrails ("Guardrail against ...", "Guardrail on ..."), stating what the rule prevents.

### MCPs

One JSON file per server under `mcps/`, each a bare `{"mcpServers": {...}}` block. Secrets are Kasetto placeholders (`${kst_github_token}`), never literals.

The site derives a transport (`http` when the server has a `url`, else `stdio`), a target, and the placeholder names from each definition, and shows the raw file verbatim. Because the secrets are placeholders, publishing the file verbatim is safe - a literal would leak.

Note the asymmetry: the site lists **every** `mcps/*.json` as local, while Kasetto only distributes the ones named in `kasetto.yaml`. A file sitting in the directory but missing from the config appears on the site without ever being synced.

### kasetto.yaml

Declares what gets pulled where. Local skills and instructions use `source: https://github.com/pivoshenko/pivoshenko.ai` with `"*"`, so anything added under `skills/` or `instructions/` is picked up without editing the config. MCPs are named one by one. External entries pin a repository, optional `sub-dir` and `branch`, and an explicit skill list.

## Site

The site lives in the private `pivoshenko.sites` monorepo under `sites/ai`. At build time it reads `skills/`, `mcps/`, `instructions/`, `kasetto.yaml` and `tags.json` from this repository: locally by copying the sibling checkout, on Vercel by shallow-cloning this public repo. The Vercel project is not connected to this repository. A push to `main` touching those paths triggers `.github/workflows/deploy.yaml`, which calls the Vercel deploy hook stored as the `VERCEL_DEPLOY_HOOK` secret.

Consequences worth knowing:

- Content edits only show up after that rebuild
- `skills/` entries are sorted by `updated_at`, newest first
- The frontmatter shape and `tags.json` are contracts the site parses, so changing them means changing the monorepo too

## Conventions

Commits, branches, CI, and the skill-authoring rule are covered in `CONTRIBUTING.md`. Commit scopes used here are the asset kind or area (`skills`, `mcps`, `instructions`, `justfile`).
