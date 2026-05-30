<!--
=== Variant: next-site ===
Audience: agents and humans applying the repository-hygiene standard.
Purpose:  README rules and template for Next.js site repositories (deploy targets, not products).
Read-when: Writing or auditing a README in a repository tagged `next-site`.
=== end ===
-->

# Variant: next-site

Signal: `next.config.ts` (or `.js`) + `app/`.

## Philosophy

Sites are deploy targets, not products. READMEs stay minimal. Visitors read the site, not the repository.

## Badge row

License -> StandWithUkraine. That's it. (No CI / version badges — there's no release pipeline, the site auto-deploys from `main`.)

## Sections (in order)

1. Hero (H1 only — no logo)
2. Badge row (`<p align="left">`)
3. `## Overview` — 1–2 sentences. What the site is, where it lives.
4. `## Stack` — bullet list of key deps (Next, React, Tailwind, Biome).
5. `## Development` — `pnpm install` / `pnpm dev` / `just check`.
6. `## Deployment` — one sentence: "Auto-deploys to Vercel on push to `main`. Preview deployments for all other branches."

## Template

````markdown
# <repository-name>

<p align="left">
  <a href="https://github.com/<owner>/<repository>/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/badge/License-MIT-0A6847?style=flat-square&logo=opensourceinitiative&logoColor=white"></a>
  <a href="https://stand-with-ukraine.pp.ua/"><img alt="StandWithUkraine" src="https://img.shields.io/badge/Support-Ukraine-FFC93C?style=flat-square&labelColor=07689F"></a>
</p>

## Overview

<one-line description>. Lives at [<domain>](https://<domain>).

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- Tailwind 3
- Biome
- Deployed to Vercel

## Development

```shell
just install
just dev
```

Run the full CI gate locally:

```shell
just check
```

## Deployment

Auto-deploys to Vercel on push to `main`. Preview deployments enabled for all other branches.
````

## Notes

- No `### Features` — sites are described by their content, not bullet-list specs.
- No `## Installation` — there's nothing to install, you visit the URL.
- Keep total length under ~50 lines.
