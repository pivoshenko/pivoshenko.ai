# pivoshenko.ai

<p align="left">
  <a href="https://stand-with-ukraine.pp.ua/">
    <img alt="StandWithUkraine" src="https://img.shields.io/badge/Support-Ukraine-FFC93C?style=flat-square&labelColor=07689F">
  </a>
</p>

## Overview

This repository is managed with [Kasetto](https://github.com/pivoshenko/kasetto). It pulls personal **and** external skills, MCPs, and instructions from upstream repositories into one synced setup. The full source list lives in [`kasetto.yaml`](kasetto.yaml).

What's in here?

- Locally authored skills, see [`skills/`](skills)
- Locally authored MCP definitions, see [`mcps/`](mcps)
- Locally authored instructions (`CLAUDE.md` / `AGENTS.md` / `.cursor/rules` ... rule fragments), see [`instructions/`](instructions)
- External skills, MCPs, and instructions, see [`kasetto.yaml`](kasetto.yaml)
- Herdr plugins, the only executable content here, see [`plugins/`](plugins)
- Retired skills and instructions, kept for reference but no longer synced, see [`archive/`](archive)

## Main Principles

- Minimalism: keep only skills and MCPs that are used daily
- Consistency: same conventions across all locally authored skills
- Composability: skills are small, single-purpose, and chainable
- Source of truth: upstream skills are pulled, not forked, so updates stay free

## Installation

1. Install Kasetto, see the [installation guide](https://github.com/pivoshenko/kasetto#installation)
2. Sync skills and MCPs into your local Claude Code config. Either run:

```shell
kst sync --config https://github.com/pivoshenko/pivoshenko.ai/blob/main/kasetto.yaml
```

Or add the source to `~/.config/kasetto/config.yaml` and then run `kst sync`:

```yaml
source: https://github.com/pivoshenko/pivoshenko.ai/blob/main/kasetto.yaml
```

## Plugins

[`plugins/`](plugins) holds [Herdr](https://herdr.dev) plugins: workflow tools that run as real processes rather than prompt fragments. Kasetto does not distribute them - it knows only skills, MCPs, and instructions - so nothing under `plugins/` appears in [`kasetto.yaml`](kasetto.yaml) and nothing syncs it. The site ignores the directory too, since it reads `skills/`, `mcps/`, and `instructions/` by name.

They are installed by Herdr itself, listed one per line in [`herdr.plugins`](https://github.com/pivoshenko/pivoshenko.dotfiles/blob/main/herdr.plugins) in [`pivoshenko.dotfiles`](https://github.com/pivoshenko/pivoshenko.dotfiles) and applied by `just install-herdr-plugins`:

```shell
herdr plugin install pivoshenko/pivoshenko.ai/plugins/<name>
```

This is the one exception to the rule that content here is Markdown and JSON with no build step, so it comes with its own constraints:

- A plugin is ordinary code that runs as your user and can call the full Herdr CLI, so review a manifest before installing it
- Plugins are global to the user, and a `[[startup]]` hook runs on every Herdr session, in every project
- Herdr has no `plugin update` in v1, so refreshing a plugin means reinstalling it

### agents.fleet

[`plugins/herdr-agents-fleet`](plugins/herdr-agents-fleet) is a status page for every coding agent on the machine: a board of who is working, who is waiting on you, and what each one is doing right now, plus what closed agents produced.

## Rules

Reusable agent rules, the behavioral guardrails that aren't project-specific, live in [`instructions/`](instructions), one Markdown file per rule. Kasetto distributes them as its **instruction** asset kind: each is transformed into the target agent's native instruction file (`CLAUDE.md`, `AGENTS.md`, `.cursor/rules`, ...) and merged in as a managed block, so hand edits and other rules survive a re-sync.

The `instructions/` files **are** the source for my global rules. Kasetto syncs them into `~/.claude/CLAUDE.md` as managed blocks. The old single `CLAUDE.md` in [`pivoshenko.dotfiles`](https://github.com/pivoshenko/pivoshenko.dotfiles) was dropped once these took over, so `dotfiles` no longer deploys it.

## Archive

[`archive/`](archive) holds what used to be part of the synced setup and got retired. Kasetto only pulls from `skills/`, `mcps/`, and `instructions/`, so moving something here takes it out of the agent config while keeping it readable in git. The site lists it in a separate **archived** section instead of dropping it silently.

Currently parked:

- **Personal wiki (second brain)**: an Obsidian vault maintained primarily by Claude Code, inspired by [Karpathy's LLM-maintained notes](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f). The workflow skills ([`wiki-capture`](archive/skills/wiki-capture), [`wiki-summarize`](archive/skills/wiki-summarize), [`wiki-project`](archive/skills/wiki-project), [`wiki-write`](archive/skills/wiki-write), [`wiki-lint`](archive/skills/wiki-lint)) and the hourly vault-backup script ([`vault-snapshot.sh`](archive/scripts/vault-snapshot.sh)) live here now. The vault and its own schema (`CLAUDE.md` / `INDEX.md` / `LOG.md`) are untouched. Only the automation is off
- **Memory rule** ([`memory.md`](archive/instructions/memory.md)): routed each `~/.claude/projects/<slug>/memory` into the vault's `97 MEMORY/<project>/`, so agent memory lived in the wiki. Retired together with the wiki
- **Co-authored attribution rule** ([`co-authored-attribution.md`](archive/instructions/co-authored-attribution.md)): banned `Co-Authored-By` trailers on commits and PRs. Retired as no longer needed

Reason for the wiki and the memory rule: they didn't visibly change how the agents worked day to day, so the upkeep wasn't paying for itself. The [`obsidian-markdown`](skills/obsidian-markdown) syntax reference stays active. It's useful for Markdown work with or without a vault.
