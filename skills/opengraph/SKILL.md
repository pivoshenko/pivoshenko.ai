---
name: opengraph
description: Add or fix the full OpenGraph + Twitter setup for a Next.js (App Router) site — both the `metadata` block in `app/layout.tsx` (title, description, url, siteName, type, locale, twitter card) AND an `app/opengraph-image.tsx` card rendered via `next/og` `ImageResponse` at the edge. Use whenever the user mentions OG, OpenGraph, og:image, og:title, social card, link preview, share image, Twitter card, unfurl, metadata block, "what shows up when I paste the link in Slack/Discord/iMessage", missing/ugly link preview, or asks to bootstrap a new site's social metadata. Trigger even without the word "opengraph" — "fix the share preview", "site has no preview image", "make the link look good when shared", "set the page title for sharing" all count.
tags: [frontend, nextjs, design]
updated_at: 2026-05-31
---

# opengraph

Drop-in OpenGraph + Twitter setup for any Next.js App Router site. Two things have to be right for an unfurl to look good — the **metadata** (text the scraper reads) and the **image** (PNG the scraper renders). This skill handles both.

## Files

- `app/layout.tsx` → `metadata.openGraph` + `metadata.twitter`. Without these, the image renders but title/description/url come back empty in the unfurl — looks broken in Slack/iMessage.
- `app/opengraph-image.tsx` → drives the `/opengraph-image` route. Next auto-injects it as `og:image` for every page that doesn't override.
- `app/twitter-image.tsx` (optional) → only if Twitter needs a different card than OG. Default: omit — Twitter falls back to og:image when `twitter.card = 'summary_large_image'`.

No public PNGs, no `/api/og` route, no extra deps. Next renders at the edge on demand.

## Metadata block (the words)

```ts
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://{{DOMAIN}}"),
  title: {
    template: "%s — {{SITE_NAME}}",
    default: "{{SITE_NAME}}",
  },
  description: "{{TAGLINE}}",
  openGraph: {
    type: "website",
    url: "https://{{DOMAIN}}",
    siteName: "{{SITE_NAME}}",
    title: "{{SITE_NAME}}",
    description: "{{TAGLINE}}",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "{{SITE_NAME}}",
    description: "{{TAGLINE}}",
  },
};
```

Rules:

- `metadataBase` MUST be set → otherwise the auto-injected `og:image` URL is relative and most scrapers (Slack, iMessage, Discord) reject it.
- Keep `description`, `openGraph.description`, and `twitter.description` the same string. One source of truth, less drift.
- Don't add an explicit `openGraph.images` — Next auto-detects `app/opengraph-image.tsx` and injects it with the correct dimensions and content-type. Adding it manually duplicates the meta tag.
- Avoid a trailing period in `openGraph.description` / `twitter.description`. Scrapers truncate inconsistently; cards look cleaner without it. Root `description` can keep its punctuation.
- `title.template` only fires when a child route sets its own `title`. The `default` is what shows on the root URL.

What you get from the block above:

| Tag                                                | Filled by                                          |
| -------------------------------------------------- | -------------------------------------------------- |
| `<title>`                                          | `title.default` (or page-level title via template) |
| `<meta name="description">`                        | `description`                                      |
| `og:image` (+ width/height/type)                   | auto from `app/opengraph-image.tsx`                |
| `og:site_name`                                     | `openGraph.siteName`                               |
| `og:title`                                         | `openGraph.title`                                  |
| `og:description`                                   | `openGraph.description`                            |
| `og:url`                                           | `openGraph.url`                                    |
| `og:type`                                          | `openGraph.type`                                   |
| `og:locale`                                        | `openGraph.locale`                                 |
| `twitter:card` / `title` / `description` / `image` | `twitter.*` + auto image                           |

## OG image (the picture)

The image is the part of an unfurl with the most design freedom — every site can and should have its own. This skill mandates the **infrastructure** (size, runtime, font loading, token discipline) and ships **one starter layout** as a working example. Use the starter when you want a clean, conventional card; replace it entirely when the site has a strong visual identity worth carrying into the unfurl.

### Infrastructure rules (apply to every image)

These are non-negotiable regardless of layout — get them wrong and the image silently breaks at the edge or in scrapers:

- `runtime = 'edge'` — the route must be edge-rendered; node runtime will fail on the JSX-to-PNG path.
- `size = { width: 1200, height: 630 }` — the OpenGraph spec target. Smaller and iMessage shows a square thumbnail instead of the hero card; larger wastes bytes.
- `contentType = 'image/png'` — every scraper handles PNG; webp/avif support is patchy.
- `export const alt = '…'` — required for accessibility and surfaces in some scrapers' alt text.
- **Display font matches the site.** Fetch the same family used in `app/layout.tsx` (`next/font/google` import) or the brand guide — `next/og` runs at the edge and does NOT inherit `next/font`, so you have to fetch the font yourself. A card in a different typeface reads as a separate poster, not a continuation of the site.
- **Visual tokens hoisted as named consts at the top of the file.** Pull hex values from the site's `globals.css` / Tailwind preset / brand guide. Don't sprinkle hexes inline — the next person who tunes the card should see the palette in one place.

### Font loading patterns

`next/og` doesn't inherit `next/font` (different runtime), so you fetch the font file in the route handler. Two reliable patterns:

1. **Single weight from a direct gstatic URL** (simplest). Find the woff2/ttf URL via the [Google Fonts CSS API](https://fonts.googleapis.com/css2?family=...) — copy the inner `src: url(...)` value. Good for cards that only need one weight at one size.
2. **Multiple weights** — fetch the CSS file with a desktop `User-Agent`, regex out each `src: url(...)`, then fetch each in parallel. Necessary when the layout mixes heavy display text with lighter body text or uses a non-Latin script alongside Latin.

If the route 500s, the font fetch is almost always the cause — gstatic URLs are versioned and silently rotate. Copy a known-working URL from a deployed site rather than hand-constructing one.

### Starter layout (in `assets/opengraph-image.tsx.tmpl`)

A three-band card — top eyebrow, center title + tagline, bottom footer — with 80px padding. Generic enough to look intentional on most sites. Slots:

- `{{ALT}}` — alt text for the image (usually site name).
- `{{BRAND}}` — top eyebrow. The project's brand identifier (e.g. `pivoshenko.ai`, `acme`). Use the name people refer to the project as, not the URL.
- `{{DOMAIN}}` — bottom footer. The actual deployed URL (e.g. `ai.pivoshenko.dev`, `acme.com`). For a vanity-domain site where brand == domain, both slots can be the same string.
- `{{TITLE}}` — big center line. 1–3 words ideal at the default 96px; ~18 chars max before it overflows. If longer, drop to 72px rather than wrapping — wrapping breaks the visual rhythm.
- `{{TAGLINE}}` — one short sentence, ideally the same as `metadata.description`.
- `{{BG}}`, `{{FG_TITLE}}`, `{{FG_TAGLINE}}`, `{{FG_MUTED}}` — palette tokens (see infrastructure rules).
- `{{FONT_NAME}}`, `{{FONT_URL}}` — display font (see font loading patterns).

Why BRAND and DOMAIN are separate slots: the project name and the URL are often different (`pivoshenko.startpage` ships at `startpage.pivoshenko.dev`). Conflating them produces a card where the top says one site and the bottom says another.

### When to design a custom layout instead

The starter is just one layout. Replace it when:

- The site's visual identity *is* a motif (e.g. a cassette-tape themed product, an album-cover-style site, a terminal-themed CLI). A generic three-band card erases the brand — the unfurl should look like the site.
- The product has a recognizable hero element (mascot, logo lockup, screenshot of the UI) that does more work than text.
- The card needs to convey something the three-band layout can't — a version number, a price, a country, etc.

Custom layouts must still follow every rule in **Infrastructure rules** and **Font loading patterns** above. Those aren't about the look — they're about the image actually rendering and being accepted by scrapers.

## Per-page overrides

For routes that deserve their own card (a blog post, a doc page), either:

- Export `generateMetadata` from `page.tsx` to override the `title` / `description` for that route (image stays the same).
- Add a route-local `app/<route>/opengraph-image.tsx` to override the image too. It can accept route params via the same signature as the page.

Default to one site-wide card. Per-page cards are worth the effort only when an individual page is meaningfully more shareable than the rest (blog posts, marketing landers).

## Verification

Always do at least one of these — never assume the unfurl is right just because the code compiled:

1. `pnpm dev` (or your dev command), then open `http://localhost:3000/opengraph-image` directly → confirms the PNG renders without 500ing on font fetch.
2. View the page source on the dev or prod URL, grep for `og:` and `twitter:` — confirm all 7 OG tags + 4 Twitter tags are present and non-empty.
3. After deploy: paste the URL into <https://www.opengraph.xyz/>, Slack, or iMessage and look at the unfurl. The image, title, and description should all show.

Common failure modes:

- Image renders, title/description blank in unfurl → `metadata` block missing or `metadataBase` not set.
- Route 500s on edge → font fetch URL is stale or wrong; copy from a working site.
- Image cached as a stale version → query string changes (Next adds a hash) usually bust it; if not, redeploy.

## When NOT to use this skill

- The site already has a working OG setup matching its brand — don't churn just to standardize unless the user asks. (A site with a bespoke image layout still benefits from the **metadata block** rules; only skip the image work.)
- Static `/public/og.png` setups for non-Next sites — different mechanism (manual `<meta>` tags + a pre-built PNG). This skill assumes Next App Router with `next/og`.
- Pages router (`pages/api/og.tsx` + manual `<Head>`) — the mechanics are similar but the file conventions differ. The metadata-block rules still apply; the image route does not.
