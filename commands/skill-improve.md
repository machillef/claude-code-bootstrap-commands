---
description: Iteratively improve a specific skill using eval-driven feedback. Analyzes the skill, proposes changes, tests against scenarios, keeps or discards. Inspired by autoresearch.
---

# Skill Improvement Loop

**Target skill:** $ARGUMENTS

Evaluate and iteratively improve a single skill using a structured feedback loop. This is NOT autonomous overnight — it runs one improvement cycle and reports results.

## The Improvement Cycle

```
Analyze skill → Identify weakness → Propose change → Test against scenario → Keep or discard → Report
```

### Step 1: Baseline Analysis

Read the target skill's entire directory (SKILL.md + all references, templates, gotchas, scripts).

Score it against the skill health criteria:
- Folder structure (not just a flat SKILL.md)
- Description quality (concise, trigger-focused)
- Gotchas section (accumulated failure patterns)
- Templates (files Claude copies instead of reconstructing)
- Scripts (code Claude composes with)
- Progressive disclosure (SKILL.md references sub-files)

Also assess content quality:
- Does the skill state the obvious? (things Claude already knows)
- Is there railroading? (overly rigid instructions that prevent adaptation)
- Are there inline blocks that should be template files?
- Is the description optimized for triggering? (not a summary, but a WHEN-to-use)

### Step 2: Identify Top 3 Improvements

Rank potential improvements by impact:

| Priority | Improvement type | Impact |
|---|---|---|
| High | Missing gotchas from real usage | Prevents repeated failures |
| High | Inline templates → files | Reduces reconstruction errors |
| Medium | Description optimization | Better trigger accuracy |
| Medium | Adding scripts/code | Reduces Claude's per-invocation work |
| Low | Structural reorganization | Cleaner progressive disclosure |
| Low | Content trimming | Smaller context footprint |

Present the top 3 to the user and wait for confirmation before making changes.

### Step 3: Implement Changes

For each approved improvement:
1. Make the change on a branch
2. Show the diff
3. Explain the reasoning

### Step 4: Test (if possible)

If the skill has test scenarios (from `/run-evals` or manual test cases):
- Run the skill against the scenario with the old version
- Run again with the new version
- Compare outputs

If no test scenarios exist, note this gap and recommend creating one.

### Step 5: Report

```
## Skill Improvement Report — <skill-name> — <date>

### Baseline Score
<score>/8 (health check criteria)

### Changes Made
1. <change description> — Rationale: <why>
2. <change description> — Rationale: <why>

### New Score
<score>/8

### Test Results
<comparison if available, or "No test scenarios — recommend creating eval cases">

### Remaining Gaps
- <what still needs improvement>
```

Append to `.claude/skill-health-history.jsonl` if it exists.

## Composing with Other Commands

- Run `/skill-health` first to identify which skill to improve
- Check recent instincts in `~/.claude/arc/` before improving to ensure gotchas are current
- Run `/retro <initiative>` to discover improvement signals from real usage
- After improving, run `/skill-health` again to verify score increased
