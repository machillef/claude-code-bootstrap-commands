---
name: review-loop
description: "Multi-pass code review with fresh subagent isolation per pass. Standalone or composed into loop-work/fix-bugs."
---

# Review Loop

Multi-pass review using separate subagent contexts per pass. Each reviewer is independent — it never wrote the code it reviews (santa-method principle).

## Skill Contents

- `prompts/review-pass-prompt.md` — subagent prompt template for each review pass

## When to Use

- After any code changes (ad-hoc, quick-change, README updates, refactors)
- As part of `/loop-work` (invoked automatically when `--passes` is set)
- After `/fix-bugs` with `--review-after`
- Any time you want deeper review than a single pass provides
- The user explicitly asks to review changes ("check this again", "review my changes")

## Inputs

- **Initiative name** (optional) — if provided, reviews against design doc and slice specs
- **Passes** (default: 2) — number of review passes
- **Scope** (optional) — what to review:
  - If initiative provided: all files changed by the initiative (from status.md)
  - If no initiative: `git diff` against the base branch or recent commits

---

## Step 1: Determine Scope

### With initiative

Read `docs/ai/<initiative>-status.md` and `docs/ai/<initiative>-slices.md`. Collect all files listed under "What was implemented" across completed slices. Also read `docs/ai/<initiative>-design.md` (architecture, user stories) and `docs/ai/<initiative>-plan.md` (if exists — phasing, assumptions) for spec compliance checking.

### Without initiative

Run:
```bash
git diff --name-only HEAD~5
```

If on a feature branch:
```bash
git diff --name-only main...HEAD
```

Collect the changed file list. This is the review scope.

---

## Step 2: Dispatch Review Passes

Each pass MUST use a **separate subagent** (Agent tool). This is non-negotiable — the reviewer must have fresh context, no memory of writing the code.

### Pass rotation

| Pass # | Focus | Rubric |
|--------|-------|--------|
| 1 | **Code Quality + De-sloppify** | Dead code, redundant checks, test quality, patterns, naming, DRY |
| 2 | **Spec Compliance** | Implementation matches design, all user stories covered, no scope creep |
| 3 | **Risk + Security** | Error paths, concurrency, contracts, security surface, rollback safety |

- If `--passes 1`: runs Pass 1 only
- If `--passes 2`: runs Pass 1 + 2
- If `--passes 3`: runs all three

### Dispatch protocol

For each pass:

1. Build the subagent prompt using `prompts/review-pass-prompt.md` as a template
2. Fill in: pass type, file list, context (design doc excerpt or "reviewing recent changes")
3. Dispatch via Agent tool with `description: "Review Pass N: <focus>"`
4. The subagent reads the actual files and returns a structured verdict

### Subagent prompt construction

**Paste context INTO the prompt** — do not ask the subagent to read docs/ai/ files. The prompt must be self-contained:

- File list with full paths
- Pass-specific rubric (from the template)
- If initiative: relevant excerpt from the design doc (user stories, architecture decisions)
- If no initiative: brief description of what the changes are for

---

## Step 3: Process Results

After each pass returns:

### If APPROVED

Proceed to the next pass (or finish if this was the last pass).

### If CHANGES_REQUESTED

1. Read the issue list carefully
2. Triage: separate real issues from style preferences
3. Fix each real issue (prefer Edit over rewrite)
4. Re-verify: build + test must still pass after fixes
5. Record what was fixed

**Do NOT re-dispatch the same pass after fixing.** Fixes are verified by the next pass (which has fresh context). If this was the last pass, the fixes stand — they were verified by build+test.

### Escalation

- If the same issue is flagged across 2 different passes: it's likely a design concern, not a code issue. Flag it to the user.
- If a fix introduces a regression (build/test fails after fix): revert the fix, flag the issue as "needs user decision."
- Max 2 fix attempts per pass. If issues persist, flag to user rather than churning.

---

## Step 4: Consolidated Report

After all passes complete, present:

```
REVIEW REPORT
=============
Passes completed: <N>
Issues found: <total> (<fixed> fixed, <flagged> flagged for user)

Pass 1 — Code Quality:
  - [FIXED] <description> (<file:line>)
  - [FIXED] <description> (<file:line>)

Pass 2 — Spec Compliance:
  - [APPROVED] All user stories covered

Pass 3 — Risk:
  - [FLAGGED] <description> — needs user decision

Manual review needed:
  - [ ] <item that requires human judgment>
  - [ ] <item that requires human judgment>
```

If all passes returned APPROVED with no issues: report "All passes clean — no issues found."

---

## Rules

- Each pass MUST be a separate subagent — never review in the same context that wrote the code.
- Do not expand scope during fixes — fix only what was flagged.
- Always re-verify (build + test) after making fixes.
- Do not argue with the reviewer in the fix step — either fix it or flag it to the user.
- If no build/test commands exist: state this and rely on the review passes as the quality gate.
