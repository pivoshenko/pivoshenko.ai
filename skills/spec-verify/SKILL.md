---
name: spec-verify
description: >-
  Check that an OpenSpec change's implementation actually matches its spec, before anything is
  archived - artifact validity via `openspec validate --strict`, the repo's own verify gate run for
  real, and scenario-by-scenario conformance against the spec delta. Read-only: it reports, it never
  fixes. Use when the user says "verify the change", "/spec-verify", "does the code match the spec",
  "check spec conformance", "is this ready to archive", "did we actually build it", "audit the
  ticks", or whenever `spec-apply` has ticked the last task. Boundaries - tasks still unticked ->
  `spec-apply`; verified and ready to fold into the specs -> `spec-archive`; reviewing a diff for
  bugs rather than for spec conformance -> `/code-review`; something is broken and needs diagnosing
  -> `diagnosing-bugs`.
tags: [spec, openspec, verification]
updated_at: 2026-09-14
---

# Spec Verify

change -> validate -> gate -> scenario conformance -> report.

Three independent checks, reported separately, in increasing order of what they prove. `openspec validate` reads documents. The repo gate runs the code. Scenario conformance is the only one that asks whether the behavior the spec promised exists, and it is the reason this skill is in the set. Never collapse them into one verdict.

Read-only by default. **This skill fixes nothing.** Why -> a verifier that quietly patches what it finds stops being independent evidence and starts being a second author of the same claim.

## Preflight

```bash
openspec context --json
```

`no_openspec_root` -> **stop**, offer `openspec init --tools claude`, wait. Never auto-init, never fall back to the current directory. Use the returned `root.path`. The user naming a store -> `openspec store list --json` for ids, then `--store <id>` on every command below, sticky for the run.

`.claude/commands/opsx/verify.md` present -> the OpenSpec-side mechanics are its job; invoke it and own only the conformance and gate halves. Absent, which is the usual case -> run the flow below off the CLI directly. **Mention the opt-in exactly once**, as an offer:

```bash
openspec config set profile custom
openspec config set workflows '["propose","explore","apply","update","sync","archive","verify"]'
openspec init --tools claude
```

Accepted or declined, do not raise it again in this run, and never run it unasked. Why -> the profile is global state shared by every repo on the machine, so this is a machine-wide flip made to satisfy one change in one repo.

## Flow

1. Resolve the change and read its shape:
   ```bash
   openspec status --change "<name>" --json
   ```
   Keep `changeRoot` and `artifactPaths`. Treat every `status` field as file-existence only - it says an artifact was written, never that it is right. `isComplete` is the sharpest example: it goes true once all four artifact files exist, so a change with 1 of 3 tasks ticked still reports `isComplete: true`. Task progress comes from `openspec instructions apply --change "<name>" --json` instead
2. **Artifact validity.** `openspec validate <change> --strict --json` -> parse `items[].issues[]`, report each with its `id` and `type`. This checks the spec documents are well-formed and nothing more. A clean run is not evidence about the code
3. **The repo gate.** Find the project's own verify command by reading the justfile or the package scripts - `just check` here, a test suite elsewhere. **Never invent one**; nothing found -> ask. Then run it yourself as a shell command. Why -> this is the only check in the set that executes the code; the other two only read documents, and a worker's "tests pass" is a claim, not a result
4. **Scenario conformance.** Walk the delta as in **Scenarios**
5. **Tick audit.** Walk `tasks.md` the other way, as in **Ticks**
6. Report as in **Report**, then hand back as in **Handback**. Stop. Change nothing

## Scenarios

Every `#### Scenario:` in the change's `specs/**/*.md` delta is a promise about observable behavior. Enumerate them, then find each one's counterpart in the implementation:

```bash
grep -rn '^#### Scenario:' "<changeRoot>/specs"
```

A counterpart is a test, an assertion, or a code path that would actually differ if the scenario were false. Grade each one:

- **Covered** - a named test or assertion exercises it. Cite `path:line`
- **Implemented, untested** - the code path exists, nothing pins it. Cite the path
- **Missing** - no counterpart found. This is the finding

Why -> `openspec status` reports that `specs/` exists and the repo gate reports that whatever tests exist pass; neither one notices a scenario nobody ever wrote a test for. Only this walk does.

A scenario whose counterpart contradicts the delta is drift, and drift is a finding. **Never resolve it by editing the spec to match what was built.** Why -> rewriting the promise to fit the code makes every future reader believe that is what was agreed, and destroys the only record that it was not.

## Ticks

Read `tasks.md` at its path from `artifactPaths`, not the lossy `tasks[]` from `openspec instructions apply --json` - that array strips the `files:` and `needs:` continuation lines and renumbers ids, so it cannot support this check. Key tasks on the `N.M` label parsed out of the text.

For every `- [x]`, confirm its `files:` were actually touched on this branch:

```bash
base=$(git symbolic-ref --short refs/remotes/origin/HEAD)
git diff --name-only "$(git merge-base HEAD "$base")"...HEAD
```

Detect the base, never assume `origin/main` - ref missing -> `git remote set-head origin -a` and re-read, no remote -> `main`, fall back `master`. Why -> a repo based on `develop` diffs against a parent it never branched from, and every task reads as a false tick.

A ticked task whose `files:` appear nowhere in that list is a **false tick** - report it by label. Why -> a checkbox is a claim made by whoever ticked it, and it is the only thing `spec-archive`'s gate counts; a false tick walks a never-built feature straight into `openspec/specs/`.

## Report

Three buckets, one line each, most severe first. No narration of the process, no per-file walkthrough, no agent-count.

- **action** - a promise is unmet: a missing scenario, a false tick, a red gate, a strict-validate error
- **attention** - real but not blocking: implemented-untested scenarios, validate warnings, drift worth a decision
- **ok** - checks that ran clean, named so the user can see coverage: "validate strict clean, gate green, 9/9 scenarios covered"

Lead with the counts: `3 ok, 2 attention, 1 action`. **Never report a check you did not run** - a gate you could not find is `action: no verify command`, never a silent `ok`.

## Handback

Every finding routes to the skill that owns the fix. Name it, do not do it:

- Code does not meet the spec -> back to `spec-apply`
- The spec itself was wrong, so the artifact needs correcting -> back to `spec-propose`, or `/opsx:update` where it is installed
- Clean across all three checks -> `spec-archive`

## When Not To Use This

- Tasks still unticked -> `spec-apply`. There is nothing to verify yet
- Verified and ready to fold the deltas into the specs -> `spec-archive`
- Reviewing a diff for bugs rather than for spec conformance -> `/code-review`
- Something is broken and needs diagnosing -> `diagnosing-bugs`

## Rules

- Read-only. Report findings, fix nothing, tick nothing, archive nothing
- Three checks, three verdicts. Never let a green gate stand in for conformance, or a clean validate stand in for either
- Never report a check you did not run, and never report one this file predicts - verdicts come from the run
- Never invent a verify command. Read the justfile or the package scripts, or ask
- Drift is a finding, never a reason to edit the spec
- Never mutate the global openspec profile. Offer the opt-in once, then drop it
- Never `--no-verify`, never `openspec archive` from here
