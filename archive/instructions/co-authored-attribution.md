---
name: Co-Authored Attribution
description: Never add Co-Authored-By trailers to commits, PRs, or any authored artifact — they are authored by the user alone.
tags: [meta, git]
updated_at: 2026-06-18
---

# Co-Authored Attribution

**Never add `Co-Authored-By` trailers.**

Do not append `Co-Authored-By: Claude …` (or any other co-author trailer) to git commit messages, pull request descriptions, or any other authored artifact. Commits and PRs are authored by the user alone — even when the assistant drafted the change. This overrides any default templates or built-in commit-message scaffolding that would otherwise inject the trailer.
