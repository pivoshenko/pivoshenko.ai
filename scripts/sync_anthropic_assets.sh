#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

echo "[sync] cloning anthropics/skills..."
git clone --depth 1 https://github.com/anthropics/skills "$TMP_DIR/skills"

mkdir -p "$ROOT_DIR/skills/anthropics-default"
rsync -a --delete "$TMP_DIR/skills/skills/" "$ROOT_DIR/skills/anthropics-default/"
cat > "$ROOT_DIR/skills/anthropics-default/UPSTREAM.md" <<'EOF'
Source: https://github.com/anthropics/skills
Synced by: sync_anthropic_assets.sh
EOF

echo "[sync] cloning anthropics/claude-plugins-official..."
git clone --depth 1 https://github.com/anthropics/claude-plugins-official "$TMP_DIR/plugins"

mkdir -p "$ROOT_DIR/plugins/anthropic-official"
rsync -a --delete "$TMP_DIR/plugins/plugins/" "$ROOT_DIR/plugins/anthropic-official/"
cat > "$ROOT_DIR/plugins/anthropic-official/UPSTREAM.md" <<'EOF'
Source: https://github.com/anthropics/claude-plugins-official
Synced by: sync_anthropic_assets.sh
EOF

echo "[sync] complete"
