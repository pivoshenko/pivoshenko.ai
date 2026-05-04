---
name: create-pr
description: Create a GitHub pull request using `gh` with a conventional title and a structured body. Use when the user asks to create a PR, open a pull request, /create-pr, or ship the current branch. Pushes the branch and opens the PR immediately without asking for confirmation.
---

# Create PR

Open a GitHub pull request for the current branch directly — no confirmation prompts.

## Workflow

1. Run the following in parallel to understand branch state:
   - `git status`
   - `git branch --show-current`
   - `git log <base>..HEAD --oneline` (where `<base>` is `main`, falling back to `master`)
   - `git diff <base>...HEAD`
2. If the branch has no commits ahead of base, stop and tell the user there's nothing to PR.
3. If the branch is not pushed or is behind its remote, push with `git push -u origin <branch>`.
4. Analyze **all** commits on the branch (not just the latest) and draft:
   - A **title** following the Title Format below (under 70 characters).
   - A **body** following the Body Template below.
5. Open the PR with `gh pr create --title "..." --body "$(cat <<'EOF' ... EOF)"`.
6. Print the resulting PR URL.

## Title Format

Mirror the conventional commit format used in this workspace:

```
<type>(<scope>): <short summary>
```

- `<type>`: one of `build|ci|docs|feat|fix|perf|refactor|test`
- `<scope>`: optional; the affected area, module, or package
- `<short summary>`: imperative present tense, lowercase, no trailing period
- Total length: under 70 characters

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

- Keep the summary tight — the diff explains the what; the body explains the why.
- If no related issue exists, remove the `**Resolves: ...**` line rather than leaving a placeholder.
- Drop the `## Screenshots` section when the change has no UI impact, and `## Additional Notes` when there's nothing extra to say.
- Add a `## Breaking changes` section above `## Additional Notes` only if there are breaking changes, with a migration note.

## Rules

- Never push to or open PRs against `main`/`master` from `main`/`master`. If the current branch is the base branch, stop and ask the user to create a feature branch first (the `create-branch` skill can do this).
- Never force-push as part of this skill.
- Never use `--no-verify` or skip hooks unless the user explicitly requests it.
- If pre-push or PR creation fails, surface the error and fix the root cause — do not retry blindly.
- Do not request reviewers, add labels, or assign the PR unless the user asks.
- Do not include "Generated with Claude Code" or co-author trailers in the PR body unless the user asks.
