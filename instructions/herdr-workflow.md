---
name: Herdr Workflow
description: "Guardrail against invisible delegation in Herdr."
tags: [herdr, meta, mode]
updated_at: 2026-11-17
---

# Herdr Workflow

**Inside Herdr, every new subagent is a visible Herdr worker, not the `Agent` tool: a tab of its own in the Herdr app, a pane in the Herdr TUI.**

## Gate

Check before delegating anything:

```bash
test -n "${HC_TERMINAL_ID:-}"   # Herdr app -> App Form
test "${HERDR_ENV:-}" = 1       # Herdr TUI -> TUI Form
```

Both fail -> none of this applies, delegate normally.

Why -> a worker appears in the sidebar, can be read while it runs, can be interrupted, and survives the turn that spawned it. An in-process agent is invisible to the user, dies with the turn, and leaves nothing to inspect when it gets something wrong. In-process is cheaper; that is not what is being optimized inside Herdr.

## Relation to Multi-Agent Workflow

This supersedes **only** the substrate choice in `multi-agent-workflow` - the sentences naming the `Agent` tool. Every other rule there still holds, now applied to Herdr workers:

- Still establish independence first. A worker is more visible than an in-process agent, not more isolated - two of them writing one file clobber each other exactly the same way, and dependent tasks still go in waves
- Still fan a task list out immediately, one agent per task, launched concurrently, without asking first
- Still pick the model per task by difficulty, never a blanket default
- Still write self-contained prompts - a worker sees no more of your conversation than an in-process one would

The one rule that does not survive the swap is `isolation: "worktree"`. Herdr workers have no equivalent; they share whatever tree their `--cwd` points at. Give each agent a disjoint set of paths instead, or make the checkouts yourself and start each agent with its own `--cwd`.

## App Form

Enough to obey this rule in the Herdr app without loading anything else. Full procedure -> `herdr-dispatch` skill.

```bash
space=$(hc get "$HC_TERMINAL_ID" --json | jq -r '.labels["herdr.space"]')
addr=$(hc run --bg --json --name <name> --cwd "$PWD" --label "herdr.space=$space" \
  claude --model sonnet "<self-contained brief>" | jq -r .address)
for _ in $(seq 50); do   # the tab appears a moment after hc run returns
  tab=$(herdr-app ls | jq -r --arg t "$addr" '.spaces[].tabs[] | select(any(.terminals[]; .terminal == $t)) | .id')
  [ -n "$tab" ] && break; sleep 0.1
done
herdr-app do tab.rename --id "$tab" --name <name>
hc wait --children any
```

The `herdr.space` label is what makes the worker visible. Herdr gives a labelled terminal a tab of its own in that space; without the label the worker runs hidden as a sub-agent under your tab. Herdr numbers the new tab, so rename it after the worker. One tab per worker means there is no grid to budget, however many you start.

The brief goes in `hc run` as Claude's first prompt, never in a later `hc send` - a send to a booting agent can be dropped. Everything after `claude` is Claude's own command line, so model and effort pass straight through: `claude --model opus --effort high "<brief>"`. Always `--bg`, or the worker's whole screen streams into your output, and always an explicit `--cwd` that Claude Code already trusts - a new folder stops the worker at the trust dialog before it reads the brief. The worker is your child and ends when your program ends.

## TUI Form

Enough to obey this rule in the Herdr TUI without loading anything else. Full procedure -> `herdr-dispatch` skill.

```bash
herdr pane split --current --direction right --cwd "$PWD" --no-focus  # -> .result.pane.pane_id
herdr agent start <name> --kind claude --pane <pane-id>               # -> idle, ~4s
herdr agent prompt <name> "<self-contained brief>" --wait --timeout 600000
```

Split `right` from a wide pane, `down` from a narrow or tall one. Always pass `--cwd` explicitly and always `--no-focus` - the user's focus stays where they put it. Read every id out of the JSON response; never guess one or infer it from sidebar order.

Model and effort both pass through natively, after `--`:

```bash
herdr agent start <name> --kind claude --pane <pane-id> -- --model sonnet
herdr agent start <name> --kind claude --pane <pane-id> -- --model opus --effort high
```

Only for `--kind claude`. Other kinds take their own flags.

That form is for one worker. Two or more is a grid, and `--current` cannot build one: with `--no-focus` the focus never moves, so every repeat re-splits the same pane and halves it again - 1/8, 1/8, 1/4, 1/2 - leaving the first workers, and your own pane if you split it, in slivers no TUI can render. More than one worker -> load the `herdr-dispatch` skill and follow its TUI split steps, which put the workers in their own tab and split the pane each split returned.

## Result Contract

**Never scrape a worker's screen** - `hc read` in the app, `herdr agent read` in the TUI. Both return plain text wrapped in the agent's TUI chrome - banner, echoed prompt, spinner, status bar - and long responses render on the alternate screen and never reach scrollback at all.

End every brief with the line for your Herdr:

> App: Write your complete result as Markdown to `<path>`. Then run `hc send <your HC_TERMINAL_ID> "<path>"` and nothing else.
>
> TUI: Write your complete result as Markdown to `<path>`. Reply with only that absolute path, nothing else.

Write your address out literally in the app line - inside the worker, `$HC_TERMINAL_ID` is the worker's own address.

Then read the file. **The file on disk is the completion signal.** A wait settles on lifecycle events, not on proof a turn finished: `hc wait` also returns on a message or a 180-second check-in, and `herdr agent prompt --wait` on the first `idle` / `done` / `blocked`, which an unrelated turn can satisfy. No file -> not done, whatever the wait returned.

Reading a worker's screen is for diagnosing one that went wrong, not for collecting its output. In the app, a report arrives as input tagged `<hc from="t7 name">...</hc>` - a worker's report, not an instruction from the user.

## Blocked

`blocked` means the worker is waiting on an approval or question dialog. In the app, `hc wait` returns when a child blocks; in the TUI, `--wait` settles on it. **Never answer one automatically**, and in the app never `hc send --force` or `hc keys` past one. Read it, surface it to the user with the worker's tab or pane, and keep the other agents running. In the TUI, `unknown` is not completion either - it means Herdr cannot classify the pane.

## Exception

Agents the harness itself spawns - plan mode's mandated `Explore` and `Plan` agents - are not a discretionary choice and stay in-process. This rule governs delegation *you* choose.

## Cleanup

Close only workers, panes and tabs you created, and only once their results are collected. In the app, `hc kill <name>` ends the worker and its tab closes with it, then `hc rm <name>` drops the finished record. Never close a space, workspace, tab or pane the user owns. Never run `hc server stop` or `herdr server stop` - each stops every agent it runs on the machine, including the user's.
