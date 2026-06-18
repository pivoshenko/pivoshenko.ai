---
name: Docs Autoupdate
description: When a non-trivial change makes the project's local CLAUDE.md stale, correct the stale lines in the same task.
tags: [meta, docs]
updated_at: 2026-06-18
---

# Docs Autoupdate

**When a non-trivial change makes the project's local `CLAUDE.md` stale, update it in the same task.**

Scope: this rule is about the **project-local `CLAUDE.md`** (the one in the repo you are working in) — not `~/.claude/CLAUDE.md`.

Trigger — a change is relevant when it alters something a future session would read `CLAUDE.md` to learn:
- new or removed tool, command, dependency, or config;
- a new convention, renamed path, or restructured layout;
- a changed build/test/run/deploy workflow;
- an architectural shift or new module boundary.

When triggered, check whether the existing `CLAUDE.md` now describes the repo incorrectly, and if so correct exactly the stale lines. Do not re-read or re-audit the whole file on every change, and do not restate things that are still accurate. If no project `CLAUDE.md` exists, do not create one unless asked.

Just do the edit when the change is already merged into the working tree and the correction is factual (a path, a command, a name). Ask first only when the update is a judgment call — choosing what convention to document, or whether a new pattern is established enough to record.

Trivial changes (typo fixes, single-line tweaks, formatting, comments) never trigger this.
