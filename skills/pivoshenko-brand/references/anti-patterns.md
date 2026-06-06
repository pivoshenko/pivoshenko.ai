# Anti-patterns

> pivoshenko is the practitioner's notebook — a dark, monospaced workshop where an engineer thinks out loud.

A brand is defined by what it accepts and clarified by what it refuses. Each DNA rule in SKILL.md has a failure mode — a plausible-looking decision that quietly drifts away from the brand. This file pairs each rule with its failure mode and names *why* the failure mode is wrong. Read when a rule feels ambiguous, when you've drifted and want to diagnose, or when a stakeholder is pushing for "just this one exception".

The pattern: **Do · Don't · Why it fails.** The "why" is the load-bearing part — without it, the rule is just taboo.

---

## DNA #1 — Dark only

- ✅ **Do:** ship dark, no toggle, no auto-switch on `prefers-color-scheme: light`.
- ❌ **Don't:** add a light mode "for accessibility" or "for printing".
- **Why it fails:** the brand's worldview is *the workshop at night*. A light mode isn't a variant of pivoshenko — it's a different brand. Accessibility is solved by the foreground ladder having enough contrast (it does), not by inverting. Printing is solved by `document.html`, which prints dark on purpose.

---

## DNA #2 — One typeface, monospaced

- ✅ **Do:** use JetBrains Mono for body, headings, captions, code.
- ❌ **Don't:** introduce a sans-serif for "readability" in long-form prose, or a serif for "elegance" in a deck.
- **Why it fails:** the typeface *is* the practitioner. Swapping it for a sans or serif moves the brand from "engineer's notebook" to "engineer's blog post about being an engineer". One step removed, posed.
- ❌ **Don't:** mix two monos (JBM + Fira Code, JBM + IBM Plex Mono).
- **Why it fails:** the hierarchy is built from one family by weight. A second mono adds noise without adding signal — the reader notices the *change* before they notice the content.

---

## DNA #3 — Grayscale chrome, one accent as subject

- ✅ **Do:** use `--accent-primary` for a link underline, a status dot, a focus ring, a copy-success flash.
- ❌ **Don't:** use it as a button background fill ("Subscribe" / "Get started" / "Try now").
- **Why it fails:** an accent-filled button says *this is the action you should take* — marketing language. The brand is a notebook; nothing inside it is trying to convert you. Buttons are 1px-bordered, grayscale, equal to their siblings. The accent marks *what's being looked at*, not *what to click*.
- ❌ **Don't:** sprinkle the accent across the chrome (accent borders on the nav, accent in the footer divider, accent in tag chips).
- **Why it fails:** the accent only works because it's rare. Scattered, it becomes a decorative color and stops being a signal.

---

## DNA #4 — Flat-edge

- ✅ **Do:** separate elements with `1px` borders. Use `--bg-surface` to lift a card off `--bg-canvas`.
- ❌ **Don't:** add `box-shadow`, even "subtle" ones — `0 1px 2px rgba(0,0,0,0.1)`.
- **Why it fails:** shadows simulate physical depth. The brand isn't physical — it's a screen of text. Implied depth (a darker floor under a lighter card) is in-brand; rendered depth (a soft drop shadow) is borrowed from product-design defaults that belong to a different aesthetic.
- ❌ **Don't:** use `backdrop-filter: blur(…)` for a "frosted" nav.
- **Why it fails:** blur is the visual equivalent of a string section in the background — it's atmosphere, and atmosphere is what marketing uses to *feel* premium. The brand doesn't perform premium. It just is what it is.
- ❌ **Don't:** use a gradient anywhere — not a hero, not a button, not a card background, not a divider.
- **Why it fails:** gradients are the easiest way to look "designed" and the surest way to look like everyone else. A flat color is a position. A gradient is hedging.

---

## DNA #5 — Type and color only

- ✅ **Do:** use a terminal screenshot, a code listing, or a mono portrait when imagery is non-negotiable.
- ❌ **Don't:** use stock photography, illustration packs, isometric "tech" art, AI-generated imagery, 3D renders, or geometric pattern fills.
- **Why it fails:** any of these screams *we hired a designer to look serious*. The brand is the work, not a frame around the work. A code listing is in-brand because it *is* the work. A 3D render of a glowing cube is somebody else's brand pretending to be yours.

---

## DNA #6 — One mark: `VP`

- ✅ **Do:** use the same `VP` tile — light fill, dark glyph, mono 700 — on every surface, every size.
- ❌ **Don't:** make a per-project glyph (a `T` for the theme work, a `D` for the dev blog, an `A` for AI).
- **Why it fails:** the mark gets stronger the more times it appears unchanged. A glyph zoo is a logo system for a company; this is one person.
- ❌ **Don't:** fill the tile with the accent color "for variety".
- **Why it fails:** the accent is the *subject*. The mark is the *identifier*. Mixing them confuses both roles — the mark stops being a fixed anchor, and the accent stops being rare.
- ❌ **Don't:** add a tagline under the wordmark ("pivoshenko.dev — thoughts on engineering").
- **Why it fails:** the brand explains itself by *being*, not by captioning itself. A tagline is a tell that the brand doesn't trust its own legibility.

---

## DNA #7 — No emoji

- ✅ **Do:** use a Lucide icon when a glyph is genuinely needed (a chevron, an external-link arrow, a copy icon).
- ❌ **Don't:** use emoji as section dividers in a README ("## 🚀 Quickstart").
- **Why it fails:** emoji introduces a different rendering engine, a different metaphor system, and a different cultural register inside one paragraph. The brand is one register, end-to-end. Lucide icons render in the same stroke language as the typeface; emoji renders as a cartoon.
- ✅ **Do:** allow exactly one contextual emoji in a GitHub repo *description* field (the one-liner under the repo name in the listing).
- **Why this exception holds:** GitHub's repo listing is a wall of unstyled grey text; a single emoji functions as a typographic mark — the visual equivalent of an initial capital. The brand survives there because it's one symbol against thirty words of plain text, and it's *outside* the brand's own rendered surfaces.

---

## DNA #8 — Voice: practitioner's notebook

- ✅ **Do:** "Execution is cheap now. Code? Generated. UI drafts? Ten in minutes."
- ❌ **Don't:** "In today's rapidly evolving landscape, AI is transforming how we approach software development."
- **Why it fails:** the second sentence is a LinkedIn opener. It performs gravitas instead of having gravitas. The brand sounds like a person who has the time to write briefly, not a person who's filling a content quota.
- ✅ **Do:** "I lead the R&D team. In my spare time, I build small tools."
- ❌ **Don't:** "We're a team of passionate engineers building the future of developer productivity."
- **Why it fails:** "we" is wrong (no company). "Passionate" is wrong (claims emotional state instead of showing it). "Building the future" is wrong (vague value). Every word is a tell.
- ❌ **Don't:** start a heading with a verb-noun marketing phrasing — "Build faster", "Ship better", "Unlock productivity".
- **Why it fails:** the brand isn't selling anything. Headings name what's below them, in noun phrases: `Recent posts`, `Ports`, `Userstyles`, `2026`.
- ❌ **Don't:** use em-dashes for drama, ellipses for suspense, rhetorical question stacks.
- **Why it fails:** all three are punctuation trying to do the work the sentence isn't doing. If the sentence is good, the punctuation can be a period.

---

## When in doubt

If a proposal triggers the question *"is this on-brand?"*, the answer is almost always no. The brand is decisive — it doesn't sit on the edge of its own rules. When something genuinely is in-brand, you don't have to ask.
