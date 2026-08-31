---
name: macos-cleanup
description: Deep-clean macOS — user/system junk (caches, logs, trash, iOS backups), leftovers from deleted apps, dev-tool junk (brew, docker, Xcode, npm/pnpm/uv/cargo caches, stale node_modules), disk-space breakdown + login-items audit. Use when the user says "clean my mac", "free up disk space", "disk is full", "what's eating my storage", "remove app leftovers", "my mac is slow", or any macOS storage/cleanup complaint. Health checks, updates, tune-up ("optimize/maintain my mac") -> macos-maintenance instead. Always scans read-only first, reports sizes, deletes only after explicit per-category confirmation.
tags: [macos, cleanup]
updated_at: 2026-06-12
---

# macOS Cleanup

Deep-clean: junk + app leftovers + dev junk + space/startup audit. Destructive territory -> scan (read-only) -> sized report -> confirm -> delete -> verify freed. Never delete during scan.

## Flow

1. **Scan**: `bash scripts/scan.sh`. Read-only, deletes nothing. Sized report -> stdout, raw lists -> `/tmp/macos-cleanup-scan.*/` (path printed). `du` over `~/Library` = takes a minute+, warn user up front.
2. **Cross-ref leftovers**: `installed.txt` (app bundle ids + cask/formula names) vs candidates (`app-support.txt`, `containers.txt`, `preferences.txt`, `caches.txt`, `saved-state.txt`, LaunchAgents). Matching rules below. Flag only what you can name the dead app for.
3. **Report**: table per category — item · size · verdict (`safe` = regenerable / `risky` = judgment call / `skip` + why). Lead with total reclaimable + current disk free.
4. **Confirm**: `AskUserQuestion`, multiSelect across categories. Anything >1 GB or non-regenerable (iOS backups, go modcache, simulator runtimes, Xcode DeviceSupport) -> its own option, never bundled into a category.
5. **Clean**: only what was confirmed, commands below. Leftovers + launch agents -> Finder Trash (recoverable). Pure caches -> `rm` fine.
6. **Verify**: `df -h /` before vs after -> "freed X GB". List skipped + why. `df` unchanged -> likely APFS purgeable / TM local snapshots; report `tmutil listlocalsnapshots /`, thinning is automatic, `tmutil deletelocalsnapshots <date>` only on explicit ask.

## Categories

### User/system junk (mostly safe)

- `~/Library/Caches/*` — per-entry, not wholesale. Skip entries of currently running apps (`pgrep -if <name>`) or tell user to quit them.
- `~/Library/Logs`, CrashReporter, QuickLook thumbnails, `~/Library/HTTPStorages` — regenerable.
- Trash: `osascript -e 'tell app "Finder" to empty trash'` (handles locked files).
- Mail Downloads cache — safe; Mail data itself off-limits.
- iOS device backups (`~/Library/Application Support/MobileSync/Backup`) — **user data, not regenerable**. Individual confirm, state device + date per backup (`ls -lt`).

### App leftovers (risky — be conservative)

Locations: Application Support, Caches, Preferences, Containers, Saved Application State, LaunchAgents, Logs, HTTPStorages.

Matching rules:
- Flag only when owner identifiable AND definitively gone: bundle id / vendor name absent from `installed.txt`, no running process, not a CLI tool.
- Verify, don't assume — grep `installed.txt` for every candidate before the verdict. Name familiarity ≠ installed (`Code` = VS Code, not Codex; an app being famous doesn't mean it's present).
- Never flag: `com.apple.*`, `group.*`, anything matching an installed app/cask/formula, vendor-shared dirs while any of that vendor's apps remain (e.g. `Google`, `JetBrains`, `Microsoft`).
- Unsure who owns it -> skip + say so. Missed leftover >> deleted-wrong-thing.
- Removal -> Trash: `osascript -e 'tell app "Finder" to delete POSIX file "<abs path>"'`.

### Dev junk

- brew: `brew cleanup --prune=all && brew autoremove`.
- docker (daemon must run): `docker system prune -f`. Never `--volumes` unless user explicitly says volumes.
- Xcode: `rm -rf ~/Library/Developer/Xcode/DerivedData`; `xcrun simctl delete unavailable`; old iOS DeviceSupport = risky (re-fetch needs the device).
- Caches: `pnpm store prune` · `npm cache clean --force` · `pip cache purge` · `uv cache clean` (safe, next install re-downloads; location from `uv cache dir` — often `~/.cache/uv`, not `~/Library/Caches`) · cargo registry `rm -rf ~/.cargo/registry/{cache,src}` (lockfiles re-fetch) · `go clean -modcache` = risky, slow re-download.
- XDG `~/.cache/*` (rod, huggingface, etc.): tool caches, mostly regenerable — but identify the owner per entry, same skip-if-unsure rule as leftovers.
- pyenv: superseded patch versions (3.13.9 next to 3.13.10) -> `pyenv uninstall <old>`. Check `pyenv version` first — never remove the active one.
- Sparkle `PersistentDownloads` (old app-update packages under `~/Library/Caches/<app>/org.sparkle-project.Sparkle/`) — safe, apps re-download pending updates.
- Stale build dirs (`projects.txt`): only projects untouched 30+ days. Regenerable via install/build (`.next` via next build). >500 MB -> per-project confirm. Never touch a repo's tracked files — `node_modules`/`.venv`/`target`/`.next` only.

### Optimization / space report

- Biggest dirs from scan -> short "what's eating the disk" breakdown.
- Login items + LaunchAgents/Daemons: flag dead ones (binary or app in `ProgramArguments` no longer exists). Removal = `launchctl bootout gui/$(id -u)/<label>` + plist -> Trash, per-item confirm. Live but unwanted -> report only, let user decide.
- No perf snake-oil: no `purge`, no "free RAM", no repair-permissions theater. Real wins = disk space + fewer startup items.

## Rules

- Scan phase = read-only. Delete only what the user confirmed this session, nothing more.
- Never touch: Documents/Desktop/Photos/iCloud Drive, `~/Library/Keychains`, `~/.ssh`, Mail data, browser profiles (their `Caches` ok), dotfiles, any repo's tracked files, `/System` (SIP anyway).
- No sudo by default. System paths (`/Library/Caches`, `/Library/Logs`, LaunchDaemons) -> report; act only on explicit sudo OK.
- Anything ambiguous -> `skip` verdict + one-line reason in report. User can override.
- Every scanned category shows up in the report — empty/clean ones as "already clean" (e.g. "Trash: empty"), never silently omitted. Omission reads as "not checked".
- Empty scan (nothing significant) -> say so + stop. Don't invent work.
