# Post-Acceptance Bugs

## Pattern

A slice passes automated verification (Step 7) and re-assessment (Step 9), is marked Complete, and the stop output directs the user to `/continue-work`. The user then manually tests the changes and discovers bugs that automated tests didn't catch.

## Why This Happens

- Step 7 only runs automated validation commands — it cannot catch visual glitches, UX issues, race conditions under real load, or cross-browser problems
- Step 9 Pass 2 (Risk) is a code review, not runtime execution — it identifies *possible* failure modes but can't confirm them
- Some bugs only surface with real data, real user interaction, or real environment conditions

## What to Do

Direct the user to run `/fix-bugs <initiative>` with a description of the bugs. This command:

1. Reopens the slice (transitions to "Needs Fix" status)
2. Diagnoses with systematic-debugging principles
3. Fixes with TDD discipline
4. Re-verifies with both new and original tests
5. Updates docs with a Fix entry in status.md
6. Produces structured stop output

Do NOT:
- Use `/detour` — the bug is in the slice's work, not a diversion
- Use `/quick-change` — this loses initiative context
- Fix freehand without a command — this bypasses workflow discipline
- Use `/continue-work` — the execution-loop will block if a slice is in "Needs Fix" state

## Prevention

When writing the stop output at Step 12, populate the `Manual check:` line with specific things the user should verify that automated tests cannot cover. This gives the user a focused testing checklist rather than leaving them to discover gaps on their own.
