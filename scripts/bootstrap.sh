#!/usr/bin/env bash
set -euo pipefail

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

if ! command -v uv >/dev/null 2>&1; then
  echo "[bootstrap] installing uv..."
  curl -LsSf https://astral.sh/uv/install.sh | sh
  export PATH="$HOME/.local/bin:$PATH"
fi

need_cmd uv
need_cmd uvx

echo "[bootstrap] done"
