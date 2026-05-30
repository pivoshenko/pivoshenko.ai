---
name: git-pr-create
description: Create a GitHub pull request using `gh` with a conventional title and a structured body. Use when the user asks to create a PR, open a pull request, /git-pr-create, or ship the current branch. Also trigger on "ship this", "raise a PR", "send for review", "open a pull request for this branch", "let's merge this", or whenever the user signals work on a feature branch is ready for review. Pushes the branch and opens the PR immediately without asking for confirmation.
tags: [git, github]
updated_at: 2026-05-30
---

# Create PR

Open GitHub PR for current branch. No confirm.

## Flow

1. Parallel:
   - `git status`
   - `git branch --show-current`
   - `git log <base>..HEAD --oneline` (`<base>` = user-named, else `main`, fallback `master`)
   - `git diff <base>...HEAD`
2. 0 commits ahead -> stop. Tell user: nothing to PR; commit first via `git-commit`.
3. Not pushed / behind -> `git push -u origin <branch>`.
4. Read **all** branch commits (not just latest). Draft title + body.
5. Heredoc body so markdown survives shell:
   ```bash
   gh pr create --title "feat(auth): add oauth login flow" --body "$(cat <<'EOF'
   # Pull Request Checklist

   **Resolves: #123**

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
6. Print PR URL.

## Title

Same as commits:

```
<type>(<scope>): <short summary>
```

- type: `build|chore|ci|docs|feat|fix|perf|refactor|test` (same set + picks as `git-commit`)
- scope: optional
- summary: imperative present, lowercase, no `.`
- Total < 70 chars.

Examples:
- `feat(auth): add oauth login flow`
- `fix(api): handle timeout on retry`
- `refactor: extract user service`

## Body template

```markdown
# Pull Request Checklist

**Resolves: #<n>**

## Summary

<1–3 bullets. Why > what.>

## Checklist

- [ ] My code follows the project style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings or errors

## Screenshots (if applicable)

<!-- Add screenshots to help explain your changes if UI is affected -->

## Additional Notes

<!-- Add any other context or information for reviewers -->
```

- Diff = what. Body = why.
- No issue -> drop `**Resolves: ...**`. No placeholder.
- No UI -> drop `## Screenshots`. Nothing extra -> drop `## Additional Notes`.
- Breaking -> add `## Breaking changes` above `## Additional Notes` + migration.
- Checklist -> match repository template. Drop items not enforced.

## Rules

- Never PR from `main`/`master` against `main`/`master`. On base -> stop + ask user to branch (use `git-branch-create`).
- Never force-push here.
- Never `--no-verify` unless asked. Why -> pre-push hooks gate CI and secret scans; skipping ships broken code.
- Push or PR-create fail -> surface + fix root cause. No blind retry.
- No reviewers / labels / assignees unless asked.
- No "Generated with Claude Code" / co-author trailers unless asked.
