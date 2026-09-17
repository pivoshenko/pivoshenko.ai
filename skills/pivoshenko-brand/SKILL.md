---
name: pivoshenko-brand
description: >-
  Central brand system for Volodymyr Pivoshenko - voice, type, color, layout, iconography, motion.
  Mirrors the pivoshenko design system artifact, which is the source of truth; works offline and
  covers any output format (web UI, PDF, slide deck, README, social card, email, terminal/theme
  port, throwaway mock). Trigger even when the user does not say "brand" - any visual or copy
  decision touching pivoshenko surfaces counts, including "make this on brand", "apply pivoshenko
  style", "needs to feel like my site", and "style this" / "design a mock" / "generate a PDF or
  poster" when the output is a pivoshenko surface or the author's own material. Long-form posts
  -> `blog-write`, which consumes this skill's voice.md.
tags: [brand, design]
updated_at: 2026-09-17
---

# Pivoshenko Brand

## What pivoshenko Is

> **pivoshenko is the practitioner's notebook - a dark, monospaced workshop where an engineer thinks out loud.**

Every rule below descends from that sentence. If a future decision doesn't fit it, the decision is out - not the sentence. Read this line as the brand's positioning, not its tagline; it's the test, not the marketing.

The skill is organized in two layers:

- **DNA** - identity decisions that hold *across every substrate* (web, print, video, audio, physical). These don't change when you port to a new medium
- **Expression** - how DNA gets rendered *in this substrate* (CSS tokens, hex values, pixel sizes, motion timings). These change per substrate; the DNA above them does not

When porting to a substrate this skill doesn't enumerate, hold the DNA fixed and re-derive the expression. The *Porting to a New Substrate* section below gives the rubric.

## The Source of Truth

The pivoshenko design system lives at `https://claude.ai/artifact/VfDdFyysx4jxGW3JgBtUyE`. It is canonical for every token, component and visual rule. This skill mirrors it so an agent with no Artifact tool still works - **where the two disagree, the artifact wins.**

Read it with the Artifact tool:

```
Artifact(action: "read_file", url: "https://claude.ai/artifact/VfDdFyysx4jxGW3JgBtUyE", path: "project/README.md")
```

- `project/README.md` - the brand book
- `project/tokens.json` - every token, with its usage note and contrast ratio
- `project/components/bundle.css` - the real CSS
- `project/components/index.d.ts` - the component APIs
- `project/components/<Name>/README.md` and `preview.html` - one per component: ArrowLink, BackToTop, Breadcrumb, Callout, Card, CodeBlock, Contours, Cover, Dropdown, EmptyState, List, MediaTile, Prose, SearchField, SectionHeading, SiteFooter, SiteHeader, Stat, Swatch, TableOfContents, Tag, TerminalWindow

**Re-sync rule.** When the design system changes: re-sync `colors_and_type.css` from `project/tokens.json` and `components.css` from `project/components/bundle.css`, then walk `references/` and `preview/` for anything the change invalidated. Never hand-edit a value in the mirror to fix a discrepancy - fix the design system, then re-sync. *Why -> a value edited only here diverges silently, and the next agent reads the artifact, not the mirror.*

Reading the artifact is the whole contract. **Do not publish to it** as a side effect of using this skill.

## Files

SKILL.md is the entry point. Open references only when the task calls for them - keeps context lean.

One rule for the tree: **everything under `preview/` is rendered HTML for a human to look at; everything else is for you to read.** The component cards are the exception worth reaching for - lift their markup instead of reinventing a component.

- `colors_and_type.css` - tokens, the accent channel, the 12 `type-*` recipes and the utility classes. Mirrored from `project/tokens.json`. Link or inline for any web output
- `components.css` - the `pv-*` component classes. Mirrored from `project/components/bundle.css`. Requires `colors_and_type.css`, which carries the tokens and the font import it reads
- `references/voice.md` - content fundamentals: rhythm, casing, microcopy, refuse-list, smell test. **Read when writing copy** (post, README, social, email). Consumed by the `blog-write` skill, which owns long-form posts - edits here change its non-negotiables
- `references/visual.md` - deep rationale for color and typography (origin / substitution / extension) and long-form spacing/border/layout rules. **Read when extending the palette, porting to a substrate without JetBrains Mono, or auditing a layout**
- `references/iconography.md` - the typeset mark, the glyph set, footer chips, favicon and lockup rules. **Read when placing a symbol, building a lockup, or making a favicon / OG mark**
- `references/anti-patterns.md` - do/don't pairs per DNA rule. **Read when a rule feels ambiguous, or when you've drifted and want to diagnose why**
- `assets/templates/` - drop-in artifact skeletons. **Start here for any one-shot output** - copy, fill placeholders, don't rebuild from scratch:
  - `page.html` - generic dark page (header + content + footer). Use for one-pagers, mocks, posters
  - `document.html` - print-tuned (A4, `@page`, page-break hygiene). Render to PDF via headless Chrome
  - `og-card.html` - 1200x630 social/OG card. Hex inlined because `@vercel/og` and most screenshotters don't resolve CSS variables. Re-check the inlined hexes after any token change
- `preview/*.html` - the rendered cards: the `colors-*`, `type-*`, `spacing-*` and `brand-*` foundations, then one `components-*` card per design system component. `preview/_base.css` is their shared scaffold and imports both stylesheets
- `preview/index.html`, `preview/components.html` - the two hub pages that frame the cards for a human browsing them. Open one for the user when they want to *see* the system; they carry no rule you can't get from this file

There is no logo file and no icon file. The mark is typeset and footer links are mono chips - see DNA #6.

## DNA - Identity (Won't Change Across Substrates)

Every line here is a hill the brand dies on. Break one -> looks like generic SaaS, not pivoshenko. These are *the* anchors - they hold whether the substrate is HTML, a printed booklet, a slide, a podcast cover, or a conference badge.

1. **Dark only.** No light mode, no toggle, no media-query fallback. One theme. The background absorbs; the foreground emits
2. **One monospaced voice, one display cut.** Everything is set in mono. A single display face is allowed for page titles and large headers *only* - nothing else gets a second face, ever. Body, nav, captions, code, meta all read in the one mono voice. The practitioner's tool is the practitioner's voice
3. **Grayscale chrome, one accent at a time, and the accent is the subject.** Chrome is warm grey on warm ash. Exactly one accent is live on a surface, and it marks *the thing being looked at* - a link, the wordmark suffix, the active nav bar, the `//` of a section label, a focus ring. Never the container, never a button fill. Which hue is live is a per-site choice; that there is only one is not
4. **Structure comes from hairlines and a lit top edge, never from decoration.** A raised surface is a fill plus a 1px outline plus a lit upper edge, travelling together - the palette's steps are too close to separate on fill alone. Shadow lifts on interaction; it does not ornament. Craft shows in small things: the notched mark, dashed rules, a 4px arrow nudge, a glow that follows the cursor. Nothing else is added
5. **No photography, no illustration, no stock, no AI imagery, no 3D.** The only imagery is generated by the system itself (the line field behind the page) or *is the work*: a terminal screenshot, a code listing, a wallpaper being catalogued
6. **The mark is typeset, never a file.** Two letters set in the brand's own type - light tile, dark glyph, small radius, one accent notch. Surfaces differentiate through the dotted wordmark (`pivoshenko.<namespace>`) and the accent, never through a per-surface glyph. The same rule kills brand logos elsewhere: an external link is a mono chip (`gh`, `in`, `rss`) with a label, not a vendor mark
7. **No emoji.** Not in UI, READMEs, commits, or social copy. Where a symbol genuinely helps, it is a geometric glyph from the brand set (`→ ↗ ★ ❯ ● ▶ ◐ ◇ ■ ▲`). Typographic restraint *is* the brand. **One exception:** the GitHub repo description field - a single contextual emoji is allowed there as punctuation in a wall of grey listing text. Nowhere else
8. **Calm motion.** Things rise in once and settle. No bounce, no spring, no loop, no autoplay, no attention-seeking entrance. Motion reacts to the reader; it never performs at them. Every animation stops under `prefers-reduced-motion`
9. **Voice = practitioner's notebook.** First-person singular. Short declarative + short declarative + counterpunch. Lists do the heavy lifting. Sentence case. No hype, no marketing voice, no "we"

Rationale for the typeface and accent - origin, substitution rule, extension rule - lives in `references/visual.md`. Open it when porting to a substrate that can't deliver mono, or when extending the palette.

## Expression - Web/CSS Substrate (This Is One Rendering of the DNA)

The hex values, class names and timings below are how the DNA renders **in CSS**. They are the *signature*, not the *soul* - a different substrate picks different signature values for the same DNA. All of it is mirrored from the design system; don't invent a value that isn't here.

### Token Model

Tokens are plain values, read directly. There are no `R G B` triples, no `rgb(var(--token))` wrapper, and no alias names - that model is gone:

```css
color: var(--fg-default);
background: var(--bg-surface);
border: 1px solid var(--border-card);
```

Alpha lives in the token that needs it (`--border-card`, `--accent-glow`, `--selection`, `--scrim`), so nothing composes alpha at the call site.

Below the roles sits **Popil** - the warm-ash palette from `pivoshenko.theme`, 26 slots (`rosewater` ... `crust`). Build with the role tokens; reach for a raw slot only when porting the palette to another tool.

Role tokens (`:root` in `colors_and_type.css`):

```
Background  --bg-canvas  #1f1f1e  page
            --bg-surface #262625  cards, tiles, callouts, code
            --bg-raised  #2e2e2c  tags, hovered rows, pressed controls
            --bg-sunken  #1a1a19  inputs, title bars, path strips
            --bg-overlay #57534e  dialog scrim fill, at 80%
            --crust      #151514  terminal bodies, footer band, letterboxing
Foreground  --fg-default #e4e2de  titles, primary copy      12.8:1
            --fg-muted   #b8b3a8  paragraphs                 7.9:1
            --fg-subtle  #9b958a  nav, meta, dates, labels   5.6:1
            --fg-faint   #78716c  decorative only            3.4:1
Border      --border-subtle #262625  dividers inside a surface
            --border-default #2e2e2c hairlines in a page
            --border-strong #373634  input outlines, dashed rules
            --border-card rgba(87,83,78,.6)  the outline of a raised surface
Accent      --accent-primary #d97757  peach, the default
            --accent-secondary #d4a85a  --accent-success #8a9d68
            --accent-warning   #d4a85a  --accent-danger  #e05d55
            --accent-info      #7ba0c4  --on-accent      #1f1f1e
Effect      --accent-glow rgba(217,119,87,.14)  --selection rgba(217,119,87,.28)
            --scrim rgba(21,21,20,.72)
```

**Contrast.** Text holds 4.5:1 (3:1 at 24px+, control borders, focus rings, icons). `--fg-faint` is 3.4:1 - decorative only, never body-size text; small text takes `--fg-subtle`. Status hues always travel with a word or glyph, never colour alone.

For off-DOM contexts that can't resolve CSS variables (`@vercel/og`, satori, `themeColor` meta, headless screenshotters), inline the raw hex above.

### The Accent Channel

Components read `var(--accent)`, which defaults to `--accent-primary`. Any site or section repoints it with `data-accent="blue"` on `<html>`, a header, a footer or any wrapper - 14 palette hues are wired in `colors_and_type.css`. *Why -> that is how sibling sites stay one family while telling themselves apart.*

The accent is spent in a fixed few places: the wordmark suffix, the 96px header tick, the active nav bar, the `//` of section labels, the index lines in the pattern, card and tile hovers, and the mark's notch. The focus ring is the exception - it stays `--accent-primary` even where the channel is repointed.

### Type Scale

Two families. `--font-mono` (JetBrains Mono, variable 100-800) sets everything; `--font-display` (Martian Mono) is for the three display styles only. Both load from Google Fonts in `colors_and_type.css`. Twelve named styles, all as `.type-*` recipes:

```
Display (--font-display)
  display-xl     64/64   700  -0.04em   hero title, one per page
  display-lg     44/48   700  -0.035em  inner-page hero; mobile hero
  display-md     28/34   600  -0.025em  post titles, large section headers
Headings (--font-mono)
  post-heading   20/1.375 600           in-article h2
  heading        16/24   600            card and list-item titles
  label          12/16   500  +0.1em    section labels, uppercase, `//` prefixed
Text (--font-mono)
  lede           16/26   400            hero intro paragraph
  body           14/1.625 400           paragraphs and descriptions
  ui             14/20   500  -0.01em   nav, buttons, tags
  logo           14/20   600  -0.025em  the wordmark beside the mark
  caption        12/1.625 400           disclaimers, image captions
  meta           12/16   400            dates, sizes, counts, hex - tabular
```

Formats: dates `Mar 2026`, sizes `8.47 MB`, dimensions `3840×2160` with a real multiplication sign. Numbers are tabular.

### Web Signature Values

- **Wordmark lockup:** `pivoshenko.<namespace>` - root in `--fg-default`, the dot in `--fg-faint`, the suffix in `var(--accent)`. Paired with the typeset mark (`.pv-mark`): 24px tile, `--fg-default` fill, `--bg-canvas` letters, `--radius-sm`, 7px accent notch at bottom-right
- **Radius:** `--radius-sm` 4px (tags, nav links, the mark, inline code), `--radius-md` 6px (buttons, inputs, swatches), `--radius-lg` 10px (cards, tiles, terminals), `--radius-full` 9999px (status dots and count pills only)
- **Depth:** every raised surface carries `--bg-surface` + 1px `--border-card` + `--shadow-rest` together. `--shadow-lift` on hover, `--shadow-float` on terminals, menus and lightboxes. Sticky surfaces use `--scrim` with a 12px backdrop blur
- **Borders:** all 1px. Dashed rules are 4px on / 4px off in `--border-strong` - section rules and the footer bar. Hovered cards step their outline up to `#78716c`
- **Motion:** `--duration-fast` 120ms (colour, opacity), `--duration-base` 220ms (2px card lift, 4px arrow nudge, nav marker slide), `--duration-slow` 600ms (entrances). `--ease-out` for entrances and lifts, `--ease-in-out` for marker slides. `[data-reveal]` rises an element 12px on load; `[data-reveal="2"|"3"|"4"]` stagger 80ms apart. All of it off under `prefers-reduced-motion`
- **Focus:** solid 2px `--accent-primary` outline, offset 2px
- **Layout:** `--content-max` 1152px, gutters `--space-6` desktop / `--space-4` mobile, `--header-height` 56px. Sections separated by `--space-12`-`--space-16`. Card grids `auto-fill, minmax(280px, 1fr)` with `--space-4` gaps and `--space-6` padding. The footer is its own `--crust` band with a `--border-strong` top edge
- **Section labels:** uppercase `.type-label`, prefixed with `//` in the accent - `// recent posts`

### Contours - The Pattern

The signature background is a live field of lines drawn from drifting noise, in `overlay0`, with index lines in `var(--accent)`. Four variants - `topo`, `ridge`, `dots`, `step`. Pick one per site and keep it; change the seed page to page, not the variant. One field per viewport, masked away from copy, pointer-reactive in page headers and inert in footers. `lake` tilts it into perspective. Static, non-JS fallback: a 16px dot grid of `overlay0`.

### Voice (Quick Reference)

- Pragmatic, technical, calm. Practitioner, not marketer
- First-person singular. Any `pivoshenko.<namespace>` form stays lowercase, even at sentence start
- Sentence case for titles and nav. No numbers in nav or section headings
- Short declarative + short declarative + one-line counterpunch. Lists do heavy lifting
- Tags and catalog names are lowercase and hyphenated, exactly as in the repo: `spec-apply`, `openspec`
- Favor: `practical notes`, `curated`, `experiments`, `step-by-step`, `baseline`, `ports`, `userstyles`
- Posts, not articles
- Refuse: hype (`game-changing`, `revolutionary`), vague value (`solutions`, `seamless`), playful slang (`awesome`, `super`), em-dashes for drama
- Byline: `Volodymyr Pivoshenko <contact@pivoshenko.dev>` (mail-header style)

For longer copy work, open `references/voice.md` for the rhythm, refuse-list, microcopy table, and smell test.

## Porting to a New Substrate

The brand outlasts any single medium. When the substrate isn't web - book cover, podcast art, conference badge, video lower-third, printed booklet, a new IDE port - *hold the DNA fixed and re-derive the expression* by walking these questions:

1. **What is "dark" here?** The deepest absorbing value the substrate can render. On paper that's the warmest near-black the press can hold without bleeding; on a screen it's `#1f1f1e`; on audio it's the silence-tone the speaker assumes between words
2. **What is "monospaced" here, and what is the display cut?** The substrate's most workshop-feeling expression of a single voice, plus one tighter, heavier cut reserved for titles. On screen that's JetBrains Mono with Martian Mono for `display-*`; in print it's the same pair if licensable, otherwise the nearest mono with good rendering at the print weight and its own bold as the display cut; in video it's mono captions with a heavier title card; in audio the display cut is the slower, lower delivery reserved for the episode title. If the substrate can only carry one cut, drop the display cut - never the mono
3. **What is "the mark" here?** Two letters set in the substrate's own type - light tile, dark glyph, one accent notch. Never an image file, never inverted. On a badge it's debossed; on video it's the sting frame; on audio it's the spoken name in the same cadence as the writing
4. **What is "the accent" here?** One hue, faithfully, if the substrate can hold colour. If not, the accent collapses to *position* - the spot the eye lands on. In a grayscale newspaper it's the bolded word; in a single-colour print run it's the only colour used. The accent's job is "look here", and that job has a substrate-appropriate answer everywhere
5. **What is "the pattern" here, if anything?** Contours ports as an *idea* - a quiet field the system draws for itself - not as a canvas. In print it's a fine line screen or the 16px dot grid; on a static page it's the dot-grid fallback; in video it's a slow drift behind the title card

Questions 1-4 must all have answers. If one stays empty, the substrate isn't ready - pick a different one or constrain the artifact. **Question 5 may answer "none", and that is fine** - the pattern is Expression, not DNA. What is DNA is the refusal underneath it (rule #5): if there *is* a background, the system draws it, and it is never a photograph.

### Substrate Cheat Sheet

Same brand, different rendering. Each row is a worked instance of the rubric above.

- **Web UI (production)** -> role tokens from `colors_and_type.css` plus the `pv-*` classes from `components.css`. Match the patterns in `preview/components-*.html`; read the artifact's component README for the full API
- **Standalone HTML mock / prototype** -> start from `assets/templates/page.html`. Lift markup from `preview/components-*.html`
- **PDF** -> start from `assets/templates/document.html` (A4, `@page`, page-break hygiene). Render via `chromium --headless --print-to-pdf` or any pipeline that respects `-webkit-print-color-adjust: exact`. Dark by design - including PDFs. No JS, so Contours takes the static dot-grid fallback, and shadows flatten: keep the 1px outlines doing the separating
- **Social card / OG image** -> start from `assets/templates/og-card.html` (1200x630, typeset mark top-left, title in `display-lg`/`display-xl`, one accent line). Hex inlined for `@vercel/og` / satori, which resolve no CSS variables
- **Slide deck / poster** -> stack `assets/templates/page.html` clones, one idea per slide. **Avoid `.pptx`** - binary formats fall outside the token system; ship slides as HTML or PDF
- **README / GitHub markdown** -> no emoji in the body (the repo *description* field is the sole exception, one contextual emoji). Lowercase brand names, sentence-case headings. Tables + code fences over prose. Mail-header byline footer
- **Email / signature** -> mono if the client supports it, system fallback otherwise. Plain text preferred. Single-line byline. No display cut - one voice
- **Terminal / theme port** -> map the 26 Popil slots to the target tool's syntax, not just the three role hexes. Background `base` `#1f1f1e`, body `text` `#e4e2de`, accent `peach` `#d97757`, terminal body `crust` `#151514`. Don't invent shades - `pivoshenko.theme` is upstream and every colour a port needs is already a slot
- **Print booklet, podcast cover, conference badge, video lower-third, ...** -> not enumerated. Walk the five questions above. Pull rationale from `references/visual.md` if substituting the typeface or extending the palette
- **No spec given** -> ask audience, fidelity, target substrate. Then output

## Quality Checklist

Two passes. DNA first (does it *belong* to the brand?), expression second (is it correctly rendered *in this substrate*?).

**DNA - does this feel like pivoshenko regardless of medium?**

1. Dark floor, foreground emits, no light mode anywhere?
2. One mono voice throughout, with the display cut confined to page titles and large headers?
3. Grayscale chrome; exactly one accent live, and it marks the subject, never the container?
4. Structure from hairlines and a lit edge - no ornament, no shadow doing decorative work?
5. No photography, illustration, stock or AI imagery - only generated pattern or the work itself?
6. The mark typeset rather than placed as a file; external links as mono chips, not vendor logos?
7. Zero emoji (GitHub repo description excepted); symbols from the geometric glyph set?
8. Motion calm - rises once, settles, and stops under reduced motion?
9. Voice: practitioner's notebook, first-person, sentence case, no hype?

**Expression - correctly rendered in this substrate?**

10. Right token / class for this medium? Web reads `var(--token)` and `pv-*`; off-DOM contexts inline raw hex
11. Contrast held - 4.5:1 for text, `fg-subtle` not `fg-faint` for small copy, status hues carrying a word or glyph?
12. Right radius / depth / motion / border weight for the medium, and the layout constants respected?
13. Right substitution where a DNA element can't render directly (typeface, colour, pattern)? See `references/visual.md`

**Final test:** Could this sit next to any other pivoshenko artifact and feel like the same hand made it? If yes, ship. If no, walk `references/anti-patterns.md` to find which rule got bent.

## How to Use This Skill

For a quick artifact (mock, poster, one-pager, slide, social card, PDF), start from `assets/templates/`, link `colors_and_type.css` and `components.css` (or inline their tokens), and lift component patterns from `preview/components-*.html` instead of reinventing. Always read tokens, never hexes.

When a component's behaviour or API matters, read it from the design system - `project/components/<Name>/README.md` - rather than inferring it from the mirrored CSS.

### Gotchas

- **`components.css` loads after `colors_and_type.css`, so a `pv-*` rule beats a `type-*` recipe on the same element.** The one place this bites: `.pv-section__title` sets `font: inherit`, so putting `type-label` on the heading does nothing. Put it on the container instead - `<div class="pv-section type-label">` - and the slash, title and count all inherit correctly
- **A `.pv-rows` row grids as `var(--lead) 1fr auto`.** A row with no lead cell slides its body into the lead column, so give every row a lead
- **`pv-row__lead`, `pv-code__name` and `pv-menu__value` have no rules of their own.** The components emit them and they take their look from `pv-meta` or the flex row - keep them for markup parity, but don't expect them to style anything

For a substrate not enumerated above, walk the five porting questions, then output.

If invoked without further guidance, ask audience, fidelity, and target substrate. Then output.
