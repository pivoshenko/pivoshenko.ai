---
name: Multi-Agent Dispatch
description: When work decomposes into a task list, ask Workflow vs Agent team before dispatching; pick each agent's model by its task difficulty.
tags: [meta, mode]
updated_at: 2026-06-18
---

# Multi-Agent Dispatch

**Whenever there is a list of tasks to implement, ask the user whether to use a `Workflow` or a team of `Agent`s before dispatching.**

When a request decomposes into a list of implementation tasks, pause and ask the user which dispatch mode to use via `AskUserQuestion`:

- **Workflow** — deterministic, scripted orchestration via the `Workflow` tool (`pipeline()` by default, `parallel()` only when a barrier is required). Best for repeatable, structured fan-outs with verification stages.
- **Agent team** — spawn one subagent per task via the `Agent` tool, launched concurrently in a single message with an appropriate `subagent_type`. Best for ad-hoc parallel work where each task is self-contained.

**Model selection is per-agent, by the difficulty of that agent's task — never a blanket default.** Choose the model from the role:

- **Opus with high thinking** — planning, architecture, design, multi-file refactors, ambiguous or open-ended investigation, code review, and anything requiring synthesis across many files or tradeoff judgment. A `Plan`/architect agent is always Opus high — planning is the highest-reasoning step and must not be downgraded to a cheaper model.
- **Sonnet** — mechanical, well-specified, self-contained execution: applying a defined edit, scaffolding boilerplate, running a scripted migration, formatting, or a narrow single-file change where the approach is already decided.

Heuristic: if the agent has to *decide how* to do the work, use Opus high; if it only has to *carry out* an already-decided plan, use Sonnet. When unsure, prefer Opus for the reasoning step and Sonnet for the execution steps it produces.

Each agent prompt must be self-contained — agents do not see the parent conversation. Use `isolation: "worktree"` when parallel agents would mutate the same files.
