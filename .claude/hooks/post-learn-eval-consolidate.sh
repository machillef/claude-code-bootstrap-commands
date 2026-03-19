#!/bin/bash
# PostToolUse hook for Skill tool: after learn-eval, remind to consolidate
# Closes the learning loop: learn-eval extracts → consolidate merges into parent skills

INPUT=$(cat)
SKILL=$(echo "$INPUT" | jq -r '.tool_input.skill // empty')

# Only trigger after learn-eval completes
if echo "$SKILL" | grep -qi "learn-eval"; then
  echo "learn-eval completed. New patterns may be in ~/.claude/skills/learned/."
  echo "Run /consolidate-learnings to merge them into parent skill gotchas."
  echo "This closes the self-learning loop — patterns get placed where they'll be read next time."
fi

exit 0
