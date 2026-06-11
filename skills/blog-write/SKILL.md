---
name: blog-write
description: Write and edit blog posts for pivoshenko.dev — interrogate for raw material, outline as a dependency graph, confirm sections, draft section-by-section, run anti-slop edit passes, ship as MDX. Use when the user says "write a blog post", "draft a post about X", "edit/revise/improve this article", "tighten this draft", "turn this into a post", "publish to my blog", or shares notes/an experience meant for pivoshenko.dev. The goal is bespoke practitioner writing, not generic AI prose.
tags: [writing, blog]
updated_at: 2026-06-11
---

# Blog write

Target: `pivoshenko.dev`, posts at `site/content/posts/*.mdx`.

Goal = bespoke content. The post must contain things only the author could write — numbers, failures, decisions, opinions. Anything the first Google result could say -> delete. Padding is where slop comes from.

## Modes

- **write** — idea/notes -> published MDX. Full flow (1-6).
- **edit** — existing draft -> improved. Map its headings into sections (step 3), confirm, then 4-6. Present per-section changes; never silently restructure.

## Flow

### 1. Interrogate — raw material before prose

Never draft from a one-line idea. Mine the author first:

- what happened — the incident, the build, the decision
- specifics — numbers, commands, configs, error messages, dates
- the failure — what broke, what was tried and abandoned, what it cost
- the opinion — what they believe that others don't, and why

Source order: user > vault (`06 WRITING` draft, project/source notes) > repo. Never invent.
No raw material for a section -> ask targeted questions, don't pad.

### 2. Thesis

One sentence the post defends. Reader finishes -> can repeat it back.
No thesis -> no post, only notes. Say so and help find one.

### 3. Outline as dependency graph

Information = DAG. A section may only use concepts established by earlier sections.

- list sections; for each write the *main point* (a claim, not a heading)
- mark dependencies: section C leans on B's claim -> B comes first
- every section needs an edge to the thesis; no edge -> cut
- check: read points in order, circle any term/claim not yet introduced -> reorder or add setup

**Confirm the outline with the user before drafting.** Outline is cheap, drafts are not.

### 4. Draft, section by section

Load `pivoshenko-brand/references/voice.md` first — that file owns the voice. Non-negotiables from it:

- paragraphs 1-3 lines (~240 chars max); a paragraph that grows -> split
- rhythm: claim, claim, claim, beat
- first person singular; lowercase brand/tool names; `posts` never `articles`

One section at a time. Each section carries >=1 author-only artifact (number, error, config, decision + why). Section has none -> back to step 1 for that section, not into generalities.

### 5. Edit passes — separate, in order

1. **structure** — DAG still holds after drafting drift; every section still earns its edge to the thesis
2. **slop** — run `references/anti-slop.md`: kill throat-clearing intro, summary outro, rule-of-three padding, hedge stacks, "it's not X — it's Y"
3. **voice** — smell test from `voice.md`: notebook entry not pitch; survives chopping in half; loses nothing if adjectives deleted
4. **facts** — every number/command/claim traces to user, vault, or repo. Untraceable -> cut or ask

### 6. Ship

- file: `site/content/posts/<kebab-slug>.mdx`
- frontmatter: `title`, `date` (today, `YYYY-MM-DD`), `description` (1-2 plain sentences, no hype), `tags` (lowercase kebab-case, single word preferred)
- `just check` from the `pivoshenko.dev` root must pass
- draft lives in the vault -> set `status: published` + `published_url` there (wiki-write owns vault duties)

## Rules

- Steps 1-3 are not skippable. A full draft delivered straight from a one-line idea is the failure mode this skill exists to prevent.
- Never invent metrics, dates, quotes, features.
- The author's opinion stays the author's. Don't sand off a strong position into "it depends".
