#!/bin/bash
# PreToolUse hook for Read tool: on first read of a session, check if skill-health is overdue
# Uses a stamp file to fire only once per session and a history file for staleness

STAMP="/tmp/.claude-skill-health-checked-$$"
HISTORY="$HOME/.claude/skill-health-history.jsonl"

# Only fire once per session (check for stamp from parent process)
PARENT_STAMP="/tmp/.claude-skill-health-checked-$PPID"
if [ -f "$PARENT_STAMP" ]; then
  exit 0
fi
touch "$PARENT_STAMP"

# No history at all — first time user
if [ ! -f "$HISTORY" ]; then
  echo "No skill health baseline found. Run /skill-health to establish one."
  exit 0
fi

# Check last run date
LAST_DATE=$(tail -1 "$HISTORY" | jq -r '.date // empty' 2>/dev/null)
if [ -z "$LAST_DATE" ]; then
  echo "Skill health history has no valid entries. Run /skill-health to establish a baseline."
  exit 0
fi

# Calculate days since last run (portable: works on GNU and BSD date)
TODAY=$(date +%Y-%m-%d)
if [ "$LAST_DATE" = "$TODAY" ]; then
  exit 0
fi

# Try GNU date first, fall back to simple string comparison for 7-day threshold
LAST_EPOCH=$(date -d "$LAST_DATE" +%s 2>/dev/null)
TODAY_EPOCH=$(date +%s)

if [ -n "$LAST_EPOCH" ]; then
  DAYS_AGO=$(( (TODAY_EPOCH - LAST_EPOCH) / 86400 ))
  if [ "$DAYS_AGO" -ge 7 ]; then
    echo "Last /skill-health run was ${DAYS_AGO} days ago (${LAST_DATE}). Consider running it to check for structural improvements."
  fi
else
  # Fallback: just remind if dates differ (can't calculate delta)
  echo "Last /skill-health run was on ${LAST_DATE}. Consider running it if it's been a while."
fi

exit 0
