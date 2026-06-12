# Vault schema — read before touching anything

Personal second brain in Obsidian, maintained primarily by Claude Code / Cowork. This file is the single source of truth for conventions; skills handle workflows and defer here. `INDEX.md` is the catalog — read it first to find existing pages before creating new ones.

## Folder map

| Folder | What lives there | Template |
| --- | --- | --- |
| `00 INBOX/` | Raw dumps awaiting processing — anything goes | none |
| `01 DAILY NOTES/` | Daily notes (`YYYYMMDD.md`) — user-authored, never edit retroactively | none |
| `02 PERMANENT NOTES/` | Evergreen concept/wiki pages, FLAT — one concept per note | `99 TEMPLATES/Concept.md` |
| `03 PROJECTS/` | One subfolder per project: `<Project>.md` index + `Decisions.md` + `Meetings.md` (append-only logs, created on first entry) + extras. `Ideas.md` at folder root holds one-liner future-project ideas; substantial ideas graduate to a hub with `status: idea` | `99 TEMPLATES/Project.md` |
| `04 RESEARCH/` | Research notes / investigations | `99 TEMPLATES/Concept.md` |
| `05 SOURCES/` | Talk/book/article/video summaries — flat, `source_type` in frontmatter | `99 TEMPLATES/Source.md` |
| `06 WRITING/` | Blog drafts + project announcement posts | `99 TEMPLATES/Blog Draft.md`, `99 TEMPLATES/Announcement.md` |
| `97 MEMORY/` | Mirror copies of Claude Code memory (`~/.claude/projects/<slug>/memory` is canonical — real dirs, no symlinks); refreshed after memory writes | harness format |
| `98 ATTACHMENTS/` | Binary assets — never touch |
| `99 TEMPLATES/` | Note-type templates (also used manually via Obsidian) |

No subfolders inside `02 PERMANENT NOTES`, `04 RESEARCH`, `05 SOURCES` — type/tags in frontmatter carry the classification. Plain descriptive filenames; no date/ID prefixes.

## Frontmatter contract

Every Claude-managed note (daily notes excluded) gets minimal frontmatter — never more than needed:

- All notes: `type`, `created` + `updated` (ISO `YYYY-MM-DD`), `tags` (lowercase kebab-case).
- `type: concept` — plus `aliases` for alternate names.
- `type: project` — plus `status: idea|active|paused|done|archived`, `links` (repo/site URLs).
- `type: source` — plus `source_type: talk|book|article|video|paper`, `url`, `author`; `rating` optional.
- `type: draft` — plus `status: idea|drafting|review|published`, `target` (blog/reddit/etc.), `published_url` once live.
- `type: research` — an investigation framed as a question; plus `status: open|answered`. Lives in `04 RESEARCH`; distilled durable claims graduate to `02 PERMANENT NOTES` as concepts.
- `type: review` — Ihroteka game reviews; plus `rating` (number 1–5, always a number) and `hall_of_fame: true` for the 5+ tier.
- `type: reference` — lookup pages that fit no other type (bio, rating scales, etc.).

Bump `updated` on every meaningful edit.

## Linking rules

- `[[wikilinks]]` everywhere; link the first mention of a concept in any note.
- Every new non-stub note ends with ≥2 wikilinks to existing notes (a Related section counts; INDEX.md and the owning project hub don't).
- If a linked concept page doesn't exist and the concept is worth keeping → create a stub in `02 PERMANENT NOTES` (frontmatter + one-line definition is enough).
- **Distill:** new information touching an existing page goes INTO that page — update it, don't just link to it. Contradictions get flagged inline: `> [!warning] Contradicts <claim> (<source>)`.
- No MOC pages beyond `INDEX.md` and per-project index notes.

## Standing duties — every session

1. New/renamed/deleted note → update `INDEX.md` (one-liner per note, ≤80 chars, by section; edit only the touched section).
2. One line per task appended to `LOG.md` via shell append (`>> LOG.md`, never full-file rewrite): `- [YYYY-MM-DD] <action>: <note title>`.
3. Bump `updated` frontmatter on edited notes.
4. Session start: if `00 INBOX/` is non-empty, or daily notes since the last LOG entry contain durable material, propose extraction (don't auto-file).
5. If LOG.md shows no `lint:` entry in 30+ days, suggest running wiki-lint before other work.

## Style

- Language: mixed — write in whatever fits the content (Ukrainian for Ihroteka reviews, English for tech content, no enforced rule).
- No emoji. Callouts sparingly. Headings in sentence case (existing notes use Title Case — match the note you're in).
- Match the proven shapes: source notes follow Source / Summary / Key Insights / References (see `05 SOURCES/`).

## Search

- `rg` first, `INDEX.md` as the map. No embeddings/RAG.
- When the vault passes ~200 notes or grep keeps missing things: install [qmd](https://github.com/tobi/qmd) and revisit.
- When `INDEX.md` passes ~300 entries: split per-section (`INDEX.md` + per-folder index files) and read only the relevant section.

## Remote sessions

If this vault path does not exist on disk, you are in a remote/cloud session: say so, and hand the content back as a formatted paste-ready block (or queue it for the next local session). Never recreate vault structure elsewhere.

## Never

- Delete or rewrite user-authored content without asking.
- Edit `01 DAILY NOTES/` retroactively. Exception: secrets (keys, tokens, passwords) found anywhere → stop and flag to the user; redacting them overrides this rule, with approval.
- Copy secret values into any other note, LOG.md, or output.
- Touch `98 ATTACHMENTS/`.
- Add Dataview queries, ID-prefixed filenames, or new folder hierarchies.
