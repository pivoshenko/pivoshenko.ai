#!/bin/sh
# Snapshot the Obsidian vault into an external git mirror (~/.vault.git).
# The .git dir lives OUTSIDE iCloud so sync never touches it; the vault stays git-free.
# Run by launchd (com.pivoshenko.vault-snapshot) hourly; safe to run manually.

set -eu

VAULT="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/Vault"
GIT_DIR="$HOME/.vault.git"

[ -d "$VAULT" ] || exit 0
[ -d "$GIT_DIR" ] || git --git-dir="$GIT_DIR" init -q

git --git-dir="$GIT_DIR" --work-tree="$VAULT" add -A
if ! git --git-dir="$GIT_DIR" --work-tree="$VAULT" diff --cached --quiet; then
  git --git-dir="$GIT_DIR" --work-tree="$VAULT" \
    -c user.name=pivoshenko -c user.email=volodymyr.pivoshenko@gmail.com \
    commit -q -m "snapshot: $(date '+%Y-%m-%d %H:%M')"
fi
