---
name: Herdr
description: Inside Herdr (HERDR_ENV=1), every new subagent runs in its own pane instead of the in-process Agent tool - visible in the sidebar, readable mid-run, interruptible, and it outlives the turn that spawned it.
tags: [herdr, meta, mode]
updated_at: 2026-09-09
---

# Herdr

**While `HERDR_ENV=1`, every new subagent is a Herdr pane, not the `Agent` tool.**

Check before delegating anything:

```bash
test "${HERDR_ENV:-}" = 1
```

Fails -> none of this applies, delegate normally.

Why -> a pane appears in the sidebar, can be read while it runs, can be interrupted, and survives the turn that spawned it. An in-process agent is invisible to the user, dies with the turn, and leaves nothing to inspect when it gets something wrong. In-process is cheaper; that is not what is being optimized inside Herdr.

## Relation to Multi-Agent Dispatch

This supersedes **only** the substrate choice in `multi-agent-dispatch` - the sentence naming the `Agent` tool. Every other rule there still holds, now applied to panes:

- still fan a task list out immediately, one agent per task, launched concurrently, without asking first
- still pick the model per task by difficulty, never a blanket default
- still write self-contained prompts - a pane agent sees no more of your conversation than an in-process one would

Model selection passes through natively, after `--`:

```bash
herdr agent start <name> --kind claude --pane <pane-id> -- --model sonnet
```

## Minimum Form

Enough to obey this rule without loading anything else. Full procedure -> `herdr-dispatch` skill.

```bash
herdr pane split --current --direction right --cwd "$PWD" --no-focus  # -> .result.pane.pane_id
herdr agent start <name> --kind claude --pane <pane-id>               # -> idle, ~4s
herdr agent prompt <name> "<self-contained brief>" --wait --timeout 600000
```

Split `right` from a wide pane, `down` from a narrow or tall one. Always pass `--cwd` explicitly and always `--no-focus` - the user's focus stays where they put it. Read every id out of the JSON response; never guess one or infer it from sidebar order.

## Result Contract

**Never scrape `herdr agent read`.** Alone among the `herdr` commands it returns plain text, not JSON, wrapped in the agent's full TUI chrome - banner, echoed prompt, spinner, status bar. Long responses render on the alternate screen and never reach scrollback at all, so a bigger `--lines` cannot recover them.

End every brief with:

> Write your complete result as Markdown to `<path>`. Reply with only that absolute path, nothing else.

Then read the file. **The file on disk is the completion signal.** `--wait` settles on the first `idle` / `done` / `blocked`, which is a lifecycle state, not proof a turn finished - if the agent was already working, an unrelated turn completing satisfies it. No file -> not done, whatever `--wait` returned.

`agent read` is for diagnosing a worker that went wrong, not for collecting its output.

## Blocked

`blocked` means Herdr recognized an approval or question dialog. **Never answer one automatically.** Read it, surface it to the user with the pane id, and keep the other agents running. `unknown` is not completion either - it means Herdr cannot classify the pane.

## Exception

Agents the harness itself spawns - plan mode's mandated `Explore` and `Plan` agents - are not a discretionary choice and stay in-process. This rule governs delegation *you* choose.

## Cleanup

Close only panes and tabs you created, and only once their results are collected. Never close a workspace, tab, or pane the user owns. Never run `herdr server stop` - it kills every agent on the machine, including theirs.
