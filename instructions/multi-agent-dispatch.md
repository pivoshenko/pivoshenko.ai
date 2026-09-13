---
name: Multi-Agent Dispatch
description: >-
  Guardrail against working a task list serially: independent tasks fan out to one subagent each,
  concurrently, model picked per task difficulty. Dependent or file-sharing tasks get sequenced
  into waves instead.
tags: [meta, mode]
updated_at: 2026-09-12
---

# Multi-Agent Dispatch

**Whenever there is a list of independent tasks to implement, dispatch a team of subagents - one per task, all launched concurrently in a single message. Do not ask first, and do not work the list serially yourself.**

Use the `Agent` tool with an appropriate `subagent_type` per task. This is the default and needs no confirmation.

Use the `Workflow` tool only when explicitly asked for it by name ("use a workflow", "orchestrate this", "fan out with verification stages"). It is not the default and is never inferred from the shape of the work.

## Independence

Two tasks are independent when neither needs the other's output and no file is written by both. That is the one precondition on fanning out. Establish it from the task list before dispatching; never assume it.

A dependency or a shared path is not a reason to stop and ask how to proceed. It is a reason to sequence:

- **dependent tasks** -> waves. Fan out the ready ones, collect and verify them, then plan the next wave from whatever is now unblocked
- **shared file, work genuinely divisible** -> one agent owns that file and takes every change to it
- **shared file, work not divisible** -> it is one task, not two. Merge it and dispatch it as one

Concurrent writers on one file clobber each other silently, and the loser looks like a worker that simply did nothing.

Fan-out has real overhead - a brief to write, a result to verify. A handful of one-line edits you could make directly stays with you.

**Model selection is per-agent, by the difficulty of that agent's task - never a blanket default.** Choose the model from the role:

- **Top reasoning tier (Fable if available, else Opus) with high effort** - planning, architecture, design, multi-file refactors, ambiguous or open-ended investigation, code review, and anything requiring synthesis across many files or tradeoff judgment. A `Plan`/architect agent always gets this tier - planning is the highest-reasoning step and must not be downgraded to a cheaper model. When the session model is already top-tier, omit the override and let the agent inherit it
- **Sonnet** - mechanical, well-specified, self-contained execution: applying a defined edit, scaffolding boilerplate, running a scripted migration, formatting, or a narrow single-file change where the approach is already decided

Heuristic: if the agent has to *decide how* to do the work, use the top reasoning tier; if it only has to *carry out* an already-decided plan, use Sonnet. When unsure, prefer the top tier for the reasoning step and Sonnet for the execution steps it produces.

Each agent prompt must be self-contained - agents do not see the parent conversation.

`isolation: "worktree"` is the backstop for tasks that are independent in content but still collide over one working tree, each running its own build or touching a lockfile. Every agent gets its own checkout and you merge afterwards. It does not license overlapping file sets; it converts a silent clobber into a merge you can see.
