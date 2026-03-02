# Stack and conventions

## Core assets

- MCP configs:
  - `mcp/codex.toml`
  - `mcp/claude.json`
- Anthropic skills mirror:
  - `skills/anthropics-default/`
- Anthropic official plugins mirror:
  - `plugins/anthropic-official/`

## Conventions

- Keep imported upstream content in dedicated mirrored folders.
- Keep custom local assets in separate folders to avoid sync collisions.
- Keep all credentials external to git-tracked files.
