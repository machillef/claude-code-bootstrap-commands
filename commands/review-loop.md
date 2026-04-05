---
description: Multi-pass code review with fresh subagent isolation per pass. Use after any code changes for deeper review.
---

**Request:** $ARGUMENTS

Invoke the `arc:review-loop` skill (use the Skill tool with this exact name). Follow it exactly — all steps, all gates, all output formats.

## Parse Arguments

Extract from the request:
- **Initiative name** (optional) — if provided, reviews against design doc and slices
- **--passes N** (optional) — number of review passes (default: 2). Pass 4 includes Interactive QA.
- **--converge** (optional flag) — after fixing issues, re-dispatch a fresh reviewer to verify the fix. Loop until APPROVED or max 3 convergence iterations per pass.

If no arguments provided: review recent git changes (no initiative context) with 2 passes.

Examples:
- `/review-loop` → review recent changes, 2 passes
- `/review-loop my-initiative` → review initiative changes, 2 passes
- `/review-loop my-initiative --passes 3` → review initiative changes, 3 passes
- `/review-loop my-initiative --passes 4` → include Interactive QA pass
- `/review-loop my-initiative --passes 3 --converge` → 3 passes with convergence verification
- `/review-loop --passes 1` → review recent changes, 1 pass
