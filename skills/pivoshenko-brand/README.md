# Pivoshenko Design System

The visual and content system behind **Volodymyr Pivoshenko**'s personal brand — a
Principal AI/R&D Engineer who builds tools, themes, and writing with a single
through‑line: **minimalism, simplicity, and cross‑tool consistency**.

The system is **dark only**. There is no light mode anywhere, and none of the
deployed surfaces (`pivoshenko.dev`, `pivoshenko.theme`, `pivoshenko.ai`,
`pivoshenko.startpage`, `pivoshenko.wallpapers`) expose a toggle. The browser
`<meta name="theme-color">` ships as `#1f1f1e`.

It is **token-driven**. The vendored role tokens — `--bg-canvas/surface/raised/sunken/overlay`,
`--fg-default/muted/subtle/faint`, `--border-subtle/default/strong`,
`--accent-primary…info` — live in `colors_and_type.css` as space-separated
`R G B` triples and are consumed via `rgb(var(--token) / <alpha>)`. The full
hex mirror lives in the `palette` module (off-DOM contexts: OG images via
`@vercel/og`, `themeColor` meta tag). Re-skin via `just vendor-preset` —
`tokens.css` and the hex mirror move together.

**Naming rule.** Components read role tokens and utility classes
(`bg-page`/`fg-primary`/`border-ui`/`fg-accent`), never hex literals.

---

## Sources

Everything in this design system was reverse‑engineered from the engineer's own
public repositories:

| Surface | Live | Source |
|---|---|---|
| Personal blog (Next.js)                 | <https://www.pivoshenko.dev>        | <https://github.com/pivoshenko/pivoshenko.dev> |
| Theme palette + ports                   | <https://theme.pivoshenko.dev>      | <https://github.com/pivoshenko/pivoshenko.theme> |
| Minimal startpage (Next.js)             | <https://startpage.pivoshenko.dev>  | <https://github.com/pivoshenko/pivoshenko.startpage> |
| AI workspace — skills + MCPs            | <https://ai.pivoshenko.dev>         | <https://github.com/pivoshenko/pivoshenko.ai> |
| Wallpapers — curated collection         | <https://wallpapers.pivoshenko.dev> | <https://github.com/pivoshenko/pivoshenko.wallpapers> |
| GitHub profile README                   | —                                   | <https://github.com/pivoshenko/pivoshenko> |
| dotfiles                                | —                                   | <https://github.com/pivoshenko/pivoshenko.dotfiles> |

All five web surfaces live on `*.pivoshenko.dev` subdomains and share one
chrome: a `VP` mark, a dotted `pivoshenko.<surface>` wordmark in the nav,
and the same `type-*` / `fg-*` / `border-ui` CSS surface. The theme repo is
the **source of truth for palette values** — the hex mirror in `ui/palette.ts`
and the role tokens in `ui/tokens.css` get vendored into every other surface
via `just vendor-preset`.

---

## Index

```
README.md                  ← you are here
SKILL.md                   ← Agent Skill entrypoint (Claude Code compatible)
CLAUDE.md                  ← Claude Code working rules
index.html                 ← entry landing page
components.html            ← inventory of every preview card
colors_and_type.css        ← vendored role tokens + utility classes + type recipes
assets/
  logo-vp.svg              ← canonical VP tile (32×32) — every repo, every size
  social/github.svg        ← Simple Icons brand marks (footer use only)
  social/linkedin.svg
  social/rss.svg
preview/                   ← reference cards (palette, type, components, brand, spacing)
```

**Fonts:** JetBrains Mono is loaded from Google Fonts at runtime by
`colors_and_type.css` — no font files are vendored. Production uses Next.js'
`JetBrains_Mono`, which is the same Google file.

---

## CONTENT FUNDAMENTALS

The voice is **engineer‑precise, first‑person, lowercase by default, and short
of breath on purpose.** Sentences are clipped. Paragraphs are one to three
lines. Lists do the heavy lifting. There is no marketing copy.

### Person and tense

- **First person, singular.** "*I* lead the R&D team", "*In my* spare time", "*my* space to experiment." The site is signed `2026 Volodymyr Pivoshenko <contact@pivoshenko.dev>` in the footer — not a company name.
- **Direct address is rare.** The writing addresses *the reader* only when it is making a point. The blog is not "let me tell you how to". It is closer to a notebook.

### Casing

- **Brand names are lowercase.** `pivoshenko.theme`, `pivoshenko.dev`, `pivoshenko.ai`, `pivoshenko.startpage`, `pivoshenko.wallpapers`, `pivoshenko.dotfiles`, `bat`, `bottom`, `delta`, `fish`, `fzf`, `ghostty`, `helix`, `k9s`, `lazygit`, `spicetify`, `zed`, `zen`. Always lowercase, even at the start of a sentence. The dotted form is the lockup: `pivoshenko` in `fg-primary`, the `.suffix` namespace in `fg-muted`.
- **Proper names get title case.** `Volodymyr Pivoshenko`. `Principal AI/R&D Engineer`.
- **Section labels are SHOUTING but small** — `RECENT POSTS`, `LINKS`, `CONTENTS`, `2026`. Rendered via `.type-label` (uppercase, widest tracking), so the shout is quiet.

### Cadence

From the engineer's own writing on the blog:

> "We are entering a world where execution is increasingly cheap.
>
> Need code? AI can generate it.
> Need UI drafts? AI can produce ten in minutes.
> Need tests, docs, PR summaries? Same story."

**Short declarative + short declarative + a one‑line counterpunch.** No
em‑dashes for drama, no rhetorical questions strung together for effect. When
there is a question, it is followed by an answer in the next line.

### Emoji

- **Product UI uses no emoji.** Use Lucide icons.
- **README files and repo descriptions are the only place emoji lives** — they function as visual punctuation in a wall of GitHub text (`🥑 pivoshenko's theme`, `📕 pivoshenko's dotfiles`, `🇺🇦 pivoshenko's profile`).

### Vocabulary cues

- "ports" — terminal/desktop targets
- "userstyles" — browser injection layer
- Author byline: `Volodymyr Pivoshenko <contact@pivoshenko.dev>` (mail‑header style)

### Microcopy patterns

- Empty state: `No posts yet.` (a sentence, not an illustrated empty-state)
- More‑link: `All posts →`
- Back‑link: `← Blog`
- Tag chips: lowercase, hyphenated, no `#`: `product-thinking`, `ai`
- Post date: `Mar 20, 2026` for detail, `Mar 20` in lists, `Mar 2026` on home
- Reading time: `5 min read`

---

## VISUAL FOUNDATIONS

The system is intentionally narrow. One font, one mode (dark), one palette,
a handful of utility classes. Everything that isn't text is either a 1px
border or a Lucide icon.

### Mode

**Dark only.** No light mode, no media-query fallback, no toggle. The
deployed sites all set `<meta name="theme-color" content="#1f1f1e">` and
`color-scheme: dark`.

### Color — role tokens

The vendored role layer. Stored as `R G B` triples, consumed via
`rgb(var(--token) / <alpha>)`. **One block of values. Re-skin in one place.**

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

### Color — usage rule

The single **`--accent-primary`** token — piped into link underline, active
nav dot, focus ring, and the copy-success flash — is the brand's one accent.
**Never a button fill.** The other accents (`success`/`warning`/`danger`/`info`)
appear only as soft status washes.

Stone neutrals (Tailwind's `stone-*`) are vendored as raw hex tokens for the
rare component that needs a warm grey outside the role layer. Reach for them
last.

### Semantic status colors

| Role     | FG slot               | hex       |
|----------|-----------------------|-----------|
| success  | `--accent-success`    | `#8a9d68` |
| warning  | `--accent-warning`    | `#d4a85a` |
| error    | `--accent-danger`     | `#c87a72` |
| info     | `--accent-info`       | `#7ba0c4` |
| neutral  | `--fg-subtle`         | `#9b958a` |

All status backgrounds are the foreground color at 16–18% alpha, exposed as
`--status-{role}-bg`. **Loud safety reds and bright greens are out of scope.**

### Typography

**One font: JetBrains Mono.**

```
font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
```

Used for everything — logos, nav, body copy, captions, metadata, code. Eight
type recipes (`.type-*` in `colors_and_type.css`):

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

### Foreground utility classes

A 6‑step grayscale ladder, named by *role* and *intent*. Each binds to a role
token; rebind the token to change the whole system.

| Class           | Token            | Used for                                  |
|-----------------|------------------|-------------------------------------------|
| `fg-primary`    | `--fg-default`   | active nav, h1, strong emphasis           |
| `fg-title`      | `--fg-muted`     | post titles in listings                   |
| `fg-secondary`  | `--fg-muted`     | link text                                 |
| `fg-body`       | `--fg-muted`     | body paragraphs                           |
| `fg-subtle`     | `--fg-subtle`    | inactive nav, descriptions                |
| `fg-muted`      | `--fg-faint`     | dates, tags, footer text, section labels  |

### Backgrounds

- **Page:** `--bg-page` → `--bg-canvas` (`#1f1f1e`).
- **Card:** `--bg-card` → `--bg-surface`.
- **Elevated:** `--bg-elevated` → `--bg-raised`. Used by popovers and the TOC.
- **Tag:** `--bg-tag` → `--bg-raised` at 70%.
- **No gradients.** **No images.** **No textures, grain, or patterns.**

### Borders

- **All borders are 1px solid.**
- **Two classes:** `border-ui` (`--border-default`) for primary lines, `border-faint` (same slot at 60% alpha) for dividers inside a card.
- **Cards:** `border-ui`, no shadow, 4px radius (`rounded`).
- **Header / footer:** single `border-b border-ui` / `border-t border-ui` line. That's the only chrome.

### Shadows

**There are no shadows.** None. The system uses 1px borders for separation.

### Corner radii

- **Default everywhere: `rounded` (4px).** Cards, tags, copy buttons, list items.
- **`rounded-full`** for one element only: the palette color swatch circle.
- **`rounded-lg` (8px)** for one element only: prose `<pre>` code blocks.

### Transparency and blur

- **No blur. Anywhere.**
- **Two uses of transparency:** `bg-tag` (`--border-default` @ 70%) and `border-faint` (same @ 60%).

### Animation

- **One transition spec:** `transition-property: color, background-color, border-color; duration: 150ms; timing: ease;` (global `*`).
- **No bounce, no spring, no scale.** The reading progress bar sets `transition-none` — it tracks scroll instantly.
- **No entry animations on page load.** Pages just appear.

### Hover & press

- **Text hover:** color class moves up one step in the foreground ladder.
- **Active link in nav:** `fg-primary` instead of `fg-subtle`. No pill, no underline, no left border.
- **Press states are not styled.** No `:active` rule.
- **Disabled buttons:** `opacity-40`, hover suppressed.

### Layout

- **Page width is capped.** Showcase: `max-w-6xl` (1152px). Blog: `max-w-4xl` (896px). Startpage: grid, fills width.
- **Horizontal padding:** `px-4` on the main column.
- **Nav / footer** are full‑width with their content in the same `max-w-*` column.
- **Reading progress bar:** `fixed top-0 left-0 right-0 h-[2px] z-50` — over the nav.
- **TOC button + scroll‑to‑top button:** `fixed bottom-6 left-6` / `bottom-6 right-6`. Both 32×32, 1px border, no background.

### Cards

```
1px border-ui          (--border-default)
4px corner radius
bg-card                (--bg-surface)
no shadow
no header gradient
section labels inside the card use type-label
the label sits in a row with border-b border-ui below it
```

Same card in the palette table, the startpage bookmark grid, and the ports
grid.

### Layered/floating elements

- **No modals, no dialogs.** The TOC opens as a 64‑wide popover above its button. That is it.
- **No tooltips.** Icon buttons rely on `aria-label`.
- **No toasts.** The copy button shows a green checkmark for 1.2s in‑place.

### Imagery

The system has no photography. If a future deck or page needs imagery, the
hierarchy is:

1. **None** — try to use type and color alone (the default).
2. **A terminal screenshot** — on `--bg-canvas`, monospace text in `fg-*`, optional accent dusting. No rounded corners, no shadow.
3. **A user portrait** — black and white, square, no border.

Never use stock photography, illustration, AI‑generated imagery, or 3D renders.

---

## ICONOGRAPHY

The system uses **two icon sources**. Do not invent or hand‑roll new icons.

### Lucide (primary)

[Lucide React](https://lucide.dev/) for all interface icons.

- **Stroke weight is the Lucide default (`1.5–2`).**
- **Standard sizes: 12, 14, 16 px.** Most UI icons at `w-4 h-4` (16px). Tiny meta icons at `w-3 h-3` (12px).
- **Icons inherit `currentColor`.** They take the same fg ladder as text.

For HTML prototypes that can't import the React package: `<script src="https://unpkg.com/lucide@latest"></script>` then `lucide.createIcons()`.

### Simple Icons (logos only)

Inline `<svg>` paths from [Simple Icons](https://simpleicons.org/) for the
**GitHub, LinkedIn, and RSS** marks in the footer. Render at `w-4 h-4`,
inherit `fg-muted`. Saved in `assets/social/`.

### The VP mark

The personal mark is the **`VP` tile** — generated at runtime in
`app/icon.tsx`, vendored here as `assets/logo-vp.svg`:

```
background: var(--fg-default)   /* #e4e2de — light tile */
foreground: var(--bg-canvas)    /* #1f1f1e — dark glyph */
glyph:      "VP"
font:       JetBrains Mono, 700, 17px, letter-spacing: -0.5px
canvas:     32×32, 4px radius (3px at 16px)
```

**`VP` is the only mark.** Every repo uses the same tile, every size. There is
no per-repo glyph variant. Repos differentiate through:

1. The **dotted wordmark suffix** — `pivoshenko.dev`, `pivoshenko.theme`, …
2. The **URL/title** of the surface
3. (Optional, on banners) a single **accent dot** in the top-left lockup

Why: at 16px (browser tab) a swapped glyph barely reads; at ≥32px the wordmark
already disambiguates; keeping the tile constant makes `VP` a stronger anchor
the more places it shows up unchanged.

Rules:

- **JetBrains Mono 700**, `VP` at ~53% of tile height, `-0.5px` tracking.
- **4px radius** at ≥24px; **3px** at 16px (favicon).
- **Always light tile / dark glyph.** Use directly on `--bg-page`.
- **The accent never fills the tile.** Monochrome only.

### Wordmark lockup

Text, not an asset. `type-logo` reading `pivoshenko.<surface>`, dotted —
`pivoshenko` in `fg-primary`, the `.suffix` in `fg-muted`. Pair with the `VP`
tile in every nav bar.

### Emoji and unicode

- **Product UI: no emoji.** Lucide only.
- **Unicode arrows as text glyphs:** `→` (more), `←` (back), `↗` (external), `·` (separator).
- **Tabular nums.** Dates use `tabular-nums` so months align in lists.
