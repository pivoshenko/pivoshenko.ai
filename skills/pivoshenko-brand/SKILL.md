---
name: pivoshenko-brand
description: Central brand system for Volodymyr Pivoshenko — voice, type, color, layout, iconography. Self-contained; covers any output format (web UI, PDF, slide deck, README, social card, email, terminal/theme port, throwaway mock). Trigger even when the user doesn't say "brand" — any visual or copy decision touching pivoshenko surfaces counts. Also trigger on "make this on brand", "style this", "design a mock", "apply pivoshenko style", "needs to feel like my site", "generate a PDF / slide / poster / card", or any styling work on pivoshenko-adjacent content.
tags: [brand, design]
updated_at: 2026-06-04
---

# pivoshenko-brand

Single source of brand truth — voice + visual rules + UI kit. Self-contained: every rule, token, hex value, and asset needed to produce a branded artifact lives in this skill. Mirrors the vendored stack shipped by `pivoshenko.ui` (`ui/tokens.css` + `palette` hex module) consumed by `pivoshenko.dev`, `pivoshenko.theme`, `pivoshenko.ai`, `pivoshenko.startpage`, `pivoshenko.wallpapers`.

## Files

- `README.md` — full content + visual + iconography foundations. **Read this first.**
- `colors_and_type.css` — drop-in role tokens (CSS vars as `R G B` triples) + utility classes + 8 `type-*` recipes. Link or inline for any prototype.
- `assets/logo-vp.svg` — canonical `VP` tile (32×32, 4px radius, light fill, dark glyph). The only mark.
- `assets/social/{github,linkedin,rss}.svg` — Simple Icons brand marks (footer use only).
- `preview/*.html` — per-recipe reference cards. Read on demand when recalling a specific pattern:
  - `colors-*` — palette + accent usage
  - `type-*` — type recipes + foreground ladder
  - `spacing-*` — scale, borders, corners
  - `components-*` — card, button, tag, alert, code, chrome, menu, search, tabs, status, form-inputs, palette-table
  - `brand-*` — voice, logo, iconography
- `index.html`, `components.html` — human preview only. Open in a browser; don't read as agent reference (the `preview/*` files cover the same ground in smaller chunks).

## Token model (read before writing any CSS)

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

Convenience aliases wrap the role tokens so utility classes read naturally: `fg-primary`/`fg-body`/`fg-muted`, `bg-page`/`bg-card`/`bg-elevated`, `border-ui`/`border-faint`, plus `-c` color-resolved forms (`--fg-muted-c`) for spots that need a plain color instead of a triple. **Prefer the utility classes; reach for raw `rgb(var(--…))` only for one-off styles.**

Hex mirror lives in the `palette` module for off-DOM contexts (OG images via `@vercel/og`, the `themeColor` meta tag). Re-skin via `just vendor-preset` — `tokens.css` and the hex mirror move together.

## Build rules (non-negotiable)

Each rule = identity anchor. Break one → looks like generic SaaS, not pivoshenko.

1. **Font = JetBrains Mono.** Everywhere — body, headings, nav, code. Single typeface = recognizable + ties UI to dev/terminal aesthetic.
2. **Dark only.** No light mode, no media-query fallback, no toggle. Deployed sites ship `<meta name="theme-color" content="#1f1f1e">` and `color-scheme: dark`.
3. **Token-driven.** Components never hard-code hex. Always read role tokens (`--bg-*`, `--fg-*`, `--border-*`, `--accent-*`) or the utility classes wrapping them. This is what makes the system swappable in one `just vendor-preset`.
4. **No emoji in product UI.** Lucide icons only. (README files + GitHub repo descriptions are the only place emoji lives.)
5. **No shadows. 1px borders only.** Flat-edge aesthetic matches mono font + theme ports.
6. **No gradients.** Anywhere.
7. **No accent color in the chrome.** UI is grayscale (warm surfaces + warm-grey text). `--accent-primary` only appears as *the subject* (palette explorer, banner dot) or as state (link underline, active dot, focus ring, copy-success flash). Never as a button fill. Status accents (`success`/`warning`/`danger`/`info`) appear only as soft washes.
8. **Page floor is `--bg-canvas` / `bg-page` (`#1f1f1e`).** Components never read the underlying hex.
9. **Corner radius is `4px` default.** `8px` only for prose `<pre>`. `999px` only for the palette swatch circle.
10. **One transition spec: 150ms ease on color/background/border.** No bounces, fades, scale.
11. **Voice = first-person, lowercase brand names, short declarative sentences.** See *Content Fundamentals* in `README.md`.
12. **One mark: `VP`.** Every surface uses the same tile — light fill (`--fg-default`), dark glyph (`--bg-canvas`), JetBrains Mono 700, 4px radius. Repos differentiate by wordmark suffix (`pivoshenko.<surface>`) and context, not by per-repo glyphs. The accent never fills the tile.
13. **No stock photo / illustration / AI imagery / 3D renders.** Type + color only. Exception: terminal screenshots, mono portraits.

## Voice (quick reference)

- Pragmatic, technical, calm. Practitioner, not marketer.
- First-person singular. Lowercase brand names (`pivoshenko.dev`, `pivoshenko.theme`, …) even at sentence start.
- Short declarative + short declarative + one-line counterpunch. Lists do heavy lifting.
- Favor: `practical notes`, `curated`, `experiments`, `step-by-step`, `baseline`, `ports`, `userstyles`.
- Blog entries = `posts`, not `articles`.
- Avoid: hype (`game-changing`, `revolutionary`), vague value claims, playful slang, em-dashes for drama.
- Byline: `Volodymyr Pivoshenko <contact@pivoshenko.dev>` (mail-header style).
- Section labels SHOUT but small — uppercase via `.type-label`, widest tracking.

## Output formats

Same brand, different substrate. Pick the row that matches the artifact:

- **Web UI (production)** → role tokens + utility classes name-compatible with the site Tailwind preset (`bg-page`, `fg-primary`, `border-ui`, `type-label`, `type-meta`). Match patterns in the target site's component tree. Tokens originate in `pivoshenko.ui`.
- **Standalone HTML mock / prototype** → link `colors_and_type.css`, lift markup from `preview/components-*.html`. Don't reinvent.
- **PDF** → HTML+CSS pipeline with `colors_and_type.css` inlined. The system is dark only — PDFs ship dark too (page floor `--bg-canvas`). Generous margins, type scale unchanged.
- **Slide deck / poster** → `--bg-canvas` background, JetBrains Mono throughout, single `--accent-primary` per slide, no decorative imagery. One idea per slide.
- **README / GitHub markdown** → emoji *allowed* (single contextual emoji per heading or repo description, no emoji walls). Lowercase brand names. Tables + code fences over prose where possible. Footer byline in mail-header format.
- **Email / signature** → mono if the client supports it; system fallback otherwise. Plain text preferred. Single-line byline.
- **Social card / OG image** → 1200×630, `--bg-canvas`, VP tile top-left, title in `type-post-heading` scaled up, one `--accent-primary` line, nothing else. Use the `palette` hex mirror — CSS vars don't reach `@vercel/og`.
- **Terminal / theme port** → defer to `pivoshenko.theme` palette files; this skill describes intent, not port-specific syntax.
- **No spec given** → ask audience, fidelity, target surface. Then output.

## Quality checklist

Before finalizing:

1. Tone practical, non-hype, first-person, lowercase brand names?
2. JetBrains Mono everywhere, compact hierarchy via `type-*` recipes?
3. Grayscale chrome; `--accent-primary` only as subject or state (never button fill)?
4. Dark only — no light fallback, no toggle, `color-scheme: dark`?
5. 1px borders, 4px radius, 150ms ease, no shadows, no gradients, no blur?
6. Tokens (not hexes) in component CSS? Utility classes preferred over raw `rgb(var(--…))`?
7. No emoji in product UI? (README is the only exception.)
8. Feels like the same ecosystem as the live pivoshenko sites?

## How to use this skill

If creating visual artifacts (slides, mocks, throwaway prototypes), copy the assets you need into the artifact and link `colors_and_type.css` (or inline its tokens). Lift component patterns from the matching `preview/components-*.html` card instead of reinventing them. Always read tokens, never hexes.

If working on production code in the Pivoshenko monorepo, the matching live file is under `app/` or `showcase/components/` of the corresponding repository; tokens originate in `pivoshenko.ui` (`ui/tokens.css` consumed by the Tailwind preset). Names here are intentionally compatible — `bg-canvas`, `fg-default`, `border-default`, `accent-primary`, the `type-*` recipes — so what you prototype maps straight onto the preset.

If invoked without further guidance, ask the user what they want to build, ask a few targeted questions (audience, fidelity, target product surface), then output an HTML artifact or production code as appropriate.
