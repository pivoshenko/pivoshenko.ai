---
name: Multi-Agent Dispatch
description: When work decomposes into a task list, ask Workflow vs Agent team before dispatching; pick each agent's model by its task difficulty.
tags: [meta, mode]
updated_at: 2026-07-31
---

# Multi-Agent Dispatch

**Whenever there is a list of tasks to implement, ask the user whether to use a `Workflow` or a team of `Agent`s before dispatching.**

When a request decomposes into a list of implementation tasks, pause and ask the user which dispatch mode to use via `AskUserQuestion`:

- **Workflow** - deterministic, scripted orchestration via the `Workflow` tool (`pipeline()` by default, `parallel()` only when a barrier is required). Best for repeatable, structured fan-outs with verification stages. The user picking this option counts as the explicit opt-in the `Workflow` tool requires.
- **Agent team** - spawn one subagent per task via the `Agent` tool, launched concurrently in a single message with an appropriate `subagent_type`. Best for ad-hoc parallel work where each task is self-contained.

**Model selection is per-agent, by the difficulty of that agent's task - never a blanket default.** Choose the model from the role:

- **Top reasoning tier (Fable if available, else Opus) with high effort** - planning, architecture, design, multi-file refactors, ambiguous or open-ended investigation, code review, and anything requiring synthesis across many files or tradeoff judgment. A `Plan`/architect agent always gets this tier - planning is the highest-reasoning step and must not be downgraded to a cheaper model. When the session model is already top-tier, omit the override and let the agent inherit it.
- **Sonnet** - mechanical, well-specified, self-contained execution: applying a defined edit, scaffolding boilerplate, running a scripted migration, formatting, or a narrow single-file change where the approach is already decided.

Heuristic: if the agent has to *decide how* to do the work, use the top reasoning tier; if it only has to *carry out* an already-decided plan, use Sonnet. When unsure, prefer the top tier for the reasoning step and Sonnet for the execution steps it produces.

Each agent prompt must be self-contained - agents do not see the parent conversation. Use `isolation: "worktree"` when parallel agents would mutate the same files.
