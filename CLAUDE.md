# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

pivoshenko's AI agents workspace — a configuration hub for Claude Code skills, MCPs, and a Next.js site that visualizes the catalog. Primary artifacts are YAML config and Markdown skill definitions; the site is a thin viewer on top of those files.

## Structure

- `kasetto.yaml` — Kasetto sync config. Lists `agent: [claude-code]` plus per-source skill and MCP entries pulled from upstream GitHub repos. Source of truth for what gets synced.
- `skills/` — Locally authored skills. Each subdir contains a required `SKILL.md` (frontmatter: `name`, `description`, optional `tags: [...]`, optional `updated_at`) and optional `references/`, `scripts/`, `assets/`.
  - `git-commit`, `git-branch-create`, `git-pr-create`, `git-branch-sync`, `git-branches-cleanup` — Conventional git workflow skills. Tag: `git`.
  - `pivoshenko-brand` — Brand style guide (voice + visual rules + UI kit). Tags: `brand`, `design`.
- `mcps/` — Local MCP definitions as JSON files (`github.json`, `vercel.json`). Shape: `{ "mcpServers": { "<name>": { ... } } }`.
- `site/` — Next.js 16 site that visualizes the catalog. Reads `../skills/*/SKILL.md`, `../mcps/*.json`, and `../kasetto.yaml` at build time. Card layout with tag filter. No `site/CLAUDE.md` — this section is the source.
- `justfile` — Root recipes that scope into `site/` via `pnpm -C site <cmd>`: `install`, `dev`, `format`, `lint`, `audit`, `check`, `build`, `start`, `update`.
- `.github/` — `workflows/ci.yaml` (runs `just check` on push/PR), `labels.yaml` (label sync source of truth), `PULL_REQUEST_TEMPLATE.md`. Internal repo — no release workflow or community files (`CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`); do not scaffold them. Skip License + CI badges in the README — these belong only in repos that ship a release.

## Site stack

- Next.js 16 (App Router, Turbopack), React 19, Tailwind 3, Biome (no eslint/prettier).
- JetBrains Mono via `next/font/google` (both `sans` and `mono`). `next-themes` for dark/light with `class` strategy.
- Data loaded server-side from parent filesystem in `site/lib/data.ts`; types shared via `import type` only so client bundle stays lean.
- Tag derivation for external skills/MCPs lives in `site/lib/external-tags.ts` (three explicit maps: `SKILL_TAGS`, `SOURCE_TAGS`, `MCP_TAGS`). Local skills use frontmatter `tags:` as source of truth and fall back to the maps.
- Shared layout/theme/components live in `pivoshenko.ui` (git-tag-pinned). The site consumes `pivoshenko.ui/tailwind-preset`, `pivoshenko.ui/biome.json`, `pivoshenko.ui/tsconfig.base.json`, plus components like `TagButton` and `IconButton`. The whole chrome (`Nav`, `Footer`, `ThemeToggle`, `ScrollToTop`) is composed via `<PageShell brand="pivoshenko.ai">` in `site/app/layout.tsx` — there are no local copies. See parent `me/CLAUDE.md` for the cross-cutting pattern and the shared UI invariant.

## Tagging rules

- Local skills: add `tags: [...]` to `SKILL.md` frontmatter. Treat as the source of truth.
- External skills/MCPs: edit `site/lib/external-tags.ts`. Do not add regex rules — use the explicit per-slug / per-source maps.
- New tag categories: keep short, lowercase, single word where possible (`git`, `brand`, `nextjs`, `startup`, `docs`, `frontend`, `vercel`, `deploy`, `rust`, `mode`, `meta`).

## When editing skills

- Skill body style is "caveman" — terse, fragments, arrows for causality, abbreviations OK. See existing local skills for reference.
- Keep `description` short and operational — it surfaces in the site card and in skill triggering.
- After editing a skill, no rebuild is needed for the site in dev — Next will pick up the change on next request.

## Content conventions

Frontmatter contract, loader pattern, tag rules, and sort order for catalog entries (skills, MCPs):

- Required keys: `name`, `description`, `tags`. `updated_at` (ISO `YYYY-MM-DD`) required once a skill is meaningfully edited after creation.
- Tags: lowercase, kebab-case (`^[a-z0-9]+(-[a-z0-9]+)*$`). Local frontmatter `tags` are the source of truth and take precedence over `external-tags.ts` maps.
- External content tags come from explicit per-slug or per-source maps in `site/lib/external-tags.ts` — no regex inference.
- Loader (`site/lib/data.ts`) runs server-side; client components import only types via `import type`.
- Sort: `updated_at` desc (entries without `updated_at` sort last), ties by `name` ascending.

## Required env vars

None for `site/`. `@vercel/analytics` is wired via the Vercel integration. No other deployables in this repo (`skills/`, `mcps/`, `kasetto.yaml` are config files, not deployed). If a future build needs a secret, add it here as: name · purpose · scope (build/runtime) · visibility (`NEXT_PUBLIC_` public vs secret).

## When editing the site

- Run `just check` from the repo root before committing. Biome check + Next build. Both must pass.
- Server components by default. Add `'use client'` only when a component actually needs hooks/state/event handlers (e.g. `theme-toggle.tsx`, `back-to-top.tsx`, `catalog.tsx`).
- Match brand tokens from `pivoshenko-brand/references/brand-system.md` — role-based classes from `pivoshenko.ui/tailwind-preset` (`bg-bg-canvas`, `text-fg-default`, `text-accent-*`). No raw `stone-*` or `dark:` chains — single dark theme (`popil`), set via `data-flavor="popil"` on `<html>`.
