<!--
=== Scope: next ===
Audience: agents and humans applying the repository-hygiene standard.
Purpose:  Own Next.js + shared-pkg manifests, lint/format config, Vercel config.
Read-when: scope=next is invoked; or when the user asks about package.json, biome, next.config, tsconfig, vercel.json, or pnpm engines.
=== end ===
-->

# Scope: next

Subpath-aware. Covers both `next-site` and `shared-pkg` stacks — they share most config but diverge on publish surface (`exports`, `peerDependencies`).

## Owns

At repository root OR `subpaths[next-site]`:

- `package.json` (canonical keys: scripts, engines, packageManager; for `shared-pkg` also `exports`, `peerDependencies`, `peerDependenciesMeta`, `files`)
- `biome.json`
- `next.config.ts` (next-site only)
- `tsconfig.json`
- `vercel.json` (next-site only)
- optional `postcss.config.mjs`, `tailwind.config.ts`, `.npmrc`
- `app/` layout convention (next-site)

## Canon

- `assets/package-json/next-site.json` — next-site template
- `assets/package-json/shared-pkg.json` — shared-pkg template (publish surface)
- `assets/biome.json`
- `assets/next.config.ts`
- `assets/tsconfig.json`
- `assets/vercel.json`

Tokens: `{{name}}`, `{{description}}`, `{{repository}}` (= `<owner>/<name>`).

Canonical scripts (next-site): `dev = "next dev --turbopack"`, `build = "next build"`, `start = "next start"`, `lint = "biome lint ."`, `format = "biome format . --write"`, `check = "biome check . --write"`.

Hard-coded across both variants: `engines.node: ">=22"`, `packageManager: "pnpm@10.30.3"`.

## Stack matrix

| Stack tag    | Applies? | Notes                                                                          |
| ------------ | -------- | ------------------------------------------------------------------------------ |
| `next-site`  | yes      | primary; full file set                                                         |
| `shared-pkg` | yes      | package.json (publish surface) + biome + tsconfig only; no next.config / vercel |
| every other  | no       |                                                                                |

Composite -> manifest lives at `subpaths[next-site]`; one root `tsconfig` may extend a shared base where applicable.

## Scaffolding notes

- `package.json` is a key-level merge, not a wholesale overwrite — replace `scripts`, `engines`, `packageManager` (and for shared-pkg `peerDependencies`, `peerDependenciesMeta`, `exports`, `files`); keep `dependencies`, `devDependencies`, `version`, `name`, `description`
- `biome.json`, `next.config.ts`, `tsconfig.json`, `vercel.json` -> overwrite cleanly with canon
- Vercel dashboard install/build commands need to match `vercel.json`; re-verify dashboard quarterly
- Tailwind preset (when used) comes from the shared package; do not duplicate locally

## Things to know

- `pnpm` is mandatory — remove any `package-lock.json` / `yarn.lock` before scaffolding
- `engines.node` floor is `>=22`
- shared-pkg has NO publish workflow (git-tag distribution); `exports` is the consumer contract
- `app/layout.tsx`, `app/icon.tsx` are per-site, not owned here
- `transpilePackages` in `next.config.ts` may include the shared-pkg name — preserve any consumer additions
- `.npmrc` optional; when present canon expects `auto-install-peers=true`
