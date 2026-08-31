---
name: humanize
description: Remove AI-writing tells from any prose, normalize punctuation to plain ASCII (em dash -> hyphen, curly quotes -> straight, ellipsis char -> "..."), and raise headings to Title Case. Use when the user says "humanize this", "make it sound human", "de-AI this", "this reads like ChatGPT", "remove AI patterns", or when editing/reviewing any prose (doc, README, PR description, commit message, email, post) that shows AI tells. The general-purpose de-AI pass for any prose, in any format, unless a more specific writing workflow already owns the piece. Skips agent-instruction files (CLAUDE.md, AGENTS.md, context.md, llms.txt, cursor rules) unless the user aims it at one - their terse fragment style is the working format, not a tell.
tags: [writing, style]
updated_at: 2026-08-31
---

# Humanize

Strip AI tells from text. Keep every fact, change the prose.

## Ground rules

1. **Preserve information, not shape.** Every claim survives. Compress dull parts, merge/split paragraphs freely. Information beats structure.
2. **Never invent facts.** No new names, numbers, dates, quotes, citations. Sentence needs missing detail to work -> ask, or write the plain version without it.
3. **Match voice.** Formal/casual/technical as intended. User provides own writing sample -> its habits outrank every rule below, including the dash rule.
4. **Don't sterilize.** Voiceless is as obvious as slop. Essay/opinion/post -> keep opinions, asides, uneven rhythm. Technical/reference -> plain and neutral IS the human voice there.

## Out of scope: agent instruction files

Files written for a model to execute, not for a person to read: `CLAUDE.md`, `AGENTS.md`, `context.md`, `llms.txt`, `.cursor/rules/*`, `GEMINI.md`, `.github/copilot-instructions.md`, and any other agent/system-prompt file. Terse fragments, arrows, abbreviations, and lowercase headings are the working format there - compression is the point, and recasing headings or padding fragments into sentences costs tokens and blurs directives. Skip these files entirely: no rewrite, no heading recase, no punctuation pass.

Same for the prose *inside* a normal file when it is addressed to a model: system prompts, skill bodies, prompt templates in code or fixtures.

Exception - the user aims the skill at one of these deliberately ("humanize my CLAUDE.md", "clean up this system prompt"). Do it, and say once that the file is agent-facing so terseness there was probably intentional. A doc that merely mentions or quotes such a file is ordinary prose; edit it normally.

## House conventions

The two rules below are **house style, not AI tells**. They run on every pass, on every file this skill touches, whether or not the prose shows a single AI pattern - which is exactly why they need saying out loud: someone who asked for a de-slop pass and got their headings recased should have seen it coming from this section.

Both are defaults, not laws. "punctuation only", "leave the casing", "don't touch my headings" -> honor it for that pass and note in the findings table which convention was skipped. A file with a documented style guide of its own outranks both (see the exceptions under each).

### Punctuation -> plain ASCII

- em/en dash (—, –), spaced ` — `, double ` -- ` -> replace, order of preference: period > comma > colon > parentheses > restructure
- curly quotes ("", '') -> straight `"` `'`
- … -> `...`
- → -> `->`
- exception: code syntax, math, non-English text, files that already follow a different convention

Before delivering, scan the result for `—` `–` `…`. Any hit -> not done.

### Headings -> Title Case

Every heading and title is Title Case; sentence-case headings get raised.

- capitalize the first word, the last word, and every major word (nouns, verbs, adjectives, adverbs, pronouns, subordinating conjunctions)
- keep lowercase mid-title: articles (a, an, the), coordinating conjunctions (and, or, but, nor, for, so, yet), prepositions of four letters or fewer (of, in, to, on, at, by, from, with)
- never recase: names that are lowercase by design (`npm`, `ripgrep`, `fish`), code identifiers, acronyms, and titles of works quoted from the source - such a name stays lowercase even in first position
- scope: markdown headings, document/section titles, table-of-contents entries. Prose sentences, list items, and table cells keep normal sentence capitalization

Example: `## Strategic negotiations and global partnerships` -> `## Strategic Negotiations and Global Partnerships`.

Exception - a surface with a documented style guide that calls for a different casing keeps that casing, whatever it is: sentence case, all-lowercase, all-caps section labels. Brand and product copy, UI labels, and house-styled publications usually have one, and there the heading style is part of what readers recognize - an all-lowercase house voice reads as deliberate, and raising it is the single most visible way this pass can damage a piece it was meant to help. A stated convention outranks this default; a file that merely happens to use a casing does not - that file is the reason the rule exists. Unsure whether a convention is stated or accidental -> leave the casing alone and say so in the findings table; a heading left unraised costs nothing, a house voice flattened costs the author.

## Tells to kill

Full before/after catalog: `references/patterns.md`. Load it when an edge case needs calibrating or a rewrite feels under/over-done; the lists below are enough for routine passes.

Content:

- inflated significance: "stands as a testament", "pivotal moment", "underscores the importance", "evolving landscape", "setting the stage for" -> state the plain fact
- promotional tone: "nestled", "vibrant", "breathtaking", "renowned", "boasts", "rich cultural heritage" -> neutral description
- "-ing" padding: trailing "...showcasing/highlighting/reflecting/ensuring..." for fake depth -> cut, or make a real sentence
- weasel attribution: "experts argue", "industry reports", "observers note" with no source -> name the source or cut; never invent one
- formulaic "Challenges / Future Outlook" sections -> keep only the concrete facts
- gap-filling: "not publicly available, suggesting she keeps a low profile", "likely grew up..." -> say what isn't known or cut; never dress a guess as fact

Vocabulary:

- AI words: delve, leverage, crucial, pivotal, tapestry, landscape (abstract), testament, underscore, showcase, foster, intricate, seamless, robust, vibrant, enhance, garner -> plain words
- copula avoidance: "serves as", "stands as", "features", "boasts" -> is / are / has

Structure:

- "not just X, it's Y", tailing negations ("no guessing") -> plain claim
- rule of three everywhere -> keep the item that carries weight
- false ranges ("from the Big Bang to dark matter") -> plain list
- synonym cycling (protagonist / main character / central figure / hero) -> one word
- bold-header bullets (`**Performance:** ...`) -> prose or plain list
- emojis on headings/bullets -> gone
- staccato drama runs ("No prior. No nostalgia. Gone.") -> one short sentence max
- aphorism formulas ("X is the language of Y", "X becomes a trap") -> the concrete claim behind it

Filler:

- "in order to" -> "to"; "due to the fact that" -> "because"; "it is important to note that" -> cut
- hedge stacks ("could potentially possibly") -> one hedge max
- generic upbeat endings ("the future looks bright") -> end on the last concrete fact
- signposting ("let's dive in", "here's what you need to know") -> just do it
- fake-candid openers ("Honestly?", "Here's the thing") -> say the thing
- chatbot residue ("I hope this helps", "Would you like...", "Great question!") -> gone

## Don't over-flag

One tell means nothing - look for clusters. A single em dash, one triad, polish, formal vocabulary, one short punchy sentence = normal human writing. Never touch quotes, titles of works, proper names, or examples that discuss a phrase rather than use it. Preserve human signals: weird specific detail, mixed feelings, asides, self-corrections, varied sentence length.

## Modes

- **pasted text** -> deliver the rewrite + findings table
- **file** -> Read, rewrite prose in place; leave code blocks, frontmatter, data, link targets untouched; report the findings table, don't paste the whole file back
- **embedded** (step in a bigger job: PR body, commit message, doc) -> output final text only, no ceremony, no table

## Findings table

Report what was fixed as a table - one row per tell category, only categories with hits, sorted by count desc:

| Tell | Count | Examples |
|------|------:|----------|
| em/en dashes | 12 | "policy—announced" -> "policy, announced" |
| AI words | 5 | delve x2, leverage x2, robust |
| headings recased | 4 | "Getting started" -> "Getting Started" |
| rule of three | 2 | "innovation, inspiration, and insights" |
| filler | 3 | "in order to" x3 |

- Count = instances fixed, not sentences touched
- Punctuation rows (`—` `–` `…` curly quotes, `->` arrows): get exact counts by grepping the source before rewriting, don't eyeball
- Examples: 1-3 short samples per row, enough to spot-check; truncate long ones
- No hits at all -> say the text is clean, skip the table

## Process

1. Scan for tells above.
2. Draft rewrite - reads naturally aloud, varied sentence length, is/are/has.
3. Audit: anything still AI-sounding? any fact not in the source? any `—` `–` `…` left? Fabrication = defect even when it sounds better.
4. Final rewrite.
