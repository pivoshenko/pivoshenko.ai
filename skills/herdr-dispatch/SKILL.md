---
name: herdr-dispatch
description: >-
  Run a task list across parallel Herdr panes — measure the pane budget, split, start one agent per task, brief them, collect results from files, handle blocked workers, clean up. Use when the user says "dispatch these", "run these in parallel", "fan this out", "spin up agents", "/herdr-dispatch", or whenever work is delegated while `HERDR_ENV=1` and the `Herdr` instruction sends it to panes. The mechanics layer — `spec-dispatch` chains to this for OpenSpec changes. Requires HERDR_ENV=1.
tags: [herdr, agents]
updated_at: 2026-09-11
---

# Herdr Dispatch

Budget -> split -> start -> brief -> collect -> verify -> clean up.

The `Herdr` instruction decides *that* subagents become panes. This decides *how*. Policy lives there; do not restate it here.

## Preconditions

```bash
test "${HERDR_ENV:-}" = 1                                  # else: not inside Herdr, stop
printf '%s\n' "$HERDR_WORKSPACE_ID" "$HERDR_TAB_ID" "$HERDR_PANE_ID"
```

Not inside Herdr -> say so and fall back to the `Agent` tool. Never control a Herdr session from outside it.

## Pane Budget

Claude Code's TUI is unusable below ~60 columns; budget at 68 so a worker can render a diff rather than merely survive. Splitting a tab N ways divides its width by N.

Workers belong in their own tab — the user's driving pane stays uncluttered and their focus stays where they put it. Create that tab **first**, then measure it:

```bash
herdr tab create --workspace "$HERDR_WORKSPACE_ID" --label "workers" --cwd "$PWD" --no-focus  # -> .result.tab, .result.root_pane
herdr pane layout --pane "<root-pane-id>"                    # -> .result.layout.area.width
```

**`--workspace` is not optional.** Omit it and the tab is created in whatever workspace currently has focus, which is routinely not yours - the user clicks into another project and every worker tab lands there. `--cwd` still points the agents at the right directory, so the work itself comes out correct and the mistake shows up only as panes scattered in someone else's space. Read the id from `$HERDR_WORKSPACE_ID`, never assume the focused one.

**Measure the worker tab's root pane, never `$HERDR_PANE_ID`.** Your own pane is whatever width the user's current split happened to leave it; a fresh tab spans the terminal. Budgeting off your pane under-counts and you spawn fewer workers than actually fit.

| Tab width | 2 panes | 3 panes | 4 panes |
| --- | --- | --- | --- |
| 136 | 68 — ok | 45 — too narrow | 34 — unusable |

**Budget = `floor(width / 68)`, minimum 1.** More workers than that -> a second tab, never thinner splits.

Tasks beyond the budget wait for a free pane. Reuse a finished worker's pane — an idle agent takes a new prompt — or close it and split fresh. Never queue two tasks into one live agent; it serializes them and you lose the point.

## Split

Wide pane -> `right`. Narrow or tall -> `down`. Avoid repeated same-direction splits that produce unusable slivers.

```bash
herdr pane split --current --direction right --cwd "$PWD" --no-focus
# -> .result.pane.pane_id
```

`--cwd` is explicit, always. Inherited cwd is not guaranteed, and a worker in the wrong directory fails in confusing ways.

## Start

```bash
herdr agent start "<name>" --kind claude --pane "<pane-id>"
# -> .result.agent.agent_status == "idle"   (~4s)
```

Names match `[a-z][a-z0-9_-]{0,31}` and must be unique among live agents — check `herdr agent list` first. A name follows the pane's current occupant and clears when that agent exits.

`agent start` needs a pane already sitting at its shell prompt; it never creates or moves layout. That is the split's job.

Returns `agent_not_ready` if the agent is blocked during startup — the name still works for `agent read` / `agent send-keys`. Wait for idle before prompting.

Different `--kind` (`codex`, `gemini`, ...) is the one case where a second pane buys something rerunning the same model cannot. Use it for independent review, not for throughput.

## Brief

One task per agent, and per `multi-agent-dispatch` the tasks in a wave are already independent — no task needs another's output, no file is written by two. Panes do not isolate the working tree, so that check happens before dispatch, not here.

The worker sees none of the parent conversation, so the brief carries everything:

- what to do, concretely
- which paths it owns, and which it must not touch
- the repo's verify command
- the result contract below

```bash
herdr agent prompt "<name>" "<brief>" --wait --timeout 600000
```

`--wait` needs to observe `working` or `blocked` within five seconds of submission, else `agent_prompt_stalled`. A stall or `timeout` does **not** prove the prompt never landed — inspect with `agent get` and `agent read` before resending. A blind resend double-submits.

`agent prompt` refuses to send into a blocked agent (`agent_blocked`) before writing anything.

## Collect

Per the `Herdr` instruction: the result file is the completion signal, never scraped screen output. Every brief ends with —

> Write your complete result as Markdown to `<path>`. Reply with only that absolute path, nothing else.

— then read that file. No file on disk means not done, regardless of what `--wait` returned.

Verify the work yourself before trusting it. A worker reporting success is a claim, not evidence.

## Blocked

Read the dialog first:

```bash
herdr agent get "<name>"
herdr agent read "<name>" --source recent-unwrapped --lines 120
```

Park that task, keep every other worker running, and surface the pane id to the user. Never answer an approval dialog on their behalf.

Use `--source detection` for what Herdr classified on, `--format ansi` when color is the evidence. `send-keys` (`esc`, `ctrl+c`) is for recovering a wedged TUI, not for clicking through prompts.

## Cleanup

Only after results are collected and verified:

```bash
herdr tab close "<tab-id>"
```

Close only what this run created. Never touch a pane, tab, or workspace the user owns. Never `herdr server stop` — it kills every agent on the machine.

Report every pane id spawned, including ones left running. An agent still alive with no record of why is the failure mode here.

## Rules

- Read every id from JSON responses. Never guess `w1:p3`, never infer from sidebar order.
- `--no-focus` on every split and tab create, and `--workspace "$HERDR_WORKSPACE_ID"` on every tab create.
- One task per agent, one agent per pane.
- Budget before spawning. Splitting past it makes every worker unreadable, including the ones already running.
- Verify before believing. Collect before closing.
