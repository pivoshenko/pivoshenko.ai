---
name: Docs Autoupdate
description: "Guardrail against docs drifting behind the code."
tags: [meta, docs]
updated_at: 2026-11-17
---

# Docs Autoupdate

**When a non-trivial change makes the project's docs stale, update them in the same task.**

## Scope

The docs checked into the repo you are working in, never `~/.claude/CLAUDE.md`. Consider each one that exists:

- `README.md` - what the project is, how to install, run, and configure it, the layout and feature overview a newcomer reads first
- `AGENTS.md` - the agent-facing map: commands, conventions, architecture, gotchas
- `CONTRIBUTING.md` - the contributor workflow: setup, command table, commit and branch rules, the pre-PR gate
- `SECURITY.md` and `CHANGELOG.md` - not hand-maintained. Leave both alone; the changelog is generated from commits at release time
- `docs/` - the long form of each topic, one file per topic -> **Layout**
- Any other project documentation present - ADRs, package-level READMEs in a monorepo

Route each correction to the file that owns it instead of repeating it everywhere: install and usage -> README, agent conventions -> `AGENTS.md`, contributor workflow -> `CONTRIBUTING.md`, deployment -> `docs/deployment/`, architecture -> `docs/architecture/`. One change can make several of them wrong at once, but only edit the ones that actually are.

## Layout

The root files stay short and point into `docs/` for anything long. `docs/` has one folder per kind of doc, and one file per subject inside it:

- `docs/deployment/` - runbooks: where it runs, how a release ships, how to roll back, e.g. `production.md`
- `docs/architecture/` - how one part is laid out and wired, e.g. `backend.md`, `frontend.md`
- `docs/conventions/` - the long form of a rule set, e.g. `code.md`, `database.md`
- `docs/design/` - the design system, when the project has a UI, e.g. `system.md`

A kind with a single doc still gets its folder, so a second one never forces a move. No files directly under `docs/`, and no deeper nesting than one folder. File and folder names are `snake_case`. Each file opens with a Title Case heading and one paragraph saying what it owns and which sibling owns the adjacent topic. `AGENTS.md` states each rule in brief for an agent mid-task and lists every `docs/` file with a one-line summary; the `docs/` file is the long form. A new `docs/` file goes into that list in the same change.

A repo without `docs/` keeps the topic in its root file. Moving a topic out into `docs/` is a judgment call -> ask first.

## Trigger

A change is relevant when it alters something a future reader would consult these docs to learn:

- New or removed tool, command, dependency, or config
- A new convention, renamed path, or restructured layout
- A changed build/test/run/deploy workflow
- An architectural shift or new module boundary

## Editing

When triggered, check whether the existing docs now describe the repo incorrectly, and if so correct exactly the stale lines. Do not re-read or re-audit a whole file on every change, and do not restate what is still accurate. If one of these docs does not exist, do not create it unless asked.

Just do the edit when the change is already merged into the working tree and the correction is factual (a path, a command, a name). Ask first only when the update is a judgment call: choosing what convention to document, or whether a new pattern is established enough to record.

## Exceptions

Trivial changes (typo fixes, single-line tweaks, formatting, comments) never trigger this.
