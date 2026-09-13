---
name: git-issue-start
description: >-
  Take a GitHub issue from open to a checked-out branch - resolve it, assign it to you, mark it in progress if the repo has such a label, derive a conventional branch name from its `type: *` label, branch off the detected base. Use for "start issue 42", "work on #42", "/git-issue-start 42", "let's do 42", "pick up that issue", "take the oauth issue", "I'll take this one", or whenever the user points at a tracked issue and signals they are about to write code for it. Resolves an issue named by title instead of number via `gh issue list --search`. Boundary with `git-branch-create`: that skill owns branch naming and base detection and is the right call when there is no issue; this one is the issue-to-branch bridge and delegates naming to it. Assigns and branches immediately without asking for confirmation.
tags: [git, github]
updated_at: 2026-09-11
---

# Start Issue

Issue -> assign -> branch -> checked out. No confirm.

## Flow

1. Resolve the issue:
   - Number given -> `gh issue view <n> --json number,title,labels,state,assignees,body`
   - Title or topic given ("the oauth issue") -> `gh issue list --search "<terms>" --state open --json number,title --limit 10`, then view the match. Exactly one hit -> take it. Several -> list them, ask which. None -> stop, say so. Why -> guessing an issue number assigns the wrong person to the wrong work and it is invisible until someone reads the tracker
2. `state == CLOSED` -> stop. Surface number, title, and that it is closed. Never reopen here
3. Assigned to someone else -> stop and ask before taking it. Own login from `gh api user -q .login`; already yours -> proceed, assignment step is a no-op. Why -> an assignee is a claim by a person, and silently overwriting it is how two people ship the same fix
4. Dirty tree -> stop. Tell the user to stash or commit first. Same reasoning as `git-branch-create` step 2: `checkout -b` carries staged and unstaged changes into the new branch silently
5. Assign to self: `gh issue edit <n> --add-assignee @me`
6. In-progress label, only if one already exists. Fetch the repo's labels once per run per canon label resolution:
   ```bash
   gh label list --limit 200 --json name -q '.[].name'
   ```
   Chain, first existing name wins: `status: in progress` -> `status: in-progress` -> `in progress` -> `in-progress` -> `wip`. Whole chain missing -> skip the step silently, no output, no error. Never `gh label create`. Why -> this skill syncs globally and runs on repos with different label sets; the user's own taxonomy has no in-progress label at all, so absent is the normal case, not a failure
7. Derive the branch type from the issue's `type: *` label:

   | Issue label | Branch type |
   | --- | --- |
   | `type: bug` | `fix` |
   | `type: enhancement` | `feat` |
   | `type: documentation` | `docs` |
   | `type: maintenance` | `chore` |
   | `type: security` | `fix` |
   | `type: dependencies` | `build` |

   Bare names count too (`bug`, `enhancement`, `documentation`, `maintenance`, `security`, `dependencies`, `deps`) - same row. `type: breaking` carries no branch type of its own; fall through

   No type label -> read the title's conventional prefix (`fix(api): ...` -> `fix`). No prefix either -> infer from title + body against `git-commit`'s **Type Pick** table. Two type labels -> pick the dominant one, never compound the branch name
8. Name and base follow `git-branch-create` exactly - its **Naming** section and its base-detection incantation. Do not restate either. The desc is the issue title, kebab-cased, verb made imperative present, with the whole `<type>/<desc>` name 60 chars or fewer; over -> cut per that skill's desc rules, never truncate mid-word
9. Create + checkout per `git-branch-create` step 5. Name already exists -> stop, surface the conflict, no overwrite
10. Record the issue on the branch:
    ```bash
    git config branch.<name>.issue <n>
    ```
    Why -> the branch name carries no ticket id, and `git-commit` reads this key to write the `Closes #<n>` trailer. Skip it and the commit has no link back to the tracker
11. Print the report

## Report

Three lines, nothing else:

```
issue     #42 add oauth login (type: enhancement)
assignee  @pivoshenko
branch    feat/add-oauth-login off origin/main
```

Label chain dropped -> one extra line naming what was skipped. Nothing skipped -> no extra line.

## Ticket IDs In Branch Names

`git-branch-create` keeps ticket IDs out of branch names unless asked, and starting from an issue does not change that: the link to `#n` rides in `branch.<name>.issue` (step 10), the commit footer (`Closes #42`), and the PR body (`Resolves: #42`) - all three of which a tool actually reads. A branch name is a human label, not a foreign key.

## Rules

- Never reopen a closed issue here, never close an open one. Closing is the commit footer's job via `git-commit`, or the user's
- Branch created but `branch.<name>.issue` unset -> the link is lost silently. Set it in the same run, never later
- Never steal an assignment. Someone else in `assignees` -> ask first, every time
- Never push the branch. `git-pr-create` pushes when there is something to review
- Dirty tree -> stop before touching the issue at all. No half-state where the issue is assigned but no branch exists
- Never `gh label create`. Missing chain -> skip and say so
- Never invent the issue. Ambiguous search -> ask; empty search -> stop
- One issue per run. Batch starts are not a thing - a branch holds one piece of work
