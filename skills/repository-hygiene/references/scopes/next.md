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

## Drift detection

`package.json` is key-level (not byte-level):

- canon-owned keys (`scripts`, `engines`, `packageManager`, and for shared-pkg `peerDependencies`, `peerDependenciesMeta`, `exports`, `files`) -> diff vs canon
- `dependencies`, `devDependencies`, `version`, `name`, `description` -> preserved

Other files (`biome.json`, `next.config.ts`, `tsconfig.json`, `vercel.json`) -> byte diff vs canon.

- `missing` -> file absent at expected path
- `drift` -> canon key/file content differs
- `extra` -> repository-added scripts or config blocks -> preserved
- `external` -> Vercel dashboard install/build command drift vs `vercel.json` -> warning (quarterly re-verify per cross-cutting convention)

## Edge cases

- `pnpm` is mandatory; presence of `package-lock.json` or `yarn.lock` -> `drift` (block fix until user removes)
- `engines.node` floor is `>=22`; tightening (e.g. `>=20`) flagged as `drift`
- shared-pkg has NO publish workflow (git-tag distribution) — `exports` field is the consumer contract
- `app/layout.tsx`, `app/icon.tsx` not owned by this scope (per-site; see consumer instructions)
- `transpilePackages` in `next.config.ts` may include the shared-pkg name -> canon preserves user additions
- `.npmrc` optional; when present canon enforces `auto-install-peers=true`
- Tailwind preset (when used) consumed from shared-pkg; not owned here
