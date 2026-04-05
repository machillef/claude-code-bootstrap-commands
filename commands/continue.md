---
description: Continue an existing initiative. Loads repo state, picks next slice, implements with TDD, verifies, updates docs.
---

**Initiative:** $ARGUMENTS

Your first output line must be the message below. Print it before any file reads or analysis. Use the exact text — do not customize it. Users experience minutes of silence otherwise.

```
Continuing initiative. Loading state...
```

## Initiative Resolution

**How to identify the initiative name:** The initiative name is the token in `$ARGUMENTS` that matches an existing `docs/ai/<token>-status.md` file. Check the first non-flag word against the filesystem. If it matches, use it. If no token matches any status file, treat the entire argument as a description/constraint and trigger auto-detection.

If `$ARGUMENTS` provides a matching initiative name, use it directly.

If no match is found or `$ARGUMENTS` is empty, auto-detect from `docs/ai/`:

1. Scan for `docs/ai/*-status.md` files
2. For each, read the file and check for slices in any state (In Progress, Not Started, Needs Fix, or all Complete)
3. Prioritize active initiatives (with In Progress/Not Started/Needs Fix slices) over completed ones

**One initiative found:** Use it automatically. Print: `Auto-detected initiative: <name>. Continuing...`
If all slices are Complete, the execution-loop will enter Extend Mode — this is expected.

**Multiple initiatives found:** Present a numbered list and ask the user to pick:
```
Active initiatives:
  1. auth-feature (Slice 3 of 5 — In Progress)
  2. dark-mode (Slice 1 of 3 — Not Started)
Completed (extend mode):
  3. onboarding-flow (all 4 slices Complete)
Which initiative? (number or name)
```

**No initiatives found:** Print:
```
No active initiatives in docs/ai/. Start one with:
  /initiative <description>   — for existing code
  /new-project <description>   — for greenfield
```

---

Then use the `execution-loop` skill. Follow it exactly — all steps, all gates, all output formats.

The skill handles: session start checklist → stale check → load state → select slice → scope → research → TDD → arc agent delegation → verify → debug if needed → re-assess → update docs → learning → stop.

If the argument includes a constraint or priority (e.g., `/continue auth-feature — focus on the API layer`), pass it through to the execution-loop as the current priority.
