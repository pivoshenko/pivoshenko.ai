---
name: git-pr-create
description: Create a GitHub pull request using `gh` with a conventional title and a structured body. Use when the user asks to create a PR, open a pull request, /git-pr-create, or ship the current branch. Also trigger on "ship this", "raise a PR", "send for review", "open a pull request for this branch", "let's merge this", or whenever the user signals work on a feature branch is ready for review. Pushes the branch and opens the PR immediately without asking for confirmation.
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
- Always add at least one label (mapped from title `<type>`, verified to exist via `gh label list`). No reviewers / assignees unless asked.
- No "Generated with Claude Code" / co-author trailers unless asked.
