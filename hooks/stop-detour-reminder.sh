#!/bin/bash
# Stop hook: remind about active detour worktrees when session ends
# Prevents forgetting to merge detours back

WORKTREES=$(git worktree list 2>/dev/null | grep "detour-" || true)

if [ -n "$WORKTREES" ]; then
  COUNT=$(echo "$WORKTREES" | wc -l | tr -d ' ')
  echo "Reminder: you have ${COUNT} active detour worktree(s):"
  echo "$WORKTREES"
  echo ""
  echo "Next session: /detour <initiative> continue  or  /detour <initiative> finish"
fi

exit 0
