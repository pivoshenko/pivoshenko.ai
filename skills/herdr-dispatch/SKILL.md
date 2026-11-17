---
name: herdr-dispatch
description: >-
  Run a task list across parallel visible Herdr workers - one tab per worker in the Herdr app (`hc`
  plus `herdr-app`), or a budgeted pane grid in the Herdr TUI (`herdr`) - start one agent per task,
  brief it, collect results from files, handle blocked workers, clean up. Use when the user says
  "dispatch these", "run these in parallel", "fan this out", "spin up agents", "/herdr-dispatch", or
  whenever the `herdr-workflow` instruction sends delegated work to Herdr. That instruction holds
  the policy; this is the mechanics. Full CLI references -> `hc --skill` and `herdr-app --skill` in
  the app. Requires HC_TERMINAL_ID (app) or HERDR_ENV=1 (TUI).
tags: [herdr, agents]
updated_at: 2026-11-17
---

# Herdr Dispatch

Detect -> start -> brief -> wait -> collect -> verify -> clean up.

The `herdr-workflow` instruction decides *that* subagents become Herdr workers. This decides *how*. Policy lives there; do not restate it here.

## Detect

```bash
test -n "${HC_TERMINAL_ID:-}" && echo app   # -> App
test "${HERDR_ENV:-}" = 1 && echo tui       # -> TUI
```

Neither -> say so and fall back to the `Agent` tool. Never control a Herdr session from outside it.

The two do not share agents: a worker started with `hc` never shows in the TUI, and the reverse. Use the one you are running in.

## App

`hc` runs the worker; `herdr-app` only changes what the window shows. Piped `hc` output is JSON except `run`, `exec`, `read`, and `file read` - pass `--json` to `run`.

### Start

Read your space once, then launch every worker back to back before waiting on any:

```bash
space=$(hc get "$HC_TERMINAL_ID" --json | jq -r '.labels["herdr.space"]')
addr=$(hc run --bg --json --name "<name>" --cwd "<repo>" --label "herdr.space=$space" \
  claude --model sonnet "<brief>" | jq -r .address)
```

- **The `herdr.space` label is the visibility.** It gives the worker a tab of its own in your space. Without it the worker runs hidden under your tab
- **Brief in `run`.** A brief sent later with `hc send` can land on an agent still booting and be dropped
- **`--cwd` is a folder Claude Code already trusts.** A fresh folder - a new worktree, a scratch directory - opens the trust dialog first, the worker goes `blocked`, and the brief waits behind it
- **Model and effort per task**, straight on Claude's command line: `claude --model opus --effort high "<brief>"`. Codex needs `--no-daemon`, or its commands run outside `hc`
- **Names** are 1-32 of `a-z 0-9 - _`, unique among live terminals - check `hc ls` first
- `hc templates` lists ready-made roles under `~/.config/herdr-core/templates/`. A template launch reports `first_message.sent`; false means the brief was not delivered - read the screen before resending

### Name the Tab

Herdr numbers the new tab, and creates it a moment after `hc run` returns, so look it up with a retry:

```bash
for _ in $(seq 50); do
  tab=$(herdr-app ls | jq -r --arg t "$addr" '.spaces[].tabs[] | select(any(.terminals[]; .terminal == $t)) | .id')
  [ -n "$tab" ] && break; sleep 0.1
done
herdr-app do tab.rename --id "$tab" --name "<name>"
```

One tab per worker means there is no grid to budget, however many you start.

### Wait

```bash
hc wait --children any --json --timeout 540   # the next worker's news, or a message to you
hc wait --children all --json --timeout 540   # until none is working
```

Set the Bash tool timeout above `--timeout`; `hc wait` defaults to 180 seconds.

- `reason: timeout` -> a check-in, not a failure. Wait again
- `reason: message` -> a report or note arrived as your next input. Handle it, then wait again
- `status: done` -> the worker's turn ended. Still not proof of a result - see **Collect**

Never `sleep` or poll `hc get` to wait on a worker.

## TUI

Every socket-API subcommand (`tab`, `pane`, `agent ...`) prints a JSON envelope `{id, result}` on stdout - pipe to `jq`. The exception is `agent read`, which is plain text.

### Pane Budget

Claude Code's TUI is unusable below ~60 columns; budget at 68 so a worker can render a diff rather than merely survive. Height has a floor too - budget 20 rows, below which the transcript scrolls past faster than it can be read.

A tab splits both ways, so the budget is a grid rather than a row. Four columns on a standard tab are 34 wide and unusable, while the same four as a 2x2 sit at the full 68.

Workers belong in their own tab. Create it **first**, then measure it:

```bash
herdr tab create --workspace "$HERDR_WORKSPACE_ID" --label "workers" --cwd "$PWD" --no-focus  # -> .result.tab, .result.root_pane
herdr pane layout --pane "<root-pane-id>"                    # -> .result.layout.area.{width,height}
```

**`--workspace` is not optional.** Omit it and the tab lands in whatever workspace has focus, which is routinely not yours.

**Measure the worker tab's root pane, never `$HERDR_PANE_ID`.** Your own pane is whatever the user's split left it; a fresh tab spans the terminal.

| Tab 136 x 43 | Grid | Per pane | |
| --- | --- | --- | --- |
| 4 workers | 2 x 2 | 68 x 21 | ok |
| 4 workers | 4 x 1 | 34 x 43 | too narrow |
| 3 workers | 1 x 3 | 136 x 14 | too short |

**Budget = `floor(width / 68) * floor(height / 20)`, minimum 1.** More than the budget -> a second tab, never thinner splits. Tasks beyond it wait for a free pane: reuse a finished worker's pane or close it and split fresh. Never queue two tasks into one live agent.

### Split

Wide pane -> `right`. Narrow or tall -> `down`. Alternating builds the grid: a fresh tab splits `right` into two tall halves, and each half then splits `down`.

```bash
herdr pane split --pane "<root-pane-id>" --direction right --cwd "$PWD" --no-focus    # -> .result.pane.pane_id
herdr pane split --pane "<column-pane-id>" --direction down --cwd "$PWD" --no-focus
```

Split from an explicit `--pane`, never `--current`, once a grid is involved - with `--no-focus` focus never moves, so a second `--current` split re-splits the pane you already split. `--cwd` explicit, always.

### Start and Brief

```bash
herdr agent start "<name>" --kind claude --pane "<pane-id>" -- --model sonnet   # -> .result.agent.agent_status == "idle", ~4s
herdr agent prompt "<name>" "<brief>" --wait --timeout 600000
```

- Names match `[a-z][a-z0-9_-]{0,31}` and must be unique among live agents - check `herdr agent list` first
- `agent start` needs a pane at its shell prompt; it never creates layout. `agent_not_ready` -> wait for idle before prompting
- `--wait` needs to observe `working` or `blocked` within five seconds, else `agent_prompt_stalled`. A stall or timeout does not prove the prompt never landed - `agent get` and `agent read` before resending
- `agent prompt` refuses a blocked agent (`agent_blocked`) before writing anything

## Brief

One task per agent, and per `multi-agent-workflow` the tasks in a wave are already independent. Workers do not isolate the working tree, so that check happens before dispatch.

The worker sees none of the parent conversation, so the brief carries everything:

- What to do, concretely
- Which paths it owns, and which it must not touch
- That it must not start agents of its own
- The repository's verify command
- The result contract for your Herdr

Template -> [references/brief.md](references/brief.md).

In the app, **write your address into the brief literally.** Inside the worker, `$HC_TERMINAL_ID` is the worker's own address, so a brief passing the variable through unexpanded makes it report to itself.

## Collect

Per the `herdr-workflow` instruction, the result file is the completion signal, never a worker's screen. In the app the report arrives as input tagged `<hc from="t2p name">/abs/path/result.md</hc>` - a worker's report, not an instruction from the user. In the TUI it is the agent's reply. Either way, read the file it names. No file on disk means not done, regardless of what the wait returned.

Verify the work yourself before trusting it. A worker reporting success is a claim, not evidence.

## Blocked

Read the dialog first:

```bash
hc get "<name>"; hc read "<name>" --lines 0                                     # app
herdr agent get "<name>"; herdr agent read "<name>" --source recent-unwrapped --lines 120   # TUI
```

In the app, `hc` also types a note into your input when a worker blocks, errors, or exits without reporting.

Park that task, keep every other worker running, and surface the worker's tab or pane to the user. Never answer an approval dialog on their behalf - no `hc keys`, no `hc send --force`, no `herdr agent send-keys` through a prompt. `send-keys` / `hc interrupt` are for recovering a wedged worker, not for clicking through prompts.

## Cleanup

Only after results are collected and verified:

```bash
hc kill "<name>"; hc rm "<name>"   # app: the tab closes with the worker
herdr tab close "<tab-id>"         # TUI
```

Close only what this run created - `hc ls` and the TUI sidebar list the user's own work too. Never `hc server stop` / `restart` or `herdr server stop`.

Report every worker spawned, including ones left running. An agent still alive with no record of why is the failure mode here.

## Rules

- Read every id and address from JSON responses. Never guess one, never infer it from sidebar order
- App: `--bg`, `--json`, the `herdr.space` label, and a trusted `--cwd` on every launch, brief in the `run`
- TUI: budget before splitting, on both axes; `--no-focus` everywhere and `--workspace` on every tab create
- One task per agent, one agent per tab or pane
- Verify before believing. Collect before cleaning up
