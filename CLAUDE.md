# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Read First

- `instructions/` is the source of truth for the author's **global** agent rules - Kasetto syncs each file into `~/.claude/CLAUDE.md` as a managed block, so editing one changes how every agent session behaves, everywhere. Higher-stakes than a skill edit
- `AGENTS.md` is a symlink to this file, so any edit here is also the AGENTS.md edit - never replace the symlink with a copy
- Styling and config are inherited from the pinned `pivoshenko.ui` package. Never add a local override to fix something that belongs upstream - fix it upstream and bump the pinned tag. `just update` will not move the pin, because it is a git ref rather than a version range
- A malformed frontmatter block, or a skill directory without a `SKILL.md`, breaks the whole site build, not just one card

## What This Repository Is

A catalog of agent **skills**, **MCP server definitions**, and **instructions**, distributed to local agent configs by [Kasetto](https://github.com/pivoshenko/kasetto), plus a Next.js site that renders the catalog at `ai.pivoshenko.dev`. The README has the full picture.

Two halves, and it matters which one a change belongs to:

- **Content** - `skills/`, `mcps/`, `instructions/`, `archive/`, and `kasetto.yaml`. Markdown and JSON, no build step, consumed by Kasetto
- **Site** - `site/`, a Next.js app that reads the content at build time and renders it

The content is the product. The site is a viewer for it.

## Commands

`just --list` for the full set, `just check` (lint, then test, then build) is the pre-PR gate and reproduces CI; the table is in `CONTRIBUTING.md`. Two recipes do not do what their names suggest:

- `just format` runs the site's `check` script (Biome `check --write`), not its `format` script
- `just test` is a no-op only while the `.no-tests` sentinel at the repo root exists; delete the sentinel when tests are added and the recipe fails loudly until a real command replaces it

## Content Architecture

### Skills

One directory per skill under `skills/`, each with a `SKILL.md` and optional `references/`, `scripts/`, `assets/`, `preview/` subdirectories. The `SKILL.md` frontmatter is the contract the site and Kasetto both read - copy its shape from an existing skill:

- `description` is a routing document, not a summary - it must enumerate the literal phrases that should trigger the skill, and name the boundary against any neighbouring skill it could be confused with
- `tags` drives the site's filter UI; local skills use frontmatter tags, external ones fall back to the lookup tables in `site/lib/external-tags.ts`
- `updated_at` is the site's primary sort key, newest first

Body style across existing skills is terse and imperative: an `## Flow` of numbered steps, `->` for consequence, bolded section refs, and a `Why -> ...` clause attached to any rule whose reason is non-obvious. Match it rather than writing prose.

### Instructions

One Markdown file per rule under `instructions/`, same frontmatter shape minus the directory. Descriptions are framed as guardrails ("Guardrail against ...", "Guardrail on ..."), stating what the rule prevents.

### MCPs

One JSON file per server under `mcps/`, each a bare `{"mcpServers": {...}}` block. Secrets are Kasetto placeholders (`${kst_github_token}`), never literals.

Note the asymmetry: `site/lib/data.ts` lists **every** `mcps/*.json` as local, while Kasetto only distributes the ones named in `kasetto.yaml`. A file sitting in the directory but missing from the config appears on the site without ever being synced.

### kasetto.yaml

Declares what gets pulled where. Local skills and instructions use `source: https://github.com/pivoshenko/pivoshenko.ai` with `"*"`, so anything added under `skills/` or `instructions/` is picked up without editing the config. MCPs are named one by one. External entries pin a repo, optional `sub-dir` and `branch`, and an explicit skill list.

### archive/

Retired content, mirroring the live layout (`archive/skills/`, `archive/instructions/`, `archive/scripts/`). Kasetto never reads it, so moving a skill or instruction here needs no `kasetto.yaml` edit - the local entries are wildcards scoped to the live directories. Retiring an MCP also means dropping its name from the config. The site renders `archive/` in a separate archived section; retiring something means moving it here and explaining why in the README's Archive list, not deleting it.

## Site Architecture

`site/lib/data.ts` is the piece to read first. At build time it walks **up out of `site/`** (`ROOT = join(process.cwd(), '..')`) and reads the repo itself: it parses `kasetto.yaml`, globs local skill/instruction frontmatter and MCP JSON, synthesizes entries for external sources (a `"*"` entry becomes one wildcard card), drops externals whose slug already exists locally, and sorts everything by `updated_at`. `loadCatalog()` returns the whole catalog in one object.

Consequences worth knowing:

- The site is a build-time projection of the repo, so content edits only show up after a rebuild
- `app/page.tsx` is a server component that calls `loadCatalog()` and splits local/external; `components/catalog.tsx` is the only client component, owning all tag filtering and search
- Vercel builds with `site/` as the project root, which still leaves the full repo checked out one level up

For design tokens and semantic utility classes, read `pivoshenko.ui`'s own `CLAUDE.md` instead of inferring the contract from the markup here.

## Conventions

Commits, branches, and CI are covered in `CONTRIBUTING.md`. Commit scopes used here are the asset kind or area (`skills`, `mcps`, `instructions`, `justfile`, `site`).
