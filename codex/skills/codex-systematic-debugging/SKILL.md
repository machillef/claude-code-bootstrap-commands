---
name: codex-systematic-debugging
description: Mandatory structured debugging workflow for failed verification or unexpected behavior. Emphasizes root cause, single-hypothesis testing, and escalation after repeated failed fixes.
---

# Codex Systematic Debugging

Use this skill whenever verification fails or behavior is unexpected.

## Iron Law

No fixes without root-cause investigation first.

## Four Phases

### 1. Root Cause Investigation

- read the full error output
- reproduce consistently
- inspect recent changes
- trace the bad value or failing state backward
- gather evidence at component boundaries

### 2. Pattern Analysis

- find working examples in the repo
- compare against reference behavior
- list concrete differences
- identify missing dependencies or assumptions

### 3. Hypothesis Testing

- state one explicit hypothesis
- make the smallest possible test change
- verify before moving on

### 4. Implementation

- write a failing reproduction
- implement one fix
- re-run validation

## Escalation

If three fix attempts fail for the same issue:

- stop the current execution loop
- record the evidence in `docs/ai/<initiative>-status.md`
- mark the slice blocked or needing re-plan
- wait for user acknowledgment before continuing

## Status Snippet

```markdown
### Debugging: <issue summary>
Phase reached: <1-4>
Root cause: <cause or "under investigation">
Fix attempts: <count>
Resolution: <what fixed it, or "escalated">
Evidence: <key findings>
```

## Rules

- Do not stack multiple speculative fixes.
- Do not skip the failing reproduction.
- Fix the source, not the symptom.
