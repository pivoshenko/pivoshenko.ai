# Brand System (Derived from pivoshenko Repositories)

## Sources

- `pivoshenko.dev`
- `pivoshenko.startpage`
- `pivoshenko.theme`
- `pivoshenko.wallpapers`

## Brand Core

- Personality: pragmatic, technical, calm, minimal.
- Positioning: practitioner and builder, not marketer.
- Mood: restrained, clean, dark-friendly, tool-oriented.
- Design direction: monochrome foundations with selective cool accents.

## Voice and Messaging

### Voice Traits

- Write directly and concretely.
- Prefer practical framing: workflows, implementation, constraints.
- Keep claims grounded in real usage.
- Use concise, low-drama sentences.

### Voice Anti-Patterns

- Avoid hype language ("game-changing", "revolutionary", "world-class").
- Avoid vague value statements without specifics.
- Avoid overly playful or casual slang.

### Copy Patterns

- Favor phrases like: `practical notes`, `curated`, `experiments`, `step-by-step`, `baseline`.
- Refer to blog entries as `posts` (not `articles`) in UI copy.
- Keep link labels short and literal.

## Typography System

### Primary Typeface Direction

- Monospace-first presentation (`JetBrains Mono` style).
- Keep sans available for fallback/system but preserve mono identity in UI.

### Text Roles

- `type-heading`: section/page heading (compact, semibold).
- `type-post-heading`: post detail H1.
- `type-body`: paragraph copy.
- `type-ui`: controls and links.
- `type-label`: uppercase micro labels, wide tracking.
- `type-meta`: dates, counts, helper metadata.
- `type-logo`: compact logotype text in nav.

## Layout and Structure

### Layout Rhythm

- Keep pages width-constrained:
  - blog-like content: `max-w-4xl`
  - dashboard/grid tools: `max-w-6xl`
- Use low visual noise: border-defined sections, sparse ornamentation.
- Keep nav/footer height around `h-14` with thin separators.

### Spacing and Shape

- Use small to medium spacing steps.
- Use restrained corner radius (`rounded`, not highly rounded pills by default).
- Prefer flat surfaces with border contrast over shadows.

## Color Strategy

Two-layer color model:

1. Neutral UI baseline for products/content.
2. `morok` palette for thematic accents and ecosystem theming.

### Neutral UI Baseline

Use stone grayscale as the default structural system:

- `stone-50` `#fafaf9`
- `stone-100` `#f5f5f4`
- `stone-200` `#e7e5e4`
- `stone-300` `#d6d3d1`
- `stone-400` `#a8a29e`
- `stone-500` `#78716c`
- `stone-600` `#57534e`
- `stone-700` `#44403c`
- `stone-800` `#292524`
- `stone-900` `#1c1917`
- `stone-950` `#0c0a09`
- dark background anchor: `#000000`

### Morok Palette (Theme Source of Truth)

From `pivoshenko.theme/palettes/morok.json`:

- rosewater `#e2cfc6`
- flamingo `#d8b8aa`
- pink `#d1b2c9`
- mauve `#a78cc4`
- red `#c98787`
- maroon `#b97a74`
- peach `#d0a178`
- yellow `#c7b07a`
- green `#8ea98c`
- teal `#7ea59d`
- sky `#7da2b5`
- sapphire `#7398ad`
- blue `#7f98bf`
- lavender `#9faece`
- text `#e7e5e4`
- subtext1 `#d6d3d1`
- subtext0 `#a8a29e`
- overlay2 `#a8a29e`
- overlay1 `#78716c`
- overlay0 `#57534e`
- surface2 `#44403c`
- surface1 `#292524`
- surface0 `#1c1917`
- base `#000000`
- mantle `#0c0a09`
- crust `#080706`

### Accent Usage

- Keep neutral-first UI for most surfaces.
- Use `blue`, `sapphire`, or `sky` for links, focus accents, and small highlights.
- Use `green`, `yellow`, `red` for semantic states only.
- Avoid rainbow usage in a single view unless the screen is explicitly a palette explorer.

## Component Patterns

### Navigation and Footer

- Brand label left, lightweight utility links right.
- Theme toggle grouped with subtle left divider.
- Footer includes year, name, contact, and minimal icon links.

### Card and List Patterns

- Use thin borders and neutral card backgrounds (`white`/`stone-950`).
- Keep hover states subtle (`hover:bg-stone-100`, `dark:hover:bg-stone-900`).
- Reveal metadata in muted typography rather than colorful badges.

### Motion

- Use only lightweight transitions on color/border/background.
- Typical timing: `150ms ease`.
- Use restrained transform motion (for example image hover scale to `1.05`).

## Iconography and Brand Mark

### Favicon/App Icon

- 32x32 black square.
- White `VP` initials in bold monospaced form.
- Tight letter spacing and centered alignment.

### Symbol Motifs

- Repeated motif: geometric snowflake/hex mark associated with Nix-like shape language.
- Supporting motif: minimal line-art animal marks (for example bear), cool-toned outlines.

## Imagery Direction (Wallpapers)

- Curation leans toward: `abstract`, `anime`, `pixelart`, `rog`, `logo`, `game`.
- Frequent mood: dark or dusk scenes, cool-to-muted palettes, occasional neon contrast.
- Composition preference: clear focal object with negative space support.

## Interaction Details

- Support both light and dark themes with parity.
- Keep selection styling consistent:
  - light selection around `stone-200`
  - dark selection around `stone-700`
- Keep focus treatment visible but understated.

## Reusable Class Vocabulary

Use semantic class naming over ad hoc utility sprawl:

- foreground levels: `fg-primary`, `fg-title`, `fg-secondary`, `fg-body`, `fg-subtle`, `fg-muted`
- interaction: `hover-primary`, `hover-secondary`
- borders: `border-ui`, `border-faint`
- decoration: `deco-subtle`

## Quality Checklist

Before finalizing output, confirm:

1. Is the tone practical and non-hype?
2. Is typography mono-first and hierarchy compact?
3. Is the UI neutral-first with restrained accent usage?
4. Are dark and light themes both considered?
5. Are borders/spacing/motion subtle and consistent?
6. Does this feel like the same ecosystem as `pivoshenko.dev` and `pivoshenko.theme`?
