# Visual Foundations

> pivoshenko is the practitioner's notebook - a dark, monospaced workshop where an engineer thinks out loud.

Read this file when you need to extend the palette beyond its current values, port to a substrate that cannot deliver the faces or the accent, or audit a layout that feels off. `SKILL.md` gives the rules; this file gives the *why* - origin, substitution rule, extension rule - so a fallback is not guesswork.

The values themselves live in `colors_and_type.css` and the component rules in `components.css`. Both mirror the design system. This file does not repeat them; it explains what they are for.

The system is narrow on purpose: one mode, one palette, two faces, one accent at a time, one pattern. Structure comes from `//` labels, hairlines and tabular numbers - not from boxes and color.

---

## Mode

**Dark only.** No light mode, no media-query fallback, no toggle. Deployed sites set `<meta name="theme-color" content="#1f1f1e">` and `color-scheme: dark`.

Why -> the brand's worldview is the workshop at night. A light mode is not a variant of pivoshenko; it is a different brand. Accessibility is solved by the foreground ladder carrying real contrast, not by inverting.

---

## Color - Popil

The palette is **Popil**, the warm-ash flavour of `pivoshenko.theme`. Twenty-six slots, mirrored from that repo's `themes/palettes/*.json` so the site, the terminal, the editor and the browser all sit in one color space.

### Two Layers

The palette has two layers, and the distinction is load-bearing:

1. **Palette slots** - `--peach`, `--surface0`, `--overlay1` and the other 23. Raw material. They mirror the source JSON exactly and they carry no meaning
2. **Role tokens** - `--bg-surface`, `--fg-muted`, `--accent-primary` and the rest. Each aliases a slot and names a *job*

**Build with role tokens. Never reach past them into a slot.** Why -> the slot layer is what gets re-skinned when a second flavour of the theme ships. A component that reads `var(--surface0)` directly survives the re-skin visually but stops meaning anything, and the next flavour breaks it silently. The one sanctioned exception is `data-accent`, below, which repoints the accent *channel* at a named slot - that is the layer doing its job, not a bypass.

### The Slot Ladder

Fourteen hues (`rosewater flamingo pink mauve red maroon peach yellow green teal sky sapphire blue lavender`) and twelve neutrals, from `text` at the top through `subtext1 subtext0 overlay2 overlay1 overlay0 surface2 surface1 surface0 base mantle` down to `crust`. The hues also drive syntax highlighting in the theme, which is why there are more of them than the web surface needs; a hue with no web role (`sky`, `sapphire`, `lavender`, `mauve`) is still a legal `data-accent` target.

### Role Tokens

| Token | Slot | Job |
|---|---|---|
| `--bg-canvas` | `base` | The page background of every `pivoshenko.*` site |
| `--bg-surface` | `surface0` | Cards, tiles, callouts, swatches, code blocks - always with `border-card` and `shadow-rest` so it reads as a surface, not a tint |
| `--bg-raised` | `surface1` | A step above `bg-surface`: tags, hovered rows, pressed controls, the card glyph tile |
| `--bg-sunken` | `mantle` | Wells: the header on scroll, inputs, the terminal title bar |
| `--bg-overlay` | `overlay0` | Scrim fill for dialogs and lightboxes, used at 80% |
| `--crust` | `crust` | Deepest ground: terminal bodies, the footer band, image letterboxing |
| `--fg-default` | `text` | Titles and primary copy, 12.8:1 on canvas |
| `--fg-muted` | `subtext1` | Body paragraphs, 7.9:1 |
| `--fg-subtle` | `subtext0` | Nav, meta, dates, section labels, 5.6:1. **Use this for any small text** |
| `--fg-faint` | `overlay1` | 3.4:1 on canvas, 2.8:1 on `bg-raised`. Decorative only |
| `--border-subtle` | `surface0` | Dividers inside a surface, table rows |
| `--border-default` | `surface1` | Card and header outlines, hairline rules in a page |
| `--border-strong` | `surface2` | Hovered cards, input outlines, the dashed rule |
| `--border-card` | `overlay0` @ 60% | The outline of a raised surface. Visible against `bg-canvas` without reading as a heavy box |

Status roles travel with a word or a glyph, never by color alone: `--accent-success` (green), `--accent-warning` (yellow), `--accent-danger` (red), `--accent-info` (blue). Why -> `accent-success` and `accent-danger` differ in hue only, so a colorblind reader gets nothing from the swap.

### Contrast

Text must hold 4.5:1; 3:1 is the floor at 24px and up, and for control borders, focus rings and icons. The measured values that constrain real decisions:

- `fg-faint` is **3.4:1** on canvas and 2.8:1 on `bg-raised`. It fails body-size text. Separators, the wordmark dot, disabled states, 24px+ only
- `accent-primary` is 5.3:1 on `bg-canvas` and `bg-surface`, but **4.4:1 on `bg-raised`** - not for small text there
- `accent-danger` is 4.6:1 on canvas, 4.2:1 on `bg-surface`, 3.8:1 on `bg-raised`. On a card use it for icons, borders and 19px+ bold text, not small copy
- `accent-info` is 6:1 on canvas; `overlay2` is 5.5:1 and is what code comments are set in
- `on-accent` (`base`) clears 5:1 on every accent, which is what makes an accent fill legal at all
- The focus ring is 5.3:1 on both `bg-canvas` and `bg-surface`

Accent text goes only on `bg-canvas` or `bg-surface`. Text on an accent fill uses `on-accent`.

### Extension Rule

When a new use of color is forced (charts, a status beyond the four, an infographic), derive from the layers above - do not invent:

- **A second highlight** -> `--accent-secondary` (yellow). Star counts, index contour lines, inline code keywords. Do not add a third
- **A chart palette of 3-7 series** -> walk the accent ring in order: `primary -> success -> info -> secondary -> danger -> teal -> sapphire`. Seven brand-native, categorically distinct colors before invention is needed
- **A tint ramp** -> stay single-hue. Step luminance from the accent, never saturation. Cross-hue ramps (red -> yellow -> green) are out
- **A neutral the role layer does not have** -> take the nearest slot from the ladder rather than mixing a new grey. That is what the slot layer is for
- **Never** a hue outside the 26 slots. The color promise is "this exact palette, used precisely"

### Substitution Rule

When the substrate cannot render the palette faithfully:

- **Single-color print** -> the accent collapses to *position*: the bolded word, the only italic, the spot where a mark sits. The eye still has somewhere to land
- **Grayscale or e-ink** -> use the accent at full saturation and let it dither. The mid-luminance of every accent slot is what keeps it separable from the foreground ladder. Do not remap it to a grey
- **Outside sRGB** -> match the Oklch coordinates, not the RGB triple. `accent-primary` is approximately `oklch(67% 0.13 40)`. A perceptual match beats a numerical one

---

## The Accent Channel

This is the newest idea in the system and the one most often got wrong.

`--accent` is not a color. It is a **channel**: a single variable that every component reads, pointed by default at `--accent-primary` (peach `#d97757`). Putting `data-accent="blue"` - or any of the fourteen hue names - on `<html>`, a header, a footer or any wrapper repoints it for everything inside.

```html
<html data-accent="sapphire">        <!-- whole site -->
<footer data-accent="green">         <!-- one band -->
```

Why a channel -> sibling sites need to be one family *and* tell themselves apart. If each site picked its own colors, they would be four brands. If they all shared one accent, they would be four copies of one site. A single repointable channel gives each surface an identity while the grayscale chrome, the type, the depth and the pattern stay identical. The family is everything except the accent.

**The accent is spent in a fixed, small set of places.** This list is the whole budget:

- The wordmark suffix - the `.dev` of `pivoshenko.dev`
- The 96px header tick at the bottom-left of the header, and its twin on the footer's top edge
- The active nav item's 2px bar
- The `//` in front of a section label
- Index lines in the Contours field, every `accentEvery`-th line
- Card and tile hovers: the `accent-glow` cursor spotlight, the arrow that nudges, the row marker

Everything else is grayscale. Why -> the accent marks *what is being looked at*, never *what to click* and never the container holding it. Spread it across chrome and it stops being a signal and becomes decoration; then the one place it mattered has nothing left to say.

Focus rings are the deliberate exception: they read `--accent-primary`, not `--accent`. Why -> a focus ring must be recognisable as the same object on every sibling site, and it must keep its measured 5.3:1 regardless of which hue a wrapper chose.

---

## Typography

**Two families. They are not interchangeable.**

```
--font-mono:    "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace
--font-display: "Martian Mono", "JetBrains Mono", ui-monospace, monospace
```

### Why JetBrains Mono

Mono is the typeface of the practitioner - it is what code, terminals, diffs and config files look like. The brand is a workshop, not a showroom, so the workshop's voice is the workshop's typeface. JetBrains Mono specifically because it ships as a **variable face across 100-800**, renders cleanly at 11-13px where most of this system lives, has true italics (rare in mono), and has round counters and a generous x-height that survive being used for body copy rather than only code. Other monos read as code-only; JBM reads as prose written by someone who codes.

It sets everything by default: nav, body, captions, metadata, tags, code, the mark.

### Why Martian Mono For Display Only

`display` is Martian Mono, and it appears in exactly three styles - `display-xl`, `display-lg`, `display-md`. Page titles and large section headers. Nothing else.

Why -> Martian Mono is wide, geometric and grid-locked. At 28px and up, with tracking pulled to `-0.04em` and weight at 700, that width closes into a solid block that reads as a *different layer* of the page, not a bigger paragraph. That layer separation is the whole point. At body size the same face is unreadable, and used for a card title it just looks like the body copy got fatter. **Tight tracking plus weight 700 is what makes a header a header here** - not size alone.

### The Twelve Styles

| Style | Family | Metrics | Used for |
|---|---|---|---|
| `display-xl` | display | 64/64, 700, -0.04em | Hero title on landing pages. One per page |
| `display-lg` | display | 44/48, 700, -0.035em | Hero on inner pages; the hero on mobile |
| `display-md` | display | 28/34, 600, -0.025em | Blog post titles, large section headers, `Stat` values |
| `post-heading` | mono | 20/1.375, 600 | In-article h2 |
| `heading` | mono | 16/24, 600 | Card and list-item titles |
| `label` | mono | 12/16, 500, 0.1em, uppercase | Section labels, prefixed with `//` |
| `lede` | mono | 16/26, 400 | The hero intro paragraph |
| `body` | mono | 14/1.625, 400 | Paragraphs and descriptions |
| `ui` | mono | 14/20, 500, -0.01em | Nav, buttons, tags |
| `logo` | mono | 14/20, 600, -0.025em | The wordmark beside the mark |
| `caption` | mono | 12/1.625, 400 | Disclaimers, image captions |
| `meta` | mono | 12/16, 400, tabular | Dates, sizes, counts, hex values |

`meta` carries `font-variant-numeric: tabular-nums` and so does `Stat`. Why -> a column of dates or sizes that does not align is the fastest way to make a catalog look unbuilt.

Prose caps at `76ch`.

### Substitution Rule

When JetBrains Mono is unavailable (no webfont loader, a print shop without the license, a video editor missing the family, an embedded device), substitute *down* this chain:

1. **iA Writer Mono / Duo** - closest spirit, designed for prose set in mono
2. **IBM Plex Mono** - open license, similar weight coverage
3. The system mono stack already declared as the fallback in `colors_and_type.css`

**When the display cut is what is missing**, do not substitute a different display face. Fall back to JetBrains Mono at weight 800 and hold the tracking (`-0.04em` at xl, `-0.035em` at lg, `-0.025em` at md). Why -> the header layer is made by *mass and tightness*, and JBM at 800 still delivers both; a substituted geometric sans delivers neither and reads as a different brand's headline. The declared `--font-display` stack already does this, so a missing Martian Mono degrades correctly on its own - the rule exists for substrates that do not read CSS.

What never substitutes: a non-mono. The moment the typeface stops being monospaced, the brand stops being the brand. "A sans looks cleaner in long-form" is the failure mode; refuse it.

---

## Depth

The old rule was flat-edge, no shadows. That is gone. **Every raised surface carries three things together:**

```
background: var(--bg-surface)
border:     1px solid var(--border-card)
box-shadow: var(--shadow-rest)
```

`shadow-rest` is `inset 0 1px 0 rgba(255,255,255,0.04)`, plus `0 1px 2px rgba(0,0,0,0.45)` and `0 10px 24px -18px rgba(0,0,0,0.8)`. The inset line lights the **upper edge** of the surface.

**That combination, not the fill alone, is what separates a surface from the page.** Why -> the palette's neutral steps are deliberately close together (`base` `#1f1f1e` to `surface0` `#262625` is barely a step). A card that only changes its fill does not read as raised; it reads as a smudge. The lit top edge and the 1px outline do the separating, and the drop is what makes the lit edge legible as light rather than as a stray hairline. Ship all three or ship none - two of the three is worse than a flat box.

Tags sit one step higher, on `bg-raised`, and carry the same border and shadow.

The rest of the depth vocabulary:

- **`shadow-lift`** is *added* to `shadow-rest` on hover for cards and tiles, together with a 2px rise and an outline stepping up to `overlay1`
- **`shadow-float`** replaces rest on things that genuinely float above the page: terminal windows, dropdown menus, lightboxes
- **`accent-glow`** is a 360px radial spotlight of the accent at 14%, tracked to the cursor across a card. Never behind text as its only contrast
- **12px backdrop blur** on sticky surfaces, over a `scrim` fill. The sticky header and the media tile index chip are the two places it appears

Still out: gradients as decoration (the glow and the mask are functional), glow as a rim on borders, drop shadows on text, and depth applied to something that is not a surface.

---

## Pattern - Contours

The signature background: a slowly drifting field of lines drawn from noise, in `overlay0`, with every `accentEvery`-th line painted in `--accent` as an index line. It reacts to the pointer. It is the only imagery the brand has, and it is generated, never authored.

Why it is in-brand where a stock illustration is not -> it is a *drawing of data*, not a picture of an idea. Nothing about it is stock, nothing about it was commissioned, and it is the same field on every site - only the seed and the accent change.

**Four variants:**

- `topo` (default) - contour lines of a hill field. The general-purpose choice
- `ridge` - stacked ridgelines, each row painted over the one behind it. Denser and more graphic; good for footers and section breaks. `rowGap` sets the row pitch, default 26px
- `dots` - a grid of dots that swell where the ground rises. The quietest; correct behind dense content, and the live twin of the static fallback
- `step` - the same contours with every crossing snapped to the grid, so lines run at right angles. The most technical; good for catalog and docs pages

**A site picks one variant and keeps it.** Vary the `seed` from page to page so the map changes as people navigate; never vary the variant. Why -> the variant is part of that site's identity, the same way the accent is. Switching it between pages reads as a different template, not a different page.

Rules that are not negotiable:

- **One field per viewport.** Two fields on one screen fight each other and neither reads as ground
- **Masked away from copy.** `mask="radial"` pulls the lines off the text; keep copy on `bg-canvas`. `mask="bottom"` fades a field into the section below
- **Interaction on in page headers, off in footers.** `interactive` defaults true - the ground lifts under the cursor (`bump` 0.16, `reach` 210px) and a click sends a ring out (`ripple`). In a footer that is a distraction under content nobody is reading; pass `interactive: false`
- **`lake` tilts the field into perspective** (`rotateX(52deg)`, scaled and dropped), for a floating-surface look under a hero
- **Pointer events are read from the parent**, so put the field inside the section it should react to
- **`speed: 0`** freezes it. `cell` (default 14px per sample) trades fidelity for cost - larger is cheaper and softer

**Static fallback, no JS:** a 16px dot grid of `overlay0` dots at 60% opacity, which is what `.pv-tile__ph` already renders behind a missing image. Use it in email, in an OG image, in any export. It is the `dots` variant with the motion taken out, which is why it does not read as a different pattern.

Under `prefers-reduced-motion` the field renders **one still frame with no interaction**. It also runs at roughly 24fps, pauses off-screen, and idles without repainting when nothing moves.

---

## Spacing, Borders, Radii

**Spacing** is a 4px scale: `space-1` 4, `space-2` 8, `space-3` 12, `space-4` 16, `space-6` 24, `space-8` 32, `space-12` 48, `space-16` 64, `space-24` 96. Nothing between the steps. A gap that wants 20px is a gap that has not decided whether it is 16 or 24.

**Borders** are 1px, always:

- `border-default` for hairlines inside a page - card outlines that are not raised surfaces, the header's bottom edge
- `border-subtle` for dividers *inside* a surface - table rows, the card eyebrow's underline
- `border-card` for the outline of a raised surface
- `border-strong` for a hovered input, and for the dashed rule
- Hovered cards and tiles step their outline to `overlay1`, one notch brighter than `border-card`

**The dashed rule** is 4px on, 4px off, in `border-strong`, as a `repeating-linear-gradient` at 90deg. It marks section rules (the line trailing a section heading) and the footer bar's top edge. It is not a generic divider - a hairline is.

**Radii:**

| Token | Value | Used for |
|---|---|---|
| `radius-sm` | 4px | Tags, nav links, the mark, inline code |
| `radius-md` | 6px | Buttons, inputs, swatches, dropdown panels |
| `radius-lg` | 10px | Cards, tiles, terminals, code blocks, prose images |
| `radius-full` | 9999px | Status dots and count pills only |

---

## Layout

- **Content max-width 1152px**, centred, with `space-6` gutters on desktop and `space-4` below 640px
- **Header height 56px.** Bottom border `border-default`, a 96px accent tick at its bottom-left. Sticky variant swaps the fill for `scrim` plus a 12px blur
- **Sections separated by `space-12` to `space-16`.** A section is a heading row plus its content; the heading row is `//` + label + optional count pill + dashed rule filling the remaining width
- **Card grids** are `repeat(auto-fill, minmax(280px, 1fr))` with `space-4` gaps and `space-6` padding inside each card
- **The footer is its own band** - `crust` fill, `border-strong` top edge with the accent tick riding it, `space-16` of air above it
- **Page headers are built per page** from the type scale and `[data-reveal]`, not from a fixed component. How much copy belongs in one is a per-page decision

---

## Motion

Three durations, two easings, and a hard stop:

- `duration-fast` **120ms** - color and opacity on hover
- `duration-base` **220ms** - the 2px card lift, the 4px arrow nudge, the nav marker slide
- `duration-slow` **600ms** - entrances
- `ease-out` `cubic-bezier(0.2, 0.8, 0.2, 1)` for entrances and lifts; `ease-in-out` `cubic-bezier(0.65, 0, 0.35, 1)` for marker slides

`[data-reveal]` rises an element 12px on load; `[data-reveal="2"|"3"|"4"]` stagger it 80ms apart. Use it on a hero and on the first row of a grid, not on everything - a page where every element arrives separately reads as a slideshow.

Nothing bounces, springs, scales past 1.04, or loops fast. Under `prefers-reduced-motion`: no entrance, no lift, no pattern interaction, one still frame of the field.
