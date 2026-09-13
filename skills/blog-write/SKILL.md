---
name: blog-write
description: Write and edit blog posts for pivoshenko.dev — interrogate for raw material, outline as a dependency graph, confirm sections, draft section-by-section, run humanize edit passes, ship as MDX. Use when the user says "write a blog post", "draft a post about X", "edit/revise/improve this article", "tighten this draft", "turn this into a post", "publish to my blog", or shares notes/an experience meant for pivoshenko.dev. The goal is bespoke practitioner writing, not generic AI prose.
tags: [writing, blog]
updated_at: 2026-09-13
---

# Blog Write

Target: `pivoshenko.dev`, posts at `site/content/posts/*.mdx`.

Goal = bespoke content. The post must contain things only the author could write - numbers, failures, decisions, opinions. Anything the first Google result could say -> delete. Padding is where generic prose comes from.

## Modes

- **Write** - idea/notes -> published MDX. Full flow (1-6)
- **Edit** - existing draft -> improved. Map its headings into sections (step 3), confirm, then 4-6. Present per-section changes; never silently restructure

## Flow

### Interrogate - Raw Material Before Prose

Never draft from a one-line idea. Mine the author first:

- What happened - the incident, the build, the decision
- Specifics - numbers, commands, configs, error messages, dates
- The failure - what broke, what was tried and abandoned, what it cost
- The opinion - what they believe that others don't, and why

Source order: user > vault (`06 WRITING` draft, project/source notes) > repo. Never invent.
No raw material for a section -> ask targeted questions, don't pad.

### Thesis

One sentence the post defends. Reader finishes -> can repeat it back.
No thesis -> no post, only notes. Say so and help find one.

### 3. Outline as Dependency Graph

Information = DAG. A section may only use concepts established by earlier sections.

- List sections; for each write the *main point* (a claim, not a heading)
- Mark dependencies: section C leans on B's claim -> B comes first
- Every section needs an edge to the thesis; no edge -> cut
- Check: read points in order, circle any term/claim not yet introduced -> reorder or add setup

**Confirm the outline with the user before drafting.** Outline is cheap, drafts are not.

### Draft, Section by Section

Load `pivoshenko-brand/references/voice.md` first (that skill's directory, not this one) - that file owns the voice. Non-negotiables from it:

- Paragraphs 1-3 lines (~240 chars max); a paragraph that grows -> split
- Rhythm: claim, claim, claim, beat
- First person singular; lowercase brand/tool names; `posts` never `articles`

One section at a time. Each section carries >=1 author-only artifact (number, error, config, decision + why). Section has none -> back to step 1 for that section, not into generalities.

### Edit Passes - Separate, in Order

1. **Structure** - DAG still holds after drafting drift; every section still earns its edge to the thesis
2. **Humanize** - run `references/humanize.md`: kill throat-clearing intro, summary outro, rule-of-three padding, hedge stacks, "it's not X - it's Y"
3. **Voice** - smell test from `pivoshenko-brand/references/voice.md`: notebook entry not pitch; survives chopping in half; loses nothing if adjectives deleted
4. **Facts** - every number/command/claim traces to user, vault, or repo. Untraceable -> cut or ask

### Ship

- File: `site/content/posts/<kebab-slug>.mdx`
- Frontmatter: `title`, `date` (today, `YYYY-MM-DD`), `description` (1-2 plain sentences, no hype), `tags` (lowercase kebab-case, single word preferred)
- `just check` from the `pivoshenko.dev` root must pass
- Draft lives in the vault -> set `status: published` + `published_url` on that note; leave the rest of the note alone

## Rules

- Steps 1-3 are not skippable. A full draft delivered straight from a one-line idea is the failure mode this skill exists to prevent
- Never invent metrics, dates, quotes, features
- The author's opinion stays the author's. Don't sand off a strong position into "it depends"
