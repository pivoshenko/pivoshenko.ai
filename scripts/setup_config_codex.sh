#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TEMPLATE="${REPO_ROOT}/config/codex.toml"
TARGET_DEFAULT="${CODEX_HOME:-$HOME/.codex}/config.toml"
TARGET="${1:-$TARGET_DEFAULT}"

if [[ ! -f "${TEMPLATE}" ]]; then
  echo "[setup_config_codex] missing template: ${TEMPLATE}"
  exit 1
fi

mkdir -p "$(dirname "${TARGET}")"
if [[ ! -f "${TARGET}" ]]; then
  touch "${TARGET}"
fi

has_top_key() {
  local key="$1"
  grep -Eq "^${key}[[:space:]]*=" "${TARGET}"
}

insert_top_key() {
  local key_line="$1"
  local tmp_out
  tmp_out="$(mktemp)"
  awk -v key_line="${key_line}" '
    BEGIN { inserted=0 }
    /^\[.*\]$/ && !inserted {
      print key_line
      inserted=1
    }
    { print }
    END {
      if (!inserted) {
        print key_line
      }
    }
  ' "${TARGET}" > "${tmp_out}"
  mv "${tmp_out}" "${TARGET}"
}

has_feature_key() {
  local key="$1"
  awk -v key="${key}" '
    BEGIN { in_features=0; found=0 }
    /^\[features\]$/ { in_features=1; next }
    /^\[.*\]$/ && in_features { in_features=0 }
    in_features && $0 ~ ("^" key "[[:space:]]*=") { found=1 }
    END { exit(found ? 0 : 1) }
  ' "${TARGET}"
}

insert_feature_key() {
  local key_line="$1"
  local tmp_out
  tmp_out="$(mktemp)"
  awk -v key_line="${key_line}" '
    BEGIN { in_features=0; inserted=0 }
    /^\[features\]$/ {
      print
      in_features=1
      next
    }
    /^\[.*\]$/ && in_features && !inserted {
      print key_line
      inserted=1
      in_features=0
    }
    { print }
    END {
      if (in_features && !inserted) {
        print key_line
        inserted=1
      }
      if (!inserted) {
        print ""
        print "[features]"
        print key_line
      }
    }
  ' "${TARGET}" > "${tmp_out}"
  mv "${tmp_out}" "${TARGET}"
}

added_top=0
for key in model model_reasoning_effort personality; do
  if ! has_top_key "${key}"; then
    key_line="$(grep -E "^${key}[[:space:]]*=" "${TEMPLATE}" | head -n1 || true)"
    if [[ -n "${key_line}" ]]; then
      insert_top_key "${key_line}"
      added_top=$((added_top + 1))
    fi
  fi
done

added_features=0
while IFS= read -r line; do
  key="${line%%=*}"
  key="${key%"${key##*[![:space:]]}"}"
  if [[ -n "${key}" ]] && ! has_feature_key "${key}"; then
    insert_feature_key "${line}"
    added_features=$((added_features + 1))
  fi
done < <(awk '
  /^\[features\]$/ { in_features=1; next }
  /^\[.*\]$/ && in_features { exit }
  in_features && /^[a-zA-Z0-9_]+[[:space:]]*=/ { print }
' "${TEMPLATE}")

echo "[setup_config_codex] merged ${added_top} top-level keys and ${added_features} feature flags into ${TARGET}"
