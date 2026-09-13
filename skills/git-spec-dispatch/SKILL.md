---
name: git-spec-dispatch
description: >-
  Execute a GitHub spec issue tree in parallel - read the parent's sub-issues, parse each Contract
  block, plan file-disjoint waves, dispatch one agent per sub-issue, verify, PR, close, repeat. Use
  when the user says "dispatch the spec", "run spec 40", "/git-spec-dispatch", "fan out that issue
  tree", "work the sub-issues in parallel", or hands over a parent issue and expects more than one
  agent on it. "implement #40" counts only when #40 is a spec parent; a plain issue is
  `git-issue-start`'s. Writing the tree is `git-spec-plan`'s - this skill only runs it.
tags: [git, github, spec, agents]
updated_at: 2026-09-13
---

# Spec Dispatch

issue tree -> wave plan -> agents -> verify -> PR -> close -> repeat.

`git-spec-plan` writes the tree and this runs it. Planning never fans out: the parent's acceptance criteria, the sub-issue split, and the `Contract` blocks that make waves provably safe all need whole-repo context, and each depends on the last. Only sub-issues fan out.

Substrate-independent. Dispatch the waves with whatever subagent mechanism the session provides; how workers start, are briefed, and hand back results belongs to that layer. This skill owns what is spec-specific - including the per-task worktree isolation in step 4, which no substrate provides on its own.

## Preconditions

```bash
gh issue view <parent> --json number,title,state
```

Parent closed -> stop and ask; a closed spec is not a work queue. No sub-issues -> it is a plain issue: send the user to `git-issue-start` to work it directly, or to `git-spec-plan` only when they want it decomposed first. **Never author a spec, a sub-issue, or a `Contract` block here.**

## Flow

1. Read the tree:
   ```bash
   gh issue view <parent> --json number,title,state
   gh issue view <parent> --json subIssues -q '.subIssues.nodes[] | {number,title,state}'
   ```
   Why -> `gh issue list` has no parent/child filter, so listing by label or milestone silently returns a different set than the one the spec owns; `--json subIssues` (gh >= 2.100) is the native tree read
2. Parse every **open** sub-issue's `## Contract` block - one fetch per issue, three seds on the saved text, never three round trips:
   ```bash
   body=$(gh issue view <n> --json body -q .body | tr -d '\r')
   printf '%s\n' "$body" | sed -n 's/^files: //p'
   printf '%s\n' "$body" | sed -n 's/^needs: //p'
   printf '%s\n' "$body" | sed -n 's/^verify: //p'
   ```
   The `tr -d '\r'` is load-bearing: one web-UI edit converts the body to CRLF, after which every value carries a trailing CR and the `needs:` comparison against closed issue numbers fails silently. Missing or empty `files:` on any open sub-issue -> **stop, name that issue**, plan nothing. Why -> guessing which tasks are disjoint is how two agents end up editing one file, and the loser's work vanishes silently with no error anywhere
3. Plan the wave: open sub-issues whose `needs:` are all **closed** and whose `files:` sets are **pairwise disjoint**. Cap at what you can brief and verify in one pass. Everything else waits. See **Waves**
4. Per task in the wave, isolate first, then dispatch. Do `git-issue-start`'s tracker side - assign the sub-issue, in-progress label, name per `git-branch-create`, set `branch.<branch>.issue` - but never check the branch out in the main tree; create it in its own worktree:
   ```bash
   git worktree add -b <branch> ../<repo>-<desc> <base>
   ```
   Then one agent per sub-issue, all launched together, each briefed into its own worktree path. Brief shape in **Brief**. Why -> one checkout cannot host a parallel wave: concurrent agents in a single tree serialize on the dirty-tree guard or cross-contaminate branches, and a verify run against the union of in-flight edits proves nothing about any one task
5. Collect. In-process subagents -> the agent's returned report is the result. Workers with their own terminal -> the result file on disk is the completion signal, never scraped screen output; no file -> not done, whatever the worker's lifecycle state says
6. Verify: run that sub-issue's own `verify:` command yourself, as a shell command inside that task's worktree. Not an agent, not a re-read of the worker's summary, never the main checkout while a wave is in flight. Why -> a worker reporting green is a claim; the command is the evidence, and it is evidence only against that task's own tree
7. Green -> inside that task's worktree: commit via `git-commit`, which reads the branch's issue link and adds the `Closes #<n>` trailer itself, then `git-pr-create`, which fills the template's `Resolves: #<n>` and derives the type label. PR open -> remove the worktree: `git worktree remove <path>`. Merging that PR closes the sub-issue. Red -> leave the sub-issue open and its worktree in place, report what failed, and **do not close it to keep moving**
8. Wave PRs open -> **stop and hand the merge decision to the user**; resume (re-run this skill) after merges land. Never `gh pr merge` from this skill. Why -> merging is the user's review gate, and an agent merging its own wave removes the only human check between generated code and the base branch
9. Re-read the tree from step 1. Why -> `state` changed under you when PRs merged, and workers may have edited paths beyond their brief. Never plan a wave off an in-memory copy. Plan the next wave, repeat until every sub-issue is closed
10. All children closed -> report the parent as ready to close, with its number and the merged PRs. **Do not close it.** Why -> the parent carries the spec's acceptance criteria and a human confirms those, not an agent

## Waves

Wave = open sub-issues whose `needs:` are all closed **and** whose `files:` sets are pairwise disjoint. Ready is not the same as safe; both halves must hold.

Parent `#40 spec: catalog filtering`:

| # | Task | `files:` | `needs:` |
| --- | --- | --- | --- |
| #41 | tag index in the data layer | `site/lib/data.ts` | none |
| #42 | tag chip component | `site/components/tag-chips.tsx` | none |
| #43 | wire filtering into the catalog | `site/components/catalog.tsx` | #41, #42 |
| #44 | document the tag contract | `site/lib/data.ts` | none |

- **Wave 1 = #41 + #42.** No open `needs:`, no shared path
- **#43 waits** - `needs: #41, #42` are still open. Dependency, not overlap
- **#44 waits** - `needs: none`, so it *looks* ready, but its `files:` collides with #41 on `site/lib/data.ts`. Two agents, one file, one of them loses
- **Wave 2 = #44** once #41's PR merges. **Wave 3 = #43**

Four tasks, three waves. That is the correct answer, not a failure of the plan. Prefer domain and feature boundaries when choosing what goes together; never split work that reaches one file from two directions.

## Brief

The worker sees none of the parent conversation. Everything it needs goes in the brief:

```
Implement sub-issue #42 of spec #40 in <worktree path>, on branch <branch>.

Task: <the sub-issue's Problem + Done when, verbatim>

You own exactly these paths: site/components/tag-chips.tsx
Do not create, edit, or delete anything else. Other tasks from this wave are in
flight in sibling worktrees, and every branch merges into the same base.

Verify with: just check

Write your complete result as Markdown to <path>. Reply with only that absolute path, nothing else.
```

- The path in the brief is that task's worktree from step 4, never the main checkout
- `files:` from the `Contract` block is the ownership list, copied not paraphrased
- Name the forbidden paths explicitly when a neighbouring task is close by
- `verify:` is the sub-issue's own, not a repo-wide default you assumed
- Do not tell a worker to commit, push, PR, or close anything. That happens here, after verify
- The result-file line is for workers with their own terminal; an in-process subagent returns its report directly, so drop that line there

## Blocked

Applies only to substrates whose workers can surface an approval or question dialog mid-run; an in-process subagent either returns or fails, and this section does not apply.

A worker hitting an approval or question dialog is parked, not answered. Read it, surface it to the user with the worker's identifier, and leave every other worker running. **Never answer an approval dialog on the user's behalf.**

That sub-issue stays open and drops out of the wave. Plan the next wave without it.

## Reporting

A wave report to the user in chat is a table of sub-issue number, verify result, PR link. Nothing else.

**Hard cap: 4 lines of prose** for a progress comment on the parent. PR bodies are `git-pr-create`'s cap, not this skill's. A progress comment states the fact and stops:

```markdown
Wave 2 done. #43 merged via #51, #44 still open - `just check` fails on the data layer.
```

Prohibitions on anything posted:

- State the result, not the process. No agent-by-agent narration, no agent-count bragging
- No restating the issue or PR title
- Never report a verify result you did not run

## Rules

- One sub-issue per agent, always. Never queue two into one worker
- Stop rather than guess disjointness. An unmarked `files:` ends the run
- Never dispatch a task whose `needs:` are still open
- Verify by running `verify:` yourself before anything closes
- Close before the next wave. An open sub-issue whose work already merged makes the next wave plan wrong
- Re-read the tree between waves. Never trust an in-memory copy
- Never close the parent. Report it ready and let the user confirm the acceptance criteria
- Never `gh pr merge`. The wave stops when its PRs are open; merges are the user's
- Never `gh label create`, never `--no-verify`
- Report every agent spawned, including any left running
