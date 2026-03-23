---
name: codex-fix-bugs
description: Fix bugs found during manual or acceptance testing of a completed slice. Re-enters the disciplined workflow with systematic debugging, TDD, and doc updates.
---

# Codex Fix Bugs

Use this skill when manual or acceptance testing reveals bugs in a slice that already passed automated verification.

## Inputs

- Initiative name (required)
- Bug description (required — what was observed, expected vs actual)
- Slice number (optional — defaults to the most recently completed slice)

## Procedure

### 1. Load State

- Read repo `AGENTS.md` if present.
- Read `docs/ai/<initiative>-status.md`.
- Read `docs/ai/<initiative>-slices.md`.
- Run `git log --oneline -10`.

Identify the target slice:
- If a slice number was given, use that slice.
- Otherwise, find the most recently completed slice (last `Status: Complete` in status.md).

**Validation gates:**
- If `In Progress` → tell the user to keep working or use `codex-continue-work`.
- If `Not Started` → tell the user to use `codex-continue-work`.
- If `Blocked` → tell the user to resolve the blocker first.
- If no initiative docs exist → tell the user to use `codex-bootstrap-existing` or `codex-bootstrap-new`.

### 2. Reopen Slice

Update `docs/ai/<initiative>-status.md`:
- Change status from `Complete` to `Needs Fix`.
- Append a bug report entry:

```markdown
### Bug Report (<date>)
Reported by: <Manual testing | User report | Integration testing>
Description: <bug description>
```

Commit: `docs: mark slice <N> as Needs Fix — <one-line bug summary>`

### 3. Reproduce and Diagnose

Apply `codex-systematic-debugging` principles inline:

**Phase 1 — Root Cause Investigation:**
- Read the bug description carefully.
- Read the slice's changed files (from status.md "What was implemented").
- Reproduce the issue if possible.
- Trace the data flow from symptom to root cause.
- Check the slice's git diff for the likely origin.

**Phase 2 — Pattern Analysis:**
- Find working examples of similar behavior in the codebase.
- Compare against the broken path — identify what's different.
- Form a single hypothesis for the root cause.

**Write a failing test** that demonstrates the bug. If no test framework exists, state this explicitly and proceed with manual verification.

### 4. Fix

- Implement the minimal fix to make the failing test pass.
- Refactor if needed — tests must stay green.
- Each attempt must change something — never retry the same approach.

**Escalation:** If 3+ fix attempts fail:
- STOP.
- Transition the slice to `Blocked` in status.md.
- Record all attempts and evidence.
- Tell the user this may be a design issue, not an implementation bug.

### 5. Verify

Run both:
1. The new bug-fix test (must pass).
2. The original slice validation commands (must still pass).

If either fails, return to Step 4 (counts toward the 3-attempt limit).

### 6. Re-assess

- **Completeness:** Does the fix fully address the reported bug?
- **Side effects:** Did the fix break anything adjacent?
- **Pattern check:** Could this bug pattern exist elsewhere in the slice?
- **Defense-in-depth:** Are there related edge cases to guard against?

If re-assessment finds another issue: fix it as a separate bug with its own Fix entry.

### 7. Update Docs

**Mandatory — `docs/ai/<initiative>-status.md`:**

Append a Fix entry to the target slice:

```markdown
### Fix: <bug description> (<date>)
Reported by: <Manual testing | User report | Integration testing>
Root cause: <one-line root cause>
Fix: <files changed and what each change does>
Tests added: <test file:test name, or "existing test updated">
Validated: <exact commands run and pass/fail>
```

Transition status back to `Complete`.

Update `docs/ai/<initiative>-decisions.md` if the fix changed the approach.

### 8. Stop Cleanly

Always end with structured output:

```text
Slice <N>: <name> — Fix <Applied|Blocked>
Bug: <one-line bug description>
Root cause: <one-line root cause>
Fix: <file list changed>
Tests added: <test names>
Validated: <commands and pass/fail>
Manual retest: <what the user should re-verify>
Next: use codex-continue-work for <initiative> -> Slice <N+1>: <name>
      use codex-fix-bugs for <initiative> — if more bugs found after retesting
```

Do not end conversationally. Use the template.

## Rules

- Do not expand scope beyond the reported bugs.
- Do not advance to the next slice — only fix and re-verify.
- If 3+ fix attempts fail, transition to `Blocked` (not back to `Complete`).
- If the bug is a design flaw, escalate — suggest re-planning the slice.
- Prefer targeted edits over rewrites.

## Gotchas

- **Fixing old slices:** If fixing Slice 10 and Slices 11-15 are complete, verify the fix doesn't break later slices. Run the full test suite.
- **Multiple bugs:** Fix one at a time. Each bug gets its own diagnosis, fix, and Fix entry.
- **No test framework:** State this in the output as "No test framework — verified manually: <what you checked>".
- **Bug is a feature gap:** If investigation reveals the "bug" is missing functionality not in the slice definition, tell the user. This is a new slice, not a fix.
