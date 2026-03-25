---
name: codex-review-loop
description: "Multi-pass code review with isolated contexts per pass. Standalone or composed into codex-loop-work."
---

# Codex Review Loop

Multi-pass review where each pass uses a separate, fresh context. The reviewer must not be the author of the code it reviews.

## Skill Contents

- `prompts/review-pass-prompt.md` — template for structuring each review pass

## Inputs

- **Initiative name** (optional) — if provided, reviews against design doc and slice specs
- **Passes** (default: 2) — number of review passes

## Step 1: Determine Scope

### With initiative

Read `docs/ai/<initiative>-status.md` and `docs/ai/<initiative>-slices.md`. Collect all files listed under "What was implemented" across completed slices. Also read `docs/ai/<initiative>-design.md` (architecture, user stories) and `docs/ai/<initiative>-plan.md` (if exists — phasing, assumptions) for spec compliance checking.

### Without initiative

```bash
git diff --name-only HEAD~5
```

If on a feature branch:
```bash
git diff --name-only main...HEAD
```

## Step 2: Dispatch Review Passes

Each pass must use a **separate context** to ensure reviewer independence. If Codex role configs are available, use the `reviewer` role. Otherwise, structure each pass as a clearly separated review task.

### Pass rotation

| Pass | Focus | What It Checks |
|------|-------|----------------|
| 1 | **Code Quality + De-sloppify** | Dead code, redundant checks, test quality, patterns, naming, DRY |
| 2 | **Spec Compliance** | Implementation matches design, all user stories covered, no scope creep |
| 3 | **Risk + Security** | Error paths, concurrency, contracts, security surface, rollback safety |

### Pass protocol

For each pass:
1. State the pass focus and rubric clearly
2. Read all files in scope
3. Evaluate each file against the rubric criteria
4. For each issue: cite exact `file:line` and describe the problem
5. Return: APPROVED or CHANGES_REQUESTED with issue list

### Rubrics

**Code Quality + De-sloppify:**
- Dead code (unused imports, unreachable branches, commented-out code)
- Redundant checks (null checks the type system handles, defensive code for impossible states)
- Test quality (tests that test language features instead of business logic)
- Pattern consistency, naming clarity, DRY (3+ occurrences only)

**Spec Compliance:**
- Every requirement implemented, no scope creep
- User stories covered ("I want" and "so that" exercisable)
- Edge cases from spec handled, contracts match

**Risk + Security:**
- Error paths, concurrency risks, contract assumptions
- Security surface (input validation, auth, secrets, data exposure)
- Rollback safety, production concerns

## Step 3: Process Results

After each pass:

- **APPROVED:** proceed to next pass
- **CHANGES_REQUESTED:** fix real issues (not style preferences), re-verify build+test, proceed to next pass
- **Escalation:** same issue across 2 passes → flag to user as design concern. Max 2 fix attempts per pass.

## Step 4: Consolidated Report

```
REVIEW REPORT
=============
Passes completed: <N>
Issues found: <total> (<fixed> fixed, <flagged> flagged)

Pass 1 — Code Quality:
  - [FIXED] <description> (<file:line>)

Pass 2 — Spec Compliance:
  - [APPROVED] All requirements covered

Pass 3 — Risk:
  - [FLAGGED] <description> — needs user decision

Manual review needed:
  - [ ] <item requiring human judgment>
```

## Rules

- Each pass must have independent context — do not review in the same context that wrote the code.
- Fix only what was flagged — do not expand scope.
- Always re-verify after fixes.
- If no build/test commands exist, state this and rely on review as the quality gate.
