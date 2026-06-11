#!/usr/bin/env bash
# macos-cleanup scan — READ-ONLY. Deletes nothing. Writes only to /tmp.
# Prints sized report to stdout; raw lists for cross-referencing -> $OUT.
set -uo pipefail

OUT="$(mktemp -d /tmp/macos-cleanup-scan.XXXXXX)"
DEV_ROOT="${DEV_ROOT:-$HOME/Development}"

hr() { printf '\n=== %s ===\n' "$1"; }
sz() { # sz <path> [label]
  [ -e "$1" ] || return 0
  local s
  s="$(du -sh "$1" 2>/dev/null | cut -f1)"
  printf '%8s  %s\n' "$s" "${2:-$1}"
}
top() { # top <dir> <n> <outfile> — sized entries, biggest first; full list -> $OUT/<outfile>
  local dir="$1" n="$2" file="$3"
  [ -d "$dir" ] || return 0
  du -sk "$dir"/* 2>/dev/null | sort -rn \
    | awk -F'\t' '{printf "%8.1fM  %s\n", $1/1024, $2}' > "$OUT/$file"
  head -n "$n" "$OUT/$file"
  local total; total="$(wc -l < "$OUT/$file" | tr -d ' ')"
  [ "$total" -gt "$n" ] && echo "    ... $((total - n)) more -> $OUT/$file"
  return 0
}

echo "macos-cleanup scan — read-only. Raw lists -> $OUT"

hr "DISK"
df -h / | sed -n '1,2p'

hr "USER JUNK (regenerable unless noted)"
sz "$HOME/Library/Caches"
sz "$HOME/Library/Logs"
sz "$HOME/.Trash"
sz "$HOME/Library/Application Support/CrashReporter"
sz "$HOME/Library/Containers/com.apple.QuickLook.thumbnailsd/Data/Library/Caches" "QuickLook thumbnails"
sz "$HOME/Library/Containers/com.apple.mail/Data/Library/Mail Downloads" "Mail Downloads"
sz "$HOME/Library/Application Support/MobileSync/Backup" "iOS device backups (NOT regenerable)"

hr "USER CACHES — top entries (also leftover candidates)"
top "$HOME/Library/Caches" 20 caches.txt

hr "DEV JUNK"
if command -v brew >/dev/null 2>&1; then
  echo "-- brew cleanup -n (dry run, tail):"
  brew cleanup -n 2>/dev/null | tail -n 3
fi
if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  echo "-- docker system df:"
  docker system df 2>/dev/null
else
  echo "-- docker: not running/installed — skipped"
fi
sz "$HOME/Library/Developer/Xcode/DerivedData" "Xcode DerivedData"
sz "$HOME/Library/Developer/Xcode/Archives" "Xcode Archives"
sz "$HOME/Library/Developer/Xcode/iOS DeviceSupport" "iOS DeviceSupport"
sz "$HOME/Library/Developer/CoreSimulator" "CoreSimulator (devices + caches)"
sz "$HOME/.npm" "npm cache"
sz "$HOME/Library/pnpm" "pnpm home (store)"
sz "$HOME/Library/Caches/Yarn" "yarn cache"
sz "$HOME/Library/Caches/pip" "pip cache"
if command -v uv >/dev/null 2>&1; then
  sz "$(uv cache dir 2>/dev/null)" "uv cache ($(uv cache dir 2>/dev/null))"
else
  sz "$HOME/Library/Caches/uv" "uv cache"
  sz "$HOME/.cache/uv" "uv cache (XDG)"
fi
sz "$HOME/.cargo/registry" "cargo registry"
sz "$HOME/.cargo/git" "cargo git checkouts"
sz "$HOME/go/pkg/mod" "go module cache (slow to re-download)"
if [ -d "$HOME/.pyenv/versions" ]; then
  echo "-- pyenv versions (flag superseded patch versions):"
  top "$HOME/.pyenv/versions" 10 pyenv.txt
fi
echo "-- Sparkle updater leftovers (old app update downloads):"
found_sparkle=0
while IFS= read -r d; do
  found_sparkle=1; sz "$d"
done < <(find "$HOME/Library/Caches" -maxdepth 3 -type d -name PersistentDownloads 2>/dev/null)
[ "$found_sparkle" -eq 0 ] && echo "    none"

hr "XDG CACHES (~/.cache — uv/rod/huggingface/etc. live here)"
top "$HOME/.cache" 15 xdg-cache.txt

hr "PROJECT BUILD DIRS under $DEV_ROOT (size / parent last-touched / path)"
if [ -d "$DEV_ROOT" ]; then
  find "$DEV_ROOT" -maxdepth 4 -type d \
    \( -name node_modules -o -name .venv -o -name target -o -name .next \) -prune 2>/dev/null \
  | while IFS= read -r d; do
      kb="$(du -sk "$d" 2>/dev/null | cut -f1)"; [ -n "${kb:-}" ] || continue
      mt="$(stat -f '%Sm' -t '%Y-%m-%d' "$(dirname "$d")" 2>/dev/null || echo '?')"
      printf '%s\t%s\t%s\n' "$kb" "$mt" "$d"
    done | sort -rn \
    | awk -F'\t' '{printf "%8.1fM  %s  %s\n", $1/1024, $2, $3}' \
    | tee "$OUT/projects.txt" | head -n 20
  total="$(wc -l < "$OUT/projects.txt" | tr -d ' ')"
  [ "$total" -gt 20 ] && echo "    ... $((total - 20)) more -> $OUT/projects.txt"
else
  echo "$DEV_ROOT not found — skipped (override with DEV_ROOT=...)"
fi

hr "INSTALLED APPS + BREW (cross-ref base for leftovers)"
{
  for d in /Applications /Applications/Utilities "$HOME/Applications"; do
    [ -d "$d" ] || continue
    for app in "$d"/*.app; do
      [ -d "$app" ] || continue
      bid="$(defaults read "$app/Contents/Info" CFBundleIdentifier 2>/dev/null || echo '?')"
      printf 'app\t%s\t%s\n' "$bid" "$(basename "$app" .app)"
    done
  done
  if command -v brew >/dev/null 2>&1; then
    brew list --cask 2>/dev/null | sed 's/^/cask\t-\t/'
    brew list --formula 2>/dev/null | sed 's/^/formula\t-\t/'
  fi
} | sort -u > "$OUT/installed.txt"
echo "$(wc -l < "$OUT/installed.txt" | tr -d ' ') entries -> $OUT/installed.txt"

hr "LEFTOVER CANDIDATES (cross-ref vs installed.txt; ignore com.apple.*)"
echo "-- ~/Library/Application Support:"
top "$HOME/Library/Application Support" 25 app-support.txt
echo "-- ~/Library/Containers (non-apple):"
du -sk "$HOME/Library/Containers"/* 2>/dev/null | sort -rn \
  | awk -F'\t' '{printf "%8.1fM  %s\n", $1/1024, $2}' \
  | grep -v '/com\.apple\.' > "$OUT/containers.txt" || true
head -n 15 "$OUT/containers.txt"
echo "-- ~/Library/Saved Application State (non-apple):"
ls -1 "$HOME/Library/Saved Application State" 2>/dev/null \
  | grep -v '^com\.apple\.' > "$OUT/saved-state.txt" || true
head -n 15 "$OUT/saved-state.txt"
echo "-- ~/Library/Preferences (non-apple plists) -> $OUT/preferences.txt:"
ls -1 "$HOME/Library/Preferences" 2>/dev/null | grep '\.plist$' \
  | grep -v '^com\.apple\.' > "$OUT/preferences.txt" || true
wc -l < "$OUT/preferences.txt" | tr -d ' ' | xargs -I{} echo "    {} plists"
sz "$HOME/Library/HTTPStorages"

hr "STARTUP / LOGIN"
echo "-- Login items:"
osascript -e 'tell application "System Events" to get the name of every login item' \
  2>/dev/null || echo "    (System Events not permitted — skipped)"
for d in "$HOME/Library/LaunchAgents" /Library/LaunchAgents /Library/LaunchDaemons; do
  echo "-- $d:"
  ls -1 "$d" 2>/dev/null | sed 's/^/    /' || echo "    (empty/missing)"
done

hr "BIGGEST DIRS IN \$HOME (for the space report)"
du -sk "$HOME"/*/ 2>/dev/null | sort -rn | head -n 12 \
  | awk -F'\t' '{printf "%8.1fG  %s\n", $1/1048576, $2}'

hr "TIME MACHINE LOCAL SNAPSHOTS (can hold space hostage)"
tmutil listlocalsnapshots / 2>/dev/null | sed 's/^/    /' || echo "    none/unavailable"

echo
echo "Scan complete. Raw lists: $OUT"
