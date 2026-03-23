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

**Build success = Step 7a complete. You still owe Steps 7b through 12.**

After a build passes:
1. **Step 7b:** Evaluate — did verification actually pass? Run the test suite, not just the build.
2. **Step 9:** Re-assessment — completeness and risk checks.
3. **Step 10:** Update docs — status.md is mandatory.
4. **Step 11:** Cross-initiative learning.
5. **Step 12:** Structured stop output using `templates/stop-output.md`.

If the fix cannot be verified by automated tests (e.g., UI race conditions, visual glitches), state this explicitly in the stop output under `Manual check:` and still complete Steps 9-12. Never trail off after a build.
