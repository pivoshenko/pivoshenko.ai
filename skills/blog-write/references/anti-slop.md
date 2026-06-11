# Anti-slop

Slop = text that could exist without its author. The byline could be anyone's, the examples could be anyone's, the conclusion offends no one. This file catches it at two levels — structure and sentence — then states the positive test a section must pass.

`voice.md` in `pivoshenko-brand` owns the refuse-list (hype, vague value, filler) and the rhythm rules. This file adds the tells specific to generated prose. Pattern: **Don't · Why it fails · The move.**

---

## Structural tells

### The throat-clearing intro

- ❌ "In this post, we'll explore...", "Have you ever wondered...", restating the title in three sentences.
- **Why it fails:** the intro promises content instead of being content. The reader came for the thing, not the trailer for the thing.
- **The move:** delete the first paragraph. Start at the first concrete fact or the sharpest claim. If the second paragraph works as an opener, the first was slop.

### The summary outro

- ❌ "In conclusion...", "Ultimately...", "The key takeaway is...", a bullet recap of the sections above.
- **Why it fails:** a post short enough to read in one sitting doesn't need a recap. Summarizing yourself signals the body didn't land the point.
- **The move:** end on the sharpest beat — the consequence, the next action, the one-line counterpunch. The last line of `product-thinking` is "Building something people will pay for is another." That's an ending.

### Symmetric everything

- ❌ Five sections of near-equal length, each with an intro sentence, three bullets, and a wrap-up line.
- **Why it fails:** real arguments are lumpy. The load-bearing section deserves 3x the space of the setup. Symmetry is the shape of a template, not of thinking.
- **The move:** give space proportional to weight. One section can be two lines if two lines is what it earns.

### Generic headings

- ❌ "Introduction", "Background", "Conclusion", "Final Thoughts", "Wrapping Up".
- **Why it fails:** a heading that fits every post belongs to no post. Headings are the skim-path — generic ones make the post skim as nothing.
- **The move:** heading = the section's claim compressed to a noun phrase. Reading only the headings should sketch the argument.

### Listicle padding

- ❌ Bullets restating one idea three ways; numbered lists where order carries no meaning.
- **Why it fails:** lists borrow the look of density without the content. Three bullets that say one thing are one sentence wearing a costume.
- **The move:** lists only when items are genuinely parallel and each adds information. Otherwise: prose.

---

## Sentence tells

### "It's not just X — it's Y"

- ❌ "This isn't just a config change — it's a mindset shift."
- **Why it fails:** the construction inflates X by gesturing at a grander Y it never demonstrates. Signature generated-prose cadence; readers now spot it instantly.
- **The move:** say Y plainly and prove it, or keep X and let it be enough.

### The rule of three

- ❌ "Faster, cleaner, and more maintainable." Three parallel examples. Three-adjective stacks, everywhere.
- **Why it fails:** generated prose reaches for triads because they sound complete. One precise word beats three approximate ones; the third item is usually the weakest.
- **The move:** cut to the one item that carries the point. Keep three only when all three are load-bearing facts.

### Hedge stacks

- ❌ "can potentially help", "might be worth considering", "in some cases, this could".
- **Why it fails:** double hedges protect the writer, not the reader. A practitioner writes what they did and what happened — that needs no insurance.
- **The move:** commit or cut. "This helped" or say nothing. Real uncertainty gets stated once, as a fact: "I haven't tested this past 10k rows."

### Transition-word chains

- ❌ "Moreover... Furthermore... Additionally... That said...".
- **Why it fails:** connective tissue substituting for actual logical flow. If the DAG ordering is right, sentences connect by content; the transition word is scaffolding left up after the build.
- **The move:** delete the transition word. The paragraph almost always survives. If it doesn't, the order is wrong — fix that instead.

### Both-sides mush

- ❌ "Whether you're a beginner or a seasoned expert...", "there are pros and cons to each approach", ending analysis with "it depends".
- **Why it fails:** addressing everyone reads as written for no one. The author has a position — that position is the reason the post exists.
- **The move:** state the position and its boundary: "Do X. The exception is Y, and here's how you know you're in it."

### Attributed opinions

- ❌ "Some might argue...", "many developers feel...", "it's often said that...".
- **Why it fails:** laundering the author's opinion through an anonymous crowd. Either the author believes it — then say "I" — or nobody specific does, and it's filler.
- **The move:** "I think X" or a named source. Nothing between.

### Described artifacts

- ❌ "I updated the configuration to enable stricter checking" — with no config shown.
- **Why it fails:** describing a command is secondhand; showing it is the practitioner's proof of work. The artifact is also the most useful thing on the page — it's what readers came to copy.
- **The move:** paste the actual command, config block, or error text. The prose around it shrinks accordingly.

---

## The bespoke test

Slop-deletion leaves a hole; this is what fills it. Every section must contain at least one artifact that could only come from the author:

- a number they measured
- an error they hit, verbatim
- a config or command they ran
- a decision they made and the reason at the time
- a thing they tried that failed
- an opinion they'll defend

A section with none of these is a Wikipedia paragraph wearing the author's byline. Don't polish it — go back and interrogate (`SKILL.md` step 1) until the artifact exists, or cut the section.

## Final sweep

Read the finished draft once, asking only:

1. Could the first search result for this topic say this paragraph? -> delete or sharpen.
2. Could this sentence appear in any other person's post unchanged? -> add the author's specifics.
3. Does the ending summarize? -> replace with a beat.

If a paragraph survives all three, it's bespoke.
