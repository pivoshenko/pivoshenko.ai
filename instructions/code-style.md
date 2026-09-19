---
name: Code Style
description: "Guardrail on code style."
tags: [meta, style]
updated_at: 2026-09-19
---

# Code Style

## Comments

**Comment only what the code cannot say itself.** A comment earns its place by explaining why, a constraint, a non-obvious consequence, or a workaround with its reason. Restating what the next line already says is noise - delete it rather than rewording it. This covers docstrings and doc comments too: a docstring that only re-spells the function name and its typed parameters adds nothing, so leave it out and write one where the contract, the failure modes, or the units are not evident from the signature. The same applies to high-level and section comments - a `== Group ==` label over code that is already obviously one group is decoration.

When editing existing code, do not add commentary narrating the change or its history - the diff and the commit message carry that.

**Comments never end with a period.** Any language (Python, Rust, TypeScript, Go, shell, etc.), inline or full-line, single-sentence or not, including comment text rewritten while editing.

**Docstrings and doc comments do.** Python `"""docstrings"""`, Rust `///` and `//!`, JSDoc and Go doc comments are documentation rather than comments, so they keep normal sentence punctuation.

**A comment labelling a block of related code takes the form `== Group ==`**, double equals, one space inside each pair, Title Case label:

```typescript
// == Parsing ==

function tokenize() {}
function lex() {}

// == Emit ==

function render() {}
```

No other separator style: no banner rules, no `----------`, no `####`, no boxed ASCII.
