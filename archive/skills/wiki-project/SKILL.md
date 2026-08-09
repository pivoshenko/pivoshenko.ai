---
name: wiki-project
description: Create or update project pages in the Obsidian vault's 03 PROJECTS — status changes, decision log entries, milestones, meeting notes, future-project ideas. Use when the user says "log a decision for <project>", "update <project> status", "new project page", "what's the state of <project>", "we had a meeting about <project>", "add a project idea", or finishes a chunk of project work worth recording in the wiki.
tags: [wiki, obsidian]
updated_at: 2026-06-12
---

# Wiki project

Vault: `/Users/volodymyr.pivoshenko/Library/Mobile Documents/iCloud~md~obsidian/Documents/Vault`

Project lifecycle in the wiki: index page + ADR-lite decision log + meeting log per project, plus a vault-wide ideas list.

## Layout

```
03 PROJECTS/
├── Ideas.md            # one-liner future-project ideas (type: reference)
└── <Project>/
    ├── <Project>.md    # index: pitch, overview, current state (template: 99 TEMPLATES/Project.md)
    ├── Decisions.md    # append-only decision log
    ├── Meetings.md     # append-only meeting log (created on first meeting)
    └── extras          # project-specific notes (reviews, specs, ...)
```

## Flow

1. Read vault `CLAUDE.md` + `INDEX.md` first.
2. New project -> subfolder + index from `99 TEMPLATES/Project.md` + `Decisions.md` bootstrap: `# Decisions` heading + one intro line ("Append-only decision log for [[<Project>]]. Entry shape: `99 TEMPLATES/Decision Entry.md`."). Real project facts (repo URL, status) -> `links` + `status` frontmatter.
3. Status change -> bump `status` frontmatter + rewrite `## Current state` (keep it current-state, not history — history lives in Decisions.md + LOG.md).
4. Decision -> append `99 TEMPLATES/Decision Entry.md` shape to `Decisions.md`: date, decision, why, alternatives. Newest at bottom. One entry per decision, terse.
5. Milestone -> rewrite `## Current state` + LOG.md line. If a decision drove it, also a Decisions.md entry. No separate milestone artifact.
6. Meeting -> append `99 TEMPLATES/Meeting Entry.md` shape to the project's `Meetings.md`: date, discussed, outcomes, actions. Newest at bottom. Create `Meetings.md` on first meeting (same bootstrap style as Decisions.md). Then distill: decisions land in Decisions.md, durable concepts in `02 PERMANENT NOTES`, status shifts in `## Current state` — the meeting entry is the record, not the destination. Non-project meetings -> `00 INBOX` for later routing.
7. Project idea -> one-liner bullet in `03 PROJECTS/Ideas.md`. Idea got substantial (keeps coming back, has a shape) -> graduate: full hub with `status: idea`, remove the line from Ideas.md.
8. Asked "state of <project>" -> read index + Decisions.md tail, answer, fix staleness found on the way (with note to user).
9. Duties: bump `updated`, INDEX.md (new pages only), LOG.md line.

## Rules

- `status`: `idea|active|paused|done|archived`. No other values.
- Decisions and meetings are append-only. Reversal -> new entry referencing the old, never edit history.
- Template sections are a starting point: drop empty ones (e.g. `## Notes`), add project-specific ones (e.g. `## Reviews`).
- Project work discussed in code repos (kasetto, ihroteka, control-room, ...) is fair game to mirror here — wiki tracks the *why* and the state, repo tracks the code.
- Vault path missing on disk -> remote session: return a formatted paste-ready block, never recreate vault structure elsewhere.
