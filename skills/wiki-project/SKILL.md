---
name: wiki-project
description: Create or update project pages in the Obsidian vault's 03 PROJECTS — status changes, decision log entries, milestones. Use when the user says "log a decision for <project>", "update <project> status", "new project page", "what's the state of <project>", or finishes a chunk of project work worth recording in the wiki.
tags: [wiki, obsidian]
updated_at: 2026-06-11
---

# Wiki project

Vault: `/Users/volodymyr.pivoshenko/Library/Mobile Documents/iCloud~md~obsidian/Documents/Vault`

Project lifecycle in the wiki: index page + ADR-lite decision log per project.

## Layout

```
03 PROJECTS/<Project>/
├── <Project>.md    # index: pitch, overview, current state (template: 99 TEMPLATES/Project.md)
├── Decisions.md    # append-only decision log
└── extras          # project-specific notes (reviews, specs, ...)
```

## Flow

1. Read vault `CLAUDE.md` + `INDEX.md` first.
2. New project -> subfolder + index from `99 TEMPLATES/Project.md` + empty `Decisions.md` (`# Decisions` heading only). Real project facts (repo URL, status) -> `links` + `status` frontmatter.
3. Status change -> bump `status` frontmatter + rewrite `## Current state` (keep it current-state, not history — history lives in Decisions.md + LOG.md).
4. Decision -> append `99 TEMPLATES/Decision Entry.md` shape to `Decisions.md`: date, decision, why, alternatives. Newest at bottom. One entry per decision, terse.
5. Asked "state of <project>" -> read index + Decisions.md tail, answer, fix staleness found on the way (with note to user).
6. Duties: bump `updated`, INDEX.md (new pages only), LOG.md line.

## Rules

- `status`: `idea|active|paused|done|archived`. No other values.
- Decisions are append-only. Reversal -> new entry referencing the old, never edit history.
- Project work discussed in code repos (kasetto, ihroteka, control-room, ...) is fair game to mirror here — wiki tracks the *why* and the state, repo tracks the code.
- Vault path missing on disk -> remote session: return a formatted paste-ready block, never recreate vault structure elsewhere.
