---
name: humanize
description: Remove AI-writing tells from any prose and normalize punctuation to plain ASCII (em dash -> hyphen, curly quotes -> straight, ellipsis char -> "..."). Use when the user says "humanize this", "make it sound human", "de-AI this", "this reads like ChatGPT", "remove AI patterns", or when editing/reviewing any prose (doc, README, PR description, commit message, email, post) that shows AI tells. Blog posts for pivoshenko.dev -> blog-write owns the full flow; this skill is the general-purpose pass for everything else.
tags: [writing, style]
updated_at: 2026-08-04
---

# Humanize

Strip AI tells from text. Keep every fact, change the prose.

## Ground rules

1. **Preserve information, not shape.** Every claim survives. Compress dull parts, merge/split paragraphs freely. Information beats structure.
2. **Never invent facts.** No new names, numbers, dates, quotes, citations. Sentence needs missing detail to work -> ask, or write the plain version without it.
3. **Match voice.** Formal/casual/technical as intended. User provides own writing sample -> its habits outrank every rule below, including the dash rule.
4. **Don't sterilize.** Voiceless is as obvious as slop. Essay/opinion/post -> keep opinions, asides, uneven rhythm. Technical/reference -> plain and neutral IS the human voice there.

## Punctuation -> plain ASCII (hard rule)

- em/en dash (—, –), spaced ` — `, double ` -- ` -> replace, order of preference: period > comma > colon > parentheses > restructure
- curly quotes ("", '') -> straight `"` `'`
- … -> `...`
- → -> `->`
- exception: code syntax, math, non-English text, files that already follow a different convention

Before delivering, scan the result for `—` `–` `…`. Any hit -> not done.

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
- Title Case Headings -> sentence case
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

One tell means nothing - look for clusters. A single em dash, one triad, polish, formal vocabulary, one short punchy sentence = normal human writing. Never touch quotes, titles, proper names, or examples that discuss a phrase rather than use it. Preserve human signals: weird specific detail, mixed feelings, asides, self-corrections, varied sentence length.

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
