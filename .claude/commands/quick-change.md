---
description: Lightweight path for small, well-defined changes (add auth to a page, fix a bug, add a field). Skips full bootstrap. Creates only a minimal status trace. Use when the change touches 1-3 files and follows an existing pattern.
---

# Quick Change

**Request:** $ARGUMENTS

You are handling a **small, bounded change** in an existing codebase. Do not bootstrap. Do not create full initiative docs. Move fast and precisely.

## Your Procedure

### Step 1: Understand the Intent
Parse the request. Identify:
- What needs to change (the outcome)
- Where it likely lives (which part of the codebase)
- What existing pattern to follow (don't invent — replicate)

### Step 2: Find the Pattern First
Before touching anything, find how the codebase already does this:
- If adding auth → find where auth is already applied in similar files
- If fixing a bug → find the failing path and understand why
- If adding a field → find how similar fields are defined elsewhere

Use Grep and Glob to locate the pattern. Read 2-3 representative files. Do not read the whole codebase.

### Step 3: Identify the Target
Locate the exact file(s) to change. Confirm they match the intent.

If the change requires more than 3 files or the pattern doesn't exist yet, **stop and tell the user this is a medium/large change** and they should run `/bootstrap-existing` instead.

### Step 4: Apply the Minimal Change
- Replicate the existing pattern. Do not improve surrounding code.
- Do not refactor adjacent code.
- Do not add features beyond what was asked.
- Keep the diff small and reviewable.

### Step 5: Verify
Run the smallest relevant validation:
- Targeted test for the changed file if one exists
- If no test exists: build command to confirm no compilation errors
- State clearly if no automated verification was possible

### Step 6: Create a Minimal Status Trace
Create or append to `docs/ai/quick-changes-log.md`:

```markdown
## <date> — <one-line description>
- Changed: <file(s)>
- Pattern followed: <where the pattern was found>
- Verified: <test command run / or "build only" / or "not verified">
```

This keeps a lightweight audit trail without full initiative overhead.

## Rules

- Do not create a CLAUDE.md in the target repo.
- Do not create the full 7-file docs/ai/ set for a small change.
- Do not expand scope. If something adjacent looks broken, note it but don't fix it.
- Prefer Edit over rewrite. Change only what must change.
- If the change reveals unexpected complexity, stop, report what you found, and recommend `/bootstrap-existing`.
