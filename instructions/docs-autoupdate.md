---
name: Docs Autoupdate
description: "Guardrail against docs drifting behind the code."
tags: [meta, docs]
updated_at: 2026-09-13
---

# Docs Autoupdate

**When a non-trivial change makes the project's docs or specs stale, update them in the same task.**

## Scope

The docs and specs checked into the repo you are working in, never `~/.claude/CLAUDE.md`. Consider each one that exists:

- `README.md` - what the project is, how to install, run, and configure it, the layout and feature overview a newcomer reads first
- `CLAUDE.md` - the agent-facing map: commands, conventions, architecture, gotchas
- `AGENTS.md` - usually a symlink to `CLAUDE.md`, so one edit covers both
- `CONTRIBUTING.md` - the contributor workflow: setup, command table, commit and branch rules, the pre-PR gate
- Any other project documentation present - `docs/`, ADRs, runbooks, package-level READMEs in a monorepo
- The spec the work came from, which carries mechanics of its own -> **Specs**

Check the symlink with `ls -l AGENTS.md` before touching it. Symlink -> edit `CLAUDE.md` only, never write the same change twice and never replace the link with a copy. A real separate file -> it gets its own edit.

Route each correction to the file that owns it instead of repeating it everywhere: install and usage -> README, agent conventions and architecture -> `CLAUDE.md`, contributor workflow -> `CONTRIBUTING.md`. One change can make several of them wrong at once, but only edit the ones that actually are.

## Specs

A spec goes stale the same way a doc does, and a stale spec is worse: the next agent reads it as the plan and builds from it.

- OpenSpec repo -> the change under `openspec/changes/<id>/` holds the truth while work is in flight. Tick `tasks.md` as each task lands, and correct the `specs/` delta whenever the implementation ended up different from what `proposal.md` described
- Never hand-edit an archived spec under `openspec/specs/` - `openspec` owns those files, so fix the change and let the archive flow write them
- No OpenSpec -> whatever played the spec's role gets the same treatment: the tracker issue the work came from, an ADR, a design doc

Correct the divergence as it is discovered, not at archive time. A change archived against a spec nobody corrected leaves a spec describing a feature that was never built that way.

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
