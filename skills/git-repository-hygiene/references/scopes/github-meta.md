<!--
=== Scope: github-meta ===
Audience: agents and humans applying the git-repository-hygiene standard.
Purpose:  Own repository settings via gh api (merge methods, default branch, feature toggles).
Read-when: scope=github-meta is invoked; or when the user asks about squash merge, default branch, or repository settings.
=== end ===
-->

# Scope: github-meta

Out-of-tree (GitHub-side) repository settings. Always rebase, never merge — squash-only on PRs.

`FUNDING.yaml` and `CODEOWNERS` are NOT in canon — repositories stay clean of both.

## Owns

Out-of-tree (via `gh api repos/<owner>/<name>`):

- `default_branch`
- merge methods (squash on, merge off, rebase off)
- `delete_branch_on_merge`, `allow_auto_merge`, `allow_update_branch`
- feature toggles: `has_issues`, `has_projects`, `has_wiki`, `has_discussions`

NOT owned: branch protection (v2), repository secrets, deploy keys, webhooks, GitHub Pages, org-level settings, `.github/FUNDING.yaml`, `.github/CODEOWNERS`.

## Canon

Canonical settings (always applied):

- `default_branch = main`
- `allow_squash_merge = true`, `allow_merge_commit = false`, `allow_rebase_merge = false`
- `delete_branch_on_merge = true`
- `allow_auto_merge = true`
- `allow_update_branch = true`
- `has_projects = false`, `has_wiki = false`, `has_discussions = false`
- `has_issues = true`

## Stack matrix

Applies to every stack — `python-lib`, `rust-cli`, `next-site`, `shared-pkg`. Settings applied uniformly. Root-only. Composite -> one set of settings per repository.

## Scaffolding notes

- Settings applied via `gh api repos/<owner>/<name>` GET then per-key PATCH; needs `repo` scope on the token
- Default branch rename is NOT automatic — if the current default is not `main`, do the rename + branch-ref migration by hand
- Feature toggles are idempotent; re-applying is a no-op when state already matches
- If `.github/FUNDING.yaml` or `.github/CODEOWNERS` exist in a target repository, flag for deletion — neither is part of the standard

## Things to know

- Older repositories may carry merge commits in history — flipping `allow_merge_commit = false` is forward-only; history is untouched
- Missing `repo` scope on the token -> settings cannot be applied; surface instructions to the user
