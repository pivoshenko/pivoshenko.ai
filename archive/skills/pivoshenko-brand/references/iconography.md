# Iconography

Read when placing a glyph, building a logo lockup, or making a favicon or OG mark.

The system has **no icon font and no logo file**. Icons are geometric glyphs set in type; the mark is typeset; brand logos in the footer are mono chips. Nothing here is vendored as an asset, and that is the point - every mark in the brand is text, so it inherits the palette, the weight, the tracking and the accent channel for free.

---

## The Mark

The mark is the site's **first two letters in a tile**, set in type. `pivoshenko.dev` gets `pv`; the tile is not a fixed `VP` graphic and it is never an image file.

`.pv-mark` in `components.css` is the implementation. The real numbers:

```
tile:       24x24, radius-sm (4px), inline-grid, centred
fill:       var(--fg-default)       /* light tile */
letters:    var(--bg-canvas)        /* dark letters */
type:       10px, weight 800, letter-spacing -0.04em, line-height 1
notch:      7x7 at right -3px / bottom -3px, 2px radius
notch fill: var(--accent)
notch ring: box-shadow 0 0 0 2px var(--bg-canvas)
hover:      the brand lockup rotates the tile -6deg over duration-base
```

The notch is the whole identity. Why -> the tile alone is a generic initial badge; the 7px accent square cut into its bottom-right corner, ringed by 2px of page color so it reads as *detached* rather than as a rounded corner, is the one shape nobody else has. It is also the smallest possible place to spend the accent, which is why the mark can carry it without the accent becoming decoration.

Rules:

- **Always light tile, dark letters.** The accent never fills the tile - it only ever appears as the notch
- **The notch reads the channel**, so the mark takes the site's accent automatically. That is the intended behaviour, not drift
- **Weight 800 and `-0.04em`**, at every size. The letters are meant to feel packed
- **`radius-sm`** at every size. Do not scale the radius with the tile
- **Two letters, lowercase**, from the site's own name. A one-letter mark reads as a placeholder

### Where Type Cannot Be Set

A favicon, an OG image, an app icon, an email header - substrates with no CSS and no font loading. **Render the typeset tile to a raster at build time.** Rasterise the real `.pv-mark` markup at the target size and commit the output as a build artifact, not as a source asset.

Why -> the moment a hand-drawn SVG of the mark exists in the repo, it is the thing that gets updated and the typeset one drifts. Checking in the *output* of the tile keeps one definition. It also means a site that repoints its accent gets a matching favicon without anyone redrawing it.

At favicon sizes, drop the ring around the notch before you drop the notch - at 16px the 2px ring eats the whole corner, but a 1px accent square still reads.

---

## The Wordmark Lockup

Text, never an asset. `type-logo` (14/20, weight 600, `-0.025em`) reading `pivoshenko.<namespace>`, in three parts:

| Part | Class | Color |
|---|---|---|
| `pivoshenko` | `.pv-brand__root` | `fg-default` |
| `.` | `.pv-brand__dot` | `fg-faint` |
| `<namespace>` | `.pv-brand__suffix` | `var(--accent)` |

The suffix is one of the six places the accent is spent. The dot is deliberately `fg-faint` - decorative, at a size where 3.4:1 is fine.

Pair it with the mark in every header, 10px apart.

---

## Glyphs, Not Icons

The brand's entire icon vocabulary is a small set of geometric glyphs set in the mono face. They inherit `currentColor`, take the foreground ladder like any text, and need no package.

| Glyph | Means |
|---|---|
| `→` | An internal link - "more of this, over here" |
| `↗` | An external link - leaves the site |
| `★` | A star count |
| `❯` | The prompt mark - search fields, terminal lines |
| `●` | A status dot |
| `▶ ◐ ◇ ■ ▲` | Project glyphs - one per project, arbitrary but fixed |

Why glyphs and not Lucide -> a stroke icon is drawn in a different language from the typeface next to it, at a different optical weight, and it needs a build-time dependency to render at all. A glyph is set in the same face as the sentence it sits in, so it scales, colors and tracks with the text. The brand is text end to end; the icons should be too.

Where they land in the components:

- **Arrows** are `var(--accent)` and nudge 4px right on hover over `duration-base` (`.pv-link__arrow`, `.pv-row__go`, `.pv-tile__go`)
- **The project glyph** sits in a 28x28 `bg-raised` tile at `radius-sm`, 14px, in `var(--accent)` (`.pv-card__glyph`)
- **Callout glyphs** take their tone color - info, success, warning, danger - and always travel with a word
- **Status dots** are 6x6 at `radius-full` in `currentColor`
- **The empty-state glyph** is 20px in `var(--accent)`

A project glyph is fixed per project. Why -> it is a recognition handle in a grid of cards, and a handle that changes is not a handle. Pick one from the set and leave it.

---

## Footer Links Are Mono Chips

The footer's elsewhere-links are **not brand logos**. Each is a two- or three-letter mono chip in a bordered square:

```
32x32 grid, centred
border: 1px solid var(--border-default)
radius: radius-sm
fill:   var(--bg-canvas)
text:   var(--fg-subtle), 500 11px/1 mono
hover:  fg-default, border-color var(--accent), translateY(-2px)
```

`gh`, `in`, `rss`. Each carries an `aria-label` with the real destination - the chip is legible, not self-explanatory.

Why -> official brand marks drag three other companies' identities into the quietest part of the page, at exactly the moment the page is trying to end. Three mono chips read as a continuation of the footer's own type instead of as a row of logos. They also take the accent on hover, which a fixed-color brand SVG cannot.

**The escape hatch:** `SiteFooter`'s `links` accept an `icon` prop, and a real SVG mark passed there renders at 16x16 with `fill: currentColor`. Use it when a third party *requires* their official mark - a partner page, a press kit, a platform whose terms mandate it. Not because the logos look more finished.

---

## Emoji And Unicode

- **No emoji** in UI, READMEs, commits, or social copy. Where a symbol genuinely helps, use a glyph from the set above
- **The one exception** is the GitHub repo *description* field - the one-liner under the repo name in a listing. A single contextual emoji is allowed there as typographic punctuation against a wall of unstyled grey text. Never inside the README itself
- **Separator** is `·`, the middle dot, never a slash
- **Dimensions use a real multiplication sign:** `3840×2160`
- **Numbers are tabular.** `meta` and `Stat` set `font-variant-numeric: tabular-nums` so dates and sizes align down a column
