#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "[bootstrap] validating base tooling..."

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "[bootstrap] missing: $1"
    return 1
  }
}

need_cmd git
need_cmd node
need_cmd npm
need_cmd npx
need_cmd jq
need_cmd uv
need_cmd uvx

CODEX_TARGET="${1:-${CODEX_HOME:-$HOME/.codex}/config.toml}"
CLAUDE_TARGET="${2:-$HOME/.claude.json}"

echo "[bootstrap] applying codex config defaults..."
"${SCRIPT_DIR}/setup_config.sh" "${CODEX_TARGET}"

echo "[bootstrap] running MCP setup scripts..."
"${SCRIPT_DIR}/setup_mcp.sh" "${CODEX_TARGET}" "${CLAUDE_TARGET}"

echo "[bootstrap] done"
