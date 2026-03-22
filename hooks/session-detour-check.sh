#!/bin/bash
# PreToolUse hook for Read tool: once per day, check for active detour worktrees
# Reminds the user to finish or continue an active detour

TODAY=$(date +%Y-%m-%d)
STAMP="/tmp/.claude-detour-checked-${TODAY}"

# Already fired today
if [ -f "$STAMP" ]; then
  exit 0
fi
touch "$STAMP"

# Check for active detour worktrees
WORKTREES=$(git worktree list 2>/dev/null | grep "detour-" || true)

if [ -n "$WORKTREES" ]; then
  COUNT=$(echo "$WORKTREES" | wc -l | tr -d ' ')
  BRANCHES=$(echo "$WORKTREES" | awk '{print $3}' | tr -d '[]')
  echo "Active detour worktree(s) found (${COUNT}):"
  echo "$WORKTREES"
  echo ""
  echo "To continue: /detour <initiative> continue"
  echo "To finish and merge back: /detour <initiative> finish"
fi

exit 0
