<!--
=== Scope: github-meta ===
Audience: agents and humans applying the repository-hygiene standard.
Purpose:  Own FUNDING.yaml + CODEOWNERS + repository settings via gh api (merge methods, default branch, feature toggles).
Read-when: scope=github-meta is invoked; or when the user asks about FUNDING, CODEOWNERS, squash merge, default branch, or repository settings.
=== end ===
-->

# Scope: github-meta

In-tree files + out-of-tree (GitHub-side) repository settings. Always rebase, never merge — squash-only on PRs.

## Owns

In-tree:

- `.github/FUNDING.yaml`
- `.github/CODEOWNERS` (opt-in per-repository)

Out-of-tree (via `gh api repos/<owner>/<name>`):

- `default_branch`
- merge methods (squash on, merge off, rebase off)
- `delete_branch_on_merge`, `allow_auto_merge`, `allow_update_branch`
- feature toggles: `has_issues`, `has_projects`, `has_wiki`, `has_discussions`

NOT owned: branch protection (v2), repository secrets, deploy keys, webhooks, GitHub Pages, org-level settings.

## Canon


- `assets/FUNDING.yaml` — canon (`github: pivoshenko`); per-repository additions allowed
- CODEOWNERS — opt-in per-repository; canon body composed from owner handle

Canonical settings (always applied):

- `default_branch = main`
- `allow_squash_merge = true`, `allow_merge_commit = false`, `allow_rebase_merge = false`
- `delete_branch_on_merge = true`
- `allow_auto_merge = true`
- `allow_update_branch = true`
- `has_projects = false`, `has_wiki = false`, `has_discussions = false`
- `has_issues = true`

## Stack matrix

Applies to every stack — `python-lib`, `rust-cli`, `next-site`, `shared-pkg`. Settings + FUNDING.yaml applied uniformly. Root-only. Composite -> single FUNDING.yaml, single CODEOWNERS, one set of settings per repository.

## Drift detection

- `missing` -> FUNDING.yaml absent (CODEOWNERS only when opted in)
- `drift` -> FUNDING.yaml diff vs canon; CODEOWNERS diff vs composed canon; setting on GitHub diverges from canon
- `extra` -> repository has CODEOWNERS without opt-in -> preserved, flagged
- `external` -> setting requires `gh api` PATCH and token lacks `repo` scope -> instructions printed; `fixable: false`

## Edge cases

- Workflow: in-tree files via diff + Write; settings via `gh api repos/<owner>/<name>` GET then per-key PATCH
- Older repositories may carry merge commits in history — flipping `allow_merge_commit = false` is forward-only; history is untouched
- `gh api` requires `repo` scope; missing scope -> `external` + instructions
- Default branch rename: if existing default is not `main`, scope refuses to auto-rename (manual + branch-ref migration needed); only flags
- FUNDING.yaml override: per-repository additions (e.g. `custom: [...]`) supersede canon body but file is still managed
- CODEOWNERS opt-in default off — most personal repositories don't need it; opt-in on shared / multi-author repositories
- Feature toggle changes are idempotent — re-running fix is a no-op when state already matches
