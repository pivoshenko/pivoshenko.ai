---
name: Comment Punctuation
description: Code comments never end with a period, in any language. Docstrings are exempt and keep normal punctuation.
tags: [meta, style]
updated_at: 2026-07-19
---

# Comment Punctuation

**Code comments never end with a period. Docstrings are fine.**

In any language (Python, Rust, TypeScript, Go, shell, etc.), do not end a comment with a trailing period, neither inline comments nor full-line comments, single-sentence or otherwise. This applies to comments you write and to comment text you rewrite while editing.

Docstrings and doc comments (Python `"""docstrings"""`, Rust `///` / `//!`, JSDoc, Go doc comments, etc.) are documentation, not comments. They keep normal sentence punctuation, including trailing periods.
