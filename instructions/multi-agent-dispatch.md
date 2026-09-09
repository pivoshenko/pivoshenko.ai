---
name: Multi-Agent Dispatch
description: When work decomposes into a task list, fan it out to a team of subagents immediately - one per task, concurrent, model picked per task difficulty.
tags: [meta, mode]
updated_at: 2026-09-09
---

# Multi-Agent Dispatch

**Whenever there is a list of tasks to implement, dispatch a team of subagents - one per task, all launched concurrently in a single message. Do not ask first, and do not work the list serially yourself.**

Use the `Agent` tool with an appropriate `subagent_type` per task. This is the default and needs no confirmation.

Use the `Workflow` tool only when explicitly asked for it by name ("use a workflow", "orchestrate this", "fan out with verification stages"). It is not the default and is never inferred from the shape of the work.

**Model selection is per-agent, by the difficulty of that agent's task - never a blanket default.** Choose the model from the role:

- **Top reasoning tier (Fable if available, else Opus) with high effort** - planning, architecture, design, multi-file refactors, ambiguous or open-ended investigation, code review, and anything requiring synthesis across many files or tradeoff judgment. A `Plan`/architect agent always gets this tier - planning is the highest-reasoning step and must not be downgraded to a cheaper model. When the session model is already top-tier, omit the override and let the agent inherit it
- **Sonnet** - mechanical, well-specified, self-contained execution: applying a defined edit, scaffolding boilerplate, running a scripted migration, formatting, or a narrow single-file change where the approach is already decided

Heuristic: if the agent has to *decide how* to do the work, use the top reasoning tier; if it only has to *carry out* an already-decided plan, use Sonnet. When unsure, prefer the top tier for the reasoning step and Sonnet for the execution steps it produces.

Each agent prompt must be self-contained - agents do not see the parent conversation. Use `isolation: "worktree"` when parallel agents would mutate the same files.
