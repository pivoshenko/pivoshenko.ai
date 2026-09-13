---
name: git-spec-dispatch
description: >-
  Execute a GitHub spec issue tree in parallel - read the parent's sub-issues, parse each Contract block, plan file-disjoint waves, dispatch one agent per sub-issue, verify, PR, close, repeat. Use when the user says "dispatch the spec", "run spec 40", "implement #40", "/git-spec-dispatch", "fan out that issue tree", "work the sub-issues in parallel", or hands over a parent issue and expects more than one agent on it. Boundary with `git-spec-plan`: that skill writes the tree (parent, sub-issues, Contract blocks) and this one runs it - a request to break work down, scope a spec, or draft sub-issues is `git-spec-plan`'s, not this skill's. Works with or without Herdr; chains to `herdr-dispatch` for the pane mechanics when inside it.
tags: [git, github, spec, agents]
updated_at: 2026-09-11
---

# Spec Dispatch

issue tree -> wave plan -> agents -> verify -> PR -> close -> repeat.

`git-spec-plan` writes the tree and this runs it. Planning never fans out: the parent's acceptance criteria, the sub-issue split, and the `Contract` blocks that make waves provably safe all need whole-repo context, and each depends on the last. Only sub-issues fan out.

Substrate-independent. Inside Herdr (`HERDR_ENV=1`) subagents are panes per the `Herdr` instruction, and the mechanics - budget, split, start, brief, collect, blocked, cleanup - belong to `herdr-dispatch`. Outside it, dispatch the same waves with the `Agent` tool. Either way this skill owns only what is spec-specific.

## Preconditions

```bash
test "${HERDR_ENV:-}" = 1        # decides the substrate only, never whether to proceed
gh issue view <parent> --json number,title,state
```

Parent closed -> stop and ask; a closed spec is not a work queue. No sub-issues -> send the user to `git-spec-plan`. **Never author a spec, a sub-issue, or a `Contract` block here.**

## Flow

1. Read the tree:
   ```bash
   gh issue view <parent> --json number,title,state
   gh api repos/{owner}/{repo}/issues/<parent>/sub_issues --jq '.[] | {number,title,state}'
   ```
   `{owner}/{repo}` are `gh` placeholders - leave them literal, `gh` fills them from the current remote. Why -> `gh issue list` has no parent/child filter and native sub-issues surface only through the API, so listing by label or milestone silently returns a different set than the one the spec owns.
2. Parse every **open** sub-issue's `## Contract` block:
   ```bash
   gh issue view <n> --json body -q .body | sed -n 's/^files: //p'
   gh issue view <n> --json body -q .body | sed -n 's/^needs: //p'
   gh issue view <n> --json body -q .body | sed -n 's/^verify: //p'
   ```
   Missing or empty `files:` on any open sub-issue -> **stop, name that issue**, plan nothing. Why -> guessing which tasks are disjoint is how two agents end up editing one file, and the loser's work vanishes silently with no error anywhere.
3. Plan the wave: open sub-issues whose `needs:` are all **closed** and whose `files:` sets are **pairwise disjoint**. Cap at the `herdr-dispatch` pane budget inside Herdr; outside it, cap at what you can brief and verify in one pass. Everything else waits. See **Waves**
4. Per task in the wave, branch first, then dispatch. Branch via `git-issue-start`'s flow - assign the sub-issue, branch off it, naming per `git-branch-create`. Then one agent per sub-issue, all launched together. Brief shape in **Brief**
5. Collect. The worker's result file on disk is the completion signal, never scraped screen output. Per `herdr-dispatch`'s result contract: no file -> not done, whatever `--wait` returned
6. Verify: run that sub-issue's own `verify:` command yourself, as a shell command. Not an agent, not a re-read of the worker's summary. Why -> a worker reporting green is a claim; the command is the evidence
7. Green -> commit via `git-commit`, which reads the branch's issue link and adds the `Closes #<n>` trailer itself, then `git-pr-create`, which fills the template's `Resolves: #<n>` and derives the type label. Merging that PR closes the sub-issue. Red -> leave the sub-issue open, report what failed, and **do not close it to keep moving**
8. Re-read the tree from step 1. Why -> `state` changed under you when PRs merged, and workers may have edited paths beyond their brief. Never plan a wave off an in-memory copy. Plan the next wave, repeat until every sub-issue is closed
9. All children closed -> report the parent as ready to close, with its number and the merged PRs. **Do not close it.** Why -> the parent carries the spec's acceptance criteria and a human confirms those, not an agent

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
Implement sub-issue #42 of spec #40 in <repo path>, on branch <branch>.

Task: <the sub-issue's Problem + Done when, verbatim>

You own exactly these paths: site/components/tag-chips.tsx
Do not create, edit, or delete anything else. Other agents are working other paths
in this same tree right now.

Verify with: just check

Write your complete result as Markdown to <path>. Reply with only that absolute path, nothing else.
```

- `files:` from the `Contract` block is the ownership list, copied not paraphrased
- name the forbidden paths explicitly when a neighbouring task is close by
- `verify:` is the sub-issue's own, not a repo-wide default you assumed
- do not tell a worker to commit, push, PR, or close anything. That happens here, after verify

## Blocked

A worker hitting an approval or question dialog is parked, not answered. Read it, surface it to the user with its pane id, and leave every other worker running. **Never answer an approval dialog on the user's behalf.** Detail in `herdr-dispatch`.

That sub-issue stays open and drops out of the wave. Plan the next wave without it.

## Reporting

A wave report to the user in chat is a table of sub-issue number, verify result, PR link. Nothing else.

**Hard cap: 4 lines of prose** for a progress comment on the parent. PR bodies are `git-pr-create`'s cap, not this skill's. A progress comment states the fact and stops:

```markdown
Wave 2 done. #43 merged via #51, #44 still open - `just check` fails on the data layer.
```

Prohibitions on anything posted:

- State the result, not the process. No pane-by-pane narration, no agent-count bragging
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
- Never `gh label create`, never `--no-verify`
- Report every agent spawned, including any left running
