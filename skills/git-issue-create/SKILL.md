---
name: git-issue-create
description: >-
  Open one standalone GitHub issue with `gh` - duplicate-checked first, conventional title,
  repo-template-aware body, auto-resolved labels. Use for every issue-filing request however casual:
  "open an issue", "file a bug", "make a ticket", "/git-issue-create", "track this", "note this down",
  "we should fix X later", or whenever the user describes a defect or wanted capability that is
  clearly not being built right now. A raw `gh issue create` skips the duplicate search, label
  resolution, and body caps this skill owns. Boundary: work starting now goes to `git-branch-create`;
  an issue that already exists goes to `git-issue-start`.
  Creates the issue immediately without asking for confirmation.
tags: [git, github]
updated_at: 2026-09-17
---

# Git Issue Create

File one standalone issue. No confirm.

## Flow

1. Boundary check: is the work starting now? Yes -> hand off to `git-branch-create` (new work) or `git-issue-start` (issue already exists) and stop. Why -> an issue is a record of work deferred; work in flight belongs on a branch, and a second tracker entry for it just rots
2. Repo: `gh repo view --json nameWithOwner -q .nameWithOwner`. Fails -> stop, surface the error (no remote, no auth, not a repo). Never guess `owner/name`
3. Search for duplicates **before drafting anything**:
   ```bash
   gh issue list --search "<2-4 distinctive keywords>" --state all --limit 10 \
     --json number,title,state,url -q '.[] | "\(.number)\t\(.state)\t\(.title)"'
   ```
   `--state all` -> a closed issue is the answer often enough that skipping it files the same bug twice. Keywords are nouns from the user's description, not the whole sentence. 10 hits returned -> the search was too broad and real duplicates may sit past the cap; narrow the keywords and search again before proceeding
4. Triage the hits:
   - Strong match (same defect, same capability) -> print its number, title, state, URL. **Stop.** Offer to comment on it instead (<= 4 prose lines, see **Length**); reopening is the user's call, not this skill's. Why -> a duplicate backlog is worse than a missing issue: every triage pass afterwards pays for it
   - Adjacent match (related, not the same) -> proceed, link it in `## Context`
   - No hits -> proceed
5. Parallel:
   - Repo issue template: `.github/ISSUE_TEMPLATE/*.md`, `.github/ISSUE_TEMPLATE/*.yml`, `.github/issue_template.md`, root `issue_template.md` (first match wins)
   - `gh label list --limit 200 --json name -q '.[].name'`
6. Draft title per **Title**. Draft body:
   - Template found -> fill that template's structure (preserve headings, order, checklists, HTML comments). A `*.yml` form -> render its `label`/`attributes` as markdown headings in the same order
   - None found (the normal case) -> use [Fallback Body](#fallback-body) below
7. Resolve labels per **Labels**. Exactly one `type: *`
8. Heredoc body so markdown survives the shell:
   ```bash
   gh issue create --title "fix(auth): session drops on api deploy" --label "type: bug" --body "$(cat <<'EOF'
   ## Problem

   Sessions drop on every API deploy because the cookie is signed with a per-instance key.

   ## Done when

   - a session survives a rolling restart of all API pods
   - no change required to the `users` table
   EOF
   )"
   ```
   `'EOF'` quoted -> no shell interpolation, so `$`, backticks and `#` in the body survive intact
9. Print the issue URL. Name any label dropped in step 7 and why
10. User wants to start on it now -> hand off to `git-issue-start`

## Title

Same grammar as `git-commit` and `git-pr-create`:

```
<type>(<scope>): <short summary>
```

- Type: `build|chore|ci|docs|feat|fix|perf|refactor|test`. Type picks and tiebreakers live in `git-commit` - use that table, do not re-derive one
- Scope: optional, lowercase, one only
- Summary: imperative present, lowercase, no trailing `.`
- Whole title <= 72 chars

The title is the type signal: `fix(` is what makes `type: bug` the obvious label in step 7.

Examples:
- `fix(api): handle timeout on retry`
- `feat(catalog): filter skills by tag`
- `docs(readme): document the sync contract`

## Labels

Never hardcode the namespaced taxonomy - detect it. These rules run on forks and third-party repos too.

Fetch once per run:

```bash
gh label list --limit 200 --json name -q '.[].name'
```

Resolve each intended label through its candidate chain, first existing name wins:

| Intent | Candidate chain |
| --- | --- |
| `feat` | `type: enhancement` -> `enhancement` -> `feature` |
| `fix` | `type: bug` -> `bug` |
| `docs` | `type: documentation` -> `documentation` -> `docs` |
| `perf` | `performance` -> `type: enhancement` -> `enhancement` |
| `refactor` / `chore` / `build` / `ci` | `type: maintenance` -> `maintenance` -> `chore` |
| `test` | `type: maintenance` -> `tests` -> `test` |
| breaking change | `type: breaking` -> `breaking-change` -> `breaking` |
| dependency bump | `type: dependencies` -> `dependencies` -> `deps` |
| security | `type: security` -> `security` |
| priority | `priority: <level>` -> `<level> priority` -> `<level>` |
| blocked | `status: blocked` -> `blocked` |
| duplicate | `status: duplicate` -> `duplicate` |

- Whole chain missing -> drop that label and say so in the output. Never `gh label create`
- Exactly one `type: *` per issue. Pick the dominant type, never two
- `priority: *` only when the user signalled urgency. Never guess a priority
- Multi-word names must be quoted: `--label "type: bug"`

## Body - Repo Template Present

- Template verbatim as the skeleton: headings, order, checklist items, HTML comments
- Fill only the fields the user actually gave you. A required field you cannot answer -> ask, do not invent
- Tick checklist items that apply; leave the rest unchecked
- `*.yml` form with a `labels:` key -> those labels are additive to step 7, and still go through the candidate chains

## Fallback Body

No template found - the normal case. Fill [references/issue-body.md](references/issue-body.md).

Optional, only when it carries a fact:

- `## Context` - <= 2 lines, links to prior issues, PRs, ADRs
- `## Out of scope` - <= 2 lines, the adjacent thing a reader would otherwise assume is included

Never emit an empty placeholder section. Drop it.

Acceptance criteria you were not told -> ask, or omit `## Done when`. Why -> an invented criterion is worse than a missing one: it closes the issue on the wrong condition.

## Length

**Hard cap: 8 lines of prose** for an issue body, **4** for a comment on an existing one. Headings and code blocks don't count - only text you write.

- `## Problem`: 1-3 lines. What is wrong and what it costs. Not the fix
- `## Done when`: one bullet per condition, one line each, 100 chars or fewer. No sub-bullets, no paragraph bullets
- Any other section: <= 2 lines, or drop it
- Nothing to say -> drop the section. An empty section is information, filler is not

Prohibitions:

- **Why it exists and what "done" means**, not how - the code shows how
- No restating the title. The reader just read it
- No play-by-play ("first X, then Y"). No file inventories, no code dumps
- Never invent acceptance criteria, paths, or repro steps. Unknown -> ask or omit

Good:

```markdown
## Problem

`kst sync` silently skips new MCP files because `kasetto.yaml` enumerates them by name.

## Done when

- adding `mcps/<name>.json` syncs without editing `kasetto.yaml`
- the site and the sync agree on which MCPs exist
```

Bad - filler opener, restates the title, narrates the work, invents criteria:

```markdown
## Problem

This issue tracks the comprehensive implementation of a more robust MCP sync
mechanism. Currently the existing configuration leverages an enumeration-based
approach which presents certain challenges.

## Done when

- First we will investigate how kasetto.yaml is parsed
- Then we will design a holistic solution
- Finally we will ensure that all 6 MCP servers sync seamlessly
```

## Rules

- Duplicate search runs before the body is drafted. Why -> drafting first makes you argue for filing it
- Strong duplicate -> stop and surface it. Never file a near-duplicate "to be safe"
- Never `gh label create`. Chain missing -> drop the label, report it
- Exactly one `type: *` label. Two type labels break every triage query
- Never invent acceptance criteria, file paths, numbers, or repro steps. Unknown -> ask or omit
- Never `--assignee` / `--milestone` / `--project` unless asked. Self-assigning implies you are starting, which is `git-issue-start`
- Body over 8 prose lines -> cut before creating, not after
- One issue per invocation. A list of separate problems -> one issue each, filed one at a time
- Never close or edit an existing issue from this skill
- No "Generated with Claude Code" or co-author trailers
