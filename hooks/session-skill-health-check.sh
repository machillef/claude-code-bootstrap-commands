#!/bin/bash
# PreToolUse hook for Read tool: once per day, check if skill-health is overdue
# Uses a date-based stamp file so it fires once per calendar day regardless of session boundaries

TODAY=$(date +%Y-%m-%d)
STAMP="/tmp/.claude-skill-health-checked-${TODAY}"
HISTORY="$HOME/.claude/skill-health-history.jsonl"

# Already fired today
if [ -f "$STAMP" ]; then
  exit 0
fi
touch "$STAMP"

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

# Same day — no reminder needed
if [ "$LAST_DATE" = "$TODAY" ]; then
  exit 0
fi

# Portable date-to-epoch: GNU date -d first, then macOS date -jf
date_to_epoch() {
  date -d "$1" +%s 2>/dev/null || date -jf "%Y-%m-%d" "$1" +%s 2>/dev/null
}

LAST_EPOCH=$(date_to_epoch "$LAST_DATE")
TODAY_EPOCH=$(date +%s)

if [ -n "$LAST_EPOCH" ]; then
  DAYS_AGO=$(( (TODAY_EPOCH - LAST_EPOCH) / 86400 ))
  if [ "$DAYS_AGO" -ge 7 ]; then
    echo "Last /skill-health run was ${DAYS_AGO} days ago (${LAST_DATE}). Consider running it to check for structural improvements."
  fi
else
  # Fallback: can't calculate delta, just remind if dates differ
  echo "Last /skill-health run was on ${LAST_DATE}. Consider running it if it's been over a week."
fi

exit 0
