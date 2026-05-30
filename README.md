# pivoshenko.ai

<p align="left">
  <a href="https://github.com/pivoshenko/pivoshenko.ai/blob/main/LICENSE">
    <img alt="License" src="https://img.shields.io/badge/License-MIT-0A6847?style=flat-square&logo=opensourceinitiative&logoColor=white">
  </a>
  <a href="https://github.com/pivoshenko/pivoshenko.ai/actions">
    <img alt="CI" src="https://img.shields.io/github/actions/workflow/status/pivoshenko/pivoshenko.ai/ci.yaml?style=flat-square&color=0A6847&logo=githubactions&logoColor=white&label=CI&branch=main">
  </a>
  <a href="https://stand-with-ukraine.pp.ua/">
    <img alt="StandWithUkraine" src="https://img.shields.io/badge/Support-Ukraine-FFC93C?style=flat-square&labelColor=07689F">
  </a>
</p>

## Overview

This repository is managed with [Kasetto](https://github.com/pivoshenko/kasetto) — it pulls personal **and** external skills and MCPs from upstream repositories into one synced setup. The full source list lives in [`kasetto.yaml`](kasetto.yaml).

What's in here?

- Locally authored skills, see [`skills/`](skills)
- Locally authored MCP server definitions, see [`mcps/`](mcps)
- Kasetto sync config that pulls everything together, see [`kasetto.yaml`](kasetto.yaml)

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
