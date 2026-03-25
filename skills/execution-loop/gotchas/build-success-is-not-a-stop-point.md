# Gotcha: Build Success Is Not a Stop Point

**Source:** Real session observation (2026-03-23)

After a long build completes successfully, the model tends to treat "BUILD SUCCESS" as a natural stopping point — especially when context is long or the build took several minutes. It stops mid-workflow without emitting structured output or completing the remaining steps.

## The Trap

The sequence looks like this:
```
Step 5: TDD (or exception stated) → Step 6: Implement → Build passes → ... silence
```

The model sees "exit code 0, both binaries present" and feels done. But Steps 7-12 haven't run: no test verification, no re-assessment, no doc update, no structured stop output. The user is left with no next action and has to nudge the model to continue.

## Rule

**Build success = Step 7b PASS. You are now at Step 7c: RUN TESTS IMMEDIATELY.**

Step 7 has explicit sub-steps. After a build passes:
1. **Step 7c:** Run tests NOW — do not stop, summarize, or wait between build and tests.
2. **Step 7d:** Evaluate both build + test results together.
3. **Step 9:** Re-assessment — completeness and risk checks.
4. **Step 10:** Update docs — status.md is mandatory.
5. **Step 11:** Cross-initiative learning.
6. **Step 12:** Structured stop output using `templates/stop-output.md`.

**Especially after long builds or multiple retries:** the model tends to stall after finally seeing "BUILD SUCCESS" because the retry output pushes Step 7 instructions out of attention. The sub-step structure (7a→7b→7c→7d) exists specifically to prevent this — 7c is a named step that can't be skipped.

If the fix cannot be verified by automated tests (e.g., UI race conditions, visual glitches), state this explicitly in the stop output under `Manual check:` and still complete Steps 9-12. Never trail off after a build.
