---
name: spec-explore
description: >-
  Map a problem and understand the codebase before any change exists - ground every question in
  what the repo says, converge on an outcome, a scope, and an explicit not-in-scope boundary,
  then hand to `spec-propose`. Use when the user says "explore this", "/spec-explore", "help me
  think this through", "what would it take to X", "where does X live", "map this out", or opens
  a design question with no decided shape yet. The thinking stage of the OpenSpec chain
  `spec-explore` -> `spec-propose` -> `spec-apply` -> `spec-verify` -> `spec-archive`, and the
  only one that runs fine in a repo with no `openspec/`. Boundary with `grilling`: that
  stress-tests a decision already made, this one has none yet. Boundary with `diagnosing-bugs`:
  something broken, failing, or slow is a diagnosis. Boundary with `spec-propose`: scope already
  clear means skip straight there. Boundary with `architecture`: a technology choice needing an
  ADR is that skill's. Writes nothing - no artifacts, no branch, no commit, no code.
tags: [openspec, spec, planning, agents]
updated_at: 2026-09-14
---

# Spec Explore

question -> read the codebase -> converge -> hand to `spec-propose`.

**Explore writes nothing.** No artifact, no branch, no commit, no source edit, not even a scratch file in the repo. Why -> an explore that edits leaves the tree holding a change nobody proposed and no spec describes, so the next stage either commits work it never planned or spends its first move reverting yours.

## Flow

1. **Preflight.** `openspec context --json`. `no_openspec_root` -> say so once and keep going. Exploring is read-only and needs no `openspec/`. Do not offer `openspec init --tools claude` yet, and never run it unasked. User names a store -> `openspec store list --json` for ids, then `--store <id>` on every later call, sticky for the run
2. **Delegate the mechanics.** `.claude/commands/opsx/explore.md` exists -> that command owns explore mode, invoke it, and keep only the framing, the question discipline, and the handoff for yourself. Absent -> drive the discovery yourself per **Grounding**
3. **Ground first.** See **Grounding**. Read before a single question reaches the user - every factual question you could answer by reading, read
4. **Restate the question in one line, carrying what you read** - the module it lands in, the file that already does the nearest thing, or the thing that turns out not to exist at all. State the framing and move straight into the first question. It is a frame, never a confirmation gate, so nothing waits on it; a wrong premise gets corrected here at the cost of one line rather than the session. Why -> a restatement offered before reading can only echo the user's own words back, which costs a full turn and returns nothing they did not already know, and it breaks **Grounding**'s own rule never to ask what you can read
5. **Ask one question at a time.** See **Questions**
6. **Check the existing specs for collisions.** See **Collisions**
7. **Converge and hand off.** See **Convergence**. Root exists -> `spec-propose`. Root missing -> now offer `openspec init --tools claude`, wait for the user, then `spec-propose`

## Grounding

Read first, in roughly this order, stopping when the picture is enough to ask a sharp question:

- The entry points and module layout - `CLAUDE.md`, `README`, the directory the user named
- The code that already does the nearest thing. Grep the nouns the user used, not the ones you would use
- The tests around it. They state the current contract more honestly than the source does
- Config, the justfile, package scripts - they name the verify commands a later stage will need
- `openspec spec list` - what capabilities are already specified
- `openspec list --json` - changes already in flight, so you do not explore something half-built

Never ask what you can read. Why -> every question you spend on a fact the repo already states is a question you do not get to spend on the judgment call only the user can make, and it teaches them the session is not grounded.

Read-only tools only: `cat`, `grep`, `find`, `git log`, `openspec` read subcommands. Nothing that writes.

## Questions

One focused question per turn. Each one carries three things:

- The decision it unlocks - "this decides whether tags live in frontmatter or a lookup table"
- A grounded recommendation - what the repo already does, and why that is the default
- The tradeoff of taking it - what you give up, named concretely

Batching five questions gets you one answer to the easiest of them. Why -> a list invites the user to skim and reply to whichever entry is cheapest, and the expensive one silently stays open until it surfaces as rework three stages later.

**Silence is not acceptance.** No answer to a question -> it stays open and goes into the open-questions list at convergence. Never promote an unanswered question into a decided scope line.

Disagreement with your recommendation is data, not a detour. Take it, restate the revised frame, move on.

## Collisions

Exploration that contradicts something already in `openspec/specs/` -> stop and surface it: the capability, the line that conflicts, and the two readings. Never silently decide which one wins. Why -> the archived spec is what every other agent reads as current truth, so an exploration that quietly overrides it produces a proposal that looks consistent and a codebase that is not.

Same for a change already in `openspec/changes/` covering the same ground - surface it and ask whether this is that change, or a second one alongside it.

## Convergence

An exploration that never converges is a conversation, not a stage. Converged means you can state all four:

- **Outcome** - what is true after this ships, observable by someone who did not build it
- **Scope** - the capabilities and the files it touches, named from what you read, not guessed
- **Not in scope** - the adjacent things deliberately left alone, each with the reason
- **Open questions** - what is still undecided, and who or what decides it

Print those four as the last message of the stage, then hand to `spec-propose`. Why -> `spec-propose` writes artifacts from this summary; a fourth section left implicit becomes scope creep in `proposal.md` that nobody agreed to.

Not converging after a full pass -> say so plainly and name the blocker. A stalled exploration reported as stalled is a result. One padded into a proposal is not.

## When Not to Use This

- Stress-testing a decision the user already made -> `grilling`
- Something broken, failing, or slow -> `diagnosing-bugs`
- Scope already clear, ready to write artifacts -> `spec-propose` directly
- A technology choice that needs a recorded decision and its consequences -> `architecture`

## Rules

- Write nothing. No artifacts, no branch, no commit, no code, no files anywhere in the repo
- Missing `openspec/` never blocks exploring. Offer `openspec init --tools claude` only at handoff, and wait for the user
- Never run `openspec init`, and never touch the global profile, `openspec config set` included
- `.claude/commands/opsx/explore.md` present -> it owns the explore mechanics. Never re-implement them
- Read the repo before putting a factual question to the user
- One question per turn, with the decision it unlocks and a grounded recommendation
- Unanswered is unanswered. It lands in open questions, never in scope
- Contradiction with `openspec/specs/` -> surface both readings, decide neither
- Converge on outcome, scope, not-in-scope, and open questions, or report the blocker
