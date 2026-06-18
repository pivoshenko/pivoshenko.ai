# pivoshenko.ai

<p align="left">
  <a href="https://stand-with-ukraine.pp.ua/">
    <img alt="StandWithUkraine" src="https://img.shields.io/badge/Support-Ukraine-FFC93C?style=flat-square&labelColor=07689F">
  </a>
</p>

## Overview

This repository is managed with [Kasetto](https://github.com/pivoshenko/kasetto) — it pulls personal **and** external skills, MCPs, and instructions from upstream repositories into one synced setup. The full source list lives in [`kasetto.yaml`](kasetto.yaml).

What's in here?

- Locally authored skills, see [`skills/`](skills)
- Locally authored MCP definitions, see [`mcps/`](mcps)
- Locally authored instructions (`CLAUDE.md` / `AGENTS.md` / `.cursor/rules` … rule fragments), see [`instructions/`](instructions)
- External skills, MCPs, and instructions, see [`kasetto.yaml`](kasetto.yaml)

## Main principles

- Minimalism — keep only skills and MCPs that are used daily
- Consistency — same conventions across all locally authored skills
- Composability — skills are small, single-purpose, and chainable
- Source of truth — upstream skills are pulled, not forked, so updates stay free

## Installation

1. Install Kasetto, see the [installation guide](https://github.com/pivoshenko/kasetto#installation)
2. Sync skills and MCPs into your local Claude Code config — either run:

```shell
kst sync --config https://github.com/pivoshenko/pivoshenko.ai/blob/main/kasetto.yaml
```

Or add the source to `~/.config/kasetto/config.yaml` and then run `kst sync`:

```yaml
source: https://github.com/pivoshenko/pivoshenko.ai/blob/main/kasetto.yaml
```

## Personal wiki (second brain)

An Obsidian vault maintained primarily by Claude Code, inspired by [Karpathy's LLM-maintained notes](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f). Three pieces, one job each:

1. **Schema in the vault** — the vault's own `CLAUDE.md` holds all conventions (folder map, frontmatter contract, linking rules, standing duties); `INDEX.md` is the catalog the agent reads first; `LOG.md` is an append-only journal of agent actions. The schema is a live file in the vault — no repo mirror.
2. **Workflow skills in this repo** — [`wiki-capture`](skills/wiki-capture), [`wiki-summarize`](skills/wiki-summarize), [`wiki-project`](skills/wiki-project), [`wiki-write`](skills/wiki-write), [`wiki-lint`](skills/wiki-lint), plus the [`obsidian-markdown`](skills/obsidian-markdown) syntax reference. Skills hold process only and defer to the vault schema — zero duplicated conventions.
3. **Templates in the vault** — one note template per type under `99 TEMPLATES/`, usable both by the skills and manually via Obsidian (including mobile).

Supporting decisions, so the setup stays repeatable:

- **Memory in the wiki** — each `~/.claude/projects/<slug>/memory` is a symlink into the vault's `97 MEMORY/<project>/`, so Claude's persistent memories live in the wiki while the harness reads them natively. The migration rule lives in my global CLAUDE.md (see [Rules](#rules)).
- **No premature tooling** — no Dataview, no Zettelkasten IDs, no embeddings; search is `rg` + `INDEX.md` until the vault passes ~200 notes, then [qmd](https://github.com/tobi/qmd).
- **Audit + rollback** — `LOG.md` records what agents did; an external git mirror records the content. The mirror's `.git` lives at `~/.vault.git` (outside iCloud, invisible to Obsidian, local-only — never pushed), snapshotted hourly via [`scripts/vault-snapshot.sh`](scripts/vault-snapshot.sh). The scheduler is machine-local setup, deliberately not in dotfiles (it's OS-specific): macOS — a launchd plist in `~/Library/LaunchAgents` running the script hourly; Linux — a cron line (`0 * * * * sh .../scripts/vault-snapshot.sh`).

To repeat it: create the vault folders + `CLAUDE.md`/`INDEX.md`/`LOG.md` per the vault's own `CLAUDE.md`, copy the templates idea, and sync the `wiki-*` skills via Kasetto (see below).

## Rules

Reusable agent rules — the behavioral guardrails that aren't project-specific — live in [`instructions/`](instructions), one Markdown file per rule. Kasetto distributes them as its **instruction** asset kind: each is transformed into the target agent's native instruction file (`CLAUDE.md`, `AGENTS.md`, `.cursor/rules`, …) and merged in as a managed block, so hand edits and other rules survive a re-sync.

The `instructions/` files **are** the source for my global rules — Kasetto syncs them into `~/.claude/CLAUDE.md` (as managed blocks). The old single `CLAUDE.md` in [`pivoshenko.dotfiles`](https://github.com/pivoshenko/pivoshenko.dotfiles) was dropped once these took over, so `dotfiles` no longer deploys it.

Other CLAUDE.md files used outside this repository live with their owners:

- The vault's `CLAUDE.md` (the wiki schema) — a live file inside the vault itself, no repo mirror
