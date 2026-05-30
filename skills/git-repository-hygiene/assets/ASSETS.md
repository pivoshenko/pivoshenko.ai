<!--
=== assets/ASSETS.md ===
Audience: agents and humans applying the git-repository-hygiene standard.
Purpose:  Documents canonical JSON assets that cannot carry inline comments.
Read-when: applying the next, shared-pkg, or any JSON-based scope; auditing JSON asset drift.
=== end ===
-->

# Asset index

Most asset files carry their own 3-field header (Purpose / Tokens / Override) inline at the top of the file. JSON has no comment syntax, so the canonical headers for JSON assets live in this index instead.

When an asset is copied into a consumer repository, the inline header (or this index entry, for JSON) is the source of truth for what may safely be customised and what must stay verbatim.

## assets/biome.json

- **Purpose:** Lands at the repository root as `biome.json`. Standalone Biome formatter + linter config for TypeScript/JavaScript variants (next-site, shared-pkg).
- **Tokens:** none.
- **Override:** Extend `linter.rules` with per-repository rule tweaks. Adjust `formatter.lineWidth` if a repository pins differently. Do not change `formatter.indentStyle` / `indentWidth` (matches `.editorconfig`). Bump `$schema` URL in lockstep with the Biome dependency in `package.json`.
- **Why this shape:** Self-contained — no extends from a shared package. `vcs.useIgnoreFile` honours `.gitignore` automatically. Strict single-quote, no-semicolon, trailing-comma style matches the Biome default opinionated set with explicit override for arrow parens (matches readability over keystroke count).

## assets/tsconfig.json

- **Purpose:** Lands at the repository root as `tsconfig.json` for Next.js sites. Standalone strict TypeScript config wired for Next 16 Turbopack typed routes.
- **Tokens:** none.
- **Override:** Safe to extend `include`/`exclude` for site-specific source layouts and to add additional `paths` aliases. Do not remove the Next plugin entry or either `.next/types` include (Next 16 requires both `.next/types` and `.next/dev/types` for typed routes to resolve). Non-Next variants use their own `tsconfig.json` shape and should not start from this file.
- **Why this shape:** ES2022 target + `bundler` module resolution + `strict: true` is the modern Next baseline. The Next plugin + dual `.next/types` includes are the minimum Next 16 needs for editor type-checking on `<Link href="...">`.

## assets/vercel.json

- **Purpose:** Lands at the repository root as `vercel.json` for any site deployed to Vercel. Declares the framework preset and pins the install/build commands so the dashboard cannot drift away from the committed config.
- **Tokens:** none.
- **Override:** May add `redirects`, `rewrites`, `headers`, `regions`, `crons`, or `functions` blocks per site need. Do not change `framework`, `buildCommand`, `installCommand`, or `outputDirectory` without coordinated dashboard updates. Never put secrets here; environment variables live in the dashboard.
- **Why this shape:** `--frozen-lockfile` on install is the hard guarantee that the lockfile committed to the repository is exactly what builds; without it a stray `pnpm install` mid-build can shift dependencies. Declaring the framework explicitly stops Vercel from auto-detecting (and occasionally mis-detecting) on monorepo layouts.

## assets/package-json/next-site.json

- **Purpose:** Lands at the repository root as `package.json` for a fresh Next.js site. Pins the canonical Next 16 / React 19 / Tailwind 3 / Biome stack, the `pnpm` package manager version, and Node `>=22`. Wires the standard `dev`/`build`/`start`/`lint`/`format`/`check` scripts that the `just` recipes call into.
- **Tokens:**
  - `{{name}}` — npm package name. Same as the repository name; lowercase, dot- or dash-separated.
- **Override:** Safe to add site-specific runtime dependencies (e.g. `@vercel/analytics`, `mdx-bundler`, `@tailwindcss/typography`, shared component packages) and dev tooling. Do not drop the `packageManager` pin, the `engines.node` floor, the Turbopack `dev` flag, or any of the six standard scripts (the `justfile` assumes the script names exist).
- **Why this shape:** `packageManager` plus `engines.node` is what makes `corepack` resolve pnpm deterministically in CI and on Vercel. The shared script names (`dev`, `build`, `start`, `lint`, `format`, `check`) match the canonical `just` vocabulary so a single `justfile` can fan out across every site.

## assets/package-json/shared-pkg.json

- **Purpose:** Lands at the repository root as `package.json` for a shared (library) package distributed by git tag rather than npm. Declares subpath `exports` for the shipped surface and marks framework deps as optional peers so consumers control versions.
- **Tokens:**
  - `{{name}}` — npm package name. Same as the repository name; consumers import this string.
  - `{{description}}` — one-sentence package summary. Surfaces in `npm` tooling and editor tooltips; keep under ~120 chars.
- **Override:** Add additional `exports` subpaths as the package grows. Safe to add `scripts` beyond `lint`/`format` and to add devDependencies needed for build/release tooling. Do not change `version` by hand — releases are tag-driven (`0.0.0` is the canonical placeholder). Do not move framework deps out of `peerDependencies` (would force a version on every consumer).
- **Why this shape:** Optional peers let one package serve both Next sites and standalone consumers without forcing a peer install. Subpath `exports` (rather than a single barrel) keeps the package tree-shakeable. The `files` allow-list ships only the directories consumers need; source, fixtures, configs stay out of the tag tarball.

## assets/next.config.ts

- **Purpose:** Lands at the repository root as `next.config.ts` for Next.js sites. Enables React strict mode. Minimal by design — site-specific options layered in via Override.
- **Tokens:** none.
- **Override:** Safe to add `images`, `experimental`, `redirects`, `rewrites`, `headers`, `webpack`/`turbopack` hooks, `pageExtensions` (for MDX), or `transpilePackages` (for any git-tag-pinned shared packages the site consumes). Do not disable `reactStrictMode` (dev-only double-render catches state bugs early).
- **Why this shape:** This file is TypeScript so it can carry inline comments, but it's catalogued here for parity with the other root-level assets. The minimal shape exists because most Next behaviour is project-specific — the canonical file ships only the one invariant every site must keep (`reactStrictMode: true`).
