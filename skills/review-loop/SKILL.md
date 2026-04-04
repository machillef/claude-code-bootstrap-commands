---
name: review-loop
description: "Multi-pass code review with fresh subagent isolation per pass. Standalone or composed into /loop or /fix."
---

> **Platform:** This skill works on Claude Code and Codex. See `references/platform-map.md` for tool mapping.

# Review Loop

Multi-pass review using separate subagent contexts per pass. Each reviewer is independent — it never wrote the code it reviews (santa-method principle).

## Skill Contents

- `prompts/review-pass-prompt.md` — subagent prompt template for code review passes (Passes 1-3)
- `prompts/qa-pass-prompt.md` — subagent prompt template for Interactive QA pass (Pass 4)

## When to Use

- After any code changes (ad-hoc, `/quick`, README updates, refactors)
- As part of `/loop` (invoked automatically when `--passes` is set)
- After `/fix` with `--review-after`
- Any time you want deeper review than a single pass provides
- The user explicitly asks to review changes ("check this again", "review my changes")

## Inputs

- **Initiative name** (optional) — if provided, reviews against design doc and slice specs
- **Passes** (default: 2) — number of review passes
- **--converge** (optional flag) — after fixing issues, re-dispatch a fresh reviewer to verify the fix. Loop until APPROVED or max 3 convergence iterations per pass. Without this flag, fixes are trusted and verified by the next pass (original behavior).
- **Scope** (optional) — what to review:
  - If initiative provided: all files changed by the initiative (from status.md)
  - If no initiative: `git diff` against the base branch or recent commits

---

## Step 0: Smart Pass Escalation

Before dispatching passes, check whether the review should auto-escalate to include Interactive QA (Pass 4):

1. If initiative is provided, check `docs/ai/<initiative>-scope-map.md` for a `## QA Commands` section
2. If QA Commands exist AND the slice being reviewed is user-facing (UI, API endpoints, CLI commands), AND `--passes` was not explicitly set by the user:
   - Auto-escalate to 4 passes
   - State: "QA Commands detected in scope-map — including Interactive QA pass."
3. If QA Commands do not exist or the slice is not user-facing: use the requested pass count as-is

This ensures Interactive QA happens automatically when the project is configured for it, without requiring the user to remember `--passes 4`.

**Note:** QA Commands are populated by the existing-repo workflow template. New-repo initiatives must add the QA Commands section to their scope-map manually if Interactive QA auto-escalation is desired.

---

## Step 1: Determine Scope

### With initiative

Read `docs/ai/<initiative>-status.md` and `docs/ai/<initiative>-slices.md`. Collect all files listed under "What was implemented" across completed slices. Also read `docs/ai/<initiative>-design.md` (architecture, user stories) and `docs/ai/<initiative>-plan.md` (if exists — phasing, assumptions) for spec compliance checking.

### Without initiative

Run:
```bash
git diff --name-only HEAD~5
```

If on a feature branch, detect the base branch dynamically (do not hardcode `main`):
```bash
BASE=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's|refs/remotes/origin/||')
[ -z "$BASE" ] && for b in main master develop trunk; do git show-ref --verify --quiet "refs/heads/$b" 2>/dev/null && BASE="$b" && break; done
git diff --name-only ${BASE}...HEAD
```

Collect the changed file list. This is the review scope.

---

## Step 1.5: Scope Drift Detection

Before dispatching review passes, mechanically verify that what was built matches what was planned. This catches "did they build what was requested" before evaluating code quality.

### With initiative

1. Extract actionable items from `docs/ai/<initiative>-slices.md` — each slice's goal, acceptance criteria, and "Touched area"
2. Extract user stories from `docs/ai/<initiative>-design.md` (if exists). If the design doc does not exist (optional for standard-tier initiatives), skip user story extraction and perform drift detection using slice definitions only.
3. Detect the base branch dynamically (same method as Step 1) and run `git diff --stat ${BASE}...HEAD` to get the actual changed files
4. Cross-reference and classify each planned item:

| Status | Meaning |
|--------|---------|
| **DONE** | Planned item is fully implemented in the diff |
| **PARTIAL** | Planned item is started but incomplete (e.g., missing edge cases) |
| **NOT DONE** | Planned item has no corresponding changes in the diff |
| **CHANGED** | Implementation differs materially from what was specified |

5. Check for **scope creep**: files changed that are not listed in any slice's "Touched area" and are not test files or docs. Flag these as "Unplanned changes."
6. Feed the classification into the Pass 2 (Spec Compliance) subagent prompt as additional context.

### Without initiative

Skip this step — there is no spec to drift from. Proceed directly to Step 2.

### Resolution

- If NOT DONE items exist: flag them in the consolidated report, not as review blockers. The review evaluates what was built, not what wasn't.
- If scope creep is detected: include it in the Pass 2 context so the spec compliance reviewer can evaluate whether the unplanned changes are justified.

---

### Scored evaluation mode

Check if `docs/ai/<initiative>-eval-criteria.md` exists. If it does, review-loop switches to **scored mode** for this initiative:

- Each pass scores its criteria on a 1-5 scale against the definitions in the eval-criteria file
- A criterion that falls below its threshold triggers CHANGES_REQUESTED regardless of other scores
- Scores and thresholds are included in the pass verdict output
- The consolidated report includes a scoring summary

If the file does not exist, use standard binary verdicts (APPROVED / CHANGES_REQUESTED).

---

## Step 2: Dispatch Review Passes

Each pass MUST use a **separate subagent** (Agent tool). This is non-negotiable — the reviewer must have fresh context, no memory of writing the code.

### Pass rotation

| Pass # | Focus | Rubric | Prompt Template |
|--------|-------|--------|-----------------|
| 1 | **Code Quality + De-sloppify** | Dead code, redundant checks, test quality, patterns, naming, DRY | `prompts/review-pass-prompt.md` |
| 2 | **Spec Compliance** | Implementation matches design, all user stories covered, no scope creep | `prompts/review-pass-prompt.md` |
| 3 | **Risk + Security** | Error paths, concurrency, contracts, security surface, rollback safety | `prompts/review-pass-prompt.md` |
| 4 | **Interactive QA** | Interact with the running artifact as an end user would, file bugs against broken behavior | `prompts/qa-pass-prompt.md` |

- If `--passes 1`: runs Pass 1 only
- If `--passes 2`: runs Pass 1 + 2
- If `--passes 3`: runs Passes 1-3
- If `--passes 4`: runs all four including Interactive QA

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
- If Step 1.5 produced scope drift data: include the classification table (DONE/PARTIAL/NOT DONE/CHANGED) and any unplanned-changes list in the Pass 2 (Spec Compliance) subagent prompt. This gives the spec reviewer concrete evidence to evaluate against.
- If scored mode is active: paste the contents of `docs/ai/<initiative>-eval-criteria.md` into the `{{EVAL_CRITERIA}}` placeholder. If scored mode is not active, remove the `{{EVAL_CRITERIA}}` placeholder and the scored mode instructions entirely from the prompt — do not leave raw template variables in the subagent prompt.
- For Pass 4 (Interactive QA): use `prompts/qa-pass-prompt.md` instead, filling `{{QA_COMMANDS}}` from the scope-map's QA Commands section.

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

### Without `--converge` (default)

**Do NOT re-dispatch the same pass after fixing.** Fixes are verified by the next pass (which has fresh context). If this was the last pass, the fixes stand — they were verified by build+test.

### With `--converge`

After fixing issues from a pass, re-dispatch a **fresh reviewer** for the same pass type to verify the fixes:

1. Fix issues flagged by Pass N
2. Re-verify: build + test must still pass after fixes
3. Dispatch a new subagent for Pass N with fresh context — the reviewer has NO knowledge of the previous review or what was fixed. It evaluates the code independently.
4. If APPROVED: proceed to Pass N+1
5. If CHANGES_REQUESTED: fix and re-dispatch again (up to 3 total convergence iterations per pass)
6. If 3 iterations exhausted without APPROVED: escalate to user — "Pass N did not converge after 3 rounds. Remaining issues may indicate a design concern."

**Critical:** Each re-dispatch uses a fresh subagent with no prior context. The fix should make the issue invisible to an independent reviewer. If it doesn't, the fix was insufficient — that's exactly what convergence detects.

### Escalation

- If the same issue is flagged across 2 different passes: it's likely a design concern, not a code issue. Flag it to the user.
- If a fix introduces a regression (build/test fails after fix): revert the fix, flag the issue as "needs user decision."
- Without `--converge`: max 2 fix attempts per pass. If issues persist, flag to user rather than churning.
- With `--converge`: max 3 convergence iterations per pass. If issues persist, escalate to user.

---

## Step 4: Consolidated Report

After all passes complete, present:

```
REVIEW REPORT
=============
Passes completed: <N>
Converge mode: <on (max 3 iterations) | off>
Scored mode: <on (eval-criteria file) | off>
Issues found: <total> (<fixed> fixed, <flagged> flagged for user)

Pass 1 — Code Quality:
  - [FIXED] <description> (<file:line>)
  - [FIXED] <description> (<file:line>)

Pass 2 — Spec Compliance:
  - [APPROVED] All user stories covered

Pass 3 — Risk:
  - [FLAGGED] <description> — needs user decision

Pass 4 — Interactive QA:  (if included)
  - [FIXED] <description> — <what was broken, how user would encounter it>
  - [FLAGGED] <description> — needs manual verification

Convergence summary:  (if --converge)
  Pass 1: converged in 1 round
  Pass 2: converged in 2 rounds (1 re-dispatch)

Scoring summary:  (if scored mode)
  Design Quality: 4/5 (threshold: 3) — PASS
  Originality: 3/5 (threshold: 3) — PASS

Manual review needed:
  - [ ] <item that requires human judgment>
  - [ ] <item that requires human judgment>
```

If all passes returned APPROVED with no issues: report "All passes clean — no issues found."

---

## Rules

- Each pass MUST be a separate subagent — never review in the same context that wrote the code.
- Each convergence re-dispatch MUST use a fresh subagent with NO knowledge of prior reviews.
- Do not expand scope during fixes — fix only what was flagged.
- Always re-verify (build + test) after making fixes.
- Do not argue with the reviewer in the fix step — either fix it or flag it to the user.
- If no build/test commands exist: state this and rely on the review passes as the quality gate.
- Pass 4 (Interactive QA) requires the application to be runnable. If it cannot be started, skip Pass 4 and note "Interactive QA skipped — no runnable artifact" in the report.
- When scored mode is active (eval-criteria file exists), include scores in every pass verdict. A criterion below threshold overrides an otherwise-clean review.
