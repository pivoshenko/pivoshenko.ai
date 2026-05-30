# Pivoshenko Design System

The visual and content system behind **Volodymyr Pivoshenko**'s personal brand — a
Principal AI/R&D Engineer who builds tools, themes, and writing with a single
through‑line: **minimalism, simplicity, and cross‑tool consistency**.

A restrained, monospaced, almost‑terminal‑native aesthetic that runs across the
website, blog, startpage, theme showcase, and dozens of ported terminal and web
themes.

> **Scope note.** Flavor-agnostic brand rules (voice, typography, layout,
> motion, component patterns) live in `brand-system.md`. *This* document
> profiles the **current default flavor in depth** — palette values, status
> mappings, surface choices, and CSS-var names (`--theme-*`). Any alternate
> flavor inherits every flavor-agnostic rule but swaps the palette below.

---

## Surfaces

The brand spans a handful of product surfaces — all of them share the same
voice, type system, color ladder, and component patterns described below:

1. **Theme showcase.** A site that displays the source palette and lets
   visitors browse the terminal/desktop ports and browser userstyles. The
   signature artifact is the **palette table** with hex / RGB / HSL columns
   and per‑cell copy buttons.
2. **Personal tech blog.** A long‑form blog on AI, distributed systems, and
   developer tooling. Signature artifacts: **post list grouped by year**,
   **reading progress bar** at the top of every page, floating **table of
   contents** button.
3. **Browser startpage.** A grid of categorised bookmark cards. Opens in a
   new tab; replaces the browser default.
4. **The theme itself.** A single palette rendered to terminal/desktop tools
   (Ghostty, Helix, Zed, K9s, Spicetify, Zen Browser, VSCode, Bottom,
   Lazygit, …) and browser userstyles (GitHub, Claude, ChatGPT, MDN, YouTube,
   Lichess, …).

The brand is the same across all four. Typography and foreground/border
classes are defined in `colors_and_type.css` in this skill. The palette is
inlined in `brand-system.md`.

**Fonts:** JetBrains Mono is loaded from Google Fonts at runtime by
`colors_and_type.css` — no font files are vendored. *Substitution note:
production sites use Next.js' `JetBrains_Mono` from Google Fonts, which is the
same file. No visual delta is expected.*

---

## CONTENT FUNDAMENTALS

The voice is **engineer‑precise, first‑person, lowercase by default, and short
of breath on purpose.** Sentences are clipped. Paragraphs are one to three
lines. Lists do the heavy lifting. There is no marketing copy anywhere on
either site.

### Person and tense

- **First person, singular.** "*I* lead the R&D team", "*In my* spare time", "*my* space to experiment." The site is signed `2026 Volodymyr Pivoshenko <contact@pivoshenko.dev>` in the footer — not a company name.
- **Direct address is rare.** The writing addresses *the reader* only when it is making a point ("That mindset is product thinking."). The blog is not "let me tell you how to". It is closer to a notebook.

### Casing

- **Brand names are lowercase.** `pivoshenko.theme`, `pivoshenko.dev`, `bat`, `bottom`, `delta`, `fish`, `fzf`, `ghostty`, `helix`, `k9s`, `lazygit`, `spicetify`, `zed`, `zen`. Always lowercase, even at the start of a sentence in nav.
- **Proper names get title case.** `Volodymyr Pivoshenko`. `Principal AI/R&D Engineer`.
- **Section labels are SHOUTING but small** — `RECENT POSTS`, `LINKS`, `CONTENTS`, `2026`. Rendered via `.type-label` (`text-xs uppercase tracking-widest`), so the shout is quiet.

### Tone examples

From the engineer's own writing on the blog (verbatim):

> "We are entering a world where execution is increasingly cheap.
>
> Need code? AI can generate it.
> Need UI drafts? AI can produce ten in minutes.
> Need tests, docs, PR summaries? Same story."

> "Most products fail for a simple reason: teams solve the wrong problem with high quality. They ship polished solutions to low-value pain."

> "Building features is one muscle.
> Building something people will pay for is another."

Note the cadence: **short declarative + short declarative + a one‑line
counterpunch.** No em‑dashes for drama; no rhetorical questions strung together
for effect. When there is a question, it is followed by an answer in the next
line.

### Emoji

- **The blog uses no emoji.** Not in prose, not in headings, not in tags.
- **The GitHub README of the *engineer's own profile* uses emoji at the start of section headings only** (`👋 Hi there!`, `⭐ Stars`, `🐛 Issues`). And every repository description starts with a single contextual emoji (`🥑 pivoshenko's theme`, `📕 pivoshenko's dotfiles`, `🇺🇦 pivoshenko's profile`).
- **Rule for this design system:** *do not use emoji in any production interface.* They are reserved for `README.md` files and repository descriptions, where they function as visual punctuation in a wall of GitHub text. If a UI needs an icon, use Lucide.

### Vocabulary cues

- "ports" (not "themes for") — `Ports` is the section title for all the terminal/desktop targets
- "userstyles" (not "skins" or "themes for sites") — for the browser injection layer
- "flavor" — the palette's mode label (`"flavor": "dark"`), inherited from Catppuccin terminology
- The author signs `Volodymyr Pivoshenko <contact@pivoshenko.dev>` in classic mail‑header style. Use this exact format in any place that needs an author byline.

### Microcopy patterns

- Empty state: `No posts yet.` (a sentence, not a 3‑line illustrated empty‑state)
- More‑link: `All posts →` (right arrow glyph, no underline)
- Back‑link: `← Blog` (left arrow glyph, lowercase nav noun)
- Tag chips: lowercase, hyphenated, no `#` prefix: `product-thinking`, `ai`, `startups`
- Post date: `Mar 20, 2026` for detail, `Mar 20` in lists, `Mar 2026` on home
- Reading time: `5 min read`

---

## VISUAL FOUNDATIONS

The system is intentionally narrow. There is one font, two themes (light +
dark), and a handful of utility classes that span all three sites. Everything
that isn't text is either a 1px border or a copied‑and‑pasted Lucide icon.

### Color

**Two color systems run side by side, and they used to not overlap. Now they do, sparingly.**

1. **Stone neutrals** (Tailwind's `stone-*` scale) drive the entire *web UI* —
   backgrounds, borders, type, hover states. Light mode is `stone-50` on
   `stone-900`; dark mode is `black` on `stone-100`. The *chrome* stays
   grayscale.
2. **theme palette** drives the *theme itself* — the colors that ship to
   Ghostty, Helix, Zed, etc. These show up in the website as **swatches inside
   the palette explorer** and now also as a single **`--accent`** token piped
   into interactive elements: link underline color, active nav dot, focus
   ring, the green flash on a successful copy. The accent is **one color at a
   time**, never multiple, never used for backgrounds (except `--accent-soft`,
   a ~16% wash for selection or hover bleed). Default accent is
   `--theme-blue` (`#7f98bf`) in light mode and `--theme-lavender` (`#9faece`)
   in dark mode — matching the userstyles' default accent.

The theme palette follows the Catppuccin naming convention:

- **Surfaces (darkest → lightest):** `crust → mantle → base → surface0 → surface1 → surface2`
- **Overlays / text:** `overlay0 → overlay1 → overlay2 → subtext0 → subtext1 → text`
- **Accents:** `rosewater, flamingo, pink, mauve, red, maroon, peach, yellow, green, teal, sky, sapphire, blue, lavender`

The theme accents are
desaturated versions of Catppuccin — `red` is `#c98787` (a brick rose, not a
warning red), `blue` is `#7f98bf` (a soft steel blue), `green` is `#8ea98c` (a
dried sage). Nothing is loud. The base color is *pure* `#000000`, not a tinted
near‑black.

### Semantic status colors

The brand maps the five conventional status roles to **muted theme accents**.
These never appear as solid fills; they show up as soft 16–18% washes behind
same-color text.

| Role     | Light text | Soft fill         | Dark text   | Source                |
|----------|-----------|-------------------|-------------|-----------------------|
| success  | `#6f8a6d` | green @ 16% α     | `#8ea98c`   | `--theme-green`       |
| warning  | `#a17849` | peach @ 18% α     | `#d0a178`   | `--theme-peach`       |
| error    | `#b06a6a` | red @ 18% α       | `#c98787`   | `--theme-red`         |
| info     | `#6383ad` | blue @ 18% α      | `#9faece`   | `--theme-blue` / `--theme-lavender` |
| neutral  | `--stone-500` | `--stone-100` | `--stone-400` | stone (no accent)    |

**Loud safety reds and bright greens are explicitly out of scope.** The brand
asks status to read as state, not as alarm. If a future surface needs
*destructive* affordance (delete a thing forever), use a confirmation pattern
instead of a saturated red button — the brand has no saturated red button.

### Typography

**One font: JetBrains Mono.** That is the entire type system.

```
font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
```

It is used for **everything** — logos, navigation, body copy in posts, captions, metadata, *and* code. The blog opts into `ui-sans-serif` as a system fallback for prose in `tailwind.config.ts`, but the page actually ships as monospace because `font-mono` is set on `<body>`.

There are exactly **seven type recipes** (defined in `colors_and_type.css` as `.type-*`):

| Recipe          | Style                                              | Used for                                  |
|-----------------|----------------------------------------------------|-------------------------------------------|
| `type-heading`  | 16px / 600                                         | page h1: "Volodymyr Pivoshenko", "Posts"  |
| `type-post-heading` | 20px / 600, snug leading                       | blog post h1                              |
| `type-body`     | 14px / 400, relaxed leading                        | prose paragraphs                          |
| `type-ui`       | 14px / 400                                         | post titles in lists, nav links           |
| `type-label`    | 12px / 400, uppercase, widest tracking, monospace  | section labels: `RECENT POSTS`, `2026`    |
| `type-meta`     | 12px / 400, monospace                              | dates, reading time, tags, footer         |
| `type-caption`  | 12px / 400, relaxed leading                        | post description snippets                 |
| `type-logo`     | 14px / 600, tight tracking, monospace              | the wordmark in nav                       |

### Foreground colors

A 6‑step grayscale ladder, named by *role* and *intent*. Light/dark are inverted
versions of each other; they are listed together via Tailwind's `dark:` prefix.

| Class           | Light            | Dark              | Used for                            |
|-----------------|------------------|-------------------|-------------------------------------|
| `fg-primary`    | `stone-900`      | `stone-100`       | active nav, h1, strong emphasis     |
| `fg-title`      | `stone-800`      | `stone-200`       | post titles in listings             |
| `fg-secondary`  | `stone-700`      | `stone-300`       | link text                           |
| `fg-body`       | `stone-600`      | `stone-400`       | body paragraphs                     |
| `fg-subtle`     | `stone-500`      | `stone-400`       | inactive nav, descriptions          |
| `fg-muted`      | `stone-400`      | `stone-500`       | dates, tags, footer text, section labels |

### Spacing

Spacing is the default Tailwind scale — `gap-1`, `gap-2`, `gap-3`, `gap-4`,
`gap-5`. There is no custom spacing scale. **Sections are separated by `space-y-12`
or `space-y-16` of vertical gap, not by visible dividers.**

### Backgrounds

- **Page bg:** `bg-stone-50` light, `bg-black` dark. **Pure black, not near‑black** in dark mode.
- **Card bg:** `bg-white` light, `bg-stone-950` dark. (Cards are 5% lighter than the page in dark; pure white in light.)
- **Tag bg:** `bg-stone-100` light, `bg-stone-800/70` dark.
- **No gradients.** Anywhere. Not in headers, not in buttons, not in cards.
- **No images.** No hero images, no illustration, no photos. The only "imagery" in the entire system is the **palette swatch** — a 16px circle of pure color next to a hex value.
- **No textures, no grain, no patterns.**

### Animation

- **One transition spec for everything:** `transition-property: color, background-color, border-color; duration: 150ms; timing: ease;` (applied globally via `*` selector).
- **Hover opacity for the logo wordmark only:** `hover:opacity-60`. Otherwise hover moves a foreground class up one step (e.g. `fg-subtle` → `fg-primary`).
- **No bounce, no spring, no scale.** The reading progress bar at the top of the page literally sets `transition-none` on its width — it tracks scroll instantaneously.
- **No entry animations on page load.** Pages just appear.

### Hover & press states

- **Text hover:** color class moves up one step in the foreground ladder. `fg-subtle hover:fg-primary`, `fg-muted hover:fg-secondary`. **Never an underline appearing on hover for nav.** Post titles in lists *do* show an underline on hover (`group-hover:underline underline-offset-2 decoration-stone-300`) — distinguishes navigable list items from nav chrome.
- **Active link in nav:** uses `fg-primary` instead of `fg-subtle`. There is no background pill, no underline, no left border. Active state is *just darker text*.
- **Press states are not styled.** This is a no‑JS, no‑interaction site at heart. There is no `:active` rule.
- **Disabled buttons:** `opacity-40` and the hover state is suppressed.

### Borders

- **All borders are 1px solid.** Always.
- **Two border classes:** `border-ui` (`stone-200` / `stone-800`) for primary lines, `border-faint` (`stone-100` / `stone-800/60`) for the line *between* items inside a card.
- **Cards have a `border-ui` outline, no shadow, and a 4px `rounded`** (Tailwind's default = `border-radius: 0.25rem`).
- **Header and footer are separated from the page by a single `border-b border-ui` / `border-t border-ui` line.** No drop shadow, no gradient fade. The line is the only chrome.

### Shadows

- **There are no shadows.** None. The system uses 1px borders for separation.
- (The lone exception: `prose` code blocks have `border-stone-700` as a 1px border with `border-radius: 0.5rem`. Still no shadow.)

### Corner radii

- **Default everywhere is `rounded` (4px).** Cards, tag chips, copy buttons, list items in the startpage.
- **`rounded-full`** for one element only: the **palette color swatch circle** next to a hex value in the palette table.
- **`rounded-lg` (8px)** for one element only: prose `<pre>` code blocks.
- **No `rounded-xl`, no `rounded-2xl`, no `rounded-3xl`.**

### Transparency and blur

- **No blur. Anywhere.** No `backdrop-blur`. No frosted glass.
- **Two uses of transparency** in the entire system:
  1. `bg-tag` in dark mode: `bg-stone-800/70` — 70% opacity over black for tag chips.
  2. `border-faint` in dark mode: `border-stone-800/60` — 60% opacity for the dividers *inside* tables.

### Layout rules

- **Page width is capped.** Showcase site uses `max-w-6xl` (1152px). Blog uses `max-w-4xl` (896px). Startpage is grid‑based and fills width.
- **Horizontal padding is `px-4` on the main column.**
- **Nav and footer are full‑width** with their content inside the same `max-w-*` column. They are separated from `main` by a single `border-b` / `border-t` line.
- **The reading progress bar at the top is `fixed top-0 left-0 right-0 h-[2px] z-50`** and sits over the nav.
- **The TOC button and scroll‑to‑top button are `fixed bottom-6 left-6` and `bottom-6 right-6`** respectively. Both are 32×32, 1px border, no background.

### Cards

A card in this system is:

```
1px border-stone-200 (light) / border-stone-800 (dark)
4px corner radius
bg-white (light) / bg-stone-950 (dark)
no shadow
no header gradient
section labels inside the card use type-label (uppercase, monospace, widest tracking)
the label sits in a row with border-b border-ui below it
```

It is the **same card** in the palette table, the startpage bookmark grid, and
the ports grid.

### Layered/floating elements

- **No modals, no dialogs.** The TOC opens as a 64‑wide popover above its button. That is it.
- **No tooltips.** Icon buttons rely on `aria-label`.
- **No toasts.** The copy button shows a green checkmark for 1.2s in‑place.

### Imagery tone

The system has no photography. If a future deck or page needs imagery, the
hierarchy is:

1. **None** — try to use type and color alone (this is the default).
2. **A terminal screenshot** — the only "imagery" that fits the brand. Should
   be on `bg-black` with monospace text in stone shades plus a dusting of theme
   accents. Centered, no rounded corners, no shadow.
3. **A user portrait** — black and white, square, no border.

Never use stock photography, illustration, AI‑generated imagery, or 3D renders.

---

## ICONOGRAPHY

The system uses **two icon sources**, both copied directly out of the engineer's
codebase. Do not invent or hand‑roll new icons.

### Lucide (primary)

[Lucide React](https://lucide.dev/) is used for all *interface* icons. The
showcase and startpage import directly: `import { Copy, ExternalLink, Boxes,
Bookmark, Briefcase, Code2, Flag, Gamepad2, Link2, MessageCircle, Newspaper,
PlayCircle, Users } from 'lucide-react'`.

- **Stroke weight is the Lucide default (`1.5–2`).** The theme toggle uses `strokeWidth="1.75"` explicitly.
- **Standard icon sizes are 12, 14, 16 px.** Most UI icons sit at `w-4 h-4` (16px). Tiny meta icons are `w-3 h-3` (12px).
- **Icons inherit `currentColor`.** They take the same fg ladder as text.

For HTML prototypes that can't import the React package, use the Lucide CDN: `<script src="https://unpkg.com/lucide@latest"></script>` then `lucide.createIcons()`.

### Simple Icons (logos only)

Inline `<svg>` paths copied from [Simple Icons](https://simpleicons.org/) are
used for the **GitHub, LinkedIn, and RSS** marks in the footer. They render at
`w-4 h-4` and inherit `fg-muted`. The SVGs are saved in `assets/social/`.

### App icon

The favicon is a 32×32 generated at runtime in `app/icon.tsx` — black square,
white `VP` in JetBrains Mono Bold at 17px with `-0.5px` letter spacing.

```
background: #000
foreground: #fff
glyph:      "VP"
font:       JetBrains Mono, 700, 17px, letter-spacing: -0.5px
canvas:     32×32
```

That is the entire logo system. There is no wordmark logo SVG; the wordmark is
just `type-logo` text (`text-sm font-semibold font-mono tracking-tight`) reading
`pivoshenko.theme` or `pivoshenko.dev`.

### Emoji and unicode

- **Emoji is forbidden in product UI.** See *Content Fundamentals*. README files use it; product doesn't.
- **Unicode arrows are used as text glyphs** in microcopy: `→` (more), `←` (back), `↗` (external), `·` (separator between meta items).
- **Tabular nums.** Dates use `tabular-nums` so months align in the post list.
