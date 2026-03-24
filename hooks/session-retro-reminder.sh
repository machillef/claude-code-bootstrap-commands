#!/bin/bash
# PreToolUse hook for Read tool: once per day, remind about completed initiatives
# that haven't had a retro run yet.

TODAY=$(date +%Y-%m-%d)
STAMP="/tmp/.claude-retro-reminder-${TODAY}"

# Already fired today
if [ -f "$STAMP" ]; then
  exit 0
fi
touch "$STAMP"

# No docs/ai/ directory — nothing to check
if [ ! -d "docs/ai" ]; then
  exit 0
fi

# Find top-level status files (not archived)
STATUS_FILES=$(find docs/ai -maxdepth 1 -name "*-status.md" -type f 2>/dev/null)
if [ -z "$STATUS_FILES" ]; then
  exit 0
fi

NEEDS_RETRO=""
for f in $STATUS_FILES; do
  # Only check files where ALL slices are done (no active slices)
  if grep -qE "Status: (Not Started|In Progress|Needs Fix)" "$f" 2>/dev/null; then
    continue
  fi

  # Has at least one Complete or Blocked slice (not an empty/malformed file)
  if ! grep -qE "Status: (Complete|Blocked)" "$f" 2>/dev/null; then
    continue
  fi

  # Extract initiative name
  INIT_NAME=$(basename "$f" | sed 's/-status\.md$//')

  # Check if retro-log.md already has an entry for this initiative
  if [ -f "docs/ai/retro-log.md" ] && grep -q "## ${INIT_NAME}" "docs/ai/retro-log.md" 2>/dev/null; then
    continue
  fi

  NEEDS_RETRO="${NEEDS_RETRO}\n  ${INIT_NAME}"
done

if [ -n "$NEEDS_RETRO" ]; then
  echo "Completed initiative(s) with no retro yet:"
  printf "%b\n" "$NEEDS_RETRO"
  echo ""
  echo "Run /retro <initiative> to extract learnings and archive docs."
fi

exit 0
