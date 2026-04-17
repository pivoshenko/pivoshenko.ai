# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This is pivoshenko's AI agents workspace — a configuration hub for Claude Code/OpenCode skills, MCPs, and agents. It is **not** a traditional software project with build/test/lint commands. The primary artifacts are YAML config and Markdown skill definitions.

## Structure

- `config.yaml` — Kasetto sync config defining which skills and MCPs to pull from various GitHub repos. Synced via `kst sync --config <url>`.
- `skills/` — Locally authored skills (each is a folder with a required `SKILL.md` and optional `references/`, `scripts/`, `assets/` subdirectories).
  - `pivoshenko-brand-guidelines/` — Brand style guide skill with `morok` palette, monospace-first typography, and neutral-first UI rules.
  - `skill-creator/` — Meta-skill for creating new skills.
