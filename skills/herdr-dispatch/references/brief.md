# Worker Brief

Fill every `<...>` and keep the closing line for your Herdr. In the app, `<parent>` is the dispatcher's `$HC_TERMINAL_ID`, expanded before sending.

```text
<What to do, concretely: the change, the files, the expected outcome.>

Scope:
- You own: <paths>
- Do not touch: <paths, or "anything outside your paths">
- Do not start agents or terminals of your own

Verify with: <the repository's check command>

App: Write your complete result as Markdown to <absolute result path>. Then run hc send <parent> "<absolute result path>" and nothing else.
TUI: Write your complete result as Markdown to <absolute result path>. Reply with only that absolute path, nothing else.

Report a blocker the same way, with the blocker written in the file.
```
