---
name: pivoshenko-brand
description: Central brand system for Volodymyr Pivoshenko — voice, type, color, layout, iconography. Self-contained; covers any output format (web UI, PDF, slide deck, README, social card, email, terminal/theme port, throwaway mock). Trigger even when the user doesn't say "brand" — any visual or copy decision touching pivoshenko surfaces counts. Also trigger on "make this on brand", "style this", "design a mock", "apply pivoshenko style", "needs to feel like my site", "generate a PDF / slide / poster / card", or any styling work on pivoshenko-adjacent content.
tags: [brand, design]
updated_at: 2026-05-30
---

# pivoshenko-brand

Single source of brand truth — voice + visual rules + UI kit. Self-contained: all rules, tokens, hex values, and assets needed to produce a branded artifact live in this skill.

## References

- `references/brand-system.md` — flavor-agnostic brand rules. Voice, color strategy, layout rhythm, class vocabulary, quality checklist. Palette hexes inlined.
- `references/visual-system.md` — deep profile of the current default flavor. Surfaces, typography sizes, status mappings, hover/press, layout caps, iconography. Read on demand for production work.
- `colors_and_type.css` — drop-in tokens (CSS vars + utility classes). Reproduces `type-*` / `fg-*` / `border-ui` surface. Use directly in HTML/PDF/email/mock work.
- `assets/` — `VP` wordmark (32×32 light/dark) + Simple Icons SVGs (GitHub, LinkedIn, RSS). The only "logo" the brand has.
- `preview/` — viewable per-recipe HTML cards. Read on demand, not upfront:
  - `colors-*` — palette + accent usage
  - `type-*` — type recipes + foreground ladder
  - `spacing-*` — scale, borders, corners, elevation
  - `components-*` — card, button, tag, alert, code, chrome, ... (one file per pattern)
  - `brand-*` — voice, logo, iconography
- `index.html`, `components.html` — human preview only. Open in a browser; don't read as agent reference (preview files cover the same ground in smaller chunks).

## Build rules (non-negotiable)

Each rule = identity anchor. Break one -> looks like generic SaaS, not pivoshenko.

1. **Font = JetBrains Mono.** Everywhere — body, headings, nav, code. Why: single typeface = recognizable across all sites + ties UI to dev/terminal aesthetic.
2. **No emoji in product UI.** Lucide icons only. Why: emoji renders inconsistently across OS, breaks mono grid. README / repository descriptions / GitHub-surface markdown OK (see Output formats).
3. **No shadows. 1px borders only.** Why: flat-edge aesthetic matches mono font + theme ports (terminal, editor).
4. **No gradients.** Anywhere. Why: same — flat, solid, deliberate.
5. **No accent colors in chrome.** Stone grayscale only. Theme accents only when they *are* the subject (palette explorer). Why: lets content + accents pop; prevents rainbow drift.
6. **Untinted base in dark mode.** Use the active flavor's `base` token as-is — not tinted toward gray. The default flavor's base is pure `#000000`. Why: matches OLED + terminal black exactly. Tinted black reads as "almost right" -> uncanny.
7. **Radius = `4px` default.** `8px` only for prose `<pre>`. `999px` only for palette swatch. Why: tight radii sit closer to terminal feel; large radii read as consumer app.
8. **One transition: 150ms ease on color/background/border.** No bounces, fades, scale. Why: snappy + restrained; motion never the subject.
9. **Voice = first-person, lowercase brand names, short declarative sentences.** Why: practitioner tone, not marketing copy.
10. **No stock photo / illustration / AI imagery / 3D renders.** Type + color only. Exception: terminal screenshots, mono portraits. Why: photography breaks the flat-edge mono grammar.

## Voice

- Pragmatic, technical, calm. Practitioner, not marketer.
- Concrete > abstract. Short + operational.
- Favor: `practical notes`, `curated`, `experiments`, `step-by-step`, `baseline`.
- Blog entries = `posts`, not `articles`.
- Avoid: hype (`game-changing`, `revolutionary`), vague value claims, playful slang.
- Byline format: `Volodymyr Pivoshenko <contact@pivoshenko.dev>` (mail-header style).

## Color strategy

Two-layer model:

1. **Stone grayscale** = default UI baseline. See `brand-system.md` for hex values.
2. **Theme palette** = accent source (active flavor; hex values inlined in `brand-system.md`). Use `blue`/`sapphire`/`sky` for links/focus, `green`/`yellow`/`red` for semantic states. No rainbow except in palette explorer.

## Output formats

Same brand, different substrate. Pick the row that matches the artifact:

- **Web UI (production)** → tokens name-compatible with site Tailwind utils (`fg-primary`, `fg-muted`, `border-ui`, `type-label`, `type-meta`). Match patterns in the target site's component tree.
- **Standalone HTML mock / prototype** → link `colors_and_type.css`, lift markup from `preview/components-*.html`. Don't reinvent.
- **PDF** → use HTML+CSS pipeline with `colors_and_type.css` inlined and print stylesheet matching `bg-white` light mode (force light; PDFs don't dark-mode well). Page margins generous, type scale unchanged.
- **Slide deck / poster** → black or stone-50 background, JetBrains Mono throughout, single accent per slide (default `--theme-lavender` on dark, `--theme-blue` on light), no decorative imagery. One idea per slide.
- **README / GitHub markdown** → emoji *allowed* (single contextual emoji per heading or repository description, no emoji walls). Lowercase brand names. Tables and code fences over prose where possible. Footer byline in mail-header format.
- **Email / signature** → mono if the client supports it; system fallback otherwise. Plain text preferred. Single-line byline.
- **Social card / OG image** → 1200×630, black bg, VP wordmark top-left, title in `type-post-heading` size scaled up, one accent line, nothing else.
- **Terminal / theme port** → defer to the actual theme palette files; this skill describes intent, not port-specific syntax.
- **No spec given** → ask: audience, fidelity, surface, dark-or-light first. Then output.

## Quality checklist

Before finalizing:

1. Tone practical, non-hype?
2. JetBrains Mono everywhere, compact hierarchy?
3. Neutral-first UI, restrained accents?
4. Dark + light parity (or deliberate single-mode choice for print/PDF)?
5. Borders/spacing/motion subtle + consistent (150ms ease, 4px radius, 1px borders)?
6. No emoji in product UI? (READMEs are the only exception.)
7. Feels like the same ecosystem as the live pivoshenko sites?

## Flavor note

Brand rules in this file are flavor-agnostic — they apply across any palette flavor. Flavor-specific palette tokens, status mappings, and surface choices live in `references/visual-system.md`. Hex values for the active flavor are inlined in `brand-system.md` and `colors_and_type.css` under the `--theme-*` namespace.
