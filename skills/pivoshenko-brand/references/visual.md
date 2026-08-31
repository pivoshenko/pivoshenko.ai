# Visual foundations

> pivoshenko is the practitioner's notebook — a dark, monospaced workshop where an engineer thinks out loud.

Read this file when you need to extend the palette beyond its current values, port to a substrate that can't deliver mono or terracotta, or audit a layout that feels off. SKILL.md gives the rules; this file gives the *why* — origin, substitution rule, extension rule — so a fallback isn't guesswork.

The system is intentionally narrow: one font, one mode (dark), one palette, a handful of utility classes. Everything that isn't text is either a 1px border or a Lucide icon.

## Why JetBrains Mono

**Origin.** Mono is the typeface of the practitioner — it's what code, terminals, diffs, and config files look like. The brand is a workshop, not a showroom, so the workshop's voice is the workshop's typeface. JetBrains Mono specifically because it has full weight coverage (400/500/600/700), excellent screen rendering at small sizes, true italics (rare in mono), and a humane geometry — round counters, generous x-height — that survives being used for body copy, not just code. Other monos read as code-only; JBM reads as *prose written by someone who codes*.

**Substitution rule.** When JBM isn't available (no webfont loader, print shop without the license, video editor missing the family, embedded device), substitute *down* this chain, in order:

1. **iA Writer Mono / Duo** — closest spirit (designed for prose in mono).
2. **IBM Plex Mono** — open license, similar weight coverage.
3. The system mono stack — `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace`. This is what `colors_and_type.css` already declares as fallback.

What never substitutes: a *non*-mono. The moment the typeface stops being monospaced, the brand stops being the brand. A sans-serif "looks cleaner" temptation is the failure mode — refuse it.

**Extension rule.** Need a second face (a hand-set headline, a chart legend, a watermark)? Stay in JBM, change *weight* or *case* instead. The hierarchy is built from one family by mass, not by mixing families.

## Why terracotta `#d97757`

**Origin.** The accent's job is "look here" — it marks the *subject*, never the *container*. Terracotta was chosen because it satisfies three constraints simultaneously:

1. **Warm.** The whole palette is warm-grey (`#1f1f1e` reads brown-black, not blue-black). A cool accent (electric blue, magenta) would feel imported from a different brand. Terracotta belongs to the same temperature family.
2. **Pre-digital.** It reads as fired clay, weathered brick, rust — materials older than screens. That matters because the brand is *a practitioner's workshop*, and workshops have a material history. A native-digital accent (neon, holographic gradient) breaks the workshop frame.
3. **Single-channel safe.** Terracotta survives being printed in one ink, projected through a single-color filter, or rendered on a grayscale device — it stays distinguishable from the neutrals because it's mid-luminance, not just mid-hue. A pure red or pure orange would either disappear into the grey or shout over it.

**Substitution rule.** When the substrate can't render `#d97757` faithfully:

- **Single-color print (no color budget):** the accent collapses to *position* — the bolded word, the only italic, the spot where a typographic mark sits. The eye still has somewhere to land.
- **Grayscale screen / e-ink:** use `--accent-primary` at full saturation; the dithered grey it becomes (~55% luminance) still reads as "different" against the foreground ladder. Don't try to remap to a different grey.
- **Outside sRGB (print process colors, video color spaces):** match the *Lab/Oklch* coordinates of `#d97757`, not the RGB triple. Approximate: `oklch(67% 0.13 40)`. A perceptual match beats a numerical one.

**Extension rule.** When a new use of color is forced (charts, infographics, a status palette beyond the existing four), derive from the role layer, don't invent:

- **Need a second accent for contrast?** Use `--accent-secondary` `#d4a85a` (warm amber — same temperature family, complementary luminance). Don't introduce a third.
- **Need a chart palette (3–7 series)?** Walk the existing accent ring — `primary -> success -> info -> warning -> danger -> secondary` — in that order. Six categorically-distinct, brand-native colors before any invention is required.
- **Need a tint ramp (heatmap, scale)?** Stay single-hue. Start from `--accent-primary` and step *only luminance*, not saturation: 10% -> 25% -> 50% -> 75% -> 100%. Cross-hue ramps (red -> yellow -> green) are out of brand.
- **Never:** introduce a hue not already in the role layer (no greens that aren't `--accent-success`, no blues that aren't `--accent-info`, no purples ever). The brand's color promise is "this exact ring, used precisely". Breaking it dilutes the rest.

## Mode

**Dark only.** No light mode, no media-query fallback, no toggle. Deployed sites set `<meta name="theme-color" content="#1f1f1e">` and `color-scheme: dark`.

## Color — role tokens

Stored as `R G B` triples, consumed via `rgb(var(--token) / <alpha>)`. **One block of values. Re-skin in one place.**

```
Background  --bg-canvas   #1f1f1e
            --bg-surface  #262625
            --bg-raised   #2e2e2c
            --bg-sunken   #1a1a19
            --bg-overlay  #57534e

Foreground  --fg-default  #e4e2de
            --fg-muted    #b8b3a8
            --fg-subtle   #9b958a
            --fg-faint    #78716c

Border      --border-subtle   #262625
            --border-default  #2e2e2c
            --border-strong   #373634

Accent      --accent-primary    #d97757  (terracotta)
            --accent-secondary  #d4a85a
            --accent-success    #8a9d68
            --accent-warning    #d4a85a
            --accent-danger     #c87a72
            --accent-info       #7ba0c4
```

## Color — usage rule

`--accent-primary` is the brand's one accent — link underline, active nav dot, focus ring, copy-success flash. **Never a button fill.** Status accents (`success`/`warning`/`danger`/`info`) appear only as soft washes.

Tailwind's `stone-*` warm-grey ramp is available as raw hex tokens for the rare component that needs a neutral outside the role layer. Reach for it last.

## Semantic status colors

| Role     | FG slot               | hex       |
|----------|-----------------------|-----------|
| success  | `--accent-success`    | `#8a9d68` |
| warning  | `--accent-warning`    | `#d4a85a` |
| error    | `--accent-danger`     | `#c87a72` |
| info     | `--accent-info`       | `#7ba0c4` |
| neutral  | `--fg-subtle`         | `#9b958a` |

All status backgrounds are the foreground color at 16–18% alpha, exposed as `--status-{role}-bg`. **Loud safety reds and bright greens are out of scope.**

## Typography

**One font: JetBrains Mono.**

```
font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
```

Used for everything — logos, nav, body copy, captions, metadata, code. Eight type recipes (`.type-*` in `colors_and_type.css`):

| Recipe              | Style                                              | Used for                                  |
|---------------------|----------------------------------------------------|-------------------------------------------|
| `type-heading`      | 16px / 600                                         | page h1                                   |
| `type-post-heading` | 20px / 600, snug leading                           | blog post h1                              |
| `type-body`         | 14px / 400, relaxed leading                        | prose paragraphs                          |
| `type-ui`           | 14px / 400                                         | post titles, nav links                    |
| `type-label`        | 12px / 400, uppercase, widest tracking             | section labels: `RECENT POSTS`, `2026`    |
| `type-meta`         | 12px / 400                                         | dates, reading time, tags, footer         |
| `type-caption`      | 12px / 400, relaxed leading                        | post description snippets                 |
| `type-logo`         | 14px / 600, tight tracking                         | the wordmark in nav                       |

## Foreground utility classes

A 6-step grayscale ladder, named by *role* and *intent*. Each binds to a role token; rebind the token to change the whole system.

| Class           | Token            | Used for                                  |
|-----------------|------------------|-------------------------------------------|
| `fg-primary`    | `--fg-default`   | active nav, h1, strong emphasis           |
| `fg-title`      | `--fg-muted`     | post titles in listings                   |
| `fg-secondary`  | `--fg-muted`     | link text                                 |
| `fg-body`       | `--fg-muted`     | body paragraphs                           |
| `fg-subtle`     | `--fg-subtle`    | inactive nav, descriptions                |
| `fg-muted`      | `--fg-faint`     | dates, tags, footer text, section labels  |

## Backgrounds

- **Page:** `--bg-page` -> `--bg-canvas` (`#1f1f1e`).
- **Card:** `--bg-card` -> `--bg-surface`.
- **Elevated:** `--bg-elevated` -> `--bg-raised`. Used by popovers and the TOC.
- **Tag:** `--bg-tag` -> `--bg-raised` at 70%.
- **No gradients. No images. No textures, grain, or patterns.**

## Borders

- **All borders are 1px solid.**
- **Two classes:** `border-ui` (`--border-default`) for primary lines, `border-faint` (same slot at 60% alpha) for dividers inside a card.
- **Cards:** `border-ui`, no shadow, 4px radius (`rounded`).
- **Header / footer:** single `border-b border-ui` / `border-t border-ui` line. That's the only chrome.

## Shadows

**None.** The system uses 1px borders for separation.

## Corner radii

- **Default: `rounded` (4px).** Cards, tags, copy buttons, list items.
- **`rounded-full`** for one element only: the palette color swatch circle.
- **`rounded-lg` (8px)** for one element only: prose `<pre>` code blocks.

## Transparency and blur

- **No blur. Anywhere.**
- **Two uses of transparency:** `bg-tag` (`--border-default` @ 70%) and `border-faint` (same @ 60%).

## Animation

- **One transition spec:** `transition-property: color, background-color, border-color; duration: 150ms; timing: ease;` (global `*`).
- **No bounce, no spring, no scale.** The reading progress bar sets `transition-none` — it tracks scroll instantly.
- **No entry animations on page load.** Pages just appear.

## Hover & press

- **Text hover:** color class moves up one step in the foreground ladder.
- **Active link in nav:** `fg-primary` instead of `fg-subtle`. No pill, no underline, no left border.
- **Press states are not styled.** No `:active` rule.
- **Disabled buttons:** `opacity-40`, hover suppressed.

## Layout

- **Page width is capped.** Showcase: `max-w-6xl` (1152px). Blog: `max-w-4xl` (896px). Startpage: grid, fills width.
- **Horizontal padding:** `px-4` on the main column.
- **Nav / footer** are full-width with their content in the same `max-w-*` column.
- **Reading progress bar:** `fixed top-0 left-0 right-0 h-[2px] z-50` — over the nav.
- **TOC button + scroll-to-top button:** `fixed bottom-6 left-6` / `bottom-6 right-6`. Both 32×32, 1px border, no background.

## Cards

```
1px border-ui          (--border-default)
4px corner radius
bg-card                (--bg-surface)
no shadow
no header gradient
section labels inside the card use type-label
the label sits in a row with border-b border-ui below it
```

Same card in the palette table, the startpage bookmark grid, and the ports grid.

## Layered/floating elements

- **No modals, no dialogs.** The TOC opens as a 64-wide popover above its button. That is it.
- **No tooltips.** Icon buttons rely on `aria-label`.
- **No toasts.** The copy button shows a green checkmark for 1.2s in-place.

## Imagery

The system has no photography. If a future deck or page needs imagery, the hierarchy is:

1. **None** — try to use type and color alone (the default).
2. **A terminal screenshot** — on `--bg-canvas`, monospace text in `fg-*`, optional accent dusting. No rounded corners, no shadow.
3. **A user portrait** — black and white, square, no border.

Never use stock photography, illustration, AI-generated imagery, or 3D renders.
