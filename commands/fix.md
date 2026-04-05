---
description: Fix bugs found during manual or acceptance testing of a completed slice. Re-enters the disciplined workflow with systematic debugging, TDD, and doc updates.
---

**Request:** $ARGUMENTS

## Immediate Acknowledgment

Before doing anything else — before reading files, before thinking — print this immediately so the user knows you're working:

```
Bug report received. Loading initiative state and diagnosing...
```

Then proceed with the full workflow below.

---

Bugs were found after a slice passed automated verification. This command re-opens the slice, diagnoses and fixes the bugs with full workflow discipline, and produces structured output.

## Parse Arguments

Extract from the request:
- **Initiative name** (required) — which initiative this belongs to
- **Bug description** (required) — what the user observed (symptoms, steps to reproduce, expected vs actual)
- **Slice number** (optional) — defaults to the most recently completed slice
- **--review-after** (optional flag) — run a review pass after all fixes are applied

## Procedure

### 1. Load State

- Read `CLAUDE.md` — project rules and structure
- Read `docs/ai/<initiative>-status.md` — current state of all slices
- Read `docs/ai/<initiative>-slices.md` — slice definitions and touched areas
- Run `git log --oneline -10` — recent changes

Identify the target slice:
- If a slice number was given, use that slice
- Otherwise, find the most recently completed slice (last entry with `Status: Complete` in status.md)

**Validation gates:**
- If the target slice is `In Progress` → tell the user: "This slice is still in progress. Keep working, or use `/continue <initiative>` to resume."
- If the target slice is `Not Started` → tell the user: "This slice hasn't been started. Use `/continue <initiative>` to implement it."
- If the target slice is `Blocked` → tell the user: "This slice is blocked. Resolve the blocker first, then use `/continue <initiative>`."
- If no initiative docs exist → tell the user: "No initiative found. Use `/new-feature` or `/new-project` first."

### 2. Reopen Slice

Update `docs/ai/<initiative>-status.md`:
- Change the target slice status from `Complete` to `Needs Fix`
- Append to the slice entry:

```markdown
### Bug Report (<date>)
Reported by: <Manual testing | User report | Integration testing>
Description: <user's bug description>
```

Commit: `docs: mark slice <N> as Needs Fix — <one-line bug summary>`

### 3. Reproduce and Diagnose

Follow `systematic-debugging` principles (do not invoke the skill — apply the phases inline):

**Phase 1 — Root Cause Investigation:**
- Read the bug description carefully
- Read the slice's changed files (from status.md "What was implemented")
- Reproduce the issue if possible (run the app, execute the failing path)
- Trace the data flow from the user-visible symptom back to the root cause
- Check the slice's git diff for the likely origin

**Phase 2 — Pattern Analysis:**
- Find working examples of similar behavior in the codebase
- Compare against the broken path — identify what's different
- Form a single hypothesis for the root cause

**Write a failing test** that demonstrates the bug (TDD red step). If a test framework exists, this is mandatory. If no test framework exists, state this explicitly and proceed with manual verification.

### 4. Fix

- Implement the minimal fix to make the failing test pass (TDD green step)
- Refactor if needed — tests must stay green (TDD refactor step)
- Each fix attempt must change something — never retry the same approach

**Escalation rule:** If 3+ fix attempts fail for the same bug:
- STOP
- Transition the slice to `Blocked` in status.md
- Record all attempts and evidence
- Tell the user: "This may be a design issue, not an implementation bug. Consider re-planning this slice."
- Do NOT continue — wait for user decision

### 5. Verify

Run both:
1. The new bug-fix test (must pass)
2. The original slice validation commands from `docs/ai/<initiative>-scope-map.md` or the slice definition (must still pass)

If either fails, return to Step 4 (counts toward the 3-attempt limit).

### 6. Re-assess

Brief but mandatory check:

- **Completeness:** Does the fix fully address the reported bug? Are there symptoms the user described that are still present?
- **Side effects:** Did the fix break anything adjacent? Check related tests.
- **Pattern check:** Could this same bug pattern exist elsewhere in the slice? If so, fix proactively.
- **Defense-in-depth:** Are there related edge cases that should be guarded against?

If re-assessment finds another issue: fix it (counts as a new bug, not toward the 3-attempt limit). Each additional bug gets its own Fix entry in Step 7.

### 7. Update Docs

**Mandatory — `docs/ai/<initiative>-status.md`:**
- Append a Fix entry to the target slice using the format from `templates/fix-entry.md`:

```markdown
### Fix: <bug description> (<date>)
Reported by: <Manual testing | User report | Integration testing>
Root cause: <one-line root cause>
Fix: <files changed and what each change does>
Tests added: <test file:test name, or "existing test updated">
Validated: <exact commands run and pass/fail>
```

- Transition status back to `Complete`

**If applicable:**
- Update `docs/ai/<initiative>-decisions.md` if the fix changed the implementation approach
- Cross-initiative learning: ask yourself — why did the original Step 9 re-assessment miss this? If the answer is a reusable pattern, save it:
  - Execution-loop failure pattern → `gotchas/` in the execution-loop skill
  - Project-specific → `.claude/skills/learned/`
  - Cross-project → `~/.claude/skills/learned/`

### 8. Review After Fixes (if --review-after)

If `--review-after` was specified, invoke the `review-loop` skill after all fixes are verified:

- Initiative: `<initiative>`
- Passes: 1 (single code-quality pass is sufficient post-fix)
- Scope: files changed by the fix

This catches follow-on issues that the fix may have introduced. If the review finds issues, fix them and re-verify before proceeding to Step 9.

If `--review-after` was not specified, skip this step.

### 9. Stop Cleanly

**Always** end with the structured output format from `templates/fix-stop-output.md`:

```
Slice <N>: <name> — Fix Applied
Bug: <one-line bug description>
Root cause: <one-line root cause>
Fix: <file list changed>
Tests added: <test names>
Validated: <commands run and pass/fail>
Review: <"1 pass — clean" or "1 pass — N issues fixed" or "skipped (no --review-after)">
Manual retest: <what the user should re-verify>
Next: /continue <initiative> → Slice <N+1>: <name>
      /fix <initiative> — if more bugs found after retesting
```

Do not end conversationally. Do not end with a question. Use the template.

## Rules

- Do not expand scope beyond the reported bugs. Note adjacent issues but don't fix them.
- Do not advance to the next slice — only fix and re-verify the target slice.
- If 3+ fix attempts fail, transition to `Blocked` (not back to `Complete`).
- If the bug is a design flaw (not an implementation bug), escalate — suggest re-planning the slice.
- Prefer Edit over rewrite. The slice's implementation is mostly correct; make targeted fixes.

## Gotchas

- **Fixing old slices:** If fixing a bug in Slice 10 and Slices 11-15 are already complete, verify the fix doesn't break later slices. Run the full test suite, not just the target slice's tests.
- **Multiple bugs:** If the user reports multiple bugs, fix them one at a time. Each bug gets its own diagnosis, fix, and Fix entry. This prevents fix interactions from masking root causes.
- **No test framework:** If the project has no test framework, state this in the stop output under "Tests added" as "No test framework — verified manually: <what you checked>". Do not silently skip testing.
- **Bug is actually a feature gap:** If investigation reveals the "bug" is actually missing functionality that wasn't in the slice definition, tell the user. This is a new slice, not a fix. Suggest adding it to slices.md and using `/continue`.
