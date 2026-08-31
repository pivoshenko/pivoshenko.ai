---
name: obsidian-markdown
description: Obsidian Flavored Markdown syntax reference — wikilinks, embeds, callouts, properties/frontmatter, tags, comments, block IDs. Use when creating or editing .md files in an Obsidian vault, when linking or embedding notes, when writing callouts or note frontmatter, or when the user mentions wikilinks, backlinks, block references, or Obsidian notes. Also use before hand-writing Obsidian syntax from memory — the extensions here are not standard markdown and the near-misses (markdown links to vault notes, wrong callout keywords) fail silently in the app.
tags: [wiki, obsidian]
updated_at: 2026-08-31
---

# Obsidian markdown

Obsidian = CommonMark + GFM + extensions below. Standard markdown assumed; this covers only the Obsidian-specific parts. Adapted from [kepano/obsidian-skills](https://github.com/kepano/obsidian-skills) (MIT).

## Wikilinks

```markdown
[[Note Name]]                 link to note
[[Note Name|Display Text]]    custom text
[[Note Name#Heading]]         link to heading
[[Note Name#^block-id]]       link to block
[[#Heading]]                  same-note heading
```

In-vault -> wikilink (Obsidian tracks renames). External URL -> `[text](url)`. Never markdown-link vault notes.

Block ID: append `^block-id` to a paragraph. Lists/quotes -> ID on its own line after the block.

## Embeds

`!` prefix on any wikilink embeds it inline:

```markdown
![[Note Name]]            full note
![[Note Name#Heading]]    section
![[image.png|300]]        image, width 300
![[document.pdf#page=3]]  PDF page
```

More (audio, bases, search embeds, external images) -> [references/EMBEDS.md](references/EMBEDS.md).

## Callouts

```markdown
> [!note]
> Basic.

> [!warning] Custom Title
> Body.

> [!faq]- Collapsed by default (+ = expanded)
```

Types: `note tip info warning example quote bug danger success failure question abstract todo`. Full table + aliases + nesting -> [references/CALLOUTS.md](references/CALLOUTS.md).

## Properties (frontmatter)

YAML at top of file. Defaults Obsidian understands: `tags`, `aliases`, `cssclasses`. Lists as YAML lists; links as `related: "[[Other Note]]"` (quoted). Types + tag charset rules -> [references/PROPERTIES.md](references/PROPERTIES.md).

## Tags

`#tag`, `#nested/tag`. Letters, numbers (not first char), `_`, `-`, `/`. Frontmatter `tags:` list = same namespace.

## Misc

```markdown
==highlight==
%%hidden comment%%
$inline\ math$  /  $$block$$
Text with footnote[^1].  /  inline.^[Inline footnote.]
```

Mermaid: fenced ```mermaid block; `class NodeName internal-link;` makes nodes link to notes.

## Docs

https://help.obsidian.md/obsidian-flavored-markdown · /links · /embeds · /callouts · /properties
