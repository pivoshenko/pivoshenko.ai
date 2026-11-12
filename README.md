# pivoshenko.ai

<p align="left">
  <a href="https://stand-with-ukraine.pp.ua/">
    <img alt="StandWithUkraine" src="https://img.shields.io/badge/Support-Ukraine-FFC93C?style=flat-square&labelColor=07689F">
  </a>
</p>

## Overview

This repository is managed with [Kasetto](https://github.com/pivoshenko/kasetto). It pulls personal **and** external skills, MCPs, and instructions from upstream repositories into one synced setup. The full source list lives in [`kasetto.yaml`](kasetto.yaml).

**What's in here?**

- Locally authored skills, see [`skills/`](skills)
- Locally authored MCP definitions, see [`mcps/`](mcps)
- Locally authored instructions (`CLAUDE.md` / `AGENTS.md` / `.cursor/rules` ... rule fragments), see [`instructions/`](instructions)
- External skills, MCPs, and instructions, see [`kasetto.yaml`](kasetto.yaml)

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

## Rules

Reusable agent rules, the behavioral guardrails that aren't project-specific, live in [`instructions/`](instructions), one Markdown file per rule. Kasetto distributes them as its **instruction** asset kind: each is transformed into the target agent's native instruction file (`CLAUDE.md`, `AGENTS.md`, `.cursor/rules`, ...) and merged in as a managed block, so hand edits and other rules survive a re-sync.

The `instructions/` files **are** the source for my global rules. Kasetto syncs them into `~/.claude/CLAUDE.md` as managed blocks.
