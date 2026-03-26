---
name: freeze
description: "Restrict file edits to a specific directory. Blocks Edit/Write outside the boundary."
---

# Freeze

Sets a boundary that blocks all Edit and Write operations outside the specified directory. Enforced by a PreToolUse hook — hard deny, not a soft suggestion.

## Usage

```
/freeze <directory>
/freeze                  # prompts for directory
```

## Behavior

1. Resolve the directory argument to an absolute path
2. Verify the directory exists
3. Write the path to `/tmp/.claude-freeze-dir`
4. Confirm: "Freeze active: edits restricted to `<directory>`"

If no argument is provided, ask the user which directory to freeze to. Default suggestion: the current working directory.

## Integration with systematic-debugging

When invoked from the systematic-debugging skill (after root cause identification), the freeze boundary should be set to the narrowest directory containing the affected files. This prevents scope creep during debugging sessions.

## Clearing

Run `/unfreeze` to remove the restriction. The freeze persists across sessions until explicitly cleared.

## Rules

- Only one freeze boundary at a time (new freeze overwrites old)
- The boundary applies to Edit and Write tools only — Read, Bash, and Grep are unaffected. Bash can still write files via redirects, cp, mv, sed -i, etc. This is a scope-discipline tool, not access control.
- `docs/ai/` and `.claude/` paths are always exempt from the freeze boundary. Every workflow requires updating initiative status docs, and blocking these would break execution-loop, systematic-debugging, and loop-work.
- The freeze state is system-wide (`/tmp/.claude-freeze-dir`). Concurrent Claude sessions share the same boundary. If you run multiple sessions, only the most recent `/freeze` takes effect.
- Do not auto-freeze without user intent (the command is always explicit)
