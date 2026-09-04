# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

pivoshenko's AI agent workspace. Two things live here:

1. **Source of truth for agent config** — locally authored skills (`skills/`), MCP definitions (`mcps/`), and instruction rules (`instructions/`), plus `kasetto.yaml`, which lists both the local assets and the external upstream repos to pull from. [Kasetto](https://github.com/pivoshenko/kasetto) (`kst sync`) distributes all of it into `~/.claude/`. Instructions land in `~/.claude/CLAUDE.md` as managed blocks, so the files in `instructions/` *are* the global agent rules.
2. **`site/`** — a Next.js catalog viewer at `ai.pivoshenko.dev` that reads the files above off the parent filesystem at build time.

Most edits here are Markdown/YAML/JSON config, not code.

## Commands

All recipes run from the repo root and delegate into `site/` (`just` + `pnpm`; Node >= 24, pnpm 10.30.3 pinned via `packageManager`).

```shell
just install   # pnpm -C site install
just dev       # next dev --turbopack
just check     # biome check . --write, then next build (run before committing)
just lint      # biome lint . (read-only, what CI runs)
just format    # biome format . --write
just build     # next build
just start     # build + next start
just audit     # pnpm audit
just update    # pnpm update
just test      # no-op while the `.no-tests` sentinel exists
```

There is no test suite. `just test` succeeds only because the empty `.no-tests` file at the repo root exists; deleting it makes the recipe fail hard (and breaks CI) until a real test command replaces it.

CI (`.github/workflows/ci.yaml`, push to `main` + PRs, `ubuntu-24.04-arm`, Node 24) runs `just install && just lint && just audit && just test && just build`. CI uses `lint` (non-writing) while local `just check` writes fixes — run `just check` locally so CI's lint stays clean.

## Asset layout and the sync contract

- `kasetto.yaml` decides what actually syncs. The local source (`github.com/pivoshenko/pivoshenko.ai`) uses `"*"` for `instructions` and `skills`, so new files in those dirs sync automatically. **`mcps` are enumerated by name** (currently `github`, `vercel`, `cloudflare`, `logfire`), so adding `mcps/foo.json` also requires adding `foo` to the `mcps:` list. `mcps/motherduck.json` and `mcps/supabase.json` exist on disk but are not listed — they show on the site (which globs `mcps/*.json`) and do not sync.
- `skills/<slug>/SKILL.md` is required; `references/`, `scripts/`, `assets/` are optional siblings loaded on demand (see `skills/pivoshenko-brand` for the full shape).
- `instructions/<slug>.md` — one rule per file, frontmatter + rule body.
- `mcps/<name>.json` — shape is `{ "mcpServers": { "<name>": { ... } } }`. Secrets are Kasetto placeholders (`${kst_github_token}`), never literals.
- `archive/` mirrors the live layout (`archive/skills/`, `archive/instructions/`, `archive/scripts/`). Kasetto only pulls from the top-level dirs, so **retire by moving here, not deleting** — the site still renders archived skills/instructions in a dimmed section.

## Frontmatter contract

Every `SKILL.md` and `instructions/*.md` needs:

```yaml
name: <slug or human name>
description: <short, operational; surfaces in the site card and in skill triggering>
tags: [lowercase-kebab]
updated_at: 2026-08-31 # ISO date; bump when meaningfully edited
```

Catalog sort is `updated_at` desc, entries without it last, ties by `name` asc (`byUpdatedAtDesc` in `site/lib/data.ts`).

## Tagging

- Local skills/instructions: frontmatter `tags` is the source of truth and takes precedence over any map.
- External skills/MCPs/instructions: add explicit entries to the per-slug / per-source maps in `site/lib/external-tags.ts` (`SKILL_TAGS`, `SOURCE_TAGS`, `MCP_TAGS`, `INSTRUCTION_TAGS`). No regex inference — the maps are deliberately literal.
- Tags stay short, lowercase, kebab-case, one word where possible (`git`, `brand`, `vercel`, `deploy`, `meta`, `engineering`, ...).

## Skill writing style

Skill bodies are terse to the point of fragments: arrows for causality (`scan -> report -> confirm -> apply`), abbreviations, no prose padding. Read any existing skill in `skills/` before writing a new one. Skills that touch destructive territory (`macos-cleanup`, `cloudflare-hygiene`, `vercel-hygiene`) all follow the same shape: read-only sweep -> categorized report -> explicit per-category confirm -> apply -> verify.

Skills cross-reference by handing off (`macos-cleanup` <-> `macos-maintenance`, `git-commit` <-> `git-pr-create`, `cloudflare-hygiene` -> `cloudflare`). `humanize` is deliberately kept free of references to other skills or this brand so it stays portable.

## Site architecture

- Next.js 16 App Router (Turbopack dev), React 19, Tailwind 3, Biome 1.9 (no eslint/prettier). Single page (`app/page.tsx`), single client component (`components/catalog.tsx`).
- `site/lib/data.ts` is the whole data layer. It runs server-side, sets `ROOT = process.cwd()/..`, and reads `../kasetto.yaml`, `../skills/*/SKILL.md`, `../mcps/*.json`, `../instructions/*.md`, plus `../archive/{skills,instructions}` through the same readers with `archived = true`. Client code imports from it with `import type` only, so nothing filesystem-related reaches the bundle.
- `loadCatalog()` merges local assets with entries derived from `kasetto.yaml`; a `"*"` upstream entry becomes one synthetic "all skills"/"all instructions" card. Local slugs shadow same-named external ones.
- Editing a skill or instruction needs no rebuild in dev — Next re-reads on the next request.
- **`pivoshenko.ui` (git-tag-pinned dependency, currently `#v0.9.3`) owns nearly all config and chrome.** `next.config.ts`, `postcss.config.mjs`, `biome.json`, `tsconfig.json`, and `app/globals.css` are one-line re-exports/extends of it. `app/layout.tsx` composes `<SiteLayout brand="pivoshenko.ai">` (plus `siteMetadata`/`siteViewport`), which owns `<html>`/`<body>`, the page shell, and analytics; `<SpeedInsights />` is passed via `afterShell`. To change the shell, bump the pinned tag rather than adding local markup.
- Styling uses role-based classes from `pivoshenko.ui/tailwind-preset/site`: foreground roles (`fg-title`, `fg-body`, `fg-muted`), type ramp (`type-body`), surfaces (`bg-bg-surface`), borders (`border-ui`, `border-faint`), accents (`bg-accent-primary|secondary|success|danger|info`). One palette, no raw `stone-*`, no `dark:` chains, no theme toggle.
- Deploy is Vercel (`site/vercel.json`: `pnpm build` / `pnpm install --frozen-lockfile`). No env vars are required to build or run the site.
- `site/pnpm-workspace.yaml` holds pnpm policy only: `onlyBuiltDependencies` and security `overrides` for transitive deps.

## Repo conventions

- Angular conventional commits (see `skills/git-commit`). Branch, PR, and label workflows are covered by the `git-*` skills; prefer them over raw `gh`/`git` invocations. PRs follow `.github/PULL_REQUEST_TEMPLATE.md`.
- Internal repo: no `CONTRIBUTING.md` / `CODE_OF_CONDUCT.md` / `SECURITY.md`, no release workflow or versioning. Do not scaffold them.
- README, `CLAUDE.md`, and the site's archive section should agree about what is retired and why; update them together when something moves into `archive/`.
