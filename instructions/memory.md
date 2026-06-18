---
name: Wiki & Memory
description: The Obsidian vault is the canonical second brain and the canonical store for Claude memory; covers routing, write flow, and auto-update.
tags: [meta, wiki, obsidian]
updated_at: 2026-06-18
---

# Personal Wiki

**The vault at `~/Vault` (symlink → `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Vault`) is the user's second brain, maintained primarily by Claude.**

- Before working inside the vault, read its `CLAUDE.md` (schema: folder map, frontmatter contract, linking rules, standing duties) and `INDEX.md` (catalog).
- Wiki workflows are skills: `wiki-capture`, `wiki-summarize`, `wiki-project`, `wiki-write`, `wiki-lint`. Use them when the user wants something captured, summarized, or maintained in the wiki.
- When durable knowledge surfaces in any session (a decision on one of the user's projects, a concept worth documenting, a talk/book discussed), offer to capture it into the vault — don't silently skip it.
- Arbitration: durable knowledge always routes to the vault via the `wiki-*` skills. The `memory-management`/`task-management` plugins are not the system of record — TASKS.md is fine for task tracking, but knowledge lands in the wiki.
- If the vault path does not exist on disk (remote/cloud session), say so and hand content back as a paste-ready block — never recreate vault structure elsewhere.

# Memory

**Canonical Claude memory lives in the vault: `<vault>/97 MEMORY/<project>/`. `~/.claude/projects/<slug>/memory` is a real-directory mirror of it (no symlinks anywhere under `~/.claude`).**

Memory write flow: write/update the memory file in `97 MEMORY/<project>/` first, then refresh the harness mirror (`cp -R` the vault folder over `~/.claude/projects/<slug>/memory/`) so sessions load it. Edit canonical, never the mirror. Remote session (vault path missing): write harness-side and flag that the vault canonical needs reconciling next local session. If a `memory` path turns out to be a symlink (legacy arrangement), convert it: move the contents into a real directory at the same path and remove the link.

**Auto-update:** at the end of any substantive task, check whether durable facts surfaced (user preference, correction, project constraint, key decision) and save/update memories then — don't wait to be asked. Update stale memories in place; delete ones proven wrong.
