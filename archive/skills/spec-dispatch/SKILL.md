---
name: spec-dispatch
description: >-
  Run an OpenSpec change's tasks in parallel — read the task queue, plan file-disjoint waves, dispatch one agent per task, verify, tick the boxes, commit. Use when the user says "dispatch the tasks", "run these tasks in parallel", "fan out the change", "/spec-dispatch", "implement this change with agents", or wants an OpenSpec change implemented by more than one agent at once. Fills the gap in OpenSpec's own `openspec-apply-change`, which is strictly serial and single-agent. Works with or without Herdr; chains to `herdr-dispatch` for the pane mechanics when inside it.
tags: [openspec, agents, herdr]
updated_at: 2026-09-09
---

# Spec Dispatch

openspec queue -> wave plan -> agents -> verify -> tick -> commit.

`openspec-apply-change` walks tasks one at a time in one context. This replaces that loop only. Planning artifacts (`proposal` / `specs` / `design` / `tasks`) stay sequential and stay with you — never fan those out; they need whole-repo context and each depends on the last.

Everything here is substrate-independent. Inside Herdr (`HERDR_ENV=1`) subagents are panes per the `Herdr` instruction, and the mechanics — budget, split, start, brief, collect, blocked, cleanup — belong to `herdr-dispatch`. Outside it, dispatch the same waves with the `Agent` tool. Either way this skill owns only what is OpenSpec-specific.

## Preconditions

```bash
test "${HERDR_ENV:-}" = 1        # decides the substrate only, never whether to proceed
openspec status --change "<name>" --json
```

Read `applyRequires` and `isPlanningComplete`. Tasks artifact missing -> send the user to `/opsx:propose` or `/opsx:continue`. **Never author planning artifacts here.**

Store-based work -> pass `--store <id>` on every openspec command and keep it sticky.

## Read the Queue

```bash
openspec instructions apply --change "<name>" --json
```

Returns `progress {total, complete, remaining}` and `tasks[]` of `{id, description, done}`.

**The list is flat.** No dependency edges, no file ownership — the `## 1. Backend` / `## 2. Frontend` grouping in `tasks.md` is flattened away. This JSON alone cannot tell you what is safe to run concurrently, and two agents on one file silently clobber each other.

## Make It Parallel-Safe at Authoring Time

Do not infer disjointness at dispatch. Force it when tasks are written, in the change root's `openspec/config.yaml`:

```yaml
rules:
  tasks:
    - "Every task MUST declare `files:` listing the paths it will touch."
    - "Every task MUST declare `needs:` listing task ids it depends on (empty if none)."
```

These surface under `rules` in `openspec instructions tasks --json`, so the agent writing the tasks artifact is bound by them.

Rules absent, or tasks written without the markers -> **stop and say so.** Offer to add the rules and re-run the tasks artifact. Guessing which tasks are disjoint is how two agents end up editing one file.

## Plan the Wave

Wave = unchecked tasks whose `needs:` are all complete **and** whose `files:` sets are pairwise disjoint. This is `multi-agent-dispatch`'s independence rule, made checkable — the markers do the work you would otherwise be guessing at.

Cap the wave at the pane budget from `herdr-dispatch` inside Herdr; outside it, cap at what you can brief and verify in one pass. Everything else waits.

Prefer domain and feature boundaries. Never split work that touches one file from two directions — that is a merge conflict authored on purpose.

Brief each worker with: the change name, the exact task text, the `files:` it owns, the paths it must not touch, and the repo's verify command.

## Collect, Verify, Tick

Per finished task, in this order:

1. Read the worker's result file.
2. Run the repo's verify command yourself — `just check`, `just lint`, the test suite, whatever the repo actually uses. This is a shell command, not an agent.
3. Green -> tick `- [ ]` to `- [x]` in `tasks.md`. Red -> leave it unticked, report, and do not tick to "keep moving".
4. Commit via `git-commit`.

**Tick only after verify passes.** The checkbox is the durable progress record — it outlives the session, and a false tick makes the next run skip real work. Never tick a box on a worker's claim alone.

A reviewing agent — spec conformance, second opinion, cross-model check — is just another dispatch. Same contract, same cleanup.

## Loop

Wave done -> re-read `openspec instructions apply --json`. Never trust an in-memory copy; workers mutate `tasks.md`. Plan the next wave. Repeat until `remaining: 0`.

All done -> hand off to `/opsx:archive`. Do not archive from here.

A change that "applies" without commits and then gets archived leaves a spec claiming a feature the working tree has never seen. Commit each wave before starting the next.

## Rules

- Planning artifacts are sequential and yours. Only tasks fan out.
- One task per agent.
- Stop rather than guess disjointness.
- Verify before tick, tick before commit, commit before the next wave.
- Re-read the queue between waves.
