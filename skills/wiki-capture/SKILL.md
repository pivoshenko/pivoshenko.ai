---
name: wiki-capture
description: Route anything into the Obsidian vault (second brain) — a thought, URL, concept, snippet, or the 00 INBOX backlog. Use when the user says "add to my wiki", "capture this", "note this down", "save to vault", "process my inbox" — and also on wiki-free phrasings like "jot this down", "remember this idea", "TIL", "interesting:", or whenever the user drops durable knowledge worth keeping. Files it under the right folder with template + frontmatter + wikilinks, updates INDEX.md and LOG.md.
tags: [wiki, obsidian]
updated_at: 2026-06-11
---

# Wiki capture

Vault: `/Users/volodymyr.pivoshenko/Library/Mobile Documents/iCloud~md~obsidian/Documents/Vault`

Workhorse skill. Anything in -> right note out. No confirm for new notes; confirm before rewriting user-authored content.

## Flow

1. Read vault `CLAUDE.md` (schema) + `INDEX.md` (catalog). Always. Conventions live there, not here.
2. Classify the input -> note type -> folder:
   - concept / evergreen idea -> `02 PERMANENT NOTES`
   - project info / decision -> `03 PROJECTS` (or hand to `wiki-project`)
   - investigation / open question -> `04 RESEARCH`
   - talk/book/article/video -> `05 SOURCES` (or hand to `wiki-summarize` if it needs summarizing)
   - blog/announcement idea -> `06 WRITING` (or hand to `wiki-write` for a full draft)
   - unclear + low effort -> dump to `00 INBOX`, done
3. Check INDEX.md: page already exists -> update it (merge, don't duplicate). Else new note from matching `99 TEMPLATES/` template.
4. Fill frontmatter per the contract in vault CLAUDE.md. `created`/`updated` = today.
5. Wikilinks: link first mention of known concepts. Worthwhile new concept w/o page -> stub in `02 PERMANENT NOTES` (frontmatter + one-line definition).
6. Duties: INDEX.md entry + LOG.md line + bump `updated` on touched notes.
7. Report: what was filed where, stubs created.

## Inbox processing

"process my inbox" -> for each file in `00 INBOX/`: run flow steps 2–6, then delete the inbox file. Empty inbox = done. Ambiguous item -> ask, don't guess-file. End with a quick lint sanity pass (INDEX drift + dead links only).

## Rules

- One concept per note. Plain descriptive filename, Title Case, no ID/date prefix.
- Existing page wins over new page. Grep (`rg`) before creating.
- Never edit `01 DAILY NOTES` retroactively. Never touch `98 ATTACHMENTS`.
- Daily note mentions something durable -> extract to proper note, leave daily note untouched.
- Vault path missing on disk -> remote session: return a formatted paste-ready block, never recreate vault structure elsewhere.
