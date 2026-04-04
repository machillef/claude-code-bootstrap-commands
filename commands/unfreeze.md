---
name: unfreeze
description: "Remove the edit freeze boundary, allowing edits to all directories."
---

# Unfreeze

Removes the freeze boundary set by `/freeze`, restoring normal edit permissions.

## Usage

```
/unfreeze
```

## Behavior

1. Check if `/tmp/.claude-freeze-dir` exists
2. If it exists: delete it and confirm "Freeze removed. Edits are no longer restricted."
3. If it does not exist: "No freeze is active."

No arguments, no prompts.
