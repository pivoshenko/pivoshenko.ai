#!/bin/sh
# AI SessionStart Hook
# Loads workspace files and injects memory-focused context.

AI_HOME="${HOME}/.ai"
WORKSPACE="${AI_HOME}/workspace"
SKILLS_DIR="${AI_HOME}/skills"
MEMORY_DIR="${AI_HOME}/memory"

# --- Check USER.md ---
check_user_profile() {
    local user_file="${WORKSPACE}/USER.md"
    if [ ! -f "$user_file" ]; then
        return 1
    fi
    # Check if USER.md has been populated (not just the template)
    if grep -q "^- Name:$" "$user_file" 2>/dev/null; then
        # Name field is empty, user has not been onboarded
        return 1
    fi
    return 0
}

# --- Load memory context ---
load_memory_context() {
    local today
    today=$(date +%Y-%m-%d)
    local yesterday
    yesterday=$(date -v-1d +%Y-%m-%d 2>/dev/null || date -d "yesterday" +%Y-%m-%d 2>/dev/null || echo "")

    # Load today's memory file if it exists
    if [ -f "${MEMORY_DIR}/${today}.md" ]; then
        echo "## Recent Memory (${today})"
        echo ""
        cat "${MEMORY_DIR}/${today}.md"
        echo ""
    fi

    # Load yesterday's memory file if it exists
    if [ -n "$yesterday" ] && [ -f "${MEMORY_DIR}/${yesterday}.md" ]; then
        echo "## Previous Day Memory (${yesterday})"
        echo ""
        cat "${MEMORY_DIR}/${yesterday}.md"
        echo ""
    fi

    # If current directory is a git repo, note it for context
    if [ -d ".git" ] || git rev-parse --git-dir >/dev/null 2>&1; then
        local repo_name
        repo_name=$(basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)")
        local branch
        branch=$(git branch --show-current 2>/dev/null || echo "unknown")
        echo "## Current Repository"
        echo ""
        echo "- Repository: ${repo_name}"
        echo "- Branch: ${branch}"
        echo "- Path: $(pwd)"
        echo ""
    fi
}

# --- Main ---

# Build additionalContext output
echo "<ai-context>"
echo ""

# Inject all workspace files
for ws_file in SOUL.md AGENTS.md IDENTITY.md USER.md MEMORY.md; do
    filepath="${WORKSPACE}/${ws_file}"
    if [ -f "$filepath" ]; then
        echo "<!-- workspace:${ws_file} -->"
        cat "$filepath"
        echo ""
        echo "<!-- /workspace:${ws_file} -->"
        echo ""
    fi
done

# Load memory context
load_memory_context

# Check if force re-onboard was requested
force_onboard=false
force_flag="${AI_HOME}/config/.force-onboard"
if [ -f "$force_flag" ]; then
    rm -f "$force_flag"
    force_onboard=true
fi

# Check if onboarding is needed
if [ "$force_onboard" = true ] || ! check_user_profile; then
    echo "## Onboarding Required"
    echo ""
    echo "USER.md is empty. You MUST begin onboarding immediately."
    echo "Do not wait for the user to ask. Follow these instructions:"
    echo ""
    onboarding_file="${SKILLS_DIR}/_onboarding/SKILL.md"
    if [ -f "$onboarding_file" ]; then
        cat "$onboarding_file"
    else
        echo "ERROR: Onboarding skill not found at $onboarding_file"
        echo "Ask the user to re-run setup.sh."
    fi
    echo ""
else
    echo "## AI Active"
    echo ""
    echo "AI is loaded and ready. User profile: $(grep '^- Name:' "${WORKSPACE}/USER.md" | sed 's/^- Name: //')."
    echo ""
    echo "When the user sends their first message, briefly acknowledge that AI is active before responding to their request. One short line is enough, e.g. 'AI ready. [then respond to their message]'. Do not repeat this acknowledgement after the first message."
    echo ""
fi

echo "</ai-context>"
