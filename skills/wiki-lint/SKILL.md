---
name: wiki-lint
description: Maintenance sweep of the Obsidian vault — orphan notes, missing/invalid frontmatter, dead wikilinks, stale project statuses, INDEX.md drift, unprocessed inbox. Use when the user says "lint my wiki", "vault health check", "clean up my vault", "is my wiki up to date", or on a periodic review.
tags: [wiki, obsidian]
updated_at: 2026-06-12
---

# Wiki lint

Vault: `/Users/volodymyr.pivoshenko/Library/Mobile Documents/iCloud~md~obsidian/Documents/Vault`

Karpathy lint loop: scan -> report -> fix with approval. Read-only until user approves fixes.

## Preflight — before ANY fix

- iCloud eviction: `find <vault> -name '*.icloud'` → any hit = partially-synced vault. Report findings, **abort all fixes** (evicted notes look deleted; "fixing" corrupts the catalog).
- Conflicted copies: filenames matching `* 2.md` / `*conflict*` → flag for manual merge, never auto-pick a side.

## Checks

1. Read vault `CLAUDE.md` + `INDEX.md` first.
2. Sweep all `*.md` (skip `01 DAILY NOTES`, `97 MEMORY`, `98 ATTACHMENTS`, `99 TEMPLATES`, `.obsidian`):
   - **frontmatter** — missing block, missing required keys per type contract, invalid `status`/`source_type` values, non-kebab tags
   - **dead links** — `[[target]]` with no matching note (`rg -o '\[\[[^\]|#]+' | sort -u` vs file list)
   - **orphans** — notes nothing links to and INDEX.md doesn't list
   - **index drift** — notes missing from INDEX.md; INDEX.md entries whose note is gone
   - **stale projects** — `status: active` + `updated` > 60 days ago
   - **stale drafts** — `status: drafting|review` + `updated` > 30 days ago
   - **inbox** — items sitting in `00 INBOX/`
   - **secrets** — `rg -i 'api[_-]?key|secret|token|password|_pat_'` across ALL notes incl. daily notes → flag to user, never quote values
   - **layout** — every top-level dir in `03 PROJECTS/` contains `<dirname>.md` index
   - **memory symlinks** — every `~/.claude/projects/*/memory` symlink resolves; every `97 MEMORY/<project>/` has a matching symlink
   - **daily-note harvest** — daily notes newer than the last `lint:` LOG entry: list durable items worth extracting (propose, don't auto-file)
   - **rules copies** — `pivoshenko.ai/rules/VAULT.md` diffs clean against vault `CLAUDE.md`; `pivoshenko.ai/rules/CLAUDE.md` diffs clean against `~/.claude/CLAUDE.md` (both canonical files are live, repo holds mirrors)
3. Report findings grouped by check, one line each, fix proposed per line. Clean -> say so, done.
4. User approves -> fix. Mechanical fixes (index drift, frontmatter gaps, dead-link stubs) batch fine; content judgment calls (orphan deletion, stale status changes) -> ask per item.
5. Duties: LOG.md line (`lint: N findings, M fixed`), bump `updated` on touched notes.

## Rules

- Never delete notes as a "fix" without explicit per-note approval.
- Dead link to a worthwhile concept -> stub it, don't unlink it.
- INDEX.md is regenerable: heavy drift -> rebuild whole file from vault state.
