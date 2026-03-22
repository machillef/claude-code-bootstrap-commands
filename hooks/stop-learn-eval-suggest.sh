#!/bin/bash
# Stop hook: suggest running learn-eval after meaningful sessions
# Checks if the session had substantial work (proxy: recent git commits in this session)

# Check if there were recent commits in the last 2 hours (likely this session)
RECENT_COMMITS=$(git log --since="2 hours ago" --oneline 2>/dev/null | wc -l | tr -d ' ')

if [ "$RECENT_COMMITS" -ge 2 ]; then
  # Check if learn-eval has been run recently (today)
  TODAY=$(date +%Y-%m-%d)
  LEARN_STAMP="/tmp/.claude-learn-eval-run-${TODAY}"

  if [ ! -f "$LEARN_STAMP" ]; then
    echo "Session had ${RECENT_COMMITS} commits. Consider running /everything-claude-code:learn-eval to extract reusable patterns before closing."
  fi
fi

exit 0
