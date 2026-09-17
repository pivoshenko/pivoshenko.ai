---
name: spec-apply
description: >-
  Implement an OpenSpec change's tasks in parallel - read the task queue, plan file-disjoint waves,
  dispatch one agent per task into its own worktree, verify, tick the checkbox, commit, repeat. Use
  when the user says "apply the change", "implement the change", "run the tasks", "work the tasks in
  parallel", "fan out the change", "dispatch the spec", "/spec-apply", or hands over an OpenSpec
  change and expects code written for it. Wraps `/opsx:apply`, whose loop is strictly serial,
  single-agent, and git-blind. Boundaries: artifacts missing or incomplete -> `spec-propose`; every
  task already ticked and the result needs checking -> `spec-verify`; a finished change ready to
  fold into the specs -> `spec-archive`; a plain GitHub issue with no OpenSpec change behind it ->
  `git-issue-start`.
tags: [openspec, spec, agents]
updated_at: 2026-09-17
---

# Spec Apply

task queue -> wave plan -> agents -> verify -> tick -> commit -> repeat.

`/opsx:apply` walks tasks one at a time in one context and never touches git. This replaces that loop only: the same OpenSpec mechanics, run in parallel, plus the commit seam it leaves out. Planning artifacts stay sequential and belong to `spec-propose` - never author one here.

Substrate-independent. Inside Herdr (`HERDR_ENV=1`) workers are panes and the mechanics belong to `herdr-dispatch`; outside it they are `Agent` tool subagents. This skill owns only what is spec-specific, including the per-task worktree isolation in **Isolation**, which no substrate provides on its own.

## Preflight

```bash
openspec context --json
```

`no_openspec_root` -> **stop**. Offer `openspec init --tools claude` and wait for the user. Never auto-init, never fall back to the current directory. Use the returned `root.path` as authoritative.

`.claude/commands/opsx/apply.md` exists -> the OpenSpec mechanics are its job; invoke it and own only the git seam. Absent -> drive the `openspec` CLI directly.

The user naming a store -> `openspec store list --json` for ids, then `--store <id>` on every command that accepts it, sticky for the rest of the run.

Change selection: a name given -> use it. Exactly one active change -> select it and say so. Ambiguous -> `openspec list --json` and ask. Either way, announce which change is in use and how to override it. Why -> every command here takes `--change` and operates on whatever it is handed without complaint, so announcing it is the only moment the user can catch a wave aimed at the wrong change before agents start writing files.

## Flow

1. Read the apply state:
   ```bash
   openspec instructions apply --change "<name>" --json
   ```
   `state: "blocked"` -> required artifacts are missing; send the user to `spec-propose` and stop. **Never author artifacts here.** `state: "all_done"` -> nothing left to apply; send them to `spec-verify`. `ready` -> continue, and keep `progress` and `contextFiles`
2. Read `tasks.md` itself, at the path from `contextFiles.tasks`. Key every task on the `N.M` label parsed out of the file text. See **The Queue JSON Is Lossy**
3. Any unticked task without `files:` and `needs:` -> stop. See **Markers**
4. Plan the wave: unticked tasks whose `needs:` are all ticked and whose `files:` sets are pairwise disjoint. Cap at what you can brief and verify in one pass; everything else waits. See **Waves**
5. Isolate first, then dispatch one agent per task, all launched together, each briefed into its own worktree path. See **Isolation** and **Brief**
6. Collect, verify, tick, commit - per task, in that order, no reordering. See **Collect, Verify, Tick, Commit**
7. Wave done -> re-read step 1 AND `tasks.md` from disk, then plan the next wave. Never an in-memory copy. Why -> workers mutate the tree under you and a merged task branch changes what is ticked, so a stale queue plans a wave against a file layout that no longer exists
8. `remaining: 0` -> hand off to `spec-verify`. **Never archive here and never open the PR here** - both are `spec-archive`'s

## The Queue JSON Is Lossy

`tasks[]` from `openspec instructions apply --json` is `{id, description, done}`, and it drops exactly the two things a wave plan needs.

- Continuation lines under a task are STRIPPED. `files:` and `needs:` never appear in the JSON at all
- `id` is renumbered sequentially `"1"`, `"2"`, `"3"` and does NOT match the `1.1` / `1.2` / `2.1` labels written in `tasks.md`

Probed: a `tasks.md` holding three tasks, each with `files:` and `needs:` continuation lines, came back as

```json
[{"id":"1","description":"1.1 Add the tag index","done":false}, ...]
```

So read `tasks.md` at `contextFiles.tasks` and key every task on the `N.M` label from the text. Use the JSON for `state`, `progress`, and `contextFiles` only.

Why -> two distinct silent failures, neither of which raises an error. Planning a wave off `tasks[].id` pairs the wrong tasks: a `needs: 1.1` marker resolves against an id that only means "first task in file order", so a dependent task dispatches before the thing it depends on exists. And planning off a `files:` set the JSON never carried means guessing at disjointness, which is how two agents edit one file - no conflict, no failed command, just the loser's work gone.

## Markers

Every unticked task carries both markers, written at authoring time by `spec-propose`:

```markdown
- [ ] 1.1 Add the tag index
      files: site/lib/data.ts
      needs: none
```

Markers missing from `tasks.md` -> **stop and name the tasks that lack them.** Offer to add the `rules: tasks:` block per `spec-propose` and re-run the tasks artifact, then resume here.

Never infer disjointness at dispatch time, and never fill the markers in yourself from a reading of the code. Why -> an inferred `files:` is a guess wearing the costume of a contract, and the wave planner trusts it exactly as much as an authored one.

## Waves

Wave = unticked tasks whose `needs:` are all ticked AND whose `files:` sets are pairwise disjoint. Ready is not the same as safe; both halves must hold.

Change `add-catalog-filtering`:

| Task | Description | `files:` | `needs:` |
| --- | --- | --- | --- |
| 1.1 | Tag index in the data layer | `site/lib/data.ts` | none |
| 1.2 | Tag chip component | `site/components/tag-chips.tsx` | none |
| 2.1 | Wire filtering into the catalog | `site/components/catalog.tsx` | 1.1, 1.2 |
| 2.2 | Document the tag contract | `site/lib/data.ts` | none |

- **Wave 1 = 1.1 + 1.2.** Nothing unticked in either `needs:`, no shared path
- **2.1 waits** - `needs: 1.1, 1.2` are both still unticked. A dependency, not an overlap
- **2.2 waits** - `needs: none`, so it *looks* ready, but its `files:` collides with 1.1 on `site/lib/data.ts`. Two agents, one file, one of them loses
- **Wave 2 = 2.2** once 1.1 is ticked. **Wave 3 = 2.1**

Four tasks, three waves. That is the correct plan, not a failure of it. Prefer domain and feature boundaries when choosing what runs together, and never split work that reaches one file from two directions.

## Isolation

Concurrent workers cannot share one checkout. One worktree per task, created before dispatch, off the change's branch:

```bash
git worktree add -b <change>/<task-id> ../<repo>-<task-id> <change-branch>
```

After that task verifies and commits, fold it back and clean up:

```bash
git merge --no-ff <change>/<task-id>
git worktree remove ../<repo>-<task-id>
git branch -d <change>/<task-id>
```

- Why -> a single tree serializes the whole wave on the dirty-tree guard or cross-contaminates branches, and a verify run against the union of every in-flight edit proves nothing about any one task
- Disjoint `files:` is what makes that merge clean. An overlap surfaces here as a conflict, after the wave has already run, which is why the check happens in **Waves** and not at merge time
- `tasks.md` is never edited in a worktree. Every task's completion writes to that one file, so you own it in the main checkout and no worker ever touches it

## Brief

The worker sees none of this conversation. Everything it needs goes in the brief -> [references/worker-brief.md](references/worker-brief.md).

- The path is that task's worktree from **Isolation**, never the main checkout
- The task text is the `N.M` line from `tasks.md`, verbatim
- `files:` from the marker is the ownership list, copied not paraphrased, and `tasks.md` is always on the forbidden list
- Name the other forbidden paths explicitly when a neighbouring task in the same wave sits close by
- The verify command is the repo's real one - read the justfile or package scripts, or ask. Never invent one
- Do not tell a worker to commit, push, open a PR, tick a box, or archive. Every one of those happens here, after verify
- The result-file line is for workers with their own terminal; an in-process subagent returns its report directly, so drop that line there

## Collect, Verify, Tick, Commit

Per finished task, in this order:

1. **Collect.** In-process subagent -> its returned report is the result. Worker with its own terminal -> the result file on disk is the completion signal, never scraped screen output; no file -> not done, whatever its lifecycle state says
2. **Verify.** Run the repo's verify command YOURSELF, as a shell command, inside that task's worktree. Not an agent, not a re-read of the worker's summary, never the main checkout while a wave is in flight. Why -> a worker reporting green is a claim, the command is the evidence, and it is evidence only against that task's own tree
3. **Tick.** Green -> flip `- [ ]` to `- [x]` on that `N.M` line in `tasks.md`, in the main checkout. Red -> leave it unticked, leave its worktree in place, report what failed, and **do not tick to keep moving**. Why -> the checkbox is the durable record that outlives the session, and a false tick makes the next run skip real work that nobody comes back to
4. **Commit.** Via `git-commit`: the task's code inside its worktree, the `tasks.md` tick in the main checkout. Then merge the task branch back per **Isolation**

Never `--no-verify`. Never tick on a worker's claim alone.

## Scope Creep

A task that cannot be finished without work the spec does not describe -> surface it and pause. Name the task, what it actually needs, and what the spec says instead.

Never silently narrow a task, defer half of it to an unwritten follow-up, or accept an exception to specified behavior to make the task fit. Tick only when the specified behavior is fully implemented. Why -> the tick plus the archived spec are together the claim that the feature exists, so a task quietly trimmed to fit leaves a spec describing behavior the code has never had.

Changing what the spec says is `spec-propose`'s, not a decision to take mid-wave.

## Blocked

Applies only to substrates whose workers can surface an approval or question dialog mid-run; an in-process subagent either returns or fails.

A worker sitting on a dialog is parked, not answered. Read it, surface it to the user with that worker's id, and leave every other worker running. **Never answer an approval on the user's behalf.** That task stays unticked and drops out of the wave; plan the next wave without it.

## When Not to Use This

- Artifacts missing or incomplete, nothing to apply yet -> `spec-propose`
- Every task already ticked and the result needs checking -> `spec-verify`
- Change finished and ready to fold into the specs -> `spec-archive`
- A plain GitHub issue with no OpenSpec change behind it -> `git-issue-start`

## Rules

- Never author an OpenSpec artifact here. Missing or thin -> `spec-propose`
- Key every task on its `N.M` label from `tasks.md`, never on `tasks[].id`
- Stop rather than guess disjointness. An unmarked task ends the run
- Never dispatch a task whose `needs:` are not all ticked
- One task per agent, one worktree per task. Never queue two tasks into one worker
- Verify by running the command yourself, in that task's worktree, before any tick
- Verify -> tick -> commit, per task, in that order
- Commit every wave before starting the next. Why -> a change that "applies" without commits and is then archived leaves a spec claiming a feature the working tree has never seen
- Re-read the apply state and `tasks.md` from disk between waves. Never an in-memory copy
- Never `--no-verify`, never `gh pr merge`
- Never archive and never open the PR. Both are `spec-archive`'s
- Report every agent spawned, including any left running
