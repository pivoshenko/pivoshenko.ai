---
name: Docs Autoupdate
description: >-
  Guardrail against stale project docs: when a non-trivial change makes the repository's checked-in
  documentation wrong, correct the stale lines in the same task.
tags: [meta, docs]
updated_at: 2026-09-13
---

# Docs Autoupdate

**When a non-trivial change makes the project's docs stale, update them in the same task.**

Scope: the docs checked into the repo you are working in, never `~/.claude/CLAUDE.md`. Consider each one that exists:

- `README.md` - what the project is, how to install, run, and configure it, the layout and feature overview a newcomer reads first
- `CLAUDE.md` - the agent-facing map: commands, conventions, architecture, gotchas
- `AGENTS.md` - usually a symlink to `CLAUDE.md`, so one edit covers both
- `CONTRIBUTING.md` - the contributor workflow: setup, command table, commit and branch rules, the pre-PR gate
- Any other project documentation present - `docs/`, ADRs, runbooks, package-level READMEs in a monorepo

Check the symlink with `ls -l AGENTS.md` before touching it. Symlink -> edit `CLAUDE.md` only, never write the same change twice and never replace the link with a copy. A real separate file -> it gets its own edit.

Route each correction to the file that owns it instead of repeating it everywhere: install and usage -> README, agent conventions and architecture -> `CLAUDE.md`, contributor workflow -> `CONTRIBUTING.md`. One change can make several of them wrong at once, but only edit the ones that actually are.

Trigger: a change is relevant when it alters something a future reader would consult these docs to learn:
- New or removed tool, command, dependency, or config
- A new convention, renamed path, or restructured layout
- A changed build/test/run/deploy workflow
- An architectural shift or new module boundary

When triggered, check whether the existing docs now describe the repo incorrectly, and if so correct exactly the stale lines. Do not re-read or re-audit a whole file on every change, and do not restate what is still accurate. If one of these docs does not exist, do not create it unless asked.

Just do the edit when the change is already merged into the working tree and the correction is factual (a path, a command, a name). Ask first only when the update is a judgment call: choosing what convention to document, or whether a new pattern is established enough to record.

Trivial changes (typo fixes, single-line tweaks, formatting, comments) never trigger this.
