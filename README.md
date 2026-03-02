# pivoshenko.ai

AI workspace for agent systems, MCP configs, plugins, skills, and reusable automations.

## What is inside

- `mcp/` - MCP client/server configs (Codex + Claude formats)
- `plugins/` - imported Anthropic official Claude plugins
- `skills/` - imported Anthropic default skills and curated picks
- `prompts/` - reusable prompt templates
- `scripts/` - setup and sync helpers
- `docs/` - architecture notes and runbooks

## Quick start

### 1) Clone

```bash
git clone https://github.com/pivoshenko/pivoshenko.ai.git
cd pivoshenko.ai
```

### 2) Install runtime tools

```bash
bash scripts/bootstrap.sh
```

This installs/validates:
- `git`
- `node` + `npm` + `npx`
- `uv` and `uvx`
- `jq`

### 3) MCP configs

- Codex config: `mcp/codex.toml`
- Claude config: `mcp/claude.json`

Set required env vars before use:

```bash
export GITHUB_PAT_TOKEN="<your_token>"
```

### 4) Obsidian MCP

In both configs, replace `<vault_path>` with your real vault path.

Example (macOS iCloud vault):

```text
/Users/<you>/Library/Mobile Documents/iCloud~md~obsidian/Documents/<VaultName>
```

## Sync upstream packs

```bash
bash scripts/sync_anthropic_assets.sh
```

This refreshes:
- `skills/anthropics-default` from `anthropics/skills`
- `plugins/anthropic-official` from `anthropics/claude-plugins-official`

## Notes

- This repo intentionally stores reusable agent assets, not secrets.
- Keep tokens in environment or secret manager, never in tracked files.
