---
name: Punctuation
description: "Guardrail against typographic drift."
tags: [meta, style]
updated_at: 2026-09-13
---

# Punctuation

Applies to everything written: source files, docs, commit messages, PR bodies, issues, and posts.

## Characters

**Stay in ASCII.** Typographic characters get normalized as they are written, not cleaned up later:

- Em dash `—` -> a spaced hyphen ` - `
- En dash `–` -> a plain hyphen `-`
- Curly quotes `“ ” ‘ ’` -> straight `"` and `'`
- Ellipsis `…` -> three periods `...`
- Non-breaking space -> an ordinary space
- Arrows `→ ⇒` -> `->`

The em dash is the absolute one: never emit it, in any position, for any reason.

## Lists

**List items start with a capital letter and never end with `;` or `.`** Bulleted or numbered, fragment or full paragraph, no exceptions. Periods between sentences inside an item stay, only the terminal one is dropped.

## Headings

**Headings are Title Case**, at every level, including the ones inside a document body rather than only its title.

## Prose

Ordinary prose paragraphs keep normal sentence punctuation.
