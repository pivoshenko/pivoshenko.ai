---
name: pivoshenko-brand
description: Central brand system for Volodymyr Pivoshenko — voice, type, color, layout, iconography. Self-contained; covers any output format (web UI, PDF, slide deck, README, social card, email, terminal/theme port, throwaway mock). Trigger even when the user doesn't say "brand" — any visual or copy decision touching pivoshenko surfaces counts. Also trigger on "make this on brand", "style this", "design a mock", "apply pivoshenko style", "needs to feel like my site", "generate a PDF / slide / poster / card", or any styling work on pivoshenko-adjacent content.
tags: [brand, design]
updated_at: 2026-08-31
---

# pivoshenko-brand

## What pivoshenko is

> **pivoshenko is the practitioner's notebook — a dark, monospaced workshop where an engineer thinks out loud.**

Every rule below descends from that sentence. If a future decision doesn't fit it, the decision is out — not the sentence. Read this line as the brand's positioning, not its tagline; it's the test, not the marketing.

The skill is organized in two layers:

- **DNA** — identity decisions that hold *across every substrate* (web, print, video, audio, physical). These don't change when you port to a new medium.
- **Expression** — how DNA gets rendered *in this substrate* (CSS tokens, hex values, pixel sizes, motion timings). These change per substrate; the DNA above them does not.

When porting to a substrate this skill doesn't enumerate, hold the DNA fixed and re-derive the expression. The *Porting to a new substrate* section below gives the rubric.

## Files

SKILL.md is the entry point. Open references only when the task calls for them — keeps context lean.

One rule for the tree: **everything under `preview/` is rendered HTML for a human to look at; everything else is for you to read.** The component cards are the exception worth reaching for — lift their markup instead of reinventing a component.

- `colors_and_type.css` — drop-in role tokens (CSS vars as `R G B` triples) + utility classes + 8 `type-*` recipes. Link or inline for any web prototype.
- `assets/logo-vp.svg` — canonical `VP` tile (32×32, 4px radius, light fill, dark glyph). The only mark.
- `assets/social/{github,linkedin,rss}.svg` — Simple Icons brand marks (footer use only).
- `assets/templates/` — drop-in artifact skeletons. **Start here for any one-shot output** — copy, fill placeholders, don't rebuild from scratch:
  - `page.html` — generic dark page (header + content + footer). Use for one-pagers, mocks, posters.
  - `document.html` — print-tuned (A4, `@page`, page-break hygiene). Render to PDF via headless Chrome.
  - `og-card.html` — 1200×630 social/OG card. Hex inlined because `@vercel/og` and most screenshotters don't resolve CSS variables.
- `references/voice.md` — content fundamentals: rhythm, casing, microcopy, refuse-list, smell test. **Read when writing copy** (post, README, social, email).
- `references/visual.md` — deep rationale for color + typography choices (origin / substitution / extension) and long-form spacing/border/layout rules. **Read when extending the palette, porting to a substrate without JetBrains Mono, or auditing a layout.**
- `references/iconography.md` — Lucide / Simple Icons / VP-mark rules. **Read when placing icons, building a logo lockup, or making a favicon / OG mark.**
- `references/anti-patterns.md` — do/don't pairs per DNA rule. **Read when a rule feels ambiguous, or when you've drifted and want to diagnose why.**
- `preview/*.html` — per-recipe component cards. Lift markup from these; read on demand:
  - `colors-*` — palette + accent usage
  - `type-*` — type recipes + foreground ladder
  - `spacing-*` — scale, borders, corners
  - `components-*` — card, button, tag, alert, code, chrome, menu, search, tabs, status, form-inputs, palette-table
- `preview/index.html`, `preview/components.html` — the two hub pages that frame the cards above for a human browsing them. Open one for the user when they want to *see* the system; they carry no rule you can't get from this file.

## DNA — identity (won't change across substrates)

Every line here is a hill the brand dies on. Break one -> looks like generic SaaS, not pivoshenko. These are *the* anchors — they hold whether the substrate is HTML, a printed booklet, a slide, a podcast cover, or a conference badge.

1. **Dark only.** No light mode, no toggle, no media-query fallback. The background absorbs; the foreground emits.
2. **One typeface, monospaced.** The whole brand reads in a single dev/terminal typeface. Headings, body, captions, code — same font. The practitioner's tool is the practitioner's voice.
3. **Grayscale chrome, one accent as subject.** UI is warm grey on warm black. The single accent is the *thing being looked at* (a link, a status dot, a focus ring, a copy-success flash) — never the container, never a button fill.
4. **Flat-edge.** No shadows, no gradients, no blur, no glow. Separation is 1px lines. Depth is implied, never rendered.
5. **Type and color only.** No stock photography, no illustration, no AI imagery, no 3D renders, no decorative shapes. The exception is *the work itself*: a terminal screenshot, a code listing, a mono portrait.
6. **One mark: `VP`.** Every surface uses the same tile — light fill, dark glyph, monospaced 700. Surfaces differentiate through the dotted wordmark suffix (`pivoshenko.<namespace>`) and the URL/title, never through a per-surface glyph.
7. **No emoji.** Not in UI, READMEs, commits, or social copy. Typographic restraint *is* the brand. **One exception:** the GitHub repo description field — a single contextual emoji is allowed there as visual punctuation in a wall of grey listing text. Nowhere else.
8. **Voice = practitioner's notebook.** First-person singular. Short declarative + short declarative + counterpunch. Lists do the heavy lifting. No hype, no marketing voice, no "we".

Rationale for the typeface and accent — origin, substitution rule, extension rule — lives in `references/visual.md`. Open it when porting to a substrate that can't deliver mono, or when extending the palette.

## Expression — web/CSS substrate (this is one rendering of the DNA)

The hex values, class names, and timings below are how DNA #1–#7 render in CSS. They are the *signature*, not the *soul*. A different substrate may pick different signature values for the same DNA.

### Token model

Tokens are space-separated `R G B` triples so they compose with alpha, consumed via `rgb(var(--token) / <alpha>)`:

```css
color: rgb(var(--fg-default));
background: rgb(var(--bg-surface));
border-color: rgb(var(--border-default) / 0.6);
```

Role tokens (single source of truth — `:root` in `colors_and_type.css`):

```
Background  --bg-canvas #1f1f1e  --bg-surface #262625  --bg-raised #2e2e2c
            --bg-sunken #1a1a19  --bg-overlay #57534e
Foreground  --fg-default #e4e2de  --fg-muted #b8b3a8
            --fg-subtle  #9b958a  --fg-faint #78716c
Border      --border-subtle #262625  --border-default #2e2e2c  --border-strong #373634
Accent      --accent-primary #d97757  (terracotta — the one accent)
            --accent-secondary #d4a85a
            --accent-success   #8a9d68  --accent-warning #d4a85a
            --accent-danger    #c87a72  --accent-info    #7ba0c4
```

Convenience aliases wrap the role tokens so utility classes read naturally: `fg-primary`/`fg-body`/`fg-muted`, `bg-page`/`bg-card`/`bg-elevated`, `border-ui`/`border-faint`, plus `-c` color-resolved forms (`--fg-muted-c`). **Prefer utility classes; reach for raw `rgb(var(--…))` only for one-off styles.**

For off-DOM contexts that can't resolve CSS variables (`@vercel/og`, `themeColor` meta, headless screenshotters), inline the raw hex values above.

### Web signature values

- **Page floor:** `--bg-canvas` `#1f1f1e`. Components never read the underlying hex.
- **Typeface:** `JetBrains Mono` everywhere — body, headings, nav, code. Fallback chain in `colors_and_type.css`.
- **Corner radius:** `4px` default. `8px` only for prose `<pre>`. `999px` only for the palette swatch circle.
- **Borders:** all `1px solid`. `border-ui` for primary lines, `border-faint` (same slot at 60% alpha) for dividers inside a card.
- **Motion:** one spec — `150ms ease` on `color, background-color, border-color`. No bounce, no spring, no scale, no entry animation.
- **Hover:** color class moves up one step in the foreground ladder. No pill, no underline, no left border on active nav.
- **Wordmark lockup:** `pivoshenko.<namespace>`, dotted — `pivoshenko` in `fg-primary`, the dotted suffix in `fg-muted`. Paired with the `VP` tile.

### Voice (quick reference)

- Pragmatic, technical, calm. Practitioner, not marketer.
- First-person singular. Any `pivoshenko.<namespace>` form stays lowercase, even at sentence start.
- Short declarative + short declarative + one-line counterpunch. Lists do heavy lifting.
- Favor: `practical notes`, `curated`, `experiments`, `step-by-step`, `baseline`, `ports`, `userstyles`.
- Posts, not articles.
- Refuse: hype (`game-changing`, `revolutionary`), vague value (`solutions`, `seamless`), playful slang (`awesome`, `super`), em-dashes for drama.
- Byline: `Volodymyr Pivoshenko <contact@pivoshenko.dev>` (mail-header style).
- Section labels SHOUT but small — uppercase via `.type-label`, widest tracking.

For longer copy work, open `references/voice.md` for the rhythm, refuse-list, microcopy table, and smell test.

## Porting to a new substrate

The brand outlasts any single medium. When the substrate isn't web — book cover, podcast art, conference badge, video lower-third, printed booklet, a new IDE port — *hold the DNA fixed and re-derive the expression* by walking these four questions:

1. **What is "dark" here?** The deepest absorbing value the substrate can render. On paper that's the warmest near-black the press can hold without bleeding; on a screen it's `#1f1f1e`; on audio it's the silence-tone the speaker assumes between words.
2. **What is "monospaced" here?** The substrate's most workshop-feeling expression of a single voice. On screen it's JetBrains Mono; on print it's the same family if licensable, otherwise the nearest mono with good rendering at the print weight; in video it's mono captions; in audio it's a steady, unhurried delivery (no music beds, no jingles).
3. **What is "the mark" here?** The `VP` tile, scaled and rendered in whatever the substrate offers. Always light tile, dark glyph; never inverted. On a badge it's debossed; on video it's the sting frame; on audio it's the spoken name in the same cadence as the writing.
4. **What is "the accent" here?** Terracotta `#d97757` if the substrate can hold color faithfully. If not, the accent collapses to *position* — the spot the eye lands on. In a grayscale newspaper it's the bolded word; in a single-color print run it's the only color used. The accent's job is "look here", and that job has a substrate-appropriate answer everywhere.

If all four questions have answers, the substrate is in. If one stays empty, the substrate isn't ready — pick a different one or constrain the artifact.

### Substrate cheat sheet

Same brand, different rendering. Each row is a worked instance of the four-question rubric.

- **Web UI (production)** -> role tokens + utility classes from `colors_and_type.css` (`bg-page`, `fg-primary`, `border-ui`, `type-label`, `type-meta`). Match patterns in `preview/components-*.html`.
- **Standalone HTML mock / prototype** -> start from `assets/templates/page.html`. Lift markup from `preview/components-*.html`.
- **PDF** -> start from `assets/templates/document.html` (A4, `@page`, page-break hygiene). Render via `chromium --headless --print-to-pdf` or any pipeline that respects `-webkit-print-color-adjust: exact`. Dark by design — including PDFs.
- **Social card / OG image** -> start from `assets/templates/og-card.html` (1200×630, VP tile top-left, title scaled up, one accent line). Hex inlined for `@vercel/og` / satori.
- **Slide deck / poster** -> stack `assets/templates/page.html` clones, one idea per slide. **Avoid `.pptx`** — binary formats fall outside the token system; ship slides as HTML or PDF.
- **README / GitHub markdown** -> no emoji in the body (the repo *description* field is the sole exception, one contextual emoji). Lowercase brand names. Tables + code fences over prose. Mail-header byline footer.
- **Email / signature** -> mono if the client supports it, system fallback otherwise. Plain text preferred. Single-line byline.
- **Terminal / theme port** -> map the hex values to the target tool's syntax. Background = `#1f1f1e`. Body = `#e4e2de`. Accent = `#d97757`. Don't invent shades — every color the port needs is already in the role layer.
- **Print booklet, podcast cover, conference badge, video lower-third, …** -> not enumerated. Walk the four questions above. Pull rationale from `references/visual.md` if substituting the typeface or extending the palette.
- **No spec given** -> ask audience, fidelity, target substrate. Then output.

## Quality checklist

Two passes. DNA first (does it *belong* to the brand?), expression second (is it correctly rendered *in this substrate*?).

**DNA — does this feel like pivoshenko regardless of medium?**

1. Dark floor, foreground emits?
2. Single monospaced (or substrate-equivalent) voice throughout?
3. Grayscale chrome; accent only as the thing being looked at, never the container?
4. Flat-edge: no shadows, gradients, blur, glow?
5. Type and color only — no decorative imagery?
6. `VP` mark present and unchanged?
7. Zero emoji (GitHub repo description excepted)?
8. Voice: practitioner's notebook, first-person, no hype?

**Expression — correctly rendered in this substrate?**

9. Right hex / class / token for this medium? Web uses tokens not raw hex; off-DOM contexts use raw hex.
10. Right radius / motion / border weight for the medium?
11. Right substitution if a DNA element can't render directly (e.g. typeface unavailable, color absent)? See `references/visual.md`.

**Final test:** Could this sit next to any other pivoshenko artifact and feel like the same hand made it? If yes, ship. If no, walk `references/anti-patterns.md` to find which rule got bent.

## How to use this skill

For a quick artifact (mock, poster, one-pager, slide, social card, PDF), start from `assets/templates/` and link `colors_and_type.css` (or inline its tokens). Lift component patterns from `preview/components-*.html` instead of reinventing. Always read tokens, never hexes.

For a substrate not enumerated above, walk the four porting questions, then output.

If invoked without further guidance, ask audience, fidelity, and target substrate. Then output.
