---
name: create-pr
description: Create a GitHub pull request using `gh` with a conventional title and a structured body. Use when the user asks to create a PR, open a pull request, /create-pr, or ship the current branch. Also trigger on "ship this", "raise a PR", "send for review", "open a pull request for this branch", "let's merge this", or whenever the user signals work on a feature branch is ready for review. Pushes the branch and opens the PR immediately without asking for confirmation.
tags: [git, github]
updated_at: 2026-05-30
---

# Create PR

Open GitHub PR for current branch. No confirm.

## Workflow

1. Parallel -> read branch state:
   - `git status`
   - `git branch --show-current`
   - `git log <base>..HEAD --oneline` (`<base>` = `main`, fallback `master`)
   - `git diff <base>...HEAD`
2. No commits ahead of base -> stop. Tell user nothing to PR.
3. Not pushed / behind remote -> `git push -u origin <branch>`.
4. Read **all** branch commits (not just latest). Draft:
   - **Title** per Title Format. Under 70 chars.
   - **Body** per Body Template.
5. Pass body via heredoc so markdown formatting survives shell quoting:
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
   Single-quoted `'EOF'` -> no shell interpolation inside body.
6. Print PR URL.

## Title Format

Same convention as commits:

```
<type>(<scope>): <short summary>
```

- `<type>`: `build|ci|docs|feat|fix|perf|refactor|test`
- `<scope>`: optional. Affected area/module/pkg.
- `<short summary>`: imperative present, lowercase, no trailing `.`
- Total < 70 chars.

Examples:
- `feat(auth): add oauth login flow`
- `fix(api): handle timeout on retry`
- `refactor: extract user service`

## Body Template

```markdown
# Pull Request Checklist

**Resolves: #<issue-number-here>**

## Summary

<1–3 bullets describing what changed and why. Focus on the why.>

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

- Summary tight. Diff = what. Body = why.
- No related issue -> remove `**Resolves: ...**` line. No placeholder.
- No UI change -> drop `## Screenshots`. Nothing extra -> drop `## Additional Notes`.
- Breaking changes -> add `## Breaking changes` above `## Additional Notes` + migration note.
- Checklist tailored to repo template — drop items not enforced (e.g. no docs site -> drop docs line). Don't pad with items that don't apply.

## Rules

- Never push/open PR against `main`/`master` from `main`/`master`. On base -> stop + ask user to make feature branch (use `create-branch` skill).
- Never force-push here.
- Never `--no-verify` / skip hooks unless asked.
- Pre-push or PR create fail -> surface error + fix root cause. No blind retry.
- No reviewers, labels, assignees unless asked.
- No "Generated with Claude Code" / co-author trailers unless asked.
