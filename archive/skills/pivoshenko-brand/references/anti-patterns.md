# Anti-Patterns

> pivoshenko is the practitioner's notebook - a dark, monospaced workshop where an engineer thinks out loud.

A brand is defined by what it accepts and clarified by what it refuses. Every rule in this system has a failure mode - a plausible-looking decision that quietly drifts away from the brand. This file pairs each rule with its failure mode and names *why* the failure mode is wrong. Read when a rule feels ambiguous, when you have drifted and want to diagnose, or when someone is pushing for "just this one exception".

The pattern: **Do · Don't · Why it fails.** The "why" is the load-bearing part - without it, the rule is just taboo.

Pairs are keyed to the rules as the design system states them, not to a numbered list. `visual.md` has the values and the rationale behind each.

---

## Dark Only

- **Do:** ship dark, no toggle, no auto-switch on `prefers-color-scheme: light`
- **Don't:** add a light mode "for accessibility" or "for printing"
- **Why it fails:** the brand's worldview is *the workshop at night*. A light mode is not a variant of pivoshenko - it is a different brand. Accessibility is solved by the foreground ladder carrying real contrast (it does), not by inverting. Printing is solved by `document.html`, which prints dark on purpose

---

## Build With Role Tokens, Never Raw Slots

- **Do:** write `var(--bg-surface)`, `var(--fg-muted)`, `var(--border-card)`
- **Don't:** write `var(--surface0)` or `#262625` because it is "the same color anyway"
- **Why it fails:** it *is* the same color, which is exactly why the mistake survives review. The slot layer is what gets re-skinned when a second flavour of `pivoshenko.theme` ships; a component reading a slot directly keeps rendering and stops meaning anything, and nothing flags it. The role token is a statement about the element's job; the slot is a statement about nothing
- **Don't:** mix a new grey by hand because no role token is quite right
- **Why it fails:** the neutral ladder has twelve steps for a reason. If none of them fits, the element is probably at the wrong depth, not in need of a thirteenth grey

---

## One Accent, Spent On The Subject

- **Do:** spend `--accent` on the wordmark suffix, the header tick, the active nav bar, the `//` of a section label, index lines in the pattern, card and tile hovers
- **Don't:** put the accent on the container - an accent border around a card, an accent-tinted panel background, an accent rule under every heading
- **Why it fails:** the accent marks *what is being looked at*, not *what is holding it*. A card with an accent border says the card is the point; the card is never the point, the thing inside it is. Once the frame is colored, the subject inside has nothing brighter left to claim
- **Don't:** use it as a button fill for "Subscribe" / "Get started" / "Try now"
- **Why it fails:** an accent-filled button says *this is the action you should take* - marketing language. The brand is a notebook; nothing inside it is trying to convert you. Buttons are 1px-bordered and grayscale, equal to their siblings
- **Don't:** add a seventh and eighth place to the accent budget because each one looks fine alone
- **Why it fails:** the accent works because it is rare, and rarity is the one property that cannot survive incremental additions. Each new use is defensible; the sum is a colored page

---

## The Accent Is A Channel, Not A Color

- **Do:** repoint it with `data-accent="blue"` on `<html>`, a header, a footer or any wrapper, and let every component follow
- **Don't:** hard-code a sibling site's hue - `color: var(--blue)` or `#7ba0c4` - because "this site is the blue one"
- **Why it fails:** it produces a site that looks right and cannot be restyled. The channel exists so the family is everything *except* the accent; a hard-coded hue removes that site from the family and makes it a fork
- **Don't:** run two accents on one page to "add variety"
- **Why it fails:** one accent per site or section is the rule that makes the channel legible at all. Two accents is a palette, and a palette has no subject
- **Don't:** repoint focus rings along with everything else
- **Why it fails:** focus reads `--accent-primary` deliberately. It must be recognisable as the same object across every sibling site, and it must keep its measured 5.3:1 no matter which hue a wrapper picked

---

## Contrast Is Measured, Not Eyeballed

- **Do:** use `fg-subtle` for any small text - nav, dates, meta, labels. It is 5.6:1
- **Don't:** use `fg-faint` for dates, captions, tag counts, or any body-size text because it "looks nicer and quieter"
- **Why it fails:** `fg-faint` is **3.4:1** on canvas and 2.8:1 on `bg-raised`. It fails. It is in the system for separators, the wordmark dot, disabled states and 24px+ only. The current sites still set some dates in it; those are bugs being fixed, not precedent
- **Don't:** put small accent text on `bg-raised` - an accent tag count, an accent label inside a tag
- **Why it fails:** `accent-primary` is 5.3:1 on canvas and `bg-surface` but only 4.4:1 on `bg-raised`. The same token passes in one place and fails one step up
- **Don't:** signal status with color alone - a green dot for "in sync", a red one for "failed"
- **Why it fails:** `accent-success` and `accent-danger` differ in hue only. A colorblind reader gets nothing. Every status travels with a word or a glyph

---

## A Surface Is Fill Plus Border Plus Lit Edge

- **Do:** ship `bg-surface` **and** a 1px `border-card` **and** `shadow-rest` together on every raised thing
- **Don't:** use the fill alone - `background: var(--bg-surface)` on a bare div and call it a card
- **Why it fails:** `base` to `surface0` is barely a step. The fill alone does not read as raised; it reads as a smudge on the page. The lit top edge from `shadow-rest` and the `border-card` outline are what do the separating, and the drop below is what lets the lit edge read as light rather than as a stray hairline. Two of the three is worse than a flat box, because a half-built surface looks like a rendering bug
- **Don't:** invent a fourth shadow, or use `shadow-float` on a card
- **Why it fails:** the three depths are a vocabulary - rest for a surface, lift added on hover, float for something genuinely above the page. A terminal-grade shadow under a card claims the card is floating, which it is not, and the real floating things lose their distinction
- **Don't:** treat "shadows are allowed now" as "depth is decorative now" - glow rims on borders, drop shadows on text, a gradient hero
- **Why it fails:** the shadows in this system are structural. They are how a surface becomes a surface at these neutral steps. Depth applied to something that is not a surface is the old flat-edge violation wearing new permission

---

## Two Faces, With Fixed Jobs

- **Do:** set everything in JetBrains Mono; reach for Martian Mono at `display-xl`, `display-lg`, `display-md` only
- **Don't:** use `--font-display` for a card title, a nav item, a lede, or anything under 28px
- **Why it fails:** Martian Mono is wide and grid-locked. At 28px+ with tracking pulled in and weight at 700 that width closes into a distinct header layer; at 16px it is just body copy that got fatter and harder to read. The display face earns its place through mass, and mass needs size
- **Don't:** add a third family - a sans "for readability" in long-form, a serif "for elegance" in a deck, a second mono for code
- **Why it fails:** the typeface *is* the practitioner. A sans moves the brand from "engineer's notebook" to "engineer's blog post about being an engineer" - one step removed, posed. A second mono adds noise without signal; the reader notices the *change* before they notice the content
- **Don't:** substitute a geometric sans when Martian Mono is unavailable
- **Why it fails:** the header layer is made by tightness and mass, not by being "a display face". JetBrains Mono at 800 with the tracking held delivers both; a substituted sans delivers neither and reads as a different brand's headline

---

## One Pattern Field, One Variant Per Site

- **Do:** put one Contours field per viewport, masked away from the copy, with a fresh `seed` on each page
- **Don't:** run a field in the hero *and* another behind a section further down the same page
- **Why it fails:** two fields of drifting lines on one screen read as two competing surfaces, and neither reads as ground. The pattern works because it is the floor of the page; a floor can only be at one depth
- **Don't:** change the variant between pages of one site - `topo` on the home page, `step` on the catalog
- **Why it fails:** the variant is part of that site's identity, exactly like its accent. Changing it between pages reads as a different template, not a different page. Vary the `seed`; that is what it is for
- **Don't:** leave the field unmasked behind body copy, or turn the pointer interaction on in a footer
- **Why it fails:** unmasked lines under a paragraph cost real legibility for zero signal. And a ground that lifts under the cursor in a footer is a flourish demanding attention at the exact moment the page is ending
- **Don't:** reach for a stock illustration, an isometric render, or an AI-generated hero because "imagery is allowed now"
- **Why it fails:** Contours is in-brand because it is a drawing of data, generated the same way on every site, commissioned from nobody. A 3D render of a glowing cube is somebody else's brand pretending to be yours. The permission is for *this* pattern, not for imagery in general

---

## The Mark Is Typeset

- **Do:** set the mark in type - two letters, `fg-default` tile, `bg-canvas` letters, `radius-sm`, weight 800, with the 7px accent notch
- **Don't:** check in an SVG of the mark because "it is easier to drop into a README"
- **Why it fails:** the moment a drawn copy exists, it is the one that gets updated and the typeset one drifts. It also freezes the accent, so a site that repoints its channel gets a mark in the wrong hue. Where type genuinely cannot be set, rasterise the typeset tile at build time - that keeps one definition
- **Don't:** fill the tile with the accent "for variety"
- **Why it fails:** the accent is the *subject*; the mark is the *identifier*. Mixing them confuses both roles - the mark stops being a fixed anchor and the accent stops being rare. The notch is already the accent's place in the mark, and it is deliberately the smallest one available
- **Don't:** add a tagline under the wordmark ("pivoshenko.dev - thoughts on engineering")
- **Why it fails:** the brand explains itself by *being*, not by captioning itself. A tagline is a tell that the brand does not trust its own legibility

---

## Glyphs, Not An Icon Set

- **Do:** use the brand's glyphs - `→` internal, `↗` external, `★` stars, `❯` prompt, `●` status, `▶ ◐ ◇ ■ ▲` for projects
- **Don't:** pull in Lucide, Feather, Heroicons or any icon package "for the one chevron"
- **Why it fails:** a stroke icon is drawn in a different language from the sentence beside it, at a different optical weight, and it needs a build dependency to render at all. The brand is text end to end - a glyph inherits the face, the color, the tracking and the accent channel for nothing
- **Don't:** put the official GitHub, LinkedIn and RSS marks in the footer
- **Why it fails:** three other companies' identities land in the quietest part of the page, at the moment the page is trying to end. `gh` / `in` / `rss` chips read as a continuation of the footer's own type, and they take the accent on hover, which a fixed-color brand SVG cannot. The `icon` prop is there for the case where a third party *requires* their mark - not for the case where the logos look more finished

---

## No Emoji

- **Do:** use a geometric glyph where a symbol genuinely helps
- **Don't:** use emoji as section dividers in a README ("## Quickstart" with a rocket)
- **Why it fails:** emoji introduces a different rendering engine, a different metaphor system and a different cultural register inside one paragraph. The brand is one register, end to end
- **Do:** allow exactly one contextual emoji in a GitHub repo *description* field - the one-liner under the repo name in a listing
- **Why this exception holds:** GitHub's listing is a wall of unstyled grey text, so a single emoji works as a typographic mark - the visual equivalent of an initial capital. It survives because it is one symbol against thirty words of plain text, and it is *outside* the brand's own rendered surfaces

---

## Voice: Practitioner's Notebook

- **Do:** "Execution is cheap now. Code? Generated. UI drafts? Ten in minutes."
- **Don't:** "In today's rapidly evolving landscape, AI is transforming how we approach software development."
- **Why it fails:** the second sentence is a LinkedIn opener. It performs gravitas instead of having gravitas. The brand sounds like a person who has the time to write briefly, not a person filling a content quota
- **Do:** "I lead the R&D team. In my spare time, I build small tools."
- **Don't:** "We're a team of passionate engineers building the future of developer productivity."
- **Why it fails:** "we" is wrong (no company). "Passionate" is wrong (claims an emotional state instead of showing it). "Building the future" is wrong (vague value). Every word is a tell
- **Don't:** number a section heading or a nav item - "1. Recent posts", "Step 2"
- **Why it fails:** headings name what is below them, in noun phrases. A number implies a sequence the reader is being marched through, which is a documentation-site idiom, not a notebook's
- **Don't:** start a heading with verb-noun marketing phrasing - "Build faster", "Ship better", "Unlock productivity"
- **Why it fails:** the brand is not selling anything. Headings are noun phrases: `Recent posts`, `Ports`, `Userstyles`
- **Don't:** use em-dashes for drama, ellipses for suspense, rhetorical question stacks
- **Why it fails:** all three are punctuation trying to do work the sentence is not doing. If the sentence is good, the punctuation can be a period

---

## When In Doubt

If a proposal triggers the question *"is this on-brand?"*, the answer is almost always no. The brand is decisive - it does not sit on the edge of its own rules. When something genuinely is in-brand, you do not have to ask.
