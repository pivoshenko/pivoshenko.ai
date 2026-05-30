---
name: pivoshenko-brand
description: Apply Volodymyr Pivoshenko's personal brand to content, UI, and visual decisions. Use when drafting or editing pages, blog posts, docs, components, themes, or assets that should match pivoshenko.dev / pivoshenko.theme / morok style. Also trigger on "make this on brand", "style this prototype", "design a mock", "apply pivoshenko style", "needs to feel like my site", or any visual/copy work touching the personal site ecosystem. Also use to generate well-branded throwaway prototypes/mocks/artifacts.
tags: [brand, design]
updated_at: 2026-05-30
---

# pivoshenko-brand

Single source of brand truth — voice + visual rules + UI kit.

## References

- `references/brand-system.md` — derived from live repos. Voice, color strategy, layout rhythm, class vocabulary, quality checklist.
- `references/visual-system.md` — full visual/content/iconography foundations. Read first for deep work.
- `colors_and_type.css` — drop-in tokens (CSS vars + utility classes). Reproduces `type-*` / `fg-*` / `border-ui` surface across all sites.
- `assets/` — `VP` wordmark (32×32 light/dark) + Simple Icons SVGs (GitHub, LinkedIn, RSS). The only "logo" the brand has.
- `preview/` — reference cards per recipe (type scale, fg ladder, card pattern, palette table, ...).
- `index.html`, `components.html` — viewable design system docs.

## Build rules (non-negotiable)

Each rule = identity anchor. Break one -> looks like generic SaaS, not pivoshenko.

1. **Font = JetBrains Mono.** Everywhere — body, headings, nav, code. Why: single typeface = recognizable across all sites + ties UI to dev/terminal aesthetic.
2. **No emoji in product UI.** Lucide icons only. Why: emoji renders inconsistently across OS, breaks mono grid. README / repo descriptions OK (GitHub context).
3. **No shadows. 1px borders only.** Why: flat-edge aesthetic matches mono font + theme ports (terminal, editor).
4. **No gradients.** Anywhere. Why: same — flat, solid, deliberate.
5. **No accent colors in chrome.** Stone grayscale only. Morok colors only when they *are* the subject (palette explorer). Why: lets content + accents pop; prevents rainbow drift.
6. **Pure `#000000` dark bg.** Not tinted near-black. Why: matches OLED + terminal black + pivoshenko.dev exactly. Tinted black reads as "almost right" -> uncanny.
7. **Radius = `4px` default.** `8px` only for prose `<pre>`. `999px` only for palette swatch. Why: tight radii sit closer to terminal feel; large radii read as consumer app.
8. **One transition: 150ms ease on color/background/border.** No bounces, fades, scale. Why: snappy + restrained; motion never the subject.
9. **Voice = first-person, lowercase brand names, short declarative sentences.** Why: practitioner tone, not marketing copy.

## Voice

- Pragmatic, technical, calm. Practitioner, not marketer.
- Concrete > abstract. Short + operational.
- Favor: `practical notes`, `curated`, `experiments`, `step-by-step`, `baseline`.
- Blog entries = `posts`, not `articles`.
- Avoid: hype (`game-changing`, `revolutionary`), vague value claims, playful slang.

## Color strategy

Two-layer model:

1. **Stone grayscale** = default UI baseline. See `brand-system.md` for hex values.
2. **morok palette** = accent source. From `pivoshenko.theme/palettes/morok.json`. Use `blue`/`sapphire`/`sky` for links/focus, `green`/`yellow`/`red` for semantic states. No rainbow except in palette explorer.

## How to use

- **Production code** → tokens name-compatible with site Tailwind utils (`fg-primary`, `fg-muted`, `border-ui`, `type-label`, `type-meta`). Match patterns in `showcase/components/` or `app/` of target repo.
- **Throwaway mocks/slides** → copy needed assets, link `colors_and_type.css` (or inline tokens). Lift patterns from `components.html`. Don't reinvent.
- **No spec given** → ask: audience, fidelity, surface, dark-or-light first. Then output.

## Quality checklist

Before finalizing:

1. Tone practical, non-hype?
2. JetBrains Mono everywhere, compact hierarchy?
3. Neutral-first UI, restrained accents?
4. Dark + light parity?
5. Borders/spacing/motion subtle + consistent (150ms ease, 4px radius, 1px borders)?
6. Feels like the same ecosystem as `pivoshenko.dev` + `pivoshenko.theme`?
