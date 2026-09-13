---
name: Code Comments
description: "Guardrail on comment style."
tags: [meta, style]
updated_at: 2026-09-13
---

# Code Comments

## Comments

**Comments never end with a period.** Any language (Python, Rust, TypeScript, Go, shell, etc.), inline or full-line, single-sentence or not, including comment text rewritten while editing.

## Docstrings

**Docstrings and doc comments do.** Python `"""docstrings"""`, Rust `///` and `//!`, JSDoc and Go doc comments are documentation rather than comments, so they keep normal sentence punctuation.

## Block Labels

**A comment labelling a block of related code takes the form `== Group ==`**, double equals, one space inside each pair, Title Case label:

```typescript
// == Parsing ==

function tokenize() {}
function lex() {}

// == Emit ==

function render() {}
```

No other separator style: no banner rules, no `----------`, no `####`, no boxed ASCII.
