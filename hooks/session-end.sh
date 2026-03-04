#!/bin/sh
# SessionEnd Hook
# Captures session context to daily memory notes and session log.
# Note: This hook runs AFTER the agent's last turn, so guidance text
# will not be seen by the agent. Instead we capture as much useful
# context as the shell can gather autonomously.

AI_HOME="${HOME}/.ai"
MEMORY_DIR="${AI_HOME}/memory"
WORKSPACE="${AI_HOME}/workspace"
HOOKS_DIR="${AI_HOME}/hooks"
SESSION_LOG="${AI_HOME}/session-log.jsonl"

# Source cc-sessions compatibility
if [ -f "${HOOKS_DIR}/cc-sessions-compat.sh" ]; then
    . "${HOOKS_DIR}/cc-sessions-compat.sh"
fi

# --- Ensure directories exist ---
mkdir -p "$MEMORY_DIR"

# --- Gather git context ---
get_git_context() {
    if ! git rev-parse --show-toplevel >/dev/null 2>&1; then
        return
    fi

    local branch
    branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    echo "- Branch: ${branch}"

    # Show files changed in this session (uncommitted changes)
    local changed
    changed=$(git status --porcelain 2>/dev/null | head -10)
    if [ -n "$changed" ]; then
        echo "- Uncommitted changes:"
        echo "$changed" | while IFS= read -r line; do
            echo "  - ${line}"
        done
        local total
        total=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
        if [ "$total" -gt 10 ]; then
            echo "  - ... and $((total - 10)) more files"
        fi
    fi

    # Show last 3 commits (likely from this session)
    local recent
    recent=$(git log --oneline -3 2>/dev/null)
    if [ -n "$recent" ]; then
        echo "- Recent commits:"
        echo "$recent" | while IFS= read -r line; do
            echo "  - ${line}"
        done
    fi
}

# --- Write daily memory note ---
write_daily_note() {
    local today
    today=$(date +%Y-%m-%d)
    local daily_file="${MEMORY_DIR}/${today}.md"
    local timestamp
    timestamp=$(date +%H:%M:%S)
    local cwd
    cwd=$(pwd)
    local repo_name=""

    # Get repo name if in a git repository
    if git rev-parse --show-toplevel >/dev/null 2>&1; then
        repo_name=$(basename "$(git rev-parse --show-toplevel)")
    fi

    # Append session entry to daily file
    {
        echo ""
        echo "### Session ended at ${timestamp}"
        if [ -n "$repo_name" ]; then
            echo "- Repository: ${repo_name}"
        fi
        echo "- Working directory: ${cwd}"
        get_git_context
        echo ""
    } >> "$daily_file"
}

# --- Update session log ---
update_session_log() {
    local timestamp
    timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    local cwd
    cwd=$(pwd)
    local repo_name=""
    local branch=""
    local cc_sessions_active="false"

    if git rev-parse --show-toplevel >/dev/null 2>&1; then
        repo_name=$(basename "$(git rev-parse --show-toplevel)")
        branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
    fi

    # Check cc-sessions status
    if command -v is_cc_sessions_repo >/dev/null 2>&1 && is_cc_sessions_repo; then
        cc_sessions_active="true"
    fi

    # Append JSONL entry
    python3 -c "
import json
entry = {
    'event': 'session_end',
    'timestamp': '${timestamp}',
    'working_directory': '${cwd}',
    'repository': '${repo_name}',
    'branch': '${branch}',
    'cc_sessions_active': '${cc_sessions_active}' == 'true'
}
print(json.dumps(entry))
" >> "$SESSION_LOG"
}

# --- Main ---
write_daily_note
update_session_log
