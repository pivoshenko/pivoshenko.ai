---
name: git-pr-create
description: >-
  Open a GitHub pull request for the current branch using `gh` — conventional title, repo-template-aware body, auto-derived labels, push if needed. Use for every PR-creation request no matter how casual: "create/open/make/raise a PR", "PR this", "PR please", "send PR", "/git-pr-create", "open pull request", "ship this", "ship it", "send for review", "ready for review", "submit this", "publish this branch", or whenever the user signals work on a feature branch should leave their machine and go to GitHub. A one-liner ask still counts — this skill owns the whole flow (push, label derivation, title format, body template, safety rules), so reaching for a raw `gh pr create` skips all of it. Boundary with `git-commit`: an explicitly local framing ("commit this", "save my work", "ship this locally") stops at a commit and is `git-commit`'s, not this skill's. Pushes the branch and opens the PR immediately without asking for confirmation.
tags: [git, github]
updated_at: 2026-09-11
---

# Create PR

Open GitHub PR for current branch. No confirm.

## Flow

1. Base: user names one -> use it. Else detect: `git symbolic-ref --short refs/remotes/origin/HEAD` -> strip the `origin/`; ref missing -> `git remote set-head origin -a`, re-read; no remote -> `main`, fall back `master`. Why -> a wrong base makes the PR diff include commits that aren't yours.
2. `git fetch origin <base>`. Why -> everything below compares against `origin/<base>`, not the local ref: the local base is often stale or absent entirely (`git-branch-create` branches off `origin/<base>` without ever creating it), so a local-ref diff either errors or replays commits already merged.
3. Parallel:
   - `git status`
   - `git branch --show-current`
   - `git log origin/<base>..HEAD --oneline`
   - `git diff origin/<base>...HEAD`
   - linked issue, three sources, merged and deduped: the branch link `git config --get branch.$(git branch --show-current).issue` (`git-issue-start` records it there), the branch's commit footers `git log origin/<base>..HEAD --format=%B | grep -oiE '(closes|fixes|resolves) #[0-9]+'`, and a trailing ticket id on the branch name (`git-branch-create`'s optional `-PROJ-123` suffix). Why -> `git-issue-start` opens the branch from an issue and `git-commit` writes the closing trailer, so the number is already on the branch; nobody retypes it
     - exactly 1 distinct issue -> fill the `Resolves:` line with it
     - more than 1 -> first fills `Resolves:`, the rest become `Refs: #<n>` lines under it. Why -> a PR closing several issues is normal, but only the primary one belongs in the template's Resolves slot
     - none -> drop the line entirely. Never emit a `#<n>` placeholder
   - check repo PR template: `.github/PULL_REQUEST_TEMPLATE.md`, `.github/pull_request_template.md`, `docs/PULL_REQUEST_TEMPLATE.md`, root `PULL_REQUEST_TEMPLATE.md` (first match wins)
4. 0 commits ahead -> stop. Tell user: nothing to PR; commit first via `git-commit`.
5. Not pushed / behind -> `git push -u origin <branch>`.
6. Read **all** branch commits (not just latest). Draft title + body.
   - Template found -> fill that template's structure (preserve headings, checklist items, comment placeholders).
   - No template -> use [fallback body](#fallback-body-template) below.
7. Derive labels (always pass `--label`):
   - Fetch the repo's labels once: `gh label list --limit 200 --json name -q '.[].name'`. Why -> detection, not hardcoding: this skill syncs globally and runs on forks and third-party repos, where the bare names exist and a namespaced taxonomy does not
   - Resolve the title `<type>` through its candidate chain, first existing name wins:

     | Intent | Candidate chain |
     | --- | --- |
     | `feat` | `type: enhancement` -> `enhancement` -> `feature` |
     | `fix` | `type: bug` -> `bug` |
     | `docs` | `type: documentation` -> `documentation` -> `docs` |
     | `perf` | `type: enhancement` -> `performance` -> `enhancement` |
     | `refactor` / `chore` / `build` / `ci` | `type: maintenance` -> `maintenance` -> `chore` |
     | `test` | `type: maintenance` -> `tests` -> `test` |
     | breaking change in commits/body | `type: breaking` -> `breaking-change` -> `breaking` |

   - Whole chain missing -> drop that label and say which in the output. Never `gh label create`
   - Exactly one `type: *` label per PR -> title type and breaking both resolving to `type: *` names, breaking wins and the title-type label is dropped
   - At least 1 label required -> all dropped, resolve the fallback chain `type: maintenance` -> `maintenance` -> `chore`. Nothing in it exists either -> surface to user and stop
   - Multi-word names must be quoted: `--label "type: bug"`
8. Heredoc body so markdown survives shell:
   ```bash
   gh pr create --base main --title "feat(auth): add oauth login flow" --label "type: enhancement" --body "$(cat <<'EOF'
   # Pull Request Checklist

   <!-- Resolves: #123 -->

   ## Summary

   - swap session cookies for OAuth flow against Google provider
   - persist user via existing `users` table

   ## Checklist

   - [ ] My code follows the project style guidelines
   - [ ] I have performed a self-review of my code
   EOF
   )"
   ```
   `'EOF'` quoted -> no shell interpolation. `--base` always passed explicitly -> without it `gh` targets the repo's default branch, silently ignoring a base the user named.
9. Print PR URL.

## Title

Same as commits:

```
<type>(<scope>): <short summary>
```

- type: `build|chore|ci|docs|feat|fix|perf|refactor|test` (same set + picks as `git-commit`)
- scope: optional
- summary: imperative present, lowercase, no `.`
- Whole title ≤ 72 chars (matches `git-commit` header limit).

Examples:
- `feat(auth): add oauth login flow`
- `fix(api): handle timeout on retry`
- `refactor: extract user service`

## Body — Repo Template Present

- Use the repo template verbatim as the skeleton (headings, order, checklist items, HTML comments).
- Fill `Summary` with 1–3 bullets, why > what. Obey **Length** below.
- Tick checklist items that actually apply; leave the rest unchecked.
- Template has a `Resolves:` / `Closes:` / `Fixes:` line -> fill it with the issue detected in step 3, extras as `Refs: #<n>` lines under it; nothing detected -> drop the line entirely (no `#<n>` placeholder).
- Preserve untouched any sections you have no content for (e.g. empty `Screenshots`), unless template explicitly says "remove if N/A".
- Extra prose headings (`Context`, `Testing`, `Notes`, ...) -> ≤ 2 lines each, or leave the placeholder. Never one paragraph per heading.

## Fallback Body Template

Use when no repo template exists:

```markdown
# Pull Request Checklist

<!-- Optional — uncomment if this PR closes an issue -->
<!-- Resolves: #issue-number-here -->

## Summary

<1–3 bullets. Why > what.>

## Checklist

- [ ] My code follows the project style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings or errors
```

- Diff = what. Body = why.
- Issue detected in step 3 -> uncomment the `Resolves:` line, fill the first number, extras as `Refs: #<n>` lines under it. None detected -> leave both comment lines out.
- Breaking -> add `## Breaking changes` section + migration notes.

## Length

**Hard cap: 10 lines of prose** for the whole body. Headings, checklists and template boilerplate don't count — only text you write.

- `Summary`: 1–3 bullets, **one line each, ≤ 100 chars**. No sub-bullets, no paragraph bullets. Why the char cap -> GitHub soft-wraps, so "one line" alone doesn't bound anything.
- `Breaking changes`: ≤ 5 lines including migration steps.
- Any other prose section: ≤ 2 lines, or leave its placeholder untouched.
- Nothing to say -> leave the section empty. Silence beats filler.

Prohibitions:

- **Why**, not what — the diff shows what.
- No restating the title. No file lists, no code dumps, no diff walkthrough.
- No play-by-play ("first X, then Y"). No "this PR does ...".
- No test-plan narration unless the template asks for one.

Good:

```markdown
## Summary

- swap session cookies for OAuth so sessions survive the API split
- reuse the existing `users` table; no migration needed
```

Bad — one paragraph per bullet, narrates the diff:

```markdown
## Summary

- This pull request implements a comprehensive OAuth login flow. It
  replaces the previous session-cookie approach in `auth/session.ts`
  with a new `OAuthProvider` class that handles the token exchange.
- Changes include: adding `oauth.ts`, updating `middleware.ts`,
  refactoring `validateSession`, and updating the auth tests.
```

## Rules

- Always pass `--base <base>` — the same base resolved in step 1. Never let `gh` infer it.
- Never PR from `main`/`master` against `main`/`master`. On base -> stop + ask user to branch (use `git-branch-create`).
- Never force-push here.
- Never `--no-verify` unless asked. Why -> pre-push hooks gate CI and secret scans; skipping ships broken code.
- Push or PR-create fail -> surface + fix root cause. No blind retry.
- Always add at least one label (resolved from title `<type>` through its candidate chain against `gh label list`). Multi-word labels -> quote: `--label "type: bug"`. No reviewers / assignees unless asked.
- Open as ready-for-review (no `--draft`) unless user explicitly asks for a draft PR.
- Body over 10 prose lines -> cut before creating. No "comprehensive" PR descriptions. Body prose obeys **Length**.
- No "Generated with Claude Code" / co-author trailers unless asked.
