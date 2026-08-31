---
name: vercel-hygiene
description: Audit and harden the 4 pivoshenko brand sites on Vercel (pivoshenko.dev, pivoshenko.startpage, pivoshenko.wallpapers, pivoshenko.ai), team `pivoshenko`. Read-only sweep -> per-site report (ok/attention/action) -> confirmed fixes. Emphasizes security headers and analytics coverage. Use when the user says "audit vercel", "check vercel hygiene", "harden the sites", "vercel security", "check analytics coverage", "vercel health check", or wants a periodic once-over of the Vercel setup. Delegates perf/cost -> `vercel-optimize`, CLI ops -> `vercel-cli`, deployments -> `deploy-to-vercel`.
tags: [vercel, nextjs, deploy]
updated_at: 2026-08-31
---

# Vercel Hygiene

Read-only sweep -> per-site report (ok / attention / action) -> confirm -> apply -> verify. Use the Vercel MCP (`mcp__vercel__*`) for dashboard state; read on-disk files for code-side checks.

**Run every check; never report a finding this file predicts.** Each check below states the command and the optimal value — the verdict comes from the run, not from here. Baked-in findings are how an audit skill rots: the fix lands, the skill keeps reporting the gap, and the next sweep raises phantom actions against work already done.

## Sites

Team `pivoshenko`. Local repos are siblings under `~/Development/sources/`; each site's app lives in `<repo>/site/`.

| Project | Repo | Domain |
| --- | --- | --- |
| `pivoshenko.dev` | `pivoshenko.dev` | `pivoshenko.dev`, `www.pivoshenko.dev` |
| `pivoshenko.startpage` | `pivoshenko.startpage` | `startpage.pivoshenko.dev` |
| `pivoshenko.wallpapers` | `pivoshenko.wallpapers` | `wallpapers.pivoshenko.dev` |
| `pivoshenko.ai` | `pivoshenko.ai` | `ai.pivoshenko.dev` |

Shared foundation: `pivoshenko.ui` (git-tag-pinned per site). Config and chrome live there — `baseNextConfig`, `<SiteLayout>`, tokens — so a fix there propagates to all 4 on the next tag bump. Prefer shared fixes over per-site duplication.

Mind the two path shapes: sites *import* `pivoshenko.ui/next/config`, but on disk that file is `pivoshenko.ui/ui/next/config.ts` (the package export strips the leading `ui/`). Grep the disk path; a grep of the import path finds nothing and reads as "no shared headers" when the opposite is true.

Repo missing locally -> run the MCP-side checks anyway, mark the code-side ones `skipped (no local repo)`, and name them. Never infer a code-side verdict from the dashboard.

## Sweep (read-only)

Every check runs against all 4 sites and appears in the report — clean ones as `ok`, never silently omitted; omission reads as "not checked". Lead with security headers and analytics coverage.

### 1. Security headers

- Check: the shared source first — `grep -n headers ~/Development/sources/pivoshenko.ui/ui/next/config.ts` — then per site, `grep -n headers <repo>/site/vercel.json <repo>/site/next.config.ts` and `ls <repo>/site/middleware.ts`.
- Optimal: `headers()` defined once in `baseNextConfig`, inherited by all 4.
- A site may narrow the shared set in its own `next.config.ts`, but only by awaiting `baseNextConfig.headers?.()` and filtering — that keeps one source of truth and makes the exception visible. `pivoshenko.startpage` does this for `X-Frame-Options` (it's meant to be framed). A site that *redefines* headers from scratch, or sets them in `vercel.json`, = **attention**: it silently stops inheriting later additions.
- Absent from the shared config -> **action**, one fix for all 4. Minimum set:

  ```
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  ```

- CSP stays out of the shared config until validated per site — the sites don't share an origin allowlist (a fonts CDN on one, `raw.githubusercontent.com` on another). Blanket CSP in `baseNextConfig` breaks whichever site fetches something the others don't.
- HSTS is applied by Vercel on production domains — check, don't duplicate. A hand-rolled `Strict-Transport-Security` header is churn at best and a shorter `max-age` at worst.

### 2. Analytics + Speed Insights

- Check per site: `grep '@vercel/analytics\|@vercel/speed-insights' <repo>/site/package.json` (dep present?) and `grep -n 'Analytics\|SpeedInsights' <repo>/site/app/layout.tsx` (actually rendered?).
- Optimal: both deps present **and** both components rendered. `<Analytics />` comes free from `<SiteLayout>` in `pivoshenko.ui`; `<SpeedInsights />` is passed per site via `afterShell`.
- Dep without a render = **action**, not `ok` — an installed package that nothing mounts collects nothing. Check both halves separately and report them separately.
- Missing on some sites but not others -> the covered site is the template; mirror its wiring exactly rather than inventing a second pattern.

### 3. `vercel.json` contract

- Check: read each `<repo>/site/vercel.json`, diff the 4 against each other; `mcp__vercel__get_project` per site to confirm the dashboard agrees on framework / build / install / output.
- Optimal: all 4 identical — `$schema`, `framework: nextjs`, `buildCommand: pnpm build`, `installCommand: pnpm install --frozen-lockfile`, `outputDirectory: .next`. Any site that differs without a stated reason = **attention**.
- Dashboard value ≠ file value = **attention** (silent drift: the dashboard wins on some fields and the repo stops being the source of truth).
- `nodeVersion` is not a `vercel.json` key. Adding it does nothing — the version-controlled lever is `engines.node`. See check 4.

### 4. Node version

- Check: `grep -A2 '"engines"' <repo>/site/package.json`; `mcp__vercel__get_project` for the dashboard's Node version.
- Optimal: `engines.node` pins the same major the dashboard runs, in source. Vercel reads `engines.node` and it overrides the dashboard setting, so the repo is where the pin belongs.
- Open lower bound (`>=N`) while the dashboard runs a newer major = **attention**: it builds fine today and silently floats on the next platform bump.

### 5. Image optimization

- Check: `grep -rn 'next/image' <repo>/site` (used?); `grep -n 'images' <repo>/site/next.config.ts` (`unoptimized`? `remotePatterns`?).
- Optimal: `next/image` with the pipeline on, or `unoptimized: true` as a stated deliberate trade-off. Remote sources -> `remotePatterns` must list them, else the build fails at runtime.
- `unoptimized: true` on an image-heavy site = **attention**, not action: it skips WebP and responsive sizing, which is a real cost but a defensible call for a gallery of large static files. Revisit only if that site's LCP is actually suffering — check Speed Insights before proposing it.

### 6. Caching / ISR

- Check: `ls <repo>/site/app/**/route.ts`; for each, `grep -n 'Cache-Control\|revalidate' `; note which routes use `generateStaticParams`.
- Optimal: every dynamic route (RSS, API, OG) sets an explicit `Cache-Control`; static routes need nothing. A fully static site here is `ok`, not a gap.
- Dynamic route with no cache header = **action** (every request hits a function that could have been cached).

### 7. Runtime on OG + icon routes

- Check: `grep -n runtime <repo>/site/app/icon.tsx <repo>/site/app/opengraph-image.tsx`; watch the build output for `The Edge Runtime is deprecated`.
- Optimal as of Next 16: **`nodejs`**. `export const runtime = 'edge'` is deprecated — it still builds, with a warning, and it forces those routes dynamic (`Using edge runtime on a page currently disables static generation`). An icon and an OG image are exactly the routes you want prerendered.
- Still on `edge` = **action**: switch to `nodejs` and confirm the routes go static in the build output. Handlers re-export from `pivoshenko.ui`, so this is one shared fix plus a tag bump, not four.
- **Re-check after any ui tag bump** — shared config drifts silently and nothing in the site repo changes to signal it.

### 8. Env var hygiene

- Check: `ls <repo>/site/.env*`; `grep -rn 'process.env\.' <repo>/site --include=*.ts --include=*.tsx`; `grep -rn 'env' <repo>/site/vercel.json`; `mcp__vercel__get_project` for dashboard env vars.
- Optimal: no secrets in `vercel.json`, no committed `.env`, and every `process.env.*` read in source has a matching dashboard var.
- Source reads a var the dashboard doesn't define = **action** (undefined at build, usually a silent empty string rather than a crash). Dashboard defines a var no source reads = **attention** (dead config, or a leftover from a removed integration).

### 9. Domains / redirects

- Check: `mcp__vercel__get_project` domains per site vs the table above; confirm the primary resolves and `www.` redirects to apex where it exists.
- Optimal: exactly the domains listed, no stale preview or one-off domains left assigned.
- Unrecognized domain on a project = **attention**, name it rather than removing — it may be an intentional alias.

### 10. Functions / crons

- Check: `grep -n 'functions\|crons' <repo>/site/vercel.json`; `mcp__vercel__list_deployments` for function count.
- Optimal: for static sites, none — SSG plus edge routes needs no `functions` block. If a site has grown functions, its cost profile changed -> note it and hand off to `vercel-optimize`.

## Report format

One row per site × check. Verdicts come from the run.

```
Site                  Check                        Verdict
─────────────────     ──────────────────────────   ────────
all 4                 Security headers             <verdict>
pivoshenko.dev        Analytics / Speed Insights   <verdict>
startpage             Analytics / Speed Insights   <verdict>
...
```

Collapse to `all 4` only when all four genuinely share a verdict — a collapsed row that hides one differing site is a missed finding. Lead with: "N ok, N attention, N actions available." Then `AskUserQuestion` multiSelect over the `action` items only.

## Actions (each confirmed; side effects stated first)

Actions are derived from what the sweep found, not from a fixed list. The recurring ones:

- **Security headers** — add or extend `headers()` in `pivoshenko.ui/ui/next/config.ts`, then bump the pinned ui tag per site. Additive, no runtime change; takes effect on next deploy. Validate CSP per site before adding it. A site that needs less than the shared set filters it in its own `next.config.ts` rather than opting out.
- **Speed Insights / Analytics coverage** — add the dep, import the component in `app/layout.tsx`, pass via `afterShell` to `<SiteLayout>`. Mirror whichever site already has it.
- **Node pin** — tighten `engines.node` to the running major in `<repo>/site/package.json`. Locks the major in source; a later platform default bump then needs a deliberate edit. Don't add `nodeVersion` to `vercel.json`.
- **Cache header on a dynamic route** — add `Cache-Control` with `stale-while-revalidate`. **Stale content for the max-age window** — confirm the freshness budget for that route first.

## Delegation

- Cost analysis, bundle size, perf budgets -> `vercel-optimize`
- CLI ops (`vercel env`, `vercel domains`, `vercel link`) -> `vercel-cli`
- Triggering/managing deployments -> `deploy-to-vercel`

## Rules

- Sweep = read-only. Change state only via confirmed actions, one site at a time -> verify -> next.
- Report what the check returned, never what this file expects. A check that couldn't run is `skipped` + why — never `ok`.
- `pivoshenko.ui` changes hit all 4 sites — prefer shared fixes there over per-site duplication, and re-run the sweep after a tag bump.
- No force-pushes, no env var changes without explicit ask.
- Side effects before confirm, always.
- Clean sweep -> "all healthy", stop. Don't invent actions.
- Security headers + analytics coverage surface first — they're the checks where a gap costs the most and shows the least.
