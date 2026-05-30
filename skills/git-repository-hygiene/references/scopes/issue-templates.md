<!--
=== Scope: issue-templates ===
Audience: agents and humans applying the git-repository-hygiene standard.
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

Applies to every stack — `python-lib`, `rust-cli`, `next-site`, `shared-pkg`. Root-only. Composite -> single set under `.github/`. Archetype `puzzles`: applies normally (puzzle repositories still benefit from a PR template).

## Scaffolding notes

- Lands under `.github/ISSUE_TEMPLATE/` and `.github/PULL_REQUEST_TEMPLATE.md`. Safe to overwrite — canon is verbatim.
- Filename prefix `---` is load-bearing: files sort lexicographically and the triple dash floats them above any auto-generated "Open a blank issue" entry. Don't rename.
- Use `.yaml`, not `.yml`. If migrating from old Markdown templates, delete the `.md` versions after writing the forms.
- `config.yaml` sets `blank_issues_enabled: false`. Override only if the repository explicitly wants blank issues.
- PR template owns: Summary, Related, Checklist. Custom checklist rows are fine to add when merging into an existing template.
