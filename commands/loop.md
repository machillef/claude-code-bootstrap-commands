---
description: Chain all remaining initiative slices in one session, accumulating QA items and optionally running review passes at the end.
---

**Initiative:** $ARGUMENTS

Accelerated execution mode: processes multiple slices continuously within a single session instead of stopping after each one. Accumulates a QA checklist across all slices and optionally runs multi-pass review at the end.

## Parse Arguments

Extract from `$ARGUMENTS`:
- **Initiative name** (optional — auto-detected if omitted)
- **--passes N** (optional) — review passes after all slices complete (default: 0)
- **--max-slices N** (optional) — safety limit on slices to process (default: all remaining)
- **--converge** (optional flag) — passed through to review-loop in Phase 3. Enables convergence mode where reviewers re-dispatch after fixes until APPROVED (max 3 iterations per pass).

**How to identify the initiative name:** The initiative name is the first non-flag token that matches an existing `docs/ai/<token>-status.md` file. If no token matches, trigger auto-detection.

**Initiative resolution:** If no initiative name is identified, scan `docs/ai/*-status.md` for active initiatives (with In Progress or Not Started slices). If exactly one is found, use it automatically. If multiple are found, list them and ask the user to pick. If none found, stop with guidance to run `/initiative` or `/new-project`.

## Prerequisites

If `docs/ai/<initiative>-status.md` does not exist, stop: "No initiative found for `<initiative>`. Run `/initiative <initiative>` or `/new-project <initiative>` first."

If any slice is in "Needs Fix" state, stop: "Slice <N> has reported bugs. Run `/fix <initiative>` first, then resume with `/loop <initiative>`."

---

## Phase 1: Load Initiative (once)

Execute the execution-loop Session Start Checklist exactly as written in the execution-loop SKILL, plus the stale check:

1. Read `CLAUDE.md`
2. Read `docs/ai/<initiative>-status.md`
3. Read `docs/ai/<initiative>-slices.md`
4. Read `docs/ai/<initiative>-plan.md` (if exists)
5. Read any learned skills relevant to this initiative (`~/.claude/skills/learned/`)
6. Read gotchas from the execution-loop skill's `gotchas/` directory
7. Run `git log --oneline -10`
8. Run stale check (execution-loop Step 0)
9. Read `docs/ai/<initiative>-decisions.md` (if exists) — additional context for cross-slice coherence

Count remaining slices (Not Started + In Progress). Apply `--max-slices` limit if set. Report:

```
Loop starting: <N> slices remaining (<slice names>)
Review passes after completion: <--passes value or "none">
```

Create the QA accumulator file:

```bash
cat > .claude/loop-qa.local.md << 'EOF'
# Loop QA Checklist

Initiative: <initiative>
Started: <date>
Slices planned: <N>

## Manual Test Items

EOF
```

---

## Phase 2: Slice Loop

**For each remaining slice**, execute the full execution-loop discipline:

### Per-slice steps (follow execution-loop SKILL)

- **Step 2:** Determine next slice (skip re-reading docs — already loaded in Phase 1)
- **Step 3:** Reconfirm scope for this slice
- **Step 4:** Research before implementing
- **Step 5:** TDD discipline (mandatory for behavioral changes)
- **Step 6:** Bounded agent delegation (arc agents)
- **Step 7:** Verify (build + test, max 3 attempts per slice)
- **Step 8:** Systematic debugging (only if Step 7 fails)
- **Step 9:** Re-assessment (completeness + risk)
- **Step 10:** Update `docs/ai/<initiative>-status.md` and other docs
- **Step 11:** Cross-initiative learning

### Lightweight harness check (every 5 slices)

After every 5th completed slice, auto-invoke a lightweight harness self-assessment. This is informational — the loop continues immediately after reporting.

**What to check:** Read the last 5 slice entries from `docs/ai/<initiative>-status.md`. For each execution-loop step (Research, TDD, Plugin Delegation, Verify, Debug, Re-assessment), assess:
- Was this step consistently skipped or produced no findings across all 5 slices?
- Was any step consistently the bottleneck (most time/attempts spent)?

**Report format:**
```
HARNESS CHECK (slices <N-4> through <N>)
========================================
Steps consistently skipped or no-op in last 5 slices:
  - <Step name>: skipped/no-op in 5/5 slices

Steps consistently load-bearing:
  - <Step name>: caught issues in N/5 slices

No action needed — loop continuing.
(To adjust: interrupt with your instructions, e.g., "skip Step 4 for remaining slices")
```

If ALL steps added value (or the assessment is inconclusive), emit: "Harness check: all steps load-bearing. Continuing."

This check does NOT pause the loop. It emits the report and immediately proceeds to the next slice. The user can interrupt (stop condition #5) if they want to act on the findings.

### After each slice completes

**1. Accumulate QA items.** From Step 9 Pass 2 (risk analysis), extract manual testing items and append to `.claude/loop-qa.local.md`:

```markdown
### Slice <N>: <name>
- [ ] <manual check item>
- [ ] <manual check item>
```

**2. Announce and continue.** State exactly:
```
✅ Slice <N>: <name> — Complete. Proceeding to Slice <N+1>: <next name>.
```
Then immediately proceed. Do NOT wait for user input.

**3. Context management.** If the session has processed 3+ slices and context feels heavy (many files read, long debugging sequences):
- All important state is already in docs/ai/ files (Step 10 saves it)
- Consider using `/compact` with summary: "Completed slices 1-N for <initiative>. Continuing to slice N+1."
- The QA accumulator file and docs/ai/ survive compaction
- After compacting, re-read only `docs/ai/<initiative>-status.md` and the next slice definition from `docs/ai/<initiative>-slices.md` before continuing

### Stop conditions (the ONLY valid reasons to stop mid-loop)

1. **All slices complete** → proceed to Phase 3
2. **Max-slices reached** → proceed to Phase 3
3. **2 consecutive slice failures** (blocked or failed verification) → STOP. Present partial results.
4. **Slice in Needs Fix state** → STOP. Tell user to run `/fix`.
5. **User interrupts** (types a message) → pause, respond, then ask "Continue the loop?" before resuming.

### Blocked slices

If a slice is Blocked (dependency not met), skip it:
- Record in QA accumulator: `### Slice <N>: <name> — SKIPPED (blocked: <reason>)`
- Continue to next slice
- This does NOT count as a "failure" for the 2-consecutive-failures rule

---

## Phase 3: Review Passes (if --passes > 0)

After all slices complete (or max-slices reached), invoke the `review-loop` skill:

- Initiative: `<initiative>`
- Passes: `<--passes value>`
- Scope: all files changed across the completed slices (collect from status.md)

Follow the review-loop SKILL exactly. Fixes made during review are committed normally.

If `--passes` was not set (default: 0), skip this phase entirely.

---

## Phase 4: Consolidated Output

**Always** end with this structured output. Do not end conversationally.

```
LOOP COMPLETE
=============
Initiative: <initiative>
Slices completed: <N> of <total> (<list of slice names>)
Slices skipped/blocked: <list or "none">

📋 QA CHECKLIST (manual testing required):

Slice <N>: <name>
  [ ] <manual check from Step 9>
  [ ] <manual check from Step 9>

Slice <M>: <name>
  [ ] <manual check>

Review passes: <N completed> (<X issues found, Y fixed, Z flagged>)
Review findings:
  [ ] <flagged item needing user decision>

Next:
  - Manual QA using the checklist above
  - /fix <initiative> — if QA reveals bugs
  - /review-loop <initiative> --passes N — for additional review passes
  - /retro <initiative> — when satisfied with the initiative
```

---

## Anti-Stalling Rules

These are **critical**. Without them, the natural tendency is to stop after each slice. Read these before starting the loop:

1. **Do NOT stop between slices** unless a stop condition from Phase 2 is met.
2. **Do NOT ask "shall I continue?"** between slices. The user authorized the full loop by invoking `/loop`.
3. **Do NOT summarize and wait** after a successful slice. Update docs (Step 10), announce completion, and immediately proceed to the next slice.
4. **Do NOT re-read all docs/ai/ files** between slices. They were loaded in Phase 1 and updated in Step 10. Only re-read after a `/compact`.
5. **Each slice transition should be seamless:** "✅ Slice N complete. Proceeding to Slice N+1." — then start Step 2 for the next slice.
6. **If you feel the urge to stop and present results mid-loop**, check: is a stop condition met? If no → continue. The stop conditions are exhaustive.

## Rules

- Follow execution-loop discipline for every slice. No shortcuts on TDD, verification, or re-assessment.
- One slice at a time within the loop — do not parallelize slices.
- Do not silently widen scope on any slice.
- QA accumulator must be accurate — it is the user's manual testing guide.
- Cleaning up `.claude/loop-qa.local.md` is the user's responsibility after QA. Do not delete it.
- If the user has not set `--passes`, do NOT suggest running review passes. Respect the default.
