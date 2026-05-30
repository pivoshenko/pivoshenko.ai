<!--
=== Scope: issue-templates ===
Audience: agents and humans applying the repository-hygiene standard.
Purpose:  Own issue forms + PR template under .github/.
Read-when: scope=issue-templates is invoked; or when the user asks about issue forms, PR template, or .github/ISSUE_TEMPLATE setup.
=== end ===
-->

# Scope: issue-templates

Issue forms (yaml), PR template (md). Triple-dash filename prefix forces stable sort ahead of GitHub's auto-blank template entry.

## Owns

- `.github/ISSUE_TEMPLATE/---bug-report.yaml`
- `.github/ISSUE_TEMPLATE/---feature-request.yaml`
- `.github/ISSUE_TEMPLATE/---documentation.yaml`
- `.github/ISSUE_TEMPLATE/config.yaml`
- `.github/PULL_REQUEST_TEMPLATE.md`

## Canon

- `assets/ISSUE_TEMPLATE/---bug-report.yaml`
- `assets/ISSUE_TEMPLATE/---feature-request.yaml`
- `assets/ISSUE_TEMPLATE/---documentation.yaml`
- `assets/ISSUE_TEMPLATE/config.yaml` — contact links + `blank_issues_enabled: false`
- `assets/PULL_REQUEST_TEMPLATE.md`

No tokens. Files ship verbatim.

## Stack matrix

Applies to every stack — `python-lib`, `rust-cli`, `next-site`, `shared-pkg`. Root-only. Composite -> single set under `.github/`.

## Drift detection

- `missing` -> any of the five files absent
- `drift` -> byte diff vs canon (label list, body schema, validation rules)
- `extra` -> additional templates beyond the canonical three -> preserved as `extra`, flagged
- `external` -> n/a

## Edge cases

- Filename prefix `---` is load-bearing — files sort lexicographically; the triple dash floats them above any auto-generated "Open a blank issue" entry
- `.yml` vs `.yaml` -> canon uses `.yaml`; `.yml` flagged as `drift` (rename on fix)
- Repositories migrating from old Markdown templates -> delete the `.md` versions when forms are written
- `config.yaml` sets `blank_issues_enabled: false` — repositories that want blank issues must opt out via `skip:`
- PR template kept short; sections it owns: Summary, Related, Checklist. Custom checklist rows -> `extra`, preserved
