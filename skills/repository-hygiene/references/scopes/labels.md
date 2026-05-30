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

Applies to every stack — `python-lib`, `rust-cli`, `next-site`, `shared-pkg`. Composite repositories -> single root `.github/labels.yaml`.

## Drift detection

- `missing` -> either file absent
- `drift` -> byte diff vs canon (label name / color / description change loses)
- `extra` -> labels on GitHub UI not in `labels.yaml` -> preserved (sync is additive); flagged for review only
- `external` -> labels.yaml present but workflow never ran on GitHub -> emits instruction to push or manually invoke

## Edge cases

- Sync is additive by design: `delete-extra-labels: false` keeps human-added labels alive; canon never destroys ad-hoc triage
- Repository with pre-existing custom namespace (e.g. `bug`, `enhancement` defaults) -> canon supersedes name; old labels remain visible until manually pruned on GitHub
- `area:` requests -> reject; channel into commit scope instead
- Renaming a label in canon -> creates a NEW label on next sync; old label keeps any existing issues attached (manual relabel needed)
- Workflow trigger: push to `main` touching `.github/labels.yaml` + manual `workflow_dispatch`
