---
name: macos-maintenance
description: Periodic macOS maintenance + optimization — read-only health sweep (pending OS/brew updates, disk health + SMART, memory pressure + swap, battery condition, Time Machine recency, Spotlight indexing state, crash/panic reports, uptime, login-item load) → ok/attention/action report → confirmed fixes. Use when the user says "maintain my mac", "mac health check", "tune up my mac", "optimize my mac", "run maintenance", "is my mac healthy", "update everything", or wants a periodic once-over. Also covers targeted fixes when a check or the user flags an issue — Spotlight reindex, Launch Services rebuild, DNS/font cache flush, frozen Finder/Dock, runaway process triage. Storage/junk/leftovers/disk-space → macos-cleanup instead.
tags: [macos, maintenance]
updated_at: 2026-06-12
---

# macOS Maintenance

Periodic once-over: sweep (read-only) → report → confirm → apply → verify. Optimization = real wins only: updates applied, reboot when due, indexing sane, startup load lean. No snake-oil (`purge`, blind cache wipes, repair-permissions theater). Storage/junk → `macos-cleanup`, hand off.

## Sweep (read-only)

Run all categories, every one shows up in the report — clean ones as "ok", never silently omitted. Warn up front: `softwareupdate -l` + `diskutil verifyVolume` take a minute+.

1. **Updates** — `softwareupdate -l` (slow); `brew update >/dev/null && brew outdated` (metadata-only refresh, ok in sweep); `brew doctor` (warnings only, most are noise — flag real ones).
2. **Disk health** — `df -h /` free %; `diskutil info disk0 | grep -i smart` -> must say Verified; `diskutil verifyVolume /` (read-only First Aid, live-volume ok); `tmutil listlocalsnapshots /` count (thinning is automatic — report only).
3. **Memory/CPU** — `memory_pressure` (plain run prints summary); `sysctl vm.swapusage` — heavy swap + warning level -> note worst consumers via `top -l 2 -o mem -n 5 -stats pid,command,cpu,mem`.
4. **Battery** — `pmset -g batt`; `system_profiler SPPowerDataType | grep -E 'Cycle Count|Condition|Maximum Capacity'` -> Condition ≠ Normal or capacity <80% = attention.
5. **Backups** — `tmutil destinationinfo` (configured at all?); `tmutil latestbackup` (may need Full Disk Access -> fallback `tmutil listbackups | tail -1`). Last backup >7d = attention; not configured = say so once, user's call.
6. **Spotlight** — `mdutil -s /` (enabled? stuck "in progress"?); `ps aux | grep -E 'mds_stores|mdworker' | grep -v grep` CPU%. Optimization: big dev trees indexed -> suggest Spotlight Privacy exclusions for build-artifact dirs (`node_modules`, `target`, `.venv` parents) — GUI only, System Settings → Siri & Spotlight.
7. **Crashes/panics** — `ls -lt ~/Library/Logs/DiagnosticReports | head`; `ls /Library/Logs/DiagnosticReports 2>/dev/null | grep -i panic`. Repeated crashes of one app or any kernel panic = attention + name it.
8. **Uptime** — `uptime`. >14d -> recommend reboot (memory leaks + pending updates accumulate; that's the whole fix, no theater).
9. **Startup load** — `osascript -e 'tell app "System Events" to get name of every login item'` + LaunchAgents count. Just the headcount here — deep dead-agent audit lives in `macos-cleanup`, point there if list looks bloated.

## Report

Table per category: check · finding · verdict (`ok` / `attention` = watch it / `action` = fix available, named). Lead with one-line summary: "N ok, N attention, N actions available". Then `AskUserQuestion` multiSelect over the actions only.

## Actions (each confirmed, side effects stated first)

- **OS updates**: `sudo softwareupdate -i -a` — sudo -> ask; may require restart, say which updates do.
- **brew upgrade**: `brew upgrade` — list what bumps first; pinned/work-critical tools -> per-formula `brew upgrade <f>` instead.
- **Reboot**: recommend, user does it themselves.
- **Spotlight reindex** (stuck/corrupt index): `sudo mdutil -E /` — **search degraded for hours on big disks, mds burns CPU meanwhile**. One bad folder -> cheaper: add to Spotlight Privacy, wait 1 min, remove -> reindexes just it, no sudo.
- **First Aid repair** (verify found errors): live `/` can't be repaired mounted -> Recovery Mode First Aid, give steps; data risk = back up first.

## Targeted fixes

When sweep or user flags a specific breakage. Same contract: confirm first, side effects stated, verify after.

- **"Open With" duplicates** — `/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -kill -r -domain local -domain system -domain user && killall Finder`. **Resets custom default handlers to Apple defaults — user re-assigns by hand.** No sudo. Verify: dupes gone.
- **DNS stale/failing** — diagnose first: `ping -c 3 8.8.8.8` vs `ping -c 3 google.com` (IP ok + name fails = DNS; both fail = network, out of scope); `scutil --dns | head -30` for stale VPN resolvers (flush won't fix those — point at VPN client). Fix: `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`. Instant, no side effects.
- **Garbled fonts** (across apps; one app -> app problem) — `ls -lt ~/Library/Fonts | head`, recently added font often culprit, remove it first. Else `atsutil databases -removeUser && atsutil server -shutdown && atsutil server -ping` (no sudo); still broken -> `sudo atsutil databases -remove`. **Needs relogin to fully take.**
- **Frozen UI** — Finder: `killall Finder`; Dock: `killall Dock`; menu bar: `killall SystemUIServer` — all auto-relaunch, no data loss. No audio: `sudo killall coreaudiod` (~2s). **Never `killall WindowServer`** — force-logout, unsaved work dies; prefer reboot.
- **Runaway process** (hot/loud/draining) — `top -l 2 -o cpu -n 10 -stats pid,command,cpu,mem` (second sample is the real one); `ps -Ao pid,pcpu,pmem,etime,comm -r | head -15`; battery angle: `sudo powermetrics -n 1 --samplers tasks | head -40` (fails on some setups -> top is fine). Identify owner before kill: known daemon (`mds*` -> Spotlight above; `bird`/`fileproviderd` = iCloud sync, out of scope, say so) / user app (**unsaved work — confirm saved**) / helper (respawns, safe). Kill: `kill <pid>` -> 5s -> `kill -9 <pid>`; root-owned -> `sudo kill`, ask. Respawns + spins again -> whack-a-mole, find the cause instead.

## Rules

- Sweep = read-only (brew metadata refresh is the one allowed mutate). Change state only via confirmed actions, one at a time -> verify -> next.
- No sudo by default — sudo command -> quote it, say why, ask.
- Side effects before confirm, always: restart-required updates, hours-long reindex, handler resets, relogin.
- No snake-oil: no `purge`, no "free RAM", no scheduled blind cache wipes, no repair theater. A clean sweep -> "all healthy", stop — don't invent actions.
- User may want the report only — fixing is optional, never assumed.
- Boundaries: disk space/junk/leftovers/dead launch agents -> `macos-cleanup`; iCloud sync internals, Time Machine repair beyond status, Bluetooth -> out of scope, name it instead of improvising.
