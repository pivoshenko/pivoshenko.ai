# Voice

> pivoshenko is the practitioner's notebook — a dark, monospaced workshop where an engineer thinks out loud.

The voice *is* the notebook. Engineer-precise, first-person, lowercase by default, clipped on purpose. Practitioner, not marketer. Read this when writing anything longer than a button label — copy, headings, microcopy, blog post, email, social.

## The shape of a sentence

Short declarative. Short declarative. One-line counterpunch.

Lists do the heavy lifting. Paragraphs are one to three lines, never more. When a sentence wants to grow, break it into two.

No em-dashes for drama. No rhetorical questions strung together. When there *is* a question, the next line is the answer.

```
Execution is cheap now.
Code? Generated.
UI drafts? Ten in minutes.
Tests, docs, summaries? Same story.
```

That rhythm — claim, claim, claim, beat — is the signature. Use it anywhere a paragraph wants to land.

## Person

First person, singular. **I**, **my**, **mine**. Never "we" (no company), never "you" except when making a point at the reader.

The byline is `Volodymyr Pivoshenko <contact@pivoshenko.dev>` — mail-header style. That format is the signature; copy it into footers, signatures, and metadata as-is.

## Casing

- **Brand names are lowercase, always, even at the start of a sentence.** Any `pivoshenko.<namespace>` property follows this rule, and so do the tools the work touches (`bat`, `fish`, `helix`, `ghostty`, `zed` — whatever shows up).
- **Proper names get title case.** `Volodymyr Pivoshenko`. Job titles too: `Principal AI/R&D Engineer`.
- **Section labels SHOUT, but quietly.** Uppercase, widest tracking, `type-label` size. Loud in form, small in size — they whisper-shout.

## Words to favor

- `practical notes`, `curated`, `experiments`, `step-by-step`, `baseline`
- `posts` — never `articles`
- `ports` — terminal/desktop targets
- `userstyles` — browser injection layer

## Words to refuse

- Hype: `game-changing`, `revolutionary`, `world-class`, `cutting-edge`
- Vague value: `solutions`, `seamless`, `empower`, `unlock`, `delight`
- Playful slang: `awesome`, `super`, `crazy`, `insanely`
- Filler: `simply`, `just`, `basically`, `actually`

If a sentence would survive in a SaaS landing page, rewrite it.

## Microcopy

The whole tone collapses into these small surfaces. Match them.

| Surface           | Pattern                                |
|-------------------|----------------------------------------|
| Empty state       | `No posts yet.` (one sentence, period) |
| More-link         | `All posts →`                          |
| Back-link         | `← Back`                               |
| External link     | `Repository ↗`                         |
| Separator         | `·` (middle dot, never a slash)        |
| Tag chip          | lowercase-hyphenated, no `#`           |
| Date (detail)     | `Mar 20, 2026`                         |
| Date (list)       | `Mar 20`                               |
| Date (archive)    | `Mar 2026`                             |
| Reading time      | `5 min read`                           |
| Footer copyright  | `2026 Volodymyr Pivoshenko <contact@pivoshenko.dev>` |

## Emoji

Banned in UI, READMEs, commits, and social copy. Lucide icons when a glyph is genuinely needed. **One exception:** GitHub repo *description* field (the one-liner under the repo name) — a single contextual emoji is allowed as visual punctuation against a wall of grey GitHub text. Never inside the README itself.

## Smell test

A finished paragraph should:

1. Read like a notebook entry, not a pitch.
2. Survive being chopped in half — every sentence stands alone.
3. Lose nothing if every adjective is deleted.

If (1)–(3) hold, it sounds like pivoshenko.
