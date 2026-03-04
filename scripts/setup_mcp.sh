#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

CODEX_TARGET="${1:-${CODEX_HOME:-$HOME/.codex}/config.toml}"
CLAUDE_TARGET="${2:-$HOME/.claude.json}"

"${SCRIPT_DIR}/setup_mcp_codex.sh" "${CODEX_TARGET}"
"${SCRIPT_DIR}/setup_mcp_claude.sh" "${CLAUDE_TARGET}"

echo "[setup_mcp] done"
