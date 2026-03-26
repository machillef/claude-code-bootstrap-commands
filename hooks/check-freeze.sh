#!/bin/bash
# PreToolUse hook for Edit/Write: block edits outside the freeze boundary
# Returns permissionDecision: "deny" if the file is outside the frozen directory.
#
# Freeze state is stored in /tmp/.claude-freeze-dir (set by /freeze, cleared by /unfreeze).
# When no freeze is active, all edits are allowed.
#
# Note: set -euo pipefail is intentionally omitted. grep/jq return non-zero on no match
# or missing input, which would abort the hook and block the tool invocation.
# Fail-open: if jq is missing or stdin is malformed, the hook allows the operation.
#
# Limitation: this hook guards Edit and Write tools only. The Bash tool can write files
# via redirects, cp, mv, sed -i, etc. This is a scope-discipline tool, not access control.

FREEZE_FILE="/tmp/.claude-freeze-dir"

# No freeze active — allow everything
if [ ! -f "$FREEZE_FILE" ]; then
  exit 0
fi

FREEZE_DIR=$(cat "$FREEZE_FILE" 2>/dev/null)
if [ -z "$FREEZE_DIR" ]; then
  exit 0
fi

# Read tool input from stdin
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Resolve to absolute path if relative
if [[ "$FILE_PATH" != /* ]]; then
  FILE_PATH="$(pwd)/$FILE_PATH"
fi

# Canonicalize paths to prevent traversal via ".." segments or symlinks
# realpath -m works even if the target does not exist yet (important for Write)
FILE_PATH=$(realpath -m "$FILE_PATH" 2>/dev/null || echo "$FILE_PATH" | sed 's|/\+|/|g; s|/$||')
FREEZE_DIR=$(realpath -m "$FREEZE_DIR" 2>/dev/null || echo "$FREEZE_DIR" | sed 's|/\+|/|g; s|/$||')

# Check if file is inside the freeze boundary
case "$FILE_PATH" in
  "${FREEZE_DIR}"|"${FREEZE_DIR}"/*)
    # Inside boundary — allow
    exit 0
    ;;
  *)
    # Outside boundary — deny
    echo "{\"permissionDecision\":\"deny\",\"message\":\"[freeze] Blocked: ${FILE_PATH} is outside the freeze boundary (${FREEZE_DIR}). Run /unfreeze to remove the restriction.\"}"
    exit 0
    ;;
esac
