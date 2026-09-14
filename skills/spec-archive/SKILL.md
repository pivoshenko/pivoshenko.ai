---
name: spec-archive
description: >-
  Fold a completed OpenSpec change into the project's specs, commit the move, and open the PR - the
  last link in the spec chain. Wraps `/opsx:archive`, which is git-blind. Use when the user says
  "archive the change", "archive that spec", "/spec-archive", "fold this into the specs", "close out
  the change", "it's done, land it", "finish the spec", or points at a change whose tasks are all
  ticked and whose code is verified. Gates on real task progress before archiving anything. Boundary:
  tasks still unticked -> `spec-apply`; applied but not proven green -> `spec-verify`; opening a PR
  with no change to archive -> `git-pr-create`; retiring a whole capability rather than completing a
  change -> that is a new change, so `spec-propose`. The PR's `Resolves:` line comes from the
  branch-to-issue link `spec-propose` set. Never merges the PR it opens.
tags: [spec, openspec]
updated_at: 2026-09-14
---

# Spec Archive

completed change -> gate -> archive -> specs updated -> commit -> PR.

The last link in `spec-explore -> spec-propose -> spec-apply -> spec-verify -> spec-archive`. `/opsx:archive` owns the OpenSpec mechanics and never branches, commits, or opens a PR. This skill owns that seam, plus the one gate the CLI declines to enforce. Never author spec content here.

## Preconditions

```bash
openspec context --json
```

`no_openspec_root` -> **stop**, offer `openspec init --tools claude`, wait for the user. Never auto-init, never fall back to the current directory. Use the returned `root.path` as authoritative. User names a store -> `openspec store list --json` for ids, then `--store <id>` on every command that accepts one, sticky for the rest of the run.

Then two things must hold before anything is archived:

- The work is verified - `spec-verify` ran and its gate passed. Not verified -> send the user there and stop. Why -> archiving folds the delta into the specs, so doing it before the code is proven makes the spec the fiction rather than the record
- The tree is clean enough to commit the archive alone. Unrelated edits in flight -> commit or stash them first. Why -> the archive move and the spec fold are one commit, and a dirty tree drags someone else's work into it

## The Gate

This is the point of this wrapper. Read the task progress **before** archiving, and never pass `--yes` without having read it:

```bash
openspec instructions apply --change "<name>" --json
```

`state: "all_done"`, equivalently `progress.remaining == 0` -> the gate passes. Anything else -> **stop**. Name every unticked task and send the user to `spec-apply`. Do not archive. Do not "just tick the boxes".

**Do not gate on `isComplete` from `openspec status --json`.** It reports that all four artifact FILES exist, not that any task is finished. Probed: a change with 1 of 3 tasks ticked reports `isComplete: true` while `openspec instructions apply --json` reports `progress: {total: 3, complete: 1, remaining: 2}`. Only the second one counts checkboxes.

Probed, on a change with 0 of 3 tasks complete, `openspec archive <name> --yes` printed exactly one line:

```
Warning: N incomplete task(s) found. Continuing due to --yes flag.
```

It then exited 0 and folded the spec delta into `openspec/specs/` as though the feature had shipped. The warning is the only signal, nothing fails, and the exit code says success.

Why -> the archive is the moment a claim becomes the project's durable specification. An unearned archive leaves `openspec/specs/` describing a feature nobody built, and every later change plans against that lie.

`--yes` suppresses the interactive prompt **after** the gate has passed. It is never the way past the warning.

## Flow

1. Preflight per **Preconditions**. Resolve the change name - user named one -> use it; ambiguous -> `openspec list --json` and ask. Never guess which change is "the finished one"
2. Gate on `progress.remaining` per **The Gate**. Nonzero -> stop here and report the unticked tasks
3. Archive. `.claude/commands/opsx/archive.md` present -> invoke it; the OpenSpec-side mechanics are its job and this skill owns only the git seam. Absent -> drive the CLI directly:
   ```bash
   openspec archive "<name>"
   ```
4. Post-check:
   ```bash
   openspec validate --archived
   ```
   Catches an archived change whose tasks were never finished. It is a backstop, not a substitute for **The Gate** - by the time it fires the specs are already wrong and the fix is a revert, not an edit
5. Read what moved (see **What The Archive Writes**) and commit **both halves as one commit** via `git-commit`, scoped to the spec:
   ```
   docs(spec): archive <change-name>
   ```
   Why -> splitting them leaves a commit where `openspec/specs/` claims a capability whose change record is still sitting open in `openspec/changes/`
6. `git-pr-create` on the branch `spec-propose` started. It derives the title, body, and label itself, and fills the template's `Resolves:` line from the branch-to-issue link `spec-propose` set (`git config --get branch.<name>.issue`). No link -> the line is dropped and the PR closes nothing. Say so; do not let it go missing quietly
7. Report: the archive path, the capability specs touched, the PR url, plus the missing-link note if step 6 hit one. Nothing else

## What The Archive Writes

Two file moves, one commit:

- `openspec/changes/<name>/` -> `openspec/changes/archive/<YYYY-MM-DD>-<name>/`
- Each spec delta folded into `openspec/specs/<capability>/spec.md`

`git status` after the archive shows both. Stage both.

**Never hand-edit anything under `openspec/specs/`.** The `openspec` CLI owns those files and the next archive overwrites the edit without a word. A spec that ended up wrong gets fixed by correcting the CHANGE - its `specs/` delta, via `spec-propose`'s flow - and letting the archive write it. This is the docs-autoupdate seam: the change is the source, the archived spec is the output.

## Flags

| Flag | Use |
| --- | --- |
| `--yes` | Only after **The Gate** passed, to skip the interactive prompt |
| `--skip-specs` | Infrastructure, tooling, or doc-only changes that carry no spec delta |
| `--json` | Reading the result programmatically |
| `--no-validate` | Never |

- `--skip-specs` is for a change that genuinely has nothing to fold. Never reach for it to get past a validation complaint. Why -> the complaint says the delta is malformed; skipping the fold archives the change anyway and leaves the specs silent about work that shipped
- `--no-validate` is never used. Why -> validation is the only check that the delta about to become the project's spec is well-formed, and it runs on exactly the file nobody will re-read afterwards

## Several Changes At Once

`/opsx:bulk-archive` where installed, then one commit per change - same message shape, same gate applied to each. Not installed -> it needs the `custom` profile, and the profile is GLOBAL state shared by every repo on the machine. **Ask before changing it**, never silently:

```bash
openspec config set profile custom
```

User declines -> loop this skill one change at a time. That is the correct fallback, not a degraded one.

## When Not to Use This

- Tasks still unticked -> `spec-apply`
- Applied but not proven green -> `spec-verify`
- Just opening a PR, with no change to archive -> `git-pr-create`
- Retiring a whole capability rather than completing a change -> that is a new change, so `spec-propose`

## Rules

- Never `openspec archive --yes` without reading `progress.remaining` first. `isComplete` is artifact existence, not task completion. See **The Gate**
- Never `--no-validate`
- Never hand-edit `openspec/specs/` - correct the change and re-archive
- Never split the directory move and the spec fold across two commits
- Never `gh pr merge`. Why -> merging is the user's review gate, and an agent merging its own spec work removes the only human check between generated code and the base branch
- Never auto-run `openspec init`. Offer it and wait
- Never mutate the global openspec profile without asking
- Never `--no-verify` on the commit or the push
