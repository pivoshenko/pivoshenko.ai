<!--
=== Variant: shared-pkg ===
Audience: agents and humans applying the repository-hygiene standard.
Purpose:  README rules for shared TS packages distributed via git tag (no publish workflow).
Read-when: Writing or auditing a README in a repository tagged `shared-pkg`.
=== end ===
-->

# Variant: shared-pkg

Signal: TS package, no publish workflow, git-tag distribution.

Tokens used in templates below: `<pkg>` = package name, `<owner>` = GitHub owner, `<repository>` = repository name, `<semver>` = release tag.

## Badge row

License -> Release (git tag) -> StandWithUkraine. No CI/coverage badges unless actually wired.

## Sections (in order)

1. Hero (H1 only)
2. Badge row (`<p align="left">`)
3. `## Overview` — what it shares, who consumes it
4. `## Subpaths` — table of import subpaths + purpose
5. `## Consumption` — how to install + use
6. `## Local development override` — link-mode override for dev
7. `## Releasing` — git tag bump flow

## Subpaths table

```markdown
## Subpaths

| Subpath | Purpose |
| --- | --- |
| `<pkg>` | Main entrypoint (e.g. React components, utilities) |
| `<pkg>/<subpath>` | Subpath exports per `exports` field in `package.json` |
```

## Consumption block

````markdown
## Consumption

Install from git tag in consumer's `package.json`:

```jsonc
"dependencies": {
  "<pkg>": "github:<owner>/<repository>#v<semver>"
}
```

Then in `next.config.ts`:

```ts
transpilePackages: ['<pkg>']
```
````

## Local development override block

````markdown
## Local development override

To edit `<pkg>` against a consuming site without bumping tags, in the consumer's `package.json`:

```jsonc
"pnpm": {
  "overrides": {
    "<pkg>": "link:../<repository>"
  }
}
```

Do NOT commit this — it's a local-dev affordance only.
````

## Releasing block

````markdown
## Releasing

```shell
just release <semver>
```

Then bump consumers' `package.json` ref to the new tag.
````
