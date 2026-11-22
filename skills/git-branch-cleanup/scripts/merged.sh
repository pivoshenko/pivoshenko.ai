#!/usr/bin/env bash
# usage: merged.sh <base-ref>
# `git branch --merged` also matches branches with no commits of their own, so a branch
# needs evidence of work: a commit in its reflog, or a tip that came in through a merge
# (the latter alone is not enough, an empty branch cut from a merged branch has such a tip too)
set -euo pipefail

base="${1:?usage: merged.sh <base-ref>}"
mainline="$(git rev-list --first-parent "$base" --)"
branches="$(git for-each-ref --merged "$base" --format='%(refname:strip=2) %(upstream:strip=3)' refs/heads)"

while read -r name upstream; do
  [ -n "$name" ] || continue
  reflog="$(git reflog show --format=%gs "refs/heads/$name" --)"
  tip="$(git rev-parse "refs/heads/$name")"
  if grep -qE '^(commit|cherry-pick|am|revert)[: ]' <<< "$reflog"; then
    echo "$name"
  elif grep -qxF "$tip" <<< "$mainline"; then
    continue
  elif [ "$upstream" = "$name" ] || ! grep -q '^branch: Created from' <<< "$reflog"; then
    echo "$name"
  fi
done <<< "$branches"
