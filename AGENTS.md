# AGENTS.md

Operational guide for this repository.

## Purpose

This repo is the shared control plane for AI agent setup:
- MCP configs
- plugin packs
- skill packs
- prompts
- automation scripts

## Principles

- Keep everything reproducible.
- Keep secrets out of git.
- Prefer explicit config files over ad-hoc shell state.

## Safe contribution rules

1. Use conventional commits.
2. Never commit API keys/tokens.
3. Add/update README when adding new top-level assets.
4. For imported upstream packs, include an `UPSTREAM.md` with source URL.
5. Keep generated vendor content in dedicated subfolders.

## Recommended workflow

1. Work on feature branch.
2. Validate config syntax locally.
3. Open PR with a short operational summary.
4. Merge only after checks pass.

## Current important paths

- `mcp/codex.toml`
- `mcp/claude.json`
- `skills/anthropics-default/`
- `skills/anthropic-marketplace/`
- `plugins/anthropic-official/`
