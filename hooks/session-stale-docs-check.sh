#!/bin/bash
# PreToolUse hook for Read tool: once per day, check for stale docs/ai/ status files
# Warns if a status.md hasn't been updated in >3 days while the repo has had recent commits

TODAY=$(date +%Y-%m-%d)
STAMP="/tmp/.claude-stale-docs-checked-${TODAY}"

# Already fired today
if [ -f "$STAMP" ]; then
  exit 0
fi
touch "$STAMP"

# No docs/ai/ directory — nothing to check
if [ ! -d "docs/ai" ]; then
  exit 0
fi

# Find status files
STATUS_FILES=$(find docs/ai -name "*-status.md" -type f 2>/dev/null)
if [ -z "$STATUS_FILES" ]; then
  exit 0
fi

# Check each status file for staleness
STALE_FILES=""
for f in $STATUS_FILES; do
  # Get last modification date of the file in git
  LAST_COMMIT_DATE=$(git log -1 --format="%ai" -- "$f" 2>/dev/null | cut -d' ' -f1)
  if [ -z "$LAST_COMMIT_DATE" ]; then
    continue
  fi

  # Calculate days since last update
  LAST_EPOCH=$(date -d "$LAST_COMMIT_DATE" +%s 2>/dev/null)
  TODAY_EPOCH=$(date +%s)

  if [ -n "$LAST_EPOCH" ]; then
    DAYS_AGO=$(( (TODAY_EPOCH - LAST_EPOCH) / 86400 ))
    if [ "$DAYS_AGO" -ge 3 ]; then
      # Check if repo has had recent commits (active work happening)
      RECENT_COMMITS=$(git log --since="3 days ago" --oneline 2>/dev/null | head -1)
      if [ -n "$RECENT_COMMITS" ]; then
        STALE_FILES="${STALE_FILES}\n  ${f} (last updated ${DAYS_AGO} days ago)"
      fi
    fi
  fi
done

if [ -n "$STALE_FILES" ]; then
  INIT_NAME=$(echo "$STATUS_FILES" | head -1 | sed 's|docs/ai/||;s|-status.md||')
  echo "Stale docs/ai/ status file(s) — repo has recent commits but status hasn't been updated:"
  echo -e "$STALE_FILES"
  echo ""
  echo "Run /continue-work ${INIT_NAME} to resume and update docs."
fi

exit 0
