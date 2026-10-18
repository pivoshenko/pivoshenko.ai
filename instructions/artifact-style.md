---
name: Artifact Style
description: "Guardrail against half-width text in generated artifacts: a paragraph fills the block it sits in."
tags: [meta, style]
updated_at: 2026-10-18
---

# Artifact Style

## Measure

**Text in a generated artifact spans the full width of the block it sits in.** A heading, its rule, and the paragraph under it all end at the same right edge.

- Never put a `max-width` - `ch`, `px`, `rem`, or `%` - on a paragraph, lead, or list that is narrower than its container
- A `ch` cap is font-relative, so it collapses hardest in exactly the display faces an artifact reaches for - `46ch` of a condensed pixel font lands near 40% of a 56rem container, not the comfortable measure the number suggests
- The reading measure is capped once, by the page container, and never again on an element inside it. Two caps compound and the inner one wins
- A deliberately narrow column is a layout decision: it gets its own container with visible framing (a card, a sidebar, an offset), not a bare paragraph floating in dead space
- Same for a grid or flex child - `w-1/2` on a text cell inside an already-constrained column is the same bug wearing a different class

Why -> prose that stops at half width under a full-bleed heading reads as a bug, not a choice. The reader sees a broken stylesheet, and the whitespace carries no meaning because nothing occupies it.

The tradeoff is real - a 120-character line is hard to track. Resolve it at the container, by narrowing the page or adding a second column with something in it, never by shrinking one text node and leaving the rest wide.
