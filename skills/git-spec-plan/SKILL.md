---
name: git-spec-plan
description: >-
  Turn a plan, design discussion, or feature request into a GitHub issue tree - one parent `spec:` issue plus native sub-issues, one per task, each carrying a machine-readable Contract block (`files:` / `needs:` / `verify:`) so the tasks can later be fanned out to parallel agents provably safely. Use when the user says "spec this out", "plan this as issues", "break this into tickets", "/git-spec-plan", "turn this into a spec", "decompose this", "what are the tasks for X", or whenever a design discussion has converged and needs to become tracked work. This is the planning half of spec-driven development; `git-spec-dispatch` is the execution half and reads exactly what this skill writes. Boundary with `git-issue-create`: one indivisible piece of work is a single issue, not a tree.
tags: [git, github, spec, agents]
updated_at: 2026-09-11
---

# Spec Plan

converged plan -> survey repo -> decompose -> check disjointness -> parent issue -> sub-issues -> native links -> print tree.

**Planning is sequential and stays with you.** Never fan decomposition out to agents. Why -> deciding task boundaries needs whole-repo context in one head, and every task's `files:` set depends on the ones already assigned; parallel planners produce overlapping slices that cannot be reconciled after the fact. Only execution fans out, and that is `git-spec-dispatch`'s job.

Bodies obey **Length** below. Labels resolve through the chain below, never hardcoded.

## Flow

1. **Establish the change.** What, why, done-when. Thin or ambiguous input -> ask before writing anything. Why -> a spec tree built on a guess costs more to unpick than to ask: every sub-issue, every `files:` set, and every branch downstream inherits the wrong scope
2. **Survey the repo for real file boundaries.** Read the module layout (`ls`, the project's `CLAUDE.md`/`README`, the entry points). Find the seams - where does one module stop calling into another. Check what already exists so a task says "extend" rather than "add" a thing already there. Grep for the nouns the user used. Why -> this is what makes `files:` accurate rather than aspirational, and an aspirational `files:` is a clobber waiting to happen in wave 1
3. **Decompose into tasks.** Each task is a vertical slice that leaves the tree green on its own - it builds, it passes `verify:`, it could ship alone. Prefer domain and feature boundaries over layer boundaries. Why -> layer-sliced tasks ("all the types", "all the components", "all the tests") all touch the same files and serialize into one wave, which is a task list that cannot parallelize at all
4. **Assign `files:` per task, then check pairwise disjointness yourself** before filing anything. See **Disjointness Check**. Overlap -> merge the two tasks, or give one sole ownership of the shared file. Never file a tree you already know cannot parallelize
5. **Create the parent.** Title `spec: <short summary>` per **Title**. Body = the fallback issue body plus `## Tasks`. Label with the single dominant `type: *` per **Labels**. No assignee
6. **Create each sub-issue.** Conventional title, body <= 4 prose lines per **Length**, then the **Contract Block** verbatim. Label each with its own dominant `type: *`
7. **Link them as native sub-issues.** See **Linking**. Why -> native sub-issues give the parent a progress bar and let `git-spec-dispatch` enumerate the tree in one call; a `- [ ] #41` checklist in the body looks the same and is not queryable
8. **Print the tree.** Parent, then each sub-issue indented with number, title, and `needs:`

## Decomposition

A task is right-sized when all four hold:

- one agent can finish it in one context
- it leaves `verify:` green on its own
- its `files:` set is nameable now, not after starting
- its title fits the conventional grammar without "and"

Split signals -> title needs "and" / "also"; two unrelated modules; the done-when list has two independent halves.

Merge signals -> two tasks share a file; one is a one-line edit inside the other's file; neither passes `verify:` without the other.

Do not create a task for "write the tests" separately from the feature. Why -> tests and the code they cover live in the same slice; splitting them guarantees a shared-file overlap and a red tree in between.

## Disjointness Check

Do this on paper before the first `gh issue create`.

1. List every task with its `files:`
2. Compare every pair. Any shared path -> not parallel-safe
3. Overlap, work genuinely divisible -> one task takes sole ownership of that file and every change to it
4. Overlap, work not divisible -> it is one task, not two. Merge it
5. Overlap that is real and unavoidable (a shared registry, a barrel export, a lockfile) -> keep them separate but express it as `needs:`, so they land in different waves

A pair that is neither disjoint nor ordered by `needs:` is a bug in the tree, not a decision to defer to dispatch time. Why -> `git-spec-dispatch` builds a wave from unclosed sub-issues whose `needs:` are all closed and whose `files:` sets are pairwise disjoint; an unmarked or overlapping pair makes it stop and ask, or silently clobber if the markers lie.

## Title

```
<type>(<scope>): <short summary>
```

- type from `build|chore|ci|docs|feat|fix|perf|refactor|test`. Type picks + tiebreakers live in `git-commit`
- scope optional, lowercase, one only
- summary imperative present, lowercase, no trailing `.`
- whole title <= 72 chars

Parent spec issues take a `spec: ` prefix instead: `spec: oauth login`. Sub-issues use ordinary conventional titles.

## Labels

Never hardcode the namespaced taxonomy. Detect it. Fetch once per run:

```bash
gh label list --limit 200 --json name -q '.[].name'
```

Resolve each intended label through its candidate chain, first existing name wins:

| Intent | Candidate chain |
| --- | --- |
| `feat` | `type: enhancement` -> `enhancement` -> `feature` |
| `fix` | `type: bug` -> `bug` |
| `docs` | `type: documentation` -> `documentation` -> `docs` |
| `perf` | `type: enhancement` -> `performance` -> `enhancement` |
| `refactor` / `chore` / `build` / `ci` | `type: maintenance` -> `maintenance` -> `chore` |
| `test` | `type: maintenance` -> `tests` -> `test` |
| breaking change | `type: breaking` -> `breaking-change` -> `breaking` |
| dependency bump | `type: dependencies` -> `dependencies` -> `deps` |
| security | `type: security` -> `security` |
| priority | `priority: <level>` -> `<level> priority` -> `<level>` |
| blocked | `status: blocked` -> `blocked` |
| duplicate | `status: duplicate` -> `duplicate` |

- Whole chain missing -> drop that label and say so in the output. NEVER `gh label create`
- Exactly one `type: *` label per issue. Pick the dominant type, never two
- Parent gets the dominant type across the whole change; each sub-issue gets its own
- `priority: *` only when the user signalled urgency. Never guess a priority
- Multi-word label names must be quoted: `--label "type: bug"`

## Parent Body

No repo in this account carries an ISSUE_TEMPLATE, so this fallback is what gets used:

```markdown
## Problem

<1-3 lines. What is wrong or missing, and the consequence. Not the solution.>

## Done when

- <observable condition, checkable by someone who did not write this>
- <...>

## Tasks

<filled by the native sub-issue list; leave empty at create time>
```

Optional sections, only when they carry a fact: `## Context` (<= 2 lines, links to prior issues/PRs/ADRs), `## Out of scope` (<= 2 lines). Never emit an empty placeholder section. Drop it.

`## Done when` on the parent is the change-level acceptance, not a restatement of the task titles.

```bash
gh issue create --title "spec: oauth login" --label "type: enhancement" --body "$(cat <<'EOF'
## Problem

Sessions drop on every API deploy because the cookie is signed with a per-instance key.

## Done when

- a session survives a rolling restart of all API pods
- existing password logins keep working unchanged

## Tasks
EOF
)"
```

`'EOF'` quoted -> no shell interpolation on `#41`, backticks, or `$`.

## Contract Block

Every spec sub-issue body ends with this. It is VISIBLE, not an HTML comment, because the user reviews these on github.com.

```markdown
## Contract

files: site/lib/data.ts, site/components/catalog.tsx
needs: #41, #42
verify: just check
```

- `files:` every path the task will write. Comma separated. Required, never empty
- `needs:` sub-issue numbers that must close first. `needs: none` when there are none. Required
- `verify:` the repo command that proves the task is done. Required

The Contract block does not count against the 4-line prose cap.

```bash
gh issue create --title "feat(auth): add google oauth provider" --label "type: enhancement" --body "$(cat <<'EOF'
## Problem

Login is password-only. Google is the provider every existing user already has.

## Contract

files: src/auth/oauth.ts, src/auth/index.ts
needs: #41
verify: just check
EOF
)"
```

`needs:` numbers only exist after the referenced sub-issue is created -> file in dependency order, or file all then patch the block with `gh issue edit <n> --body`. Why -> a `needs: #41` written before #41 exists points at whatever issue lands on 41.

`git-spec-dispatch` parses it back with:

```bash
gh issue view <n> --json body -q .body | sed -n 's/^files: //p'
gh issue view <n> --json body -q .body | sed -n 's/^needs: //p'
```

Keep the keys at column zero, one per line, exactly these spellings. Anything else and the parse returns empty, which reads as "unmarked" and stops dispatch.

## Linking

Native sub-issues, not a checklist. The GitHub MCP tool `sub_issue_write` does this directly. `gh` has no first-class command, so the fallback is the REST API:

```bash
gh issue view 41 --json id -q .id                 # node id
gh api repos/{owner}/{repo}/issues/41 -q .id      # database id, what REST wants
gh api repos/{owner}/{repo}/issues/40/sub_issues -F sub_issue_id=<id>
```

Why -> the field is the issue's id, never its display number. Pass `41` and the call either 404s or links whichever unrelated issue happens to carry id 41. Resolve the id first, every time.

`{owner}/{repo}` -> `gh repo view --json nameWithOwner -q .nameWithOwner`.

## Worked Example

Three tasks, one dependency edge, no file overlap anywhere.

Parent `#40` - `spec: oauth login`, label `type: enhancement`, unassigned.

`#41` - `feat(db): add oauth account table`

```markdown
## Problem

No table links a provider identity to a local user, so a returning Google login cannot resolve to an account.

## Contract

files: migrations/0007_oauth_accounts.sql, src/db/schema.ts
needs: none
verify: just check
```

`#42` - `feat(auth): add google oauth provider`

```markdown
## Problem

Login is password-only. Google is the provider every existing user already has.

## Done when

- a fresh Google login creates one row in `oauth_accounts` and one session
- a repeat login reuses the existing row

## Contract

files: src/auth/oauth.ts, src/auth/index.ts
needs: #41
verify: just check
```

`#43` - `feat(ui): add sign-in with google button`

```markdown
## Problem

The sign-in form has no entry point for a provider login.

## Contract

files: src/components/sign-in.tsx
needs: none
verify: just check
```

Printed tree:

```
#40 spec: oauth login
├─ #41 feat(db): add oauth account table          needs: none
├─ #42 feat(auth): add google oauth provider      needs: #41
└─ #43 feat(ui): add sign-in with google button   needs: none

wave 1 -> #41, #43   (disjoint files, no open needs)
wave 2 -> #42        (blocked on #41)
```

`#43` is UI-only and shares nothing with `#41`, so it runs in wave 1 despite belonging to the same feature. That is what domain slicing buys.

Hand off: `git-spec-dispatch` to run the waves.

## Length

**Hard cap: 8 lines of prose** for the parent body, **4** for each sub-issue. Headings, the `## Tasks` list, and Contract blocks don't count - only text you write.

Parent:

- `## Problem`: 1-3 lines. Why this change exists and what it costs to not do it
- `## Done when`: the acceptance criteria for the whole change, one line each, 100 chars or fewer
- `## Tasks`: the sub-issue list. Generated, not prose - no cap

Sub-issue:

- 1-2 lines saying what this slice does and what it leaves alone
- No restating the parent. A reader clicks up to it
- The `## Contract` block carries `files:` / `needs:` / `verify:`, so the prose never repeats them

Prohibitions:

- **Why and what "done" means**, not how - the task's implementer decides how
- No restating the title, and no restating the parent in a sub-issue. A reader clicks up to it
- No play-by-play ("first X, then Y"). The `needs:` edges already encode the order
- Never invent paths, criteria, or verify commands. Confirm them against the repo or ask

## When Not to Use This

- one indivisible piece of work, no tree needed -> `git-issue-create`
- work starting right now, no tracking or decomposition wanted -> `git-branch-create`
- an existing backlog that needs sorting rather than a new spec -> `git-issue-triage`

## Rules

- Every sub-issue has a non-empty `files:` and an explicit `needs:` (`none` counts, blank does not)
- Never file a tree with overlapping `files:` in the same wave. Merge, reassign ownership, or order it with `needs:`
- Never invent acceptance criteria. Unknown -> ask, or omit the section
- Ask rather than guess scope. A clarifying question before the first `gh issue create` is cheap; a wrong tree is not
- The parent issue is never assigned to anyone. Only sub-issues are
- Exactly one `type: *` label per issue. Never `gh label create`
- Planning stays with you. Never dispatch decomposition to agents
- Sub-issue bodies <= 4 prose lines, parent <= 8, per **Length**
- `verify:` is a command that exists in this repo. Unsure -> read the justfile / package scripts, do not invent one
