#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

TEMPLATE="${REPO_ROOT}/mcp/codex.toml"
TARGET_DEFAULT="${CODEX_HOME:-$HOME/.codex}/config.toml"
TARGET="${1:-$TARGET_DEFAULT}"

if [[ ! -f "${TEMPLATE}" ]]; then
  echo "[setup_mcp_codex] missing template: expected mcp/codex.toml"
  exit 1
fi

VAULT_PATH="${OBSIDIAN_VAULT_PATH:-}"
if [[ -z "${VAULT_PATH}" ]]; then
  echo "[setup_mcp_codex] OBSIDIAN_VAULT_PATH is not set"
  echo "[setup_mcp_codex] export OBSIDIAN_VAULT_PATH=\"/absolute/path/to/vault\""
  exit 1
fi

mkdir -p "$(dirname "${TARGET}")"
if [[ ! -f "${TARGET}" ]]; then
  touch "${TARGET}"
fi

TMP_TEMPLATE="$(mktemp)"
cp "${TEMPLATE}" "${TMP_TEMPLATE}"
sed -i '' "s#<TODO_YOUR_VAULT_PATH>#${VAULT_PATH//\#/\\#}#g" "${TMP_TEMPLATE}"

has_server() {
  local server="$1"
  grep -Eq "^\\[mcp_servers\\.${server//./\\.}\\]$" "${TARGET}"
}

extract_block() {
  local server="$1"
  awk -v section="[mcp_servers.${server}]" '
    $0 == section { in_section=1 }
    in_section {
      if ($0 ~ /^\[/ && $0 != section && NR > 1) {
        exit
      }
      print
    }
  ' "${TMP_TEMPLATE}"
}

if ! grep -Eq '^experimental_use_rmcp_client\s*=\s*' "${TARGET}"; then
  if grep -Eq '^\[features\]$' "${TARGET}"; then
    TMP_OUT="$(mktemp)"
    awk '
      BEGIN { in_features=0; inserted=0 }
      /^\[features\]$/ {
        print
        in_features=1
        next
      }
      /^\[.*\]$/ && in_features && !inserted {
        print "experimental_use_rmcp_client = true"
        inserted=1
        in_features=0
      }
      { print }
      END {
        if (in_features && !inserted) {
          print "experimental_use_rmcp_client = true"
          inserted=1
        }
        if (!inserted) {
          print ""
          print "[features]"
          print "experimental_use_rmcp_client = true"
        }
      }
    ' "${TARGET}" > "${TMP_OUT}"
    mv "${TMP_OUT}" "${TARGET}"
  else
    {
      echo ""
      echo "[features]"
      echo "experimental_use_rmcp_client = true"
    } >> "${TARGET}"
  fi
fi

added=0
while IFS= read -r server; do
  if ! has_server "${server}"; then
    {
      echo ""
      extract_block "${server}"
    } >> "${TARGET}"
    added=$((added + 1))
  fi
done < <(awk '/^\[mcp_servers\./ { gsub(/^\[mcp_servers\.|\]$/, ""); print }' "${TMP_TEMPLATE}")

rm -f "${TMP_TEMPLATE}"
echo "[setup_mcp_codex] merged ${added} missing servers into ${TARGET}"
