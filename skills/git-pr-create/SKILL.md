---
name: git-pr-create
description: >-
  Open a GitHub pull request for the current branch using `gh` — conventional title, repo-template-aware body, auto-derived labels, push if needed. ALWAYS invoke this skill for ANY PR-creation request, no matter how short or casual. Trigger on every phrasing: "create a PR", "open a PR", "make a PR", "raise a PR", "PR this", "PR please", "let's PR", "send PR", "/git-pr-create", "push and open a PR", "open pull request", "ship this", "ship it", "send for review", "ready for review", "let's merge this", "submit this", "publish this branch", "open a pull request for this branch", or whenever the user signals work on a feature branch should leave their machine and go to GitHub. Do NOT call `gh pr create` directly — this skill owns the entire flow (push, label derivation, title format, body template, safety rules). Even when the request looks like a trivial one-liner, prefer this skill over a raw `gh` call. Pushes the branch and opens the PR immediately without asking for confirmation.
tags: [git, github]
updated_at: 2026-06-04
---

# Create PR

Open GitHub PR for current branch. No confirm.

## Flow

1. Parallel:
   - `git status`
   - `git branch --show-current`
   - `git log <base>..HEAD --oneline` (`<base>` = user-named, else `main`, fallback `master`)
   - `git diff <base>...HEAD`
   - check repo PR template: `.github/PULL_REQUEST_TEMPLATE.md`, `.github/pull_request_template.md`, `docs/PULL_REQUEST_TEMPLATE.md`, root `PULL_REQUEST_TEMPLATE.md` (first match wins)
2. 0 commits ahead -> stop. Tell user: nothing to PR; commit first via `git-commit`.
3. Not pushed / behind -> `git push -u origin <branch>`.
4. Read **all** branch commits (not just latest). Draft title + body.
   - Template found -> fill that template's structure (preserve headings, checklist items, comment placeholders).
   - No template -> use [fallback body](#fallback-body-template) below.
5. Derive labels (always pass `--label`):
   - Map title `<type>` -> label: `feat`->`enhancement`, `fix`->`bug`, `docs`->`documentation`, `test`->`tests`, `perf`->`performance`, `refactor`->`refactor`, `build`->`build`, `ci`->`ci`, `chore`->`chore`.
   - Breaking change in commits/body -> add `breaking-change`.
   - Verify labels exist: `gh label list --json name -q '.[].name'`. Drop any missing; never auto-create.
   - At least 1 label required -> if all dropped, fall back to `chore`. If `chore` also missing, surface to user and stop.
6. Heredoc body so markdown survives shell:
   ```bash
   gh pr create --title "feat(auth): add oauth login flow" --label enhancement --body "$(cat <<'EOF'
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
   `'EOF'` quoted -> no shell interpolation.
7. Print PR URL.

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

## Body — repo template present

- Use the repo template verbatim as the skeleton (headings, order, checklist items, HTML comments).
- Fill `Summary` with 1–3 bullets, why > what.
- Tick checklist items that actually apply; leave the rest unchecked.
- If template has a `Resolves:` / `Closes:` / `Fixes:` line and there's a linked issue, fill the number; else drop that line entirely (no `#<n>` placeholder).
- Preserve untouched any sections you have no content for (e.g. empty `Screenshots`), unless template explicitly says "remove if N/A".

## Fallback body template

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
- Linked issue -> uncomment `Resolves:` line and fill number.
- Breaking -> add `## Breaking changes` section + migration notes.

## Rules

- Never PR from `main`/`master` against `main`/`master`. On base -> stop + ask user to branch (use `git-branch-create`).
- Never force-push here.
- Never `--no-verify` unless asked. Why -> pre-push hooks gate CI and secret scans; skipping ships broken code.
- Push or PR-create fail -> surface + fix root cause. No blind retry.
- Always add at least one label (mapped from title `<type>`, verified to exist via `gh label list`). Multi-word labels -> quote: `--label "needs review"`. No reviewers / assignees unless asked.
- Open as ready-for-review (no `--draft`) unless user explicitly asks for a draft PR.
- No "Generated with Claude Code" / co-author trailers unless asked.
