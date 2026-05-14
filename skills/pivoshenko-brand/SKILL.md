---
name: pivoshenko-brand
description: Apply Volodymyr Pivoshenko's personal brand to content, UI, and visual decisions. Use when drafting or editing pages, blog posts, docs, components, themes, or assets that should match pivoshenko.dev / pivoshenko.theme / morok style. Also use to generate well-branded throwaway prototypes/mocks/artifacts.
tags: [brand, design]
user-invocable: true
updated_at: 2026-05-14
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

1. **Font = JetBrains Mono.** Everywhere. Body, headings, nav, code.
2. **No emoji in product UI.** Lucide icons only. Emoji allowed in README / repo descriptions only.
3. **No shadows.** 1px borders only.
4. **No gradients.** Anywhere.
5. **No accent colors in chrome.** Whole UI = stone grayscale. Morok colors only when they are *the subject* (palette explorer).
6. **Pure `#000000` for dark mode bg.** Not tinted near-black.
7. **Corner radius = `4px` default.** `8px` only for prose `<pre>`. `999px` only for palette swatch circle.
8. **One transition: 150ms ease on color/background/border.** No bounces, fades, scale.
9. **Voice = first-person, lowercase brand names, short declarative sentences.**

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

**Production code** → tokens here are name-compatible with Tailwind utility classes in the sites (`fg-primary`, `fg-muted`, `border-ui`, `type-label`, `type-meta`). Match existing patterns in `showcase/components/` or `app/` of the target repo.

**Throwaway prototypes/mocks/slides** → copy assets you need, link `colors_and_type.css` (or inline its tokens). Lift component patterns from `components.html` instead of reinventing.

**No further guidance** → ask: audience, fidelity, target surface, dark or light first. Then output HTML artifact or production code.

## Quality checklist

Before finalizing:

1. Tone practical, non-hype?
2. JetBrains Mono everywhere, compact hierarchy?
3. Neutral-first UI, restrained accents?
4. Dark + light parity?
5. Borders/spacing/motion subtle + consistent (150ms ease, 4px radius, 1px borders)?
6. Feels like the same ecosystem as `pivoshenko.dev` + `pivoshenko.theme`?
