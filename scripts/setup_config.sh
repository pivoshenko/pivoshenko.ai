#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

CODEX_TARGET="${1:-${CODEX_HOME:-$HOME/.codex}/config.toml}"

"${SCRIPT_DIR}/setup_config_codex.sh" "${CODEX_TARGET}"

echo "[setup_config] done"
