---
name: git-issue-triage
description: >-
  Groom an open GitHub backlog with `gh` - one read-only sweep, every open issue bucketed into exactly one category (unlabeled, unprioritized, stale, likely duplicate, closeable, blocked, healthy), a per-issue report, per-category confirmation, then batched label / state / comment edits. Use when the user says "triage issues", "groom the backlog", "clean up issues", "/git-issue-triage", "what's in the backlog", "any stale issues", "review my open issues", "the backlog is a mess", "nothing in here is labelled", or otherwise complains about issue clutter. Boundary with `git-issue-create`: that one writes a single new issue, this one only grooms issues that already exist. Boundary with `git-issue-start`: that one picks one issue up and branches, this one never starts work. Destructive - previews everything and confirms per category before touching anything.
tags: [git, github]
updated_at: 2026-09-11
---

# Triage Issues

Groom the open backlog. Read-only sweep -> bucketed report -> per-category confirm -> apply -> verify.

**Report what the sweep returned, never what this file predicts.** The buckets below define how to classify; the contents come from the run.

## Flow

1. Sweep, read-only, two calls total:

   ```bash
   gh issue list --state open --limit 200 --json number,title,labels,assignees,createdAt,updatedAt,comments
   gh label list --limit 200 --json name -q '.[].name'
   ```

   Why -> one batched fetch, never `gh issue view` per issue. A 60-issue backlog is 60 round trips that way, and the list payload already carries every field the buckets need.
2. Zero open issues -> say so, stop. No report, no proposals
3. Corroborating fetch, only if step 1 produced **Closeable** candidates:

   ```bash
   gh search prs --repo "$(gh repo view --json nameWithOwner -q .nameWithOwner)" --merged --limit 100 --json number,title,body
   ```

   Grep those bodies for `#<n>`. Why -> a merged PR naming the issue is the only close signal that does not require reading the tree.
4. Bucket every open issue into exactly one category. See **Buckets**
5. Report. One line per issue, grouped, counts in each heading. See **Report Format**
6. Confirm **per category**, never per issue and never all-at-once. `AskUserQuestion`, multiSelect, one option per non-empty actionable category. Why -> closing is irreversible in effect even though technically reopenable, relabelling is not, and the user is entitled to accept "labels yes, closes no"
7. Apply only the accepted categories, batched. See **Apply**
8. Summary: counts applied per category, plus one line per skipped issue with why. No recap of what step 5 already listed

## Buckets

Exactly one bucket per issue. State buckets resolve before label buckets - `Closeable` > `Likely duplicate` > `Blocked` > `Stale` > `Unlabeled` > `Unprioritized` > `Healthy`. Why -> an issue about to be closed does not need a label argument first.

### Unlabeled

No `type: *` label resolved through the chain below. Propose one derived from title + body text.

- Type picks and tiebreakers live in `git-commit` - read that table, do not re-derive one here
- Text carries no type signal at all -> propose nothing, list it as `-> needs a human read`

### Unprioritized

Has a type, no `priority: *`. Propose a priority **only** where the text gives a real signal:

- crash, data loss, security, production down -> `critical` or `high`
- anything else -> propose nothing, and say so in the line

Why -> a guessed priority is worse than an absent one, it makes the backlog look sorted when it isn't.

### Stale

`updatedAt` older than 90 days.

```bash
# BSD/macOS; GNU is `date -u -d '90 days ago' +%Y-%m-%dT%H:%M:%SZ`
date -u -v-90d +%Y-%m-%dT%H:%M:%SZ
```

Propose one of: ping, close as `not planned`, leave. Pick by the `comments` count already in the sweep payload - a stale issue with real discussion gets **ping**, never close. Why -> people argued about it; closing silently discards that argument.

### Likely Duplicate

Title or body overlaps another open issue. Propose linking + the duplicate label.

- Keep the **older** number as canonical, propose the label on the newer one
- Propose the link and the label only. Closing a duplicate is a separate decision the user makes under `Closeable`

### Closeable

The work appears done, evidenced by one of:

- a merged PR from step 3 references `#<n>`
- the described defect no longer reproduces in the current tree, verified by actually looking

Propose close with `state_reason: completed`. No evidence -> it is not Closeable, it is Stale.

### Blocked

Body or comments name an unmet dependency. Propose the blocked label + a comment naming the blocker. Comment obeys **Comment Length** below.

### Healthy

Fully labelled (`type: *` present, recently touched). **Count only, do not list.** Why -> a report that lists everything is a report nobody reads.

## Label Resolution

Never hardcode the namespaced taxonomy. Detect it with the `gh label list` from Flow step 1, then resolve each intended label through its candidate chain, first existing name wins:

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
- `priority: *` only when the text signalled urgency. Never guess a priority
- Multi-word label names must be quoted: `--label "type: bug"`

## Report Format

Grouped by bucket, count in the heading, one line per issue, no prose between groups:

```
Unlabeled (4)
#42   catalog sort drops entries with no updated_at   ->  type: bug
#51   add rss feed to the site                        ->  type: enhancement
#58   kasetto sync skips unlisted mcps                ->  type: documentation
#63   pnpm audit noise on every ci run                ->  needs a human read

Unprioritized (2)
#42   catalog sort drops entries with no updated_at   ->  priority: high (data loss)
#51   add rss feed to the site                        ->  no signal, propose nothing

Stale (3)
#17   spike: alternate theme tokens                   ->  close, not planned
#23   revisit biome rule set                          ->  ping (11 comments)
#29   investigate turbopack build times               ->  leave

Likely Duplicate (1)
#61   sort order wrong on archived skills             ->  link #42 + status: duplicate

Closeable (2)
#34   pin engines.node in site/package.json           ->  close, completed (PR #77)
#39   drop the edge runtime from icon route           ->  close, completed (PR #81)

Blocked (1)
#48   migrate catalog reads to the new loader         ->  status: blocked + comment (waits on #34)

Healthy: 9
```

Titles truncate at 50 chars. Lead with: "N open, N actionable across M categories."

## Apply

Batched per category, after that category was accepted. `gh issue edit` takes many numbers in one call:

```bash
gh issue edit 42 58 --add-label "type: bug"
gh issue edit 42 --add-label "priority: high"
gh issue close 34 --reason completed --comment "Landed in #77"
gh issue close 17 --reason "not planned"
gh issue comment 48 --body "Blocked on #34 - the loader lands there first."
```

- Every close passes an explicit `--reason completed` or `--reason "not planned"`. Why -> without it GitHub records `completed`, so every abandoned spike reads in the timeline as shipped work
- Edit fails -> surface it, keep going with the rest of the batch, list it as skipped in step 8. No blind retry
- Comment bodies obey **Comment Length** - 4 lines, facts only

## Comment Length

Triage writes no issue bodies, only comments. **Hard cap: 4 lines of prose** per comment.

- State the fact and stop: what blocks it, which issue duplicates it, what evidence closed it
- One line each, 100 chars or fewer. No sub-bullets
- Link rather than summarize: `blocked by #38` beats a paragraph about #38

Prohibitions:

- State the fact, not the process. No "I reviewed this and determined that"
- No restating the issue title. The reader is looking at it
- Never invent a blocker, duplicate, or merged PR you did not verify
- No "just checking in on this", no apologizing for the triage pass

Good:

```markdown
Blocked by #38 - the label taxonomy has to land before this can resolve chains.
```

Bad - restates the title, narrates the triage, invents a timeline:

```markdown
I reviewed this issue as part of a backlog pass. The label chain problem
described in the title is still outstanding. We will need the taxonomy work
completed first. We should be able to revisit this in the next sprint.
```

## Delegation

- New standalone issue -> `git-issue-create`
- Picking a triaged issue up and branching -> `git-issue-start`
- A triaged issue too big to be one task -> `git-spec-plan`
- Local branch clutter, the same sweep shape one layer down -> `git-branches-cleanup`

## Rules

- Sweep is read-only. Nothing changes before a per-category confirm
- Never close an issue whose category the user did not accept. Partial acceptance is the normal outcome, not an edge case
- Never `gh label create`. Chain missing -> drop the label, name it in the report
- Never guess a priority. No urgency signal in the text -> no `priority: *`
- Never edit issue **titles** or **bodies**. Labels, assignees, state, and comments only. Why -> retitling other people's issues loses their words, and the tracker's value is that it records what they wrote
- Assignees change only on explicit ask. Unassigning someone is not grooming
- Never `gh issue view` in a loop. One batched list, per Flow step 1
- Closeable needs evidence - a merged PR or a verified non-repro. "Probably fixed" is Stale
- Healthy issues are counted, never listed
- Empty backlog -> say so and stop. Don't manufacture categories
