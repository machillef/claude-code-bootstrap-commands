---
description: Run a retrospective on a completed initiative. Extracts metrics, patterns, and learnings from docs/ai/ and git history. Feeds back into skill improvement.
---

# Initiative Retrospective

**Initiative:** $ARGUMENTS

Analyze a completed (or abandoned) initiative to extract metrics and learnings that improve future work.

## Procedure

### Step 1: Gather Data

Read:
- `docs/ai/<initiative>-status.md` — all slice entries
- `docs/ai/<initiative>-slices.md` — planned vs actual
- `docs/ai/<initiative>-decisions.md` — decision trail
- `git log --oneline --since="<initiative start date>"` — commit history

### Step 2: Compute Metrics

```
## Initiative Metrics

| Metric | Value |
|---|---|
| Slices planned | <count from slices.md> |
| Slices completed | <count with Status: Complete in status.md> |
| Slices blocked | <count with Status: Blocked> |
| Completion rate | <completed / planned * 100>% |
| Total commits | <count from git log> |
| Decisions made | <count of ## Decision entries> |
| Debugging escalations | <count of "escalated" in status.md> |
| Post-acceptance fixes | <count of "### Fix:" entries in status.md> |
| Learnings extracted | <count of learned skills created during this initiative> |
```

### Step 3: Identify Patterns

Answer these questions from the data:

**What went well?**
- Which slices completed cleanly on first attempt?
- Which decisions were validated by subsequent work?
- Which ECC agents were most useful?

**What went wrong?**
- Which slices required debugging escalation?
- Which slices were blocked and why?
- Which slices needed post-acceptance bug fixes (`/fix-bugs`)? What did Step 9 miss?
- Were there scope creep indicators (slices added mid-initiative)?
- Were there stale-doc incidents (Step 0 stale check caught drift)?

**What was surprising?**
- Any non-obvious patterns that should be captured as gotchas?
- Any workflow steps that were consistently skipped or felt unnecessary?
- Any tools/libraries discovered that should be documented?

### Step 4: Extract Actionable Learnings

For each pattern identified in Step 3:

1. **Is it a gotcha?** → Create a file in the appropriate skill's `gotchas/` directory
2. **Is it a workflow improvement?** → Note as a recommendation for the workflow skills
3. **Is it a new skill candidate?** → Flag for creation

### Step 5: Append to Initiative History

Create or append to `docs/ai/retro-log.md`:

```markdown
## <initiative> — <date>

### Metrics
<paste metrics table>

### Key Learnings
- <learning 1>
- <learning 2>

### Skill Improvements Made
- <gotcha added to X>
- <template updated in Y>

### Recommendations for Next Initiative
- <recommendation>
```

### Step 6: Harness Audit

Auto-invoke the ECC `harness-optimizer` agent to evaluate the execution-loop configuration used during this initiative.

**Detection:** Check if the `harness-optimizer` agent is available by looking for it in the agent registry (e.g., `ls ~/.claude/plugins/*/agents/harness-optimizer.md 2>/dev/null`). If not found, skip this step silently. Do not fail the retro.

**Input to the agent:**
- The metrics computed in Step 2
- The patterns identified in Step 3
- The initiative's `docs/ai/<initiative>-status.md` (all slice entries showing which steps were used)

**What the agent evaluates:**
- Which execution-loop steps were consistently load-bearing (caught real issues, produced actionable output)?
- Which steps were consistently no-op (skipped, produced no findings)?
- Are there harness components that encode assumptions about model limitations that may no longer hold?
- Cost/benefit of each step based on the initiative's actual usage data

**Output:** The agent produces a harness audit report appended to the retro output. Recommendations are advisory — they inform the user's decisions about harness configuration for the next initiative.

### Step 7: Run Consolidation

After extracting learnings, run `/consolidate-learnings` to ensure any new learned skills are merged into parent skills.

### Step 8: Archive Completed Initiative

**Only if ALL slices are either Complete or Blocked** (no In Progress, Not Started, or Needs Fix):

1. Create `docs/ai/archive/<initiative>/` if it doesn't exist
2. Move all `docs/ai/<initiative>-*` files into the archive directory using `git mv`
3. Commit: `docs: archive completed initiative <initiative>`

**If any slice is still active (In Progress, Not Started, Needs Fix):** Skip archival. State: "Initiative is still active — skipping archival. Run `/retro` again after all slices are complete to archive."

This keeps the active `docs/ai/` directory clean. Archived files remain in git history and can be referenced anytime. The `retro-log.md` and `quick-changes-log.md` files are never archived — they span initiatives.

## When to Run

- After the last slice of an initiative is marked Complete
- After abandoning or pausing an initiative (to capture what was learned)
- The execution-loop's End of Plan output is a good trigger — run retro immediately after
