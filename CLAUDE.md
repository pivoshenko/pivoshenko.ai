# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository purpose

pivoshenko's AI agents workspace: a configuration hub for Claude Code skills, MCPs, instructions, and a Next.js site that visualizes the catalog. Primary artifacts are YAML config and Markdown skill/instruction definitions; the site is a thin viewer on top of those files.

## Structure

- `kasetto.yaml`: Kasetto sync config. Lists `agent: [claude-code]` plus per-source `instructions`, `skills`, and `mcps` entries pulled from upstream GitHub repos (the local source uses `"*"` wildcards for each kind). Source of truth for what gets synced.
- `skills/`: Locally authored skills. Each subdir contains a required `SKILL.md` (frontmatter: `name`, `description`, optional `tags: [...]`, optional `updated_at`) and optional `references/`, `scripts/`, `assets/`.
  - `git-commit`, `git-branch-create`, `git-pr-create`, `git-branch-sync`, `git-branches-cleanup`: Conventional git workflow skills. Tag: `git`.
  - `pivoshenko-brand`: Brand style guide (voice + visual rules + UI kit). Tags: `brand`, `design`.
  - `obsidian-markdown`: Obsidian Flavored Markdown syntax reference (wikilinks, embeds, callouts, properties) + `references/`. In-house adaptation of kepano/obsidian-skills (MIT). Kept active after the wiki was archived: syntax reference, no vault dependency. Tags: `wiki`, `obsidian`.
  - `blog-write`: Write/edit posts for `pivoshenko.dev` (interrogate -> thesis -> DAG outline -> per-section draft -> anti-slop passes -> MDX ship) + `references/anti-slop.md`. Voice rules stay in `pivoshenko-brand`. Tags: `writing`, `blog`.
  - `humanize`: General-purpose de-AI edit pass for any prose: tell catalog (inflated significance, AI vocabulary, rule of three, filler, etc.) + plain-ASCII punctuation normalization (no em/en dashes, curly quotes, ellipsis chars, arrows) + `references/patterns.md` (full before/after examples, loaded on demand). Sole owner of the contract; the old `humanized` instruction rule was dropped in its favor. Blog posts -> `blog-write`. Tags: `writing`, `style`.
  - `macos-cleanup`: Deep-clean macOS: junk, app leftovers, dev caches, space/startup audit. Read-only scan (`scripts/scan.sh`) -> sized report with safe/risky/skip verdicts -> per-category confirm -> delete -> verify freed. Tags: `macos`, `cleanup`.
  - `macos-maintenance`: Periodic macOS health sweep + tune-up: updates, disk health/SMART, memory pressure, battery, backups, Spotlight, crashes, uptime, startup load. Read-only sweep -> ok/attention/action report -> confirmed fixes; plus targeted fixes (Spotlight reindex, LS rebuild, DNS/font cache, runaway processes). Complement to `macos-cleanup` (health/updates vs storage split). Tags: `macos`, `maintenance`.
  - `vercel-hygiene`: Audit + harden the 4 brand sites on Vercel (pivoshenko.dev, pivoshenko.startpage, pivoshenko.wallpapers, pivoshenko.ai), team `pivoshenko`. Read-only sweep -> per-site ok/attention/action report -> confirmed fixes. Priority: security headers (absent on all 4) + Speed Insights coverage (only `pivoshenko.dev` has it). Delegates perf/cost -> `vercel-optimize`, CLI -> `vercel-cli`, deploy -> `deploy-to-vercel`. Tags: `vercel`, `nextjs`, `deploy`.
  - `cloudflare-hygiene`: Audit + harden live Cloudflare zones/domains (operational config, NOT the upstream `cloudflare` dev skill). Read-only sweep -> per-zone ok/attention/action report grouped by category (SSL/TLS, security/WAF/bot, perf/caching, network protocols, DNS hygiene, analytics) -> per-category confirm -> apply via `cloudflare-api` MCP -> verify. `references/best-practices.md` = spec-verified endpoint/value matrix; `scripts/audit.mjs` = read-only sweep (GET-only). Preflight detects narrow MCP token (current `cloudflare-api` token is read-narrow, so settings are reported manual until broadened). Tags: `cloudflare`, `optimization`, `security`.
- `mcps/`: Local MCP definitions as JSON files (`github.json`, `vercel.json`). Shape: `{ "mcpServers": { "<name>": { ... } } }`.
- `instructions/`: Locally authored agent instructions (Kasetto's instruction asset kind: distributed as managed blocks into each agent's native instruction file, `CLAUDE.md` / `AGENTS.md` / `.cursor/rules` etc.). One `.md` per rule, with frontmatter (`name`, `description`, `tags`, `updated_at`); body is the rule text. These are the source for the global rules (`andrej-karpathy-workflow`, `comment-punctuation`, `docs-autoupdate`, `multi-agent-dispatch`), which Kasetto syncs into `~/.claude/CLAUDE.md` as managed blocks. Tag: `meta` (+ topic tag). The old monolithic `CLAUDE.md` in `pivoshenko.dotfiles` was removed once these took over, so there is no longer a dotfiles-deployed copy to keep in sync.
- `archive/`: Retired assets, mirroring the live layout (`archive/skills/`, `archive/instructions/`, `archive/scripts/`). Kasetto only pulls from the top-level `skills/`, `mcps/`, `instructions/`, so anything moved here stops syncing but stays readable. Currently holds the `wiki-*` skills, the `memory` instruction, and `vault-snapshot.sh` (the Obsidian second-brain setup, paused because it didn't change day-to-day agent behavior enough to justify the upkeep), plus the `co-authored-attribution` instruction, retired as no longer needed. Retire by moving, not deleting; the site surfaces these in its `archived` section.
- `site/`: Next.js 16 site that visualizes the catalog. Reads `../skills/*/SKILL.md`, `../mcps/*.json`, `../instructions/*.md`, `../archive/{skills,instructions}/*`, and `../kasetto.yaml` at build time. Card layout with tag filter; sections are own/external × skills/mcps/instructions, plus a dimmed `archived` section. No `site/CLAUDE.md`. This section is the source.
- `justfile`: Root recipes that scope into `site/` via `pnpm -C site <cmd>`: `install`, `dev`, `format`, `lint`, `audit`, `check`, `build`, `start`, `update`.
- `.github/`: `workflows/ci.yaml` (runs `just check` on push/PR), `labels.yaml` (label sync source of truth), `PULL_REQUEST_TEMPLATE.md`. Internal repo, so no release workflow or community files (`CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`); do not scaffold them. Skip License + CI badges in the README: these belong only in repos that ship a release.

## Site stack

- Next.js 16 (App Router, Turbopack), React 19, Tailwind 3, Biome (no eslint/prettier).
- JetBrains Mono via `next/font/google` loaded inside the shared `SiteLayout`. Single dark theme (`popil`). Light mode and `next-themes` were removed.
- Data loaded server-side from parent filesystem in `site/lib/data.ts`; types shared via `import type` only so client bundle stays lean. `readLocalSkills`/`readLocalInstructions` are reused for `archive/` with `archived = true`. Archived entries keep their frontmatter tags, count toward the tag filter, and render dimmed with `archive/`-prefixed GitHub links.
- Tag derivation for external skills/MCPs/instructions lives in `site/lib/external-tags.ts` (explicit maps: `SKILL_TAGS`, `SOURCE_TAGS`, `MCP_TAGS`, `INSTRUCTION_TAGS`). Local skills and instructions use frontmatter `tags:` as source of truth and fall back to the maps (`INSTRUCTION_TAGS` is empty for now, since all instructions are local).
- Shared layout/theme/components live in `pivoshenko.ui` (git-tag-pinned). The site consumes `pivoshenko.ui/tailwind-preset/site`, `pivoshenko.ui/biome.json`, `pivoshenko.ui/tsconfig.base.json`, `pivoshenko.ui/next/config`, `pivoshenko.ui/postcss.config.mjs`, plus components like `TagButton` and `IconButton`. The whole shell is composed via `<SiteLayout brand="pivoshenko.ai">` (from `pivoshenko.ui/next/site-layout`) which owns `<html>`, `<body>`, JetBrains-Mono font loading, `<PageShell>`, and `<Analytics />`. `app/icon.tsx` + `app/opengraph-image.tsx` re-export the shared handlers from `pivoshenko.ui/next/{icon,opengraph-image}`. See parent `sources/CLAUDE.md` for the cross-cutting pattern and the shared UI invariant.

## Tagging rules

- Local skills and instructions: add `tags: [...]` to the `SKILL.md` / instruction-file frontmatter. Treat as the source of truth.
- External skills/MCPs/instructions: edit `site/lib/external-tags.ts`. Do not add regex rules. Use the explicit per-slug / per-source maps.
- New tag categories: keep short, lowercase, single word where possible (`git`, `brand`, `nextjs`, `startup`, `docs`, `frontend`, `vercel`, `deploy`, `rust`, `mode`, `meta`, `cloudflare`, `security`, `optimization`, `workflow`, `terraform`, `iac`).

## When editing skills

- Skill body style is "caveman": terse, fragments, arrows for causality, abbreviations OK. See existing local skills for reference.
- Keep `description` short and operational. It surfaces in the site card and in skill triggering.
- After editing a skill, no rebuild is needed for the site in dev. Next will pick up the change on next request.

## Content conventions

Frontmatter contract, loader pattern, tag rules, and sort order for catalog entries (skills, MCPs):

- Required keys: `name`, `description`, `tags`. `updated_at` (ISO `YYYY-MM-DD`) required once a skill is meaningfully edited after creation.
- Tags: lowercase, kebab-case (`^[a-z0-9]+(-[a-z0-9]+)*$`). Local frontmatter `tags` are the source of truth and take precedence over `external-tags.ts` maps.
- External content tags come from explicit per-slug or per-source maps in `site/lib/external-tags.ts`, with no regex inference.
- Loader (`site/lib/data.ts`) runs server-side; client components import only types via `import type`.
- Sort: `updated_at` desc (entries without `updated_at` sort last), ties by `name` ascending.

## Required env vars

None for `site/`. `@vercel/analytics` is wired via the Vercel integration. No other deployables in this repo (`skills/`, `mcps/`, `kasetto.yaml` are config files, not deployed). If a future build needs a secret, add it here as: name · purpose · scope (build/runtime) · visibility (`NEXT_PUBLIC_` public vs secret).

## When editing the site

- Run `just check` from the repo root before committing. Biome check + Next build. Both must pass.
- Server components by default. Add `'use client'` only when a component actually needs hooks/state/event handlers (e.g. `theme-toggle.tsx`, `back-to-top.tsx`, `catalog.tsx`).
- Match brand tokens from `pivoshenko-brand/references/brand-system.md`: role-based classes from `pivoshenko.ui/tailwind-preset` (`bg-bg-canvas`, `text-fg-default`, `text-accent-*`). No raw `stone-*` or `dark:` chains, since there is a single dark theme (`popil`), with `--*` tokens scoped to `:root` in `pivoshenko.ui/ui/tokens.css` (no `data-flavor` attribute on consumers).
