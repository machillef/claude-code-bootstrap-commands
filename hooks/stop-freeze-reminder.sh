#!/bin/bash
# Stop hook: remind about active freeze boundary when session ends
# Note: set -euo pipefail is intentionally omitted — hooks must exit 0 on benign failures.

FREEZE_FILE="/tmp/.claude-freeze-dir"

if [ -f "$FREEZE_FILE" ]; then
  FREEZE_DIR=$(cat "$FREEZE_FILE" 2>/dev/null)
  if [ -n "$FREEZE_DIR" ]; then
    echo "Freeze boundary is still active: ${FREEZE_DIR}"
    echo "Edits outside this directory will be blocked in the next session."
    echo "Run /unfreeze to remove, or it will persist until cleared."
  fi
fi

exit 0
