#!/bin/sh
# PreCompact Hook
# Saves context to memory before agent compacts the conversation

AI_HOME="${HOME}/.ai"
MEMORY_DIR="${AI_HOME}/memory"

# Ensure directories exist
mkdir -p "$MEMORY_DIR"

# --- Write pre-compaction note ---
write_compaction_note() {
    local today
    today=$(date +%Y-%m-%d)
    local daily_file="${MEMORY_DIR}/${today}.md"
    local timestamp
    timestamp=$(date +%H:%M:%S)
    local cwd
    cwd=$(pwd)
    local repo_name=""

    if git rev-parse --show-toplevel >/dev/null 2>&1; then
        repo_name=$(basename "$(git rev-parse --show-toplevel)")
    fi

    {
        echo ""
        echo "### Context compacted at ${timestamp}"
        if [ -n "$repo_name" ]; then
            echo "- Repository: ${repo_name}"
        fi
        echo "- Working directory: ${cwd}"
        echo "- [Key context should have been persisted to memory before this point]"
        echo ""
    } >> "$daily_file"
}

# --- Output guidance for the agent ---
output_compaction_guidance() {
    echo "<ai-pre-compact>"
    echo "Context is about to be compacted."
    echo "Before compaction completes, persist any important context that has not yet been saved:"
    echo "- Key decisions made in this conversation"
    echo "- Current task state and progress"
    echo "- Any facts or preferences learned about the user"
    echo "- Repository-specific findings that should be remembered"
    echo "Update ~/.ai/workspace/MEMORY.md if needed."
    echo "</ai-pre-compact>"
}

# --- Main ---
write_compaction_note
output_compaction_guidance
