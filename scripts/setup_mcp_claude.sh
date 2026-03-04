#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

TEMPLATE="${REPO_ROOT}/mcp/claude.json"
TARGET_DEFAULT="$HOME/.claude.json"
TARGET="${1:-$TARGET_DEFAULT}"

if [[ ! -f "${TEMPLATE}" ]]; then
  echo "[setup_mcp_claude] missing template: expected mcp/claude.json"
  exit 1
fi

VAULT_PATH="${OBSIDIAN_VAULT_PATH:-}"
if [[ -z "${VAULT_PATH}" ]]; then
  echo "[setup_mcp_claude] OBSIDIAN_VAULT_PATH is not set"
  echo "[setup_mcp_claude] export OBSIDIAN_VAULT_PATH=\"/absolute/path/to/vault\""
  exit 1
fi

command -v jq >/dev/null 2>&1 || {
  echo "[setup_mcp_claude] missing required tool: jq"
  exit 1
}

mkdir -p "$(dirname "${TARGET}")"
if [[ ! -f "${TARGET}" || ! -s "${TARGET}" ]]; then
  echo '{"mcpServers":{}}' > "${TARGET}"
fi

TMP_TEMPLATE="$(mktemp)"
TMP_OUT="$(mktemp)"
cp "${TEMPLATE}" "${TMP_TEMPLATE}"
sed -i '' "s#<TODO_YOUR_VAULT_PATH>#${VAULT_PATH//\#/\\#}#g" "${TMP_TEMPLATE}"

jq --slurpfile tmpl "${TMP_TEMPLATE}" '
  . as $root
  | ($root.mcpServers // {}) as $existing
  | ($tmpl[0].mcpServers // {}) as $incoming
  | $root + {
      mcpServers: (
        reduce ($incoming | keys_unsorted[]) as $k ($existing;
          if has($k) then . else . + {($k): $incoming[$k]} end
        )
      )
    }
' "${TARGET}" > "${TMP_OUT}"

mv "${TMP_OUT}" "${TARGET}"
rm -f "${TMP_TEMPLATE}"

echo "[setup_mcp_claude] merged missing servers into ${TARGET}"
