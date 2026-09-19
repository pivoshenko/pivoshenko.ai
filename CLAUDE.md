# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Read First

- `instructions/` is the source of truth for the author's **global** agent rules - Kasetto syncs each file into `~/.claude/CLAUDE.md` as a managed block, so editing one changes how every agent session behaves, everywhere. Higher-stakes than a skill edit
- `AGENTS.md` is a symlink to this file, so any edit here is also the AGENTS.md edit - never replace the symlink with a copy
- Styling and config are inherited from the pinned `pivoshenko.ui` package, whose own `CLAUDE.md` documents the design-token and semantic helper-class vocabulary - read that rather than inferring the contract from the markup here. A site picks its accent with `SiteLayout`'s `accent` prop (`peach` here), never by overriding colours locally. Never add a local override to fix something that belongs upstream - fix it upstream and bump the pinned tag. `just update` will not move the pin, because it is a git ref rather than a version range
- A malformed frontmatter block, or a skill directory without a `SKILL.md`, breaks the whole site build, not just one card

## What This Repository Is

A catalog of agent **skills**, **MCPs**, and **instructions**, distributed to local agent configs by [Kasetto](https://github.com/pivoshenko/kasetto), plus a Next.js site that renders the catalog at `ai.pivoshenko.dev`. The README has the full picture.

Two halves, and it matters which one a change belongs to:

- **Content** - `skills/`, `mcps/`, `instructions/`, `archive/`, and `kasetto.yaml`. Markdown and JSON, no build step, consumed by Kasetto. `plugins/` sits alongside them as content the site renders but Kasetto never touches, and is the one executable thing here
- **Site** - `site/`, a Next.js app that reads the content at build time and renders it
- **Scripts** - `scripts/`, stdlib-only Python 3 linters that check the content contract. They run from the repository root with whatever `python3` is on PATH, so there is no virtualenv, lockfile or third-party import - the hand-rolled frontmatter and `kasetto.yaml` parsers in `lib.py` exist for that reason. Each linter is run as `python3 scripts/lint_<kind>.py`, which puts `scripts/` on `sys.path` so `lib` resolves

The content is the product. The site is a viewer for it.

## Commands

`just --list` for the full set, `just check` (lint, then test, then build) is the pre-PR gate and reproduces CI; the table is in `CONTRIBUTING.md`. Three recipes do not do what their names suggest:

- `just format` runs the site's `check` script (Biome `check --write`), not its `format` script
- `just test` is a no-op only while the `.no-tests` sentinel at the repository root exists; delete the sentinel when tests are added and the recipe fails loudly until a real command replaces it
- `just lint-next` is the site's Biome lint, not a Next.js linter. `just lint` is the aggregate above it: the three content linters (`lint-skills`, `lint-mcps`, `lint-instructions`) first, then `lint-next`

## Content Architecture

### Skills

One directory per skill under `skills/`, each with a `SKILL.md` and optional `references/`, `scripts/`, `assets/`, `preview/` subdirectories. `SKILL.md` holds instructions only - any artifact an agent copies out or matches its output against (body template, report format, worker brief, task shape) belongs in `references/` and is linked by relative path, because `SKILL.md` loads in full on every trigger while a reference is read only when its step runs. The rule is in `CONTRIBUTING.md`. The `SKILL.md` frontmatter is the contract the site and Kasetto both read, enforced by `just lint-skills` - copy its shape from an existing skill:

- `description` is a routing document, not a summary - it must enumerate the literal phrases that should trigger the skill, and name the boundary against any neighbouring skill it could be confused with
- `tags` drives the site's filter UI; local skills use frontmatter tags, external ones fall back to the lookup tables in `site/lib/external-tags.ts`. `just lint-skills` warns when a named external skill matches neither table - it would otherwise render as a card with no chips and be unreachable by any filter
- `updated_at` is the site's primary sort key, newest first

Body style across existing skills is terse and imperative: an `## Flow` of numbered steps, `->` for consequence, bolded section refs, and a `Why -> ...` clause attached to any rule whose reason is non-obvious. Match it rather than writing prose.

### Instructions

One Markdown file per rule under `instructions/`, same frontmatter shape minus the directory. Descriptions are framed as guardrails ("Guardrail against ...", "Guardrail on ..."), stating what the rule prevents.

### MCPs

One JSON file per server under `mcps/`, each a bare `{"mcpServers": {...}}` block. Secrets are Kasetto placeholders (`${kst_github_token}`), never literals.

The site reads each definition rather than just its filename: `readServers()` in `site/lib/data.ts` derives a transport (`http` when the server has a `url`, else `stdio`), a target, and the placeholder names it references, and `/mcps` draws those as a map and shows the raw file in a config dialog. Because the secrets are placeholders, publishing the file verbatim is safe - a literal would leak.

Note the asymmetry: `site/lib/data.ts` lists **every** `mcps/*.json` as local, while Kasetto only distributes the ones named in `kasetto.yaml`. A file sitting in the directory but missing from the config appears on the site without ever being synced.

### Plugins

One directory per agent host under `plugins/`, then one per plugin (`plugins/<host>/<slug>/`), each carrying a `<host>-plugin.toml` manifest. Kasetto does not distribute plugins - it knows only skills, MCPs and instructions - so `plugins/` never appears in `kasetto.yaml`, nothing syncs it, and no content linter covers it. The site does read it: `readLocalPlugins()` in `site/lib/data.ts` walks those two levels and parses the manifest's flat scalar head with a hand-rolled parser, for the same reason the Python linters hand-roll theirs - no TOML dependency. A plugin is paired with `assets/<host>_<slug>_preview.png`, dots in the slug replaced by underscores, when that file exists. Next only serves what is under `public/`, so `site/scripts/sync-previews.mjs` copies `assets/*.png` into the gitignored `site/public/previews/` and both `dev` and `build` call it before Next - explicitly, not through a `pre` lifecycle hook, because pnpm does not run those. The install story is the README's.

### kasetto.yaml

Declares what gets pulled where. Local skills and instructions use `source: https://github.com/pivoshenko/pivoshenko.ai` with `"*"`, so anything added under `skills/` or `instructions/` is picked up without editing the config. MCPs are named one by one. External entries pin a repository, optional `sub-dir` and `branch`, and an explicit skill list.

### archive/

Retired content, mirroring the live layout (`archive/skills/`, `archive/instructions/`, `archive/scripts/`). Kasetto never reads it, so moving a skill or instruction here needs no `kasetto.yaml` edit - the local entries are wildcards scoped to the live directories. Retiring an MCP also means dropping its name from the config. The site renders `archive/` in a separate archived section; retiring something means moving it here and explaining why in the README's Archive list, not deleting it.

## Site Architecture

`site/lib/data.ts` is the piece to read first. At build time it walks **up out of `site/`** (`ROOT = join(process.cwd(), '..')`) and reads the repository itself: it parses `kasetto.yaml`, globs local skill/instruction frontmatter and MCP JSON, reads each MCP definition's servers and raw config, walks `plugins/`, synthesizes entries for external sources (a `"*"` entry becomes one wildcard card), drops externals whose slug already exists locally, and sorts everything by `updated_at`. `loadCatalog()` returns the whole catalog in one object, memoized behind a module-level cache, because several route segments ask for it within a build.

### Routes

Four, all statically prerendered:

- `/` - the landing, and the only page with no catalog on it. Hero, `components/principles.tsx`, `components/browse.tsx`, and the plugin showcases. It carries no cards: principles are an editorial three-up over a rule, browse is a row list, and the plugin's screenshot is cropped to a 16/10 frame with a fade rather than shown whole
- `/skills` - the skills catalog plus archived skills
- `/mcps` - `components/mcp-map.tsx` over the server catalog
- `/instructions` - the instructions catalog plus archived instructions

### Shared Pieces

- `components/entry.ts` - the `Entry` shape every card, dialog and filter reads, plus one builder per kind. `locate()` is the rule that our own files resolve to a path and a `tree/main` link while an external entry stops at the repository, whose layout is not ours to know
- `components/entry-catalog.tsx` - the only client component of any size. Filters (search, source, tags, reset), the own/external split, the archived block, and the card dialog. The filter bar hides itself below thirteen entries unless `filters` says otherwise; search and source AND together, tags OR within themselves
- `components/catalog-hero.tsx` - the full-bleed band each route opens with
- `components/mcp-map.tsx` - the hub-and-spoke diagram. Links are one SVG underneath, nodes are real `<button>`s on top, and a `md:` gate swaps the ring for a list rather than measuring the viewport in JS

Consequences worth knowing:

- The site is a build-time projection of the repository, so content edits only show up after a rebuild
- `PageShell` gives `main` no width of its own. A page alternates full-bleed bands (`Hero`, a canvas) with `PageBody`, which is the constrained container. A page that forgets `PageBody` runs edge to edge
- `app/layout.tsx` owns the nav for every route. A `/#fragment` entry is scroll-spied by `Nav` **only while the reader is on that route**, so the landing's section ids and those hrefs are one contract - renaming a section means editing both, or a nav entry silently goes dead
- Vercel builds with `site/` as the project root, which still leaves the full repository checked out one level up

## Conventions

Commits, branches, CI, and the skill-authoring rule are covered in `CONTRIBUTING.md`. Commit scopes used here are the asset kind or area (`skills`, `mcps`, `instructions`, `justfile`, `site`).
