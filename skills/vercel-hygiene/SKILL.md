---
name: vercel-hygiene
description: Audit and harden the 4 pivoshenko brand sites on Vercel (pivoshenko.dev, pivoshenko.startpage, pivoshenko.wallpapers, pivoshenko.ai), team `pivoshenko`. Read-only sweep → per-site report (ok/attention/action) → confirmed fixes. Emphasizes security headers and analytics coverage. Use when the user says "audit vercel", "check vercel hygiene", "harden the sites", "vercel security", "check analytics coverage", "vercel health check", or wants a periodic once-over of the Vercel setup. Delegates perf/cost → `vercel-optimize`, CLI ops → `vercel-cli`, deployments → `deploy-to-vercel`.
tags: [vercel, nextjs, deploy]
updated_at: 2026-06-13
---

# Vercel Hygiene

Read-only sweep → per-site report (ok / attention / action) → confirm → apply → verify. 4 sites, 1 team (`pivoshenko`): `pivoshenko.dev`, `pivoshenko.startpage`, `pivoshenko.wallpapers`, `pivoshenko.ai`. Shared foundation in `pivoshenko.ui` — fixes there propagate everywhere. Use the Vercel MCP (`mcp__vercel__*`) for dashboard state; read on-disk files for code-side checks.

## Sweep (read-only)

Run all checks across all 4 sites. Every check appears in the report — clean ones as `ok`, never silently omitted. Security headers + analytics coverage first.

### 1. Security headers (PRIORITY — absent everywhere)

All 4 `site/vercel.json` have no `headers` key. `pivoshenko.ui/next/config.ts` `baseNextConfig` has no `headers()`. No `middleware.ts` in any site → zero security headers today.

Check:
- `grep -n headers site/vercel.json site/next.config.ts` → expect nothing
- confirm no `site/middleware.ts`

Gap = **action** on all 4. Fix: add `headers()` to `baseNextConfig` in `pivoshenko.ui/next/config.ts` → propagates to all sites on next deploy. Minimum set:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

CSP = optional, add only after per-site validation — shared config can't cover it blindly: `pivoshenko.dev` loads Google Fonts CDN, `pivoshenko.wallpapers` fetches `raw.githubusercontent.com`. HSTS auto-applied by Vercel on prod domains → don't duplicate.

### 2. Analytics + Speed Insights (PRIORITY)

**Analytics (`@vercel/analytics`):** all 4 have the dep (`^1.6.1`) + `<Analytics />` rendered unconditionally by `<SiteLayout>` (`pivoshenko.ui/next/site-layout.tsx`). → **ok** all 4.

**Speed Insights (`@vercel/speed-insights`):** only `pivoshenko.dev` has dep + `<SpeedInsights />` via `afterShell` in `app/layout.tsx`. `startpage`, `wallpapers`, `ai` → no coverage.

Check:
- `grep "@vercel/speed-insights" site/package.json` per site
- `grep SpeedInsights site/app/layout.tsx` per site

Gap = **action** on `startpage`, `wallpapers`, `ai`. Fix: add dep + `afterShell={<SpeedInsights />}`, mirror the `pivoshenko.dev` pattern.

### 3. `vercel.json` contract

All 4 identical → `$schema`, `framework: nextjs`, `buildCommand: pnpm build`, `installCommand: pnpm install --frozen-lockfile`, `outputDirectory: .next`. No `headers`/`redirects`/`rewrites`/node pin.

Check: read each `site/vercel.json`, diff vs canonical. MCP `get_project` confirms no drift on framework/build/install/output.

Gap = **attention**: dashboard pins Node `24.x` (MCP-confirmed) via Project Settings, but `package.json engines.node >=22` is only a lower bound. `nodeVersion` is NOT a `vercel.json` key — the version-controlled lever is `engines.node` (Vercel reads it and it overrides dashboard). Optional: tighten `>=22` → `24.x` in each `site/package.json` to lock the major in source.

### 4. Node engines

All 4 `site/package.json` → `"engines": { "node": ">=22" }`. Dashboard runs `24.x` → satisfies. → **ok**.

### 5. Image optimization

`pivoshenko.wallpapers` uses `next/image` (`site/components/wallpaper-browser.tsx`) with local paths (`/wallpapers/...`). `next.config.ts` sets `images: { unoptimized: true }` → pipeline off. Images are big static files in `public/wallpapers/`, no remote → no `remotePatterns` needed. Other 3 sites: no `next/image`.

Gap = **attention** (wallpapers only): `unoptimized: true` skips WebP + responsive sizing. Deliberate trade-off for a gallery — revisit only if LCP suffers. Not a blocking action.

### 6. Caching / ISR

`pivoshenko.dev` RSS route (`app/rss.xml/route.ts`) → `Cache-Control: public, max-age=3600, stale-while-revalidate=86400`. Blog routes use `generateStaticParams` → static. → **ok**. Other sites: fully static, no dynamic routes/API → no ISR needed → **ok**.

### 7. Edge runtime on OG + icon routes

All 4 declare `export const runtime = 'edge'` in `app/icon.tsx` + `app/opengraph-image.tsx` (handlers re-export from `pivoshenko.ui/next/{icon,opengraph-image}`). → **ok** all 4. Re-check after any `pivoshenko.ui` tag bump — shared config drifts silently.

### 8. Env var hygiene

No `.env*` files in any site. No `process.env.*` / `NEXT_PUBLIC_*` in source. Analytics wired via shared layout, no env needed. No secrets in any `vercel.json`. → **ok**.

### 9. Domains / redirects

MCP `get_project` domains per site → apex/subdomain + preview domains:
- `pivoshenko.dev` → `pivoshenko.dev`, `www.pivoshenko.dev`
- `pivoshenko.startpage` → `startpage.pivoshenko.dev`
- `pivoshenko.wallpapers` → `wallpapers.pivoshenko.dev`
- `pivoshenko.ai` → `ai.pivoshenko.dev`

Check: primary resolves, `www.` redirects to apex as intended, no stale preview domains. Path-level redirects (none today) → `next.config.ts` or `vercel.json`.

### 10. Fluid compute

No `functions`/`crons` in any `vercel.json`. Sites = static (SSG) + edge routes. Not applicable → **ok**.

## Report format

```
Site                  Check                        Verdict
─────────────────     ──────────────────────────   ────────
all 4                 Security headers             ACTION
pivoshenko.dev        Speed Insights               ok
startpage             Speed Insights               ACTION
wallpapers            Speed Insights               ACTION
pivoshenko.ai         Speed Insights               ACTION
all 4                 Analytics                    ok
all 4                 vercel.json contract         ok
all 4                 Node pin (engines.node)      ATTENTION
all 4                 engines.node                 ok
wallpapers            images.unoptimized           ATTENTION
pivoshenko.dev        RSS Cache-Control            ok
all 4                 Edge runtime (icon/OG)       ok
all 4                 Env vars                     ok
all 4                 Domains                      ok
all 4                 Fluid compute                ok
```

Lead with: "N ok, N attention, N actions available." Then `AskUserQuestion` multiSelect over the `action` items only.

## Actions (each confirmed; side effects stated first)

- **Security headers (all 4)** — add `headers()` to `baseNextConfig` in `pivoshenko.ui/next/config.ts`. Propagates to all 4 on next deploy via ui-tag bump. Additive, no runtime change. Validate CSP per-site before adding it (fonts CDN on dev, raw.githubusercontent on wallpapers).
- **Speed Insights (`startpage`, `wallpapers`, `ai`)** — per site: add `@vercel/speed-insights` dep → import `SpeedInsights` in `app/layout.tsx` → pass `afterShell={<SpeedInsights />}` to `<SiteLayout>`. Mirror `pivoshenko.dev` exactly.
- **Node version pin** — tighten `engines.node` from `>=22` to `24.x` in all 4 `site/package.json` (Vercel reads `engines.node`, overrides dashboard). Locks the major in source. `nodeVersion` is not a `vercel.json` key — don't add it there.

## Delegation

- Cost analysis, bundle size, perf budgets → `vercel-optimize`
- CLI ops (`vercel env`, `vercel domains`, `vercel link`) → `vercel-cli`
- Triggering/managing deployments → `deploy-to-vercel`

## Rules

- Sweep = read-only. Change state only via confirmed actions, one site at a time → verify → next.
- `pivoshenko.ui` changes hit all 4 sites — prefer shared fixes there over per-site duplication.
- No force-pushes, no env var changes without explicit ask.
- Side effects before confirm, always.
- Clean sweep → "all healthy", stop. Don't invent actions.
- Security headers + analytics coverage are top priority — surface them first.
