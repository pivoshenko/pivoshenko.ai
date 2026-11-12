---
name: vercel-hygiene
description: Audit and harden the 5 pivoshenko brand sites on Vercel (pivoshenko.dev, pivoshenko.ai, pivoshenko.theme, pivoshenko.startpage, pivoshenko.wallpapers), team `pivoshenko`. Read-only sweep -> per-site report (ok/attention/action) -> confirmed fixes. Emphasizes security headers and analytics coverage. Use when the user says "audit vercel", "check vercel hygiene", "harden the sites", "vercel security", "check analytics coverage", "vercel health check", or wants a periodic once-over of the Vercel setup. Delegates perf/cost -> `vercel-optimize`, CLI ops and deployments -> `vercel-cli` (or the `mcp__vercel__deploy_to_vercel` tool).
tags: [vercel, nextjs, deploy]
updated_at: 2026-11-12
---

# Vercel Hygiene

Read-only sweep -> per-site report (ok / attention / action) -> confirm -> apply -> verify. Use the Vercel MCP (`mcp__vercel__*`) for dashboard state; read on-disk files for code-side checks.

**Run every check; never report a finding this file predicts.** Each check below states the command and the optimal value - the verdict comes from the run, not from here. Baked-in findings are how an audit skill rots: the fix lands, the skill keeps reporting the gap, and the next sweep raises phantom actions against work already done.

## Sites

Team `pivoshenko`. All sites live in one private monorepo, `pivoshenko/pivoshenko.sites`, checked out at `~/Development/sources/pivoshenko.sites`; each site's app lives in `sites/<name>/`. Every path in the checks below is relative to that monorepo root.

| Project | Site Dir | Domain |
| --- | --- | --- |
| `pivoshenko-dev` | `sites/dev` | `pivoshenko.dev`, `www.pivoshenko.dev` |
| `pivoshenko-ai` | `sites/ai` | `ai.pivoshenko.dev` |
| `pivoshenko-theme` | `sites/theme` | `theme.pivoshenko.dev` |
| `pivoshenko-startpage` | `sites/startpage` | `startpage.pivoshenko.dev` |
| `pivoshenko-wallpapers` | `sites/wallpapers` | `wallpapers.pivoshenko.dev` |

Each Vercel project builds from Root Directory `sites/<name>`, with install `pnpm install --frozen-lockfile`, build `pnpm build`, and "affected projects" skipping on (`enableAffectedProjectsDeployments`). `ai`, `theme` and `wallpapers` fetch content at build from the public repos `pivoshenko.ai`, `pivoshenko.theme` and `pivoshenko.wallpapers` via `scripts/fetch-content.mjs`; those repos trigger rebuilds through Vercel deploy hooks (`.github/workflows/deploy.yaml`, secret `VERCEL_DEPLOY_HOOK`). Deploy hooks are expected, not drift.

Shared foundation: `packages/ui/` in the same monorepo, still named `pivoshenko.ui`, consumed as `workspace:*`. Config and chrome live there - `baseNextConfig`, `<SiteLayout>`, tokens - so a fix there lands in the same commit as the sites and deploys with them; there is no tag bump. Prefer shared fixes over per-site duplication.

Mind the two path shapes: sites *import* `pivoshenko.ui/next/config`, but on disk that file is `packages/ui/ui/next/config.ts` (the package export strips the leading `ui/`). Grep the disk path; a grep of the import path finds nothing and reads as "no shared headers" when the opposite is true.

Monorepo missing locally -> run the MCP-side checks anyway, mark the code-side ones `skipped (no local repo)`, and name them. Never infer a code-side verdict from the dashboard.

## Sweep (Read-Only)

Every check runs against all 5 sites and appears in the report - clean ones as `ok`, never silently omitted; omission reads as "not checked". Lead with security headers and analytics coverage.

First, `mcp__vercel__list_projects` on team `pivoshenko`: any project not in the Sites table = **attention**, name it - an unlisted project is exactly the drift this sweep exists to catch.

### 1. Security Headers

- Check: the shared source first - `grep -n headers packages/ui/ui/next/config.ts` - then per site, `grep -n headers sites/<site>/vercel.json sites/<site>/next.config.ts` and `ls sites/<site>/middleware.ts`
- Optimal: `headers()` defined once in `baseNextConfig`, inherited by all 5
- A site may narrow the shared set in its own `next.config.ts`, but only by awaiting `baseNextConfig.headers?.()` and filtering - that keeps one source of truth and makes the exception visible. `pivoshenko.startpage` does this for `X-Frame-Options` (it's meant to be framed). A site that *redefines* headers from scratch, or sets them in `vercel.json`, = **attention**: it silently stops inheriting later additions
- Absent from the shared config -> **action**, one fix for all 5. Minimum set:

  ```
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  ```

- CSP stays out of the shared config until validated per site - the sites don't share an origin allowlist (a fonts CDN on one, `raw.githubusercontent.com` on another). Blanket CSP in `baseNextConfig` breaks whichever site fetches something the others don't
- HSTS is applied by Vercel on production domains - check, don't duplicate. A hand-rolled `Strict-Transport-Security` header is churn at best and a shorter `max-age` at worst

### 2. Analytics + Speed Insights

- Check per site: `grep '@vercel/analytics\|@vercel/speed-insights' sites/<site>/package.json` (dep present?) and `grep -n 'Analytics\|SpeedInsights' sites/<site>/app/layout.tsx` (actually rendered?)
- Optimal: both deps present **and** both components rendered. `<Analytics />` comes free from `<SiteLayout>` in `pivoshenko.ui`; `<SpeedInsights />` is passed per site via `afterShell`
- Dep without a render = **action**, not `ok` - an installed package that nothing mounts collects nothing. Check both halves separately and report them separately
- Missing on some sites but not others -> the covered site is the template; mirror its wiring exactly rather than inventing a second pattern

### 3. `vercel.json` Contract

- Check: read each `sites/<site>/vercel.json` (`ls sites/*/vercel.json`), diff the 5 against each other; `mcp__vercel__get_project` per site to confirm the dashboard agrees on framework / build / install / output / Root Directory (`sites/<name>`) / `enableAffectedProjectsDeployments`
- Optimal: all 5 identical - `$schema`, `framework: nextjs`, `buildCommand: pnpm build`, `installCommand: pnpm install --frozen-lockfile`, `outputDirectory: .next`. Any site that differs without a stated reason = **attention**
- Dashboard value ≠ file value = **attention** (silent drift: the dashboard wins on some fields and the repo stops being the source of truth)
- `nodeVersion` is not a `vercel.json` key. Adding it does nothing - the version-controlled lever is `engines.node`. See check 4

### 4. Node Version

- Check: `grep -A2 '"engines"' package.json` and `grep packageManager package.json` at the monorepo root (sites no longer declare either; `grep -A2 '"engines"' sites/*/package.json` should find nothing); `mcp__vercel__get_project` for the dashboard's Node version
- Optimal: root `engines.node` pins the same major the dashboard runs, in source. Vercel reads `engines.node` and it overrides the dashboard setting, so the repo is where the pin belongs
- Open lower bound (`>=N`) while the dashboard runs a newer major = **attention**: it builds fine today and silently floats on the next platform bump

### 5. Image Optimization

- Check: `grep -rn 'next/image' sites/<site>` (used?); `grep -n 'images' sites/<site>/next.config.ts` (`unoptimized`? `remotePatterns`?)
- Optimal: `next/image` with the pipeline on, or `unoptimized: true` as a stated deliberate trade-off. Remote sources -> `remotePatterns` must list them, else the build fails at runtime
- `unoptimized: true` on an image-heavy site = **attention**, not action: it skips WebP and responsive sizing, which is a real cost but a defensible call for a gallery of large static files. Revisit only if that site's LCP is actually suffering - check Speed Insights before proposing it

### 6. Caching / ISR

- Check: `find sites/<site>/app -name route.ts` (`ls` with `**` misses nested routes without globstar); for each, `grep -n 'Cache-Control\|revalidate' `; note which routes use `generateStaticParams`
- Optimal: every dynamic route (RSS, API, OG) sets an explicit `Cache-Control`; static routes need nothing. A fully static site here is `ok`, not a gap
- Dynamic route with no cache header = **action** (every request hits a function that could have been cached)

### 7. Runtime on OG + Icon Routes

- Check: `grep -n runtime sites/<site>/app/icon.tsx sites/<site>/app/opengraph-image.tsx`; watch the build output for `The Edge Runtime is deprecated`
- Optimal: **`nodejs`** - the deprecation warning in the build output is the check, trust it over any version claim here. Why -> as of Next 16, `export const runtime = 'edge'` is deprecated and forces those routes dynamic (`Using edge runtime on a page currently disables static generation`); an icon and an OG image are exactly the routes you want prerendered
- Still on `edge` = **action**: switch to `nodejs` and confirm the routes go static in the build output. Handlers re-export from `pivoshenko.ui`, so this is one shared fix in `packages/ui`, not five
- **Re-check after any `packages/ui` change** - shared config drifts silently and nothing in a site's own directory changes to signal it

### 8. Env Var Hygiene

- Check: `ls sites/<site>/.env*`; `grep -rn 'process.env\.' sites/<site> --include=*.ts --include=*.tsx`; `grep -rn 'env' sites/<site>/vercel.json`; `mcp__vercel__get_project` for dashboard env vars
- Optimal: no secrets in `vercel.json`, no committed `.env`, and every `process.env.*` read in source has a matching dashboard var. Currently the projects define no env vars; the deploy hooks that `pivoshenko.ai`, `pivoshenko.theme` and `pivoshenko.wallpapers` call live in those repos' GitHub secrets, not in Vercel env
- Source reads a var the dashboard doesn't define = **action** (undefined at build, usually a silent empty string rather than a crash). Dashboard defines a var no source reads = **attention** (dead config, or a leftover from a removed integration)

### 9. Domains / Redirects

- Check: `mcp__vercel__get_project` domains per site vs the table above; confirm the primary resolves and `www.` redirects to apex where it exists
- Optimal: exactly the domains listed, no stale preview or one-off domains left assigned
- Unrecognized domain on a project = **attention**, name it rather than removing - it may be an intentional alias

### 10. Functions / Crons

- Check: `grep -n 'functions\|crons' sites/<site>/vercel.json`; derive function presence from the repo (`find sites/<site>/app -name route.ts` handlers + the `functions` block); `mcp__vercel__get_deployment` on the latest deployment only to confirm
- Optimal: for static sites, none - SSG plus edge routes needs no `functions` block. If a site has grown functions, its cost profile changed -> note it and hand off to `vercel-optimize`

## Report Format

One row per site x check, verdicts from the run -> [references/report-format.md](references/report-format.md).

Collapse to `all 5` only when all five genuinely share a verdict - a collapsed row that hides one differing site is a missed finding. Lead with: "N ok, N attention, N actions available." Then `AskUserQuestion` multiSelect over the `action` items only.

## Actions (Each Confirmed; Side Effects Stated First)

Actions are derived from what the sweep found, not from a fixed list. The recurring ones:

- **Security headers** - add or extend `headers()` in `packages/ui/ui/next/config.ts`; the sites inherit it in the same commit. Additive, no runtime change; takes effect on next deploy. Validate CSP per site before adding it. A site that needs less than the shared set filters it in its own `next.config.ts` rather than opting out
- **Speed Insights / Analytics coverage** - add the dep, import the component in `app/layout.tsx`, pass via `afterShell` to `<SiteLayout>`. Mirror whichever site already has it
- **Node pin** - tighten `engines.node` to the running major in the root `package.json`. Locks the major in source; a later platform default bump then needs a deliberate edit. Don't add `nodeVersion` to `vercel.json`
- **Cache header on a dynamic route** - add `Cache-Control` with `stale-while-revalidate`. **Stale content for the max-age window** - confirm the freshness budget for that route first

## Delegation

- Cost analysis, bundle size, perf budgets -> `vercel-optimize`
- CLI ops (`vercel env`, `vercel domains`, `vercel link`) -> `vercel-cli`
- Triggering/managing deployments -> `vercel-cli` (CLI) or `mcp__vercel__deploy_to_vercel` (MCP)

## Rules

- Sweep = read-only. Change state only via confirmed actions, one site at a time -> verify -> next
- Report what the check returned, never what this file expects. A check that couldn't run is `skipped` + why - never `ok`
- `pivoshenko.ui` changes hit all 5 sites - prefer shared fixes there over per-site duplication, and re-run the sweep after a `packages/ui` change
- No force-pushes, no env var changes without explicit ask
- Side effects before confirm, always
- Clean sweep -> "all healthy", stop. Don't invent actions
- Security headers + analytics coverage surface first - they're the checks where a gap costs the most and shows the least
