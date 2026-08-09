---
name: wiki-summarize
description: Turn rough notes, a transcript, or a URL of a talk/video/book/article/paper into a polished source note in the Obsidian vault's 05 SOURCES. Use when the user says "summarize this talk/video/book/article for my wiki", dumps watch/read notes, shares a YouTube link to digest — and also on wiki-free phrasings like "I just watched/read/finished…", "great talk about X", "notes from the conference". Updates the concept pages the source touches.
tags: [wiki, obsidian]
updated_at: 2026-06-11
---

# Wiki summarize

Vault: `/Users/volodymyr.pivoshenko/Library/Mobile Documents/iCloud~md~obsidian/Documents/Vault`

Rough input -> polished source note. The user dumps; this skill structures.

## Flow

1. Read vault `CLAUDE.md` + `INDEX.md` first.
2. Gather: user notes as the base. URL given -> fetch page/transcript for metadata + gaps. User notes win over fetched content on emphasis — summarize what *they* found valuable.
3. New note in `05 SOURCES/` from `99 TEMPLATES/Source.md`. Filename = clean title of the source, Title Case.
4. Shape (proven by existing notes — match it exactly):
   - `## Source` — speaker/author + link
   - `## Summary` — 2–4 sentence overview
   - `## Key Insights` — bullets, `**Bold insight title**. Explanation` form, substance over count
   - `## References` — books/tools/links mentioned, only if any
5. Frontmatter: `type: source`, `source_type: talk|book|article|video|paper`, `url`, `author`, dates, tags. `rating` only if user gave a verdict.
6. Distill: update EVERY existing concept page this source touches — new info goes into the page, contradictions flagged inline (`> [!warning] Contradicts ...`). New concepts worth keeping -> stubs in `02 PERMANENT NOTES`. Wikilink all of them from the insights.
7. Duties: INDEX.md + LOG.md + report.

## Rules

- Don't pad. Thin source -> short note. Never invent insights not in the material.
- Long book -> insights grouped by theme, still one note.
- Same source already in INDEX.md -> update existing note instead.
