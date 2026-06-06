# Iconography

Read when placing icons, building a logo lockup, or making a favicon / OG mark. The system uses **two icon sources**. Do not invent or hand-roll new icons.

## Lucide (primary)

[Lucide React](https://lucide.dev/) for all interface icons.

- **Stroke weight is the Lucide default (`1.5–2`).**
- **Standard sizes: 12, 14, 16 px.** Most UI icons at `w-4 h-4` (16px). Tiny meta icons at `w-3 h-3` (12px).
- **Icons inherit `currentColor`.** They take the same fg ladder as text.

For HTML prototypes that can't import the React package:

```html
<script src="https://unpkg.com/lucide@latest"></script>
<script>lucide.createIcons()</script>
```

## Simple Icons (logos only)

Inline `<svg>` paths from [Simple Icons](https://simpleicons.org/) for the **GitHub, LinkedIn, and RSS** marks in the footer. Render at `w-4 h-4`, inherit `fg-muted`. Saved in `assets/social/`.

## The VP mark

The personal mark is the **`VP` tile** — vendored as `assets/logo-vp.svg`:

```
background: var(--fg-default)   /* #e4e2de — light tile */
foreground: var(--bg-canvas)    /* #1f1f1e — dark glyph */
glyph:      "VP"
font:       JetBrains Mono, 700, 17px, letter-spacing: -0.5px
canvas:     32×32, 4px radius (3px at 16px)
```

**`VP` is the only mark.** Every surface uses the same tile, every size. There is no per-surface glyph variant. Surfaces differentiate through:

1. The **dotted wordmark suffix** — `pivoshenko.<namespace>` (the namespace = whatever the surface is).
2. The **URL/title** of the surface.
3. (Optional, on banners) a single **accent dot** in the top-left lockup.

Why: at 16px (browser tab) a swapped glyph barely reads; at ≥32px the wordmark already disambiguates; keeping the tile constant makes `VP` a stronger anchor the more places it shows up unchanged.

Rules:

- **JetBrains Mono 700**, `VP` at ~53% of tile height, `-0.5px` tracking.
- **4px radius** at ≥24px; **3px** at 16px (favicon).
- **Always light tile / dark glyph.** Use directly on `--bg-page`.
- **The accent never fills the tile.** Monochrome only.

## Wordmark lockup

Text, not an asset. `type-logo` reading `pivoshenko.<namespace>`, dotted — `pivoshenko` in `fg-primary`, the dotted suffix in `fg-muted`. Pair with the `VP` tile in every nav bar.

## Emoji and unicode

- **No emoji** in UI, READMEs, commits, or social copy. Lucide only when a glyph is needed. Sole exception: GitHub repo description field (one contextual emoji allowed).
- **Unicode arrows as text glyphs:** `→` (more), `←` (back), `↗` (external), `·` (separator).
- **Tabular nums.** Dates use `tabular-nums` so months align in lists.
