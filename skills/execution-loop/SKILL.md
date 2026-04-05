---
name: execution-loop
description: "Continue initiative work: load docs/ai, pick next slice, TDD, verify, update status. One slice at a time."
---

> **Platform:** This skill works on Claude Code and Codex. See `references/platform-map.md` for tool mapping.

# Execution Loop

Use this workflow to continue an existing initiative after bootstrap.

Intentionally conservative: one slice at a time, narrow implementation, clear verification, doc update, stop cleanly.

**Output rule:** Always print every step number, even when skipping. If a step is not applicable, emit a one-liner with a brief reason in parentheses:
```
Step 4: Research — Skipped (verification-only, no new implementation)
Step 5: TDD — Skipped (no behavioral changes in this slice)
Step 6: Arc Agents — Skipped (no new code to review)
```
Never silently jump from Step 1 to Step 7 — the user needs to see that you considered each step and why you skipped it.

## Skill Contents

- `templates/` — copy these when creating docs/ai entries (status-entry, end-of-plan, stop-output, fix-entry, fix-stop-output)
- `gotchas/` — known failure patterns from real usage. **Read these before starting any slice.**
- `prompts/` — subagent prompt templates for implementation dispatch (implementer, spec-reviewer, code-quality-reviewer)

## Inputs

- Initiative name
- Optional current priority or constraint

---

## Session Start

Before executing any step, confirm you have fresh context. Steps 0 and 1 below handle all required reads.

---

## Step 0: Stale Check

Before trusting the docs, verify they reflect current repo state.

- Check last-modified dates on docs/ai/ files
- Run `git log --oneline -10` to see recent commits
- **Significant drift** = any commit since the last docs/ai/ update that modified a file listed in scope-map or slices touched-areas, OR added/removed a dependency, OR changed a contract (auth, API shape, config). A commit that only changes tests or docs is not drift.
- If significant drift is detected: flag the affected docs explicitly, update them to reflect current reality, then continue
- If no drift: proceed directly

Do not implement on stale assumptions.

---

## Step 1: Load the Repo State

Read:
- `docs/ai/<initiative>-status.md`
- `docs/ai/<initiative>-slices.md`
- `docs/ai/<initiative>-plan.md` (if it exists)
- `docs/ai/<initiative>-decisions.md` (if it exists)
- Read `docs/ai/<initiative>-scope-map.md` (if exists) — verification commands, contracts
- Any other initiative docs that materially affect the current slice

---

## Step 2: Determine the Next Slice

From status.md and slices.md:
- Slice in "Needs Fix" state → **STOP.** Tell the user: "Slice <N> has reported bugs. Run `/fix <initiative>` to address them before advancing." Do not proceed to implement the next slice.
- Current in-progress slice (if any) → resume it
- **All slices Complete (or Complete + Blocked) and no slices Not Started or In Progress** → enter Extend mode (see below)
- Otherwise: next planned slice
- Check blockers or dependencies
- Check validation requirements and rollback notes

If the docs are inconsistent, fix them first. State the inconsistency explicitly before implementing.

### Extend Mode (all slices done, user wants more work)

If `/continue <initiative> <new objective>` is invoked and all slices are already Complete:

**If initiative files are not found in `docs/ai/`:** check `docs/ai/archive/<initiative>/`. If found there, restore them first: `git mv docs/ai/archive/<initiative>/* docs/ai/` and commit `docs: restore <initiative> from archive for extension`. Then continue below.

1. Read the existing design doc and decisions
2. Treat the `<new objective>` as a request to extend the initiative
3. Ask brief clarifying questions about the new scope (this is NOT a full superpowers:brainstorming session — the design already exists)
4. Propose new slices (numbered continuing from the last slice)
5. Get user approval on the new slices
6. Add them to slices.md and status.md (as Not Started)
7. Continue with the first new slice using the normal execution loop

If no new objective was provided (`/continue <initiative>` with no additional text), emit the End of Plan block as usual.

**Triage gate:** If the new objective is materially different from the original design (new domain, different architecture, unrelated feature), recommend `/new-feature` for a fresh initiative instead of extending. Extend mode is for follow-up work within the same design, not for starting something new.

This avoids re-bootstrapping when the user wants to add polishing, follow-up work, or additional features to an existing initiative.

---

## Step 3: Reconfirm Scope

Before editing:
- Confirm which files/areas are in scope for this slice
- Identify adjacent areas that should not be touched
- Do not do unrelated cleanup unless explicitly approved

---

## Step 4: Research Before Implementing

Before writing code, check for existing solutions:
- Search the codebase for similar patterns already implemented (`rg`, `ast-grep`, Glob)
- Search package registries (npm, PyPI, crates.io) for libraries that solve the problem
- If the slice involves an unfamiliar API or integration, fetch the relevant docs first
- Prefer adopting a proven approach over writing net-new code

Skip this step only if the slice is a mechanical change where the pattern is already identified in the slice definition.

---

## Step 5: Apply TDD Discipline

TDD is **mandatory** for any slice that adds or changes behavior. Follow the Red-Green-Refactor cycle:

1. Write a failing test that describes the expected behavior (RED)
2. Run the test — confirm it fails
3. Write the minimal implementation to make it pass (GREEN)
4. Run the test — confirm it passes
5. Refactor if needed — tests must stay green

**Exceptions** (must state the reason explicitly):
- Pure infrastructure/config changes (build scripts, CI config, scaffolding) — no testable behavior exists
- Documentation-only changes

If skipping TDD, state why in a single line before proceeding. "Not practical" is not a valid reason — name the specific exception.

---

## Step 6: Bounded Agent Delegation

Check ALL tables below and invoke every matching agent — do not stop at the first match. Multiple agents can apply to the same slice.

### Arc Agents (bundled)

| Agent | Invoke when |
|---|---|
| `cpp-reviewer` | Slice implements C or C++ code |
| `rust-reviewer` | Slice implements Rust code |
| `python-reviewer` | Slice implements Python code |
| `csharp-reviewer` | Slice implements C#/.NET code |
| `typescript-reviewer` | Slice implements TypeScript/JavaScript code |
| `powershell-reviewer` | Slice implements PowerShell scripts |
| `kubernetes-reviewer` | Slice modifies Kubernetes manifests, Helm charts, or YAML configs |
| `cpp-build-resolver` | C++ build fails (CMake, compilation, linker errors) |
| `rust-build-resolver` | Rust build fails (cargo, borrow checker, dependency errors) |
| `security-audit` skill | Slice touches auth, input validation, data persistence, secrets, or external calls |

### Subagent Dispatch (for complex slices)

For slices with 3+ tasks or independent subtasks, dispatch focused subagents using the prompt templates in `prompts/`:

1. **Implementer** (`prompts/implementer-prompt.md`) — Dispatch one subagent per independent subtask. Paste the full task description into the prompt (don't make subagents read files). Subagent reports: DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT.

2. **Spec Compliance Review** (`prompts/spec-reviewer-prompt.md`) — After implementer reports DONE, dispatch a fresh subagent to verify the implementation matches the spec. Critical: this reviewer must read the actual code, not trust the implementer's report. **If issues found:** implementer fixes them, then spec reviewer re-reviews. Iterate until the spec reviewer returns APPROVED. Do not proceed to code quality review with unresolved spec issues.

3. **Code Quality Review** (`prompts/code-quality-reviewer-prompt.md`) — Only after spec compliance passes. Reviews architecture, code quality, testing, and maintainability. Returns APPROVED | CHANGES_REQUESTED. **If CHANGES_REQUESTED:** implementer fixes them, then quality reviewer re-reviews. Iterate until APPROVED.

**Review loop guardrail:** If either review loop exceeds 3 iterations without convergence, stop and escalate to the user. Do not iterate indefinitely.

**When to use subagent dispatch vs direct implementation:**
- Direct: simple slices (1-2 files, clear pattern, no unknowns)
- Subagent: complex slices (3+ files, new patterns, cross-cutting changes)

### Fallback

For languages without a bundled reviewer (e.g., Go, Java), defer to `superpowers:requesting-code-review` for a language-agnostic review. If superpowers is not installed, review your own code using the standard review rubric (correctness, security, testing, maintainability).

---

## Step 7: Verify (max 3 attempts)

Build and tests are separate sub-steps. Execute them in order — do not skip 7c after build passes.

```
┌─────────────────────────────────────────────────────┐
│  7a. BUILD the slice.                               │
│                                                     │
│  7b. Build result:                                  │
│      FAIL ──► diagnose, fix, loop to 7a             │
│      PASS ──► proceed to 7c IMMEDIATELY             │
│                                                     │
│  7c. RUN TESTS. Do not stop, summarize, or wait     │
│      for input between build success and tests.     │
│      If no test command exists: note "build-only     │
│      verification" and skip to 7d.                  │
│                                                     │
│  7d. EVALUATE (both build and tests)                │
│      ALL PASS ──► Step 7f (UI check) then Step 9    │
│      TEST FAIL ──► 7e: triage first                 │
│                                                     │
│  7e. TRIAGE test failures                           │
│      In-branch ──► fix, loop to 7a                  │
│      Pre-existing/Flaky ──► document, continue      │
│                                                     │
│  After 3 in-branch attempts (build+test cycles):    │
│  STOP. Mark slice as Blocked. Report to user.       │
└─────────────────────────────────────────────────────┘
```

- Check `docs/ai/<initiative>-scope-map.md` for a `## Verification Commands` table. If it exists, use those exact commands. If not, infer from the stack.
- **After each build attempt, state your position:** `"Build FAILED — diagnosing [error]"` or `"Build PASSED — Step 7c: running tests now."` This self-prompt keeps your sub-step position in recent context even after long retry sequences.
- Record failures honestly — do not retry blindly
- Each attempt must change something (fix, different approach) — never re-run the exact same code expecting a different result

### 7e. Test Failure Triage (when tests fail)

Before spending attempts on a test failure, classify whether it was caused by your branch or is pre-existing.

**Detect the base branch first:** Do not hardcode `main`. Determine the base branch dynamically:
```bash
BASE=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's|refs/remotes/origin/||')
[ -z "$BASE" ] && for b in main master develop trunk; do git show-ref --verify --quiet "refs/heads/$b" 2>/dev/null && BASE="$b" && break; done
```

If BASE is empty after both methods, warn "Could not detect base branch — skipping triage, treating all failures as in-branch" and proceed without classification.

**Primary method — diff-based heuristic (preferred):** Check which test files your slice touched via `git diff --name-only ${BASE}...HEAD`. If the failing test file was NOT modified by the slice, the failure is likely pre-existing. Verify by checking `git log --oneline -5 -- <failing-test-file>` — if the last change predates your branch, it is pre-existing.

If a modified test file has multiple failures and some may be pre-existing, use the secondary method to triage individual test cases, not just the file. Also use the secondary method if the failing test imports or references any file that WAS modified by the branch (transitive breakage), since the diff heuristic only considers direct file modifications.

**Secondary method — worktree isolation (when the heuristic is inconclusive):** Run the failing test against the base branch without modifying the working tree:
```bash
git worktree remove /tmp/triage-check 2>/dev/null  # clean up stale worktree from previous run
TRIAGE_DIR="/tmp/triage-check-$$"                   # unique path avoids collisions
git worktree add "$TRIAGE_DIR" "$BASE" 2>/dev/null
if [ $? -eq 0 ]; then
  (cd "$TRIAGE_DIR" && <test command>); TRIAGE_EXIT=$?
  git worktree remove "$TRIAGE_DIR" 2>/dev/null
else
  echo "Worktree creation failed — falling back to diff heuristic"
fi
```
If the test also fails on the base branch (`TRIAGE_EXIT != 0`), it is pre-existing. If it passes, it is in-branch. If worktree creation fails, fall back to the diff heuristic and note the limitation.

**Do NOT use `git stash && git checkout`** — this modifies the working tree and can strand the repo on the wrong branch if the test command fails mid-chain.

Classify each failure:

| Classification | Action |
|----------------|--------|
| **In-branch** | Failure is caused by your changes. Fix it — this counts toward the 3-attempt limit. |
| **Pre-existing** | Failure exists on the base branch too. Do NOT fix it and do NOT count it toward the 3-attempt limit. Note it in the status entry as "Pre-existing failure: `<test name>`". |
| **Flaky** | Failure is intermittent (passes on retry without code changes). Note it as flaky. Do not count toward the 3-attempt limit. |

Only in-branch failures block the slice. Pre-existing and flaky failures are documented but do not prevent proceeding to Step 7f (UI check) then Step 9.

### 7f. UI-Aware Verification (when slice touches UI files)

When the slice touches frontend or UI files, suggest browser-based verification after build+test passes.

**Trigger patterns:** `*.razor`, `*.cshtml`, `*.tsx`, `*.jsx`, `*.vue`, `*.svelte`, `*.css`, `*.scss`, `*.html`, or when the slice description mentions UI, frontend, layout, design, Blazor, or React.

If triggered:
- Suggest: "This slice touches UI files. Consider running `/ui-smoke-test <url>` or `/ui-review <url>` for visual verification."
- If `superpowers:brainstorming`'s visual companion was used during planning, suggest reviewing the implemented UI against the design mockups.
- Do not block on UI verification — suggest it as an additional quality step.

This is informational only. The slice is not blocked if UI verification is skipped.

---

## Step 8: Systematic Debugging (if verification failed)

If Step 7 verification passes, note "Step 8 (debugging) — skipped, verification passed" and proceed to Step 9.

If verification **fails**, invoke the `superpowers:systematic-debugging` skill for the mandatory 4-phase process. If superpowers is not installed, apply the 4-phase debugging discipline directly: (1) Root Cause Investigation, (2) Pattern Analysis, (3) Hypothesis Testing, (4) Implementation.

1. **Root Cause Investigation** — read errors carefully, reproduce, check recent changes, gather evidence, trace data flow
2. **Pattern Analysis** — find working examples, compare against references, identify differences
3. **Hypothesis Testing** — form a single hypothesis, test minimally, verify before continuing
4. **Implementation** — create failing test, implement single fix, verify

**Escalation rule:** If 3+ fix attempts fail for the same issue:
- STOP the execution loop
- Update `docs/ai/<initiative>-status.md` with the architectural concern and evidence from each attempt
- Flag the current slice for re-planning
- Do NOT continue to Step 9 — wait for user acknowledgment

After successful debugging, return to Step 7 to re-verify, then continue to Step 9.

---

## Step 9: Re-assessment

After verification passes, step back and evaluate the slice as a whole. This is not a code-quality review (Step 6 handles that) — it is a completeness and risk check: did I do the right thing, and what did I miss?

**Mandatory** for every slice. Do not skip even if verification passed cleanly.

### Pass 1 — Completeness

Re-read the slice definition from `docs/ai/<initiative>-slices.md`. Re-read the diff of what you actually changed.

- Does the diff fully implement the slice goal, or is something partially done?
- Do the changes satisfy the user stories referenced by this slice? Check each story's "I want" and "so that" against the actual behavior.
- Does the diff touch anything outside the slice's declared "Touched area"?
- Are there TODOs, hardcoded values, or placeholder implementations?
- Did you change a contract (function signature, API shape, config key) that the slice didn't call for?

### Pass 2 — Risk

For each changed file, consider failure modes that automated tests won't catch:

- **Error paths**: What happens with unexpected input, null/empty values, or a failed dependency?
- **Concurrency**: Could parallel execution (threads, async, Parallel.ForEach) cause races or data corruption?
- **Contracts**: Does this assume a specific response shape, config value, or environmental condition that could differ in production?
- **Security surface**: Did this expose new input handling, modify auth flow, or change data persistence?
- **Rollback safety**: If this change is reverted, does it leave the system in a clean state?

### Resolution

- If either pass finds an actionable issue: fix it, return to Step 7 to re-verify, then re-run this step.
- If both passes are clean: proceed to Step 10.
- Maximum 2 re-assessment cycles per slice. If issues persist after the second cycle, record them in status.md under "What remains unverified" and proceed.

> **When tests run only in CI/CD**, this step is your primary behavioral safety net. Be proportionally more thorough in Pass 2.

---

## Step 10: Update Docs

After a completed or partially completed slice, update all relevant docs:

- `docs/ai/<initiative>-decisions.md` — update if a decision was made
- `docs/ai/<initiative>-slices.md` — update only if slice definitions changed
- `docs/ai/<initiative>-plan.md` — update only if the plan materially changed

**`docs/ai/<initiative>-status.md` — MANDATORY after every slice attempt. Copy the format from `templates/status-entry.md` in this skill directory.**

Do not summarize vaguely. A fresh session reading only this file must be able to determine the true state without inspecting the codebase.

---

## Step 11: Cross-Initiative Learning

**Mandatory** after every completed slice (skip only for blocked/abandoned slices).

The arc learning system captures patterns automatically via observation hooks. Instincts are created at session end without manual invocation. If a pattern warrants explicit documentation beyond what the learning system captures, add it to `gotchas/` in this skill directory.

1. **Did you discover something that applies beyond this slice?** Examples:
   - A retry pattern that other suites/modules will need
   - An API quirk or schema change
   - A tool/library behavior that wasn't obvious
   - A failure mode category (infra vs product vs test code)

2. **If yes:** add it to `gotchas/` in this skill directory (one file per pattern). The learning system handles cross-project and project-specific pattern capture automatically.

3. **If no:** move on — not every slice produces a learning. Don't force it.

The goal is cumulative intelligence: each initiative should make the next one faster. Patterns discovered in Suite A should inform Suite B without re-discovery.

---

## Step 12: Stop Cleanly

**Always** end with the structured output format in `templates/stop-output.md` — do not end conversationally or with a question.

**If this was the last slice** (no slices remain as Not Started or In Progress after this update), replace the normal stop output with the End of Plan block from `templates/end-of-plan.md`. To fill it:

1. Read `## Definition of Done` from scope-map.md. Mark each as MET/NOT MET with evidence.
2. Scan every slice in status.md for non-empty "What remains unverified." Collect into a flat list.
3. Cross-check against exit criteria in slices.md — flag any with no validated entry.
4. Keep checklist items concrete — copy unverified text verbatim.

If no Definition of Done exists, fall back to slice-level validation only.

**After emitting the End of Plan block**, suggest running `/retro <initiative>` to extract metrics and learnings. Do not auto-invoke — let the user decide when to run it.

---

## Rules

- One slice at a time.
- Prefer narrow changes over broad refactors.
- Do not silently widen scope.
- Docs must reflect reality after each step.
- If the slice reveals a bad assumption, update docs before moving on.
