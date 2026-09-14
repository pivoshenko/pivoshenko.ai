---
name: spec-propose
description: >-
  Draft the OpenSpec change artifacts - `proposal.md`, the `specs/` delta, `design.md`, `tasks.md` - on a fresh branch, install the wave rules that make `tasks.md` parallel-safe, validate, and commit. Use when the user says "propose this", "write the proposal", "spec this out", "/spec-propose", "turn this into an OpenSpec change", "plan this as a change", "decompose this", "what are the tasks for X", or whenever a design discussion has converged and needs artifacts. Wraps `/opsx:propose` and owns only the git seam it ignores - branch first, issue link so the later commit and PR close the ticket, commit after. Boundaries: still working out what the change even is -> `spec-explore`; artifacts already written and ready to build -> `spec-apply`; one indivisible piece of work needing no spec at all -> `git-branch-create`; a tracked ticket rather than a spec -> `git-issue-create`. This skill plans and stops - it never implements.
tags: [spec, openspec, agents]
updated_at: 2026-09-14
---

# Spec Propose

converged idea -> branch -> config rules -> artifacts -> commit.

**Planning only.** The request that reaches this skill authorizes artifacts, nothing more, even when it is phrased as "build X" or "fix Y". See **Planning Boundary**.

**Order is load-bearing twice**: the branch exists before any artifact is written, and the wave rules are installed before `tasks.md` is written. Both are one-way doors.

## Flow

1. **Preflight.** `openspec context --json`. `no_openspec_root` -> stop, offer `openspec init --tools claude`, wait for the user. Never auto-init, never fall back to the current directory. Otherwise take `root.path` as authoritative. User named a store -> `openspec store list --json` for ids, then `--store <id>` on every command for the rest of the run
2. **Branch first**, via `git-branch-create`. Type from the change (`feat`, `fix`, `refactor`), desc matching the change name. Why -> artifacts written on the base branch put an unreviewed spec on `main`, and relocating them afterwards means hand-rewriting the paths in `.openspec.yaml` on top of the git move
3. **Link the issue, if there is one.** The branch carries no ticket id of its own:
   - User named an existing issue -> `git config branch.<branch>.issue <n>`
   - No issue, repo has a GitHub remote and uses issues -> offer `git-issue-create` for this change, then set the key from the number it returns. Offer it, never file one unasked
   - No GitHub remote, or the user declines -> skip silently and carry on. Not every repo tracks work in issues, and a spec is perfectly valid without one

   Why -> this one `git config` call is the only thing that makes `git-commit`'s `Closes #<n>` trailer and `git-pr-create`'s `Resolves:` line fire later. `git-branch-create` never writes the key, and nothing downstream can recover the number if it is not set here
4. **Derive the change name.** Kebab-case, from the request, and it should read as the branch name without its `<type>/` prefix. Name already taken under `openspec/changes/` -> ask whether to continue that change (that is `spec-apply`'s job) or start a new one. Never overwrite an existing change directory
5. **Install the wave rules** into `openspec/config.yaml` before the tasks artifact is written. See **Wave Rules**. This is the step the whole set depends on
6. **Scaffold.** `openspec new change "<kebab-name>"` -> `openspec/changes/<name>/.openspec.yaml`. The `spec-driven` schema's artifacts are `proposal` -> (`specs`, `design`) -> `tasks`, with `applyRequires: ["tasks"]`
7. **Author the artifacts.** See **Delegation**. Never write artifact content from your own head when `openspec instructions` can hand you the authoritative guidance - this is a wrapper
8. **Sanity-read `tasks.md`** before committing. See **Disjointness Check**. Overlap -> fix it now by merging, reassigning ownership, or ordering with `needs:`
9. **Validate.** `openspec validate <change> --strict --json` -> read `items[].issues`, fix, re-run until `summary.totals` is clean
10. **Commit** via `git-commit`: `docs(spec): add <change-name> proposal`. Artifacts only. Why -> a commit mixing the spec with its implementation makes the spec unreviewable, and `spec-apply` can no longer revert one without the other
11. **Stop.** Print the change name, the branch, and the task count, then hand to `spec-apply`

## Wave Rules

`tasks.md` carries no dependency or file-ownership information by default, so nothing in it says what is safe to run concurrently. Force the markers at authoring time, as per-artifact rules in `<root.path>/openspec/config.yaml`:

```yaml
rules:
  tasks:
    - "Every task MUST end with a `files:` line listing every path it will write."
    - "Every task MUST end with a `needs:` line listing task ids it depends on, or `none`."
```

Probed: these surface verbatim under `rules` in `openspec instructions tasks --change "<name>" --json`, and the propose workflow applies `rules` as constraints on the artifact it writes. That is the whole mechanism.

Rules already present in the file -> leave them alone, do not restate or reformat them.

Why -> the markers can only be forced at authoring time. `openspec instructions apply --change "<name>" --json` strips every continuation line on the way back out, so a `tasks.md` written without them can never be made parallel-safe except by rewriting it task by task.

## Delegation

`.claude/commands/opsx/propose.md` present -> it owns artifact authoring. Invoke it and own only the git seam around it: the branch, the rules, the validate, the commit.

Absent -> drive the CLI yourself, in dependency order:

```bash
openspec status --change "<name>" --json
openspec instructions <artifact-id> --change "<name>" --json
```

- `status` returns `artifacts[] {id, outputPath, status, requires, missingDeps}`. Write every `ready` artifact, re-run `status`, repeat until `isPlanningComplete`
- The required set is `applyRequires` plus everything reachable from it by `requires` edges - the transitive closure, not the literal list. Why -> `applyRequires` is `["tasks"]` alone, and writing only `tasks.md` leaves a change with no proposal behind it
- `status` is FILE-EXISTENCE ONLY. A `done` artifact proves a file exists at that path, never that its dependencies do. Walk the edges yourself rather than trusting the label
- `instruction`, `context`, and `rules` from `instructions` are constraints on the writer. They are never content to paste into the artifact

## Tasks Shape

What step 5's rules buy you:

```markdown
## 1. Data layer

- [ ] 1.1 Add the tag index
      files: site/lib/data.ts
      needs: none
- [ ] 1.2 Wire filtering into the catalog
      files: site/components/catalog.tsx
      needs: 1.1

## 2. UI

- [ ] 2.1 Add the tag chip component
      files: site/components/tag-chips.tsx
      needs: none
```

- `files:` every path the task will write. Comma separated. Required, never empty
- `needs:` the `N.M` labels that must be ticked first, or `none`. Required
- Both are continuation lines under the checkbox, indented, one key per line

`spec-apply` builds a wave from unticked tasks whose `needs:` are all ticked AND whose `files:` sets are pairwise disjoint. Ready is not the same as safe - both halves must hold.

## Decomposition

A task is right-sized when all four hold:

- One agent can finish it in one context
- It leaves the repo's verify command green on its own
- Its `files:` set is nameable now, not after starting
- Its description fits without "and"

A change worth specifying at all is worth at least two tasks. One task -> either the decomposition never happened, or the work needed no spec and belongs to `git-branch-create`. Why -> a single task is a wave of one, so the `files:` and `needs:` markers step 5 just forced go unread and `spec-apply` fans out to exactly one agent; the whole mechanism this skill exists to install does nothing.

Apply the four to the description you actually wrote, not the one you had in mind. After drafting `tasks.md`, re-read every task line against them. Why -> "fits without 'and'" is a test on a written sentence, and a run-on that read fine while planning is the exact line that ends up in the file - nothing catches it unless something re-reads the file.

Verification belongs in the task's verify expectation - the second criterion above, which `spec-apply` proves by running the repo's command itself - never stapled onto the description as "and then run ...". Why -> a description ending in "then run `just check`" fails the "and" test and duplicates a step `spec-apply` already runs for every task in the wave.

Split signals -> the description needs "and" / "also"; two unrelated modules; two independent halves of the done-when.

Merge signals -> two tasks share a file; one is a one-line edit inside the other's file; neither is verifiable without the other.

Prefer domain and feature slices over layer slices. Why -> layer-sliced tasks ("all the types", "all the components", "all the tests") all touch the same files and collapse into a single wave, which is a task list that cannot parallelize at all.

Never split "write the tests" from the feature it covers. Why -> tests and their code live in the same slice, so splitting them guarantees a `files:` overlap and a red tree in between.

## Disjointness Check

On paper, before the commit.

1. List every task with its `files:`
2. Compare every pair. Any shared path -> not parallel-safe
3. Overlap, work genuinely divisible -> one task takes sole ownership of that file and every change to it
4. Overlap, work not divisible -> it is one task. Merge them
5. Overlap real and unavoidable (a barrel export, a shared registry, a lockfile) -> keep them separate and express it as `needs:`, so they land in different waves

A pair that is neither disjoint nor ordered by `needs:` is a defect in `tasks.md`, not a decision to defer. Why -> `spec-apply` reads exactly these markers to build its waves; an unmarked or overlapping pair makes it stop and ask, or silently clobber if the markers lie.

## Planning Boundary

The triggering request authorizes PLANNING ONLY. "Build the tag filter" reaching this skill means "write the change that describes building the tag filter".

- Stop after the commit. Do not open a file under `src/`, do not start task 1.1, do not "get a head start" in the same response
- Hand to `spec-apply` and wait for a new request. Why -> the artifacts are a review gate; implementing in the same turn means the user reviews a spec whose code already exists, which is not a review

Planning stays with you - never fan decomposition out to workers. Why -> every task's `files:` set depends on the ones already assigned, so parallel planners produce overlapping slices that cannot be reconciled afterwards. Only `spec-apply` fans out.

## When Not to Use This

- Still working out what the change even is, or which capability it touches -> `spec-explore`
- Artifacts already exist and the work is ready to build -> `spec-apply`
- One indivisible piece of work that needs no spec at all -> `git-branch-create`
- A tracked ticket rather than a spec -> `git-issue-create`

## Rules

- Never auto-run `openspec init`. Offer it and wait
- Never mutate the global `openspec` profile without asking. `openspec config set` is machine-wide, not per-repo
- Branch before the first artifact, always
- Wave rules land in `openspec/config.yaml` before `tasks.md` is authored. After is too late
- Every task has a non-empty `files:` and an explicit `needs:` (`none` counts, blank does not)
- Never commit a `tasks.md` with overlapping `files:` and no `needs:` edge between them
- `openspec validate <change> --strict --json` passes before the commit
- The commit carries artifacts only. No implementation, no `--no-verify`
- Never author artifact content that `openspec instructions` would have given you
- Never invent a verify command. Read the justfile or the package scripts, or ask
