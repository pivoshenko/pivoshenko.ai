<!--
=== Scope: labels ===
Audience: agents and humans applying the repository-hygiene standard.
Purpose:  Own GitHub issue labels + the sync workflow that mirrors them from yaml.
Read-when: scope=labels is invoked; or when the user asks about issue labels, triage namespaces, or the labeler workflow.
=== end ===
-->

# Scope: labels

15 labels across three namespaces: `type:`, `priority:`, `status:`. No `area:` namespace — area lives in commit scope (`feat(auth):`).

## Owns

- `.github/labels.yaml`
- `.github/workflows/labels.yaml`

## Canon

- `assets/labels.yaml` — 15 labels, full definitions (name, color, description)
- `assets/workflows/labels.yaml` — sync workflow using `crazy-max/ghaction-github-labeler`, additive (`delete-extra-labels: false`)

No tokens. Files ship verbatim.

## Stack matrix

Applies to every stack — `python-lib`, `rust-cli`, `next-site`, `shared-pkg`. Composite repositories -> single root `.github/labels.yaml`. Archetype `puzzles`: applies normally.

## Scaffolding notes

- Drop `labels.yaml` at `.github/labels.yaml` and the workflow at `.github/workflows/labels.yaml`. Safe to overwrite both — canon is the source of truth for label definitions.
- Sync is additive (`delete-extra-labels: false`): pre-existing human-added labels survive, and GitHub default labels (`bug`, `enhancement`) remain until manually pruned. Canon labels supersede by name on next sync.
- Workflow triggers: push to `main` touching `.github/labels.yaml` + manual `workflow_dispatch`. After first scaffold, run `workflow_dispatch` once to seed.
- Renaming a label in canon creates a NEW label on next sync; old label keeps issues attached (manual relabel needed).
- `area:` requests -> reject; channel into commit scope instead.
