---
name: wiki-write
description: Draft blog posts and project announcement posts (reddit/HN style) in the Obsidian vault's 06 WRITING. Use when the user says "draft a blog post about X", "write an announcement for <project>", "reddit post for my project", or wants to turn wiki/project material into publishable writing.
tags: [wiki, obsidian, writing]
updated_at: 2026-06-11
---

# Wiki write

Vault: `/Users/volodymyr.pivoshenko/Library/Mobile Documents/iCloud~md~obsidian/Documents/Vault`

Wiki material -> publishable draft. Voice = pivoshenko brand.

## Flow

1. Read vault `CLAUDE.md` + `INDEX.md` first. Load `pivoshenko-brand` skill for voice/style rules.
2. Pull facts from the vault: project index + Decisions.md for announcements; concept/source notes for blog posts. Missing facts -> check the actual repo, then ask.
3. New note in `06 WRITING/` from template:
   - blog post -> `99 TEMPLATES/Blog Draft.md`, `target: blog`
   - announcement -> `99 TEMPLATES/Announcement.md`, `target: reddit|hn|...`, wikilink the project
4. Draft. Announcement shape: what it is -> why built -> how it works -> links. Blog shape: thesis -> outline -> draft sections.
5. Frontmatter `status` tracks lifecycle: `idea -> drafting -> review -> published`. Published -> set `published_url` + `status: published`. Never delete published drafts — they're the archive.
6. Duties: INDEX.md + LOG.md + bump `updated`.

## Rules

- Facts from vault/repo only. No invented metrics, dates, features.
- Reddit/HN: no marketing speak, lead with the problem, disclose "I built this".
- Blog target = pivoshenko.dev -> final publish goes through that repo's MDX flow; the vault holds the draft, not the published artifact.
- Vault path missing on disk -> remote session: return a formatted paste-ready block, never recreate vault structure elsewhere.
