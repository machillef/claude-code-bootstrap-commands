---
name: execution-loop
description: "Continue initiative work: load docs/ai, pick next slice, TDD, verify, update status. One slice at a time."
---

# Execution Loop

Use this workflow to continue an existing initiative after bootstrap.

Intentionally conservative: one slice at a time, narrow implementation, clear verification, doc update, stop cleanly.

## Skill Contents

- `templates/` — copy these when creating docs/ai entries (status-entry, end-of-plan, stop-output, fix-entry, fix-stop-output)
- `gotchas/` — known failure patterns from real usage. **Read these before starting any slice.**
- `prompts/` — subagent prompt templates for implementation dispatch (implementer, spec-reviewer, code-quality-reviewer)

## Inputs

- Initiative name
- Optional current priority or constraint

---

## Session Start Checklist

Before doing anything else, execute these reads in order:

1. Read `CLAUDE.md` — project rules and structure
2. Read `docs/ai/<initiative>-status.md` — where are we?
   - **If the file does not exist:** check `docs/ai/archive/<initiative>/`. If found there, the initiative was archived — see Extend Mode in Step 2. If not found anywhere, stop: "No initiative found for `<initiative>`. Run `/bootstrap-existing <initiative>` or `/bootstrap-new <initiative>` first."
3. Read `docs/ai/<initiative>-slices.md` — what's the plan?
4. Read `docs/ai/<initiative>-plan.md` (if it exists)
5. Read any learned skills relevant to this initiative (`~/.claude/skills/learned/`)
6. Read `gotchas/` in this skill directory — known failure patterns
7. Run `git log --oneline -10` — what changed since last session?

Only then proceed. Do not skip this checklist.

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
- Any other initiative docs that materially affect the current slice

---

## Step 2: Determine the Next Slice

From status.md and slices.md:
- Slice in "Needs Fix" state → **STOP.** Tell the user: "Slice <N> has reported bugs. Run `/fix-bugs <initiative>` to address them before advancing." Do not proceed to implement the next slice.
- Current in-progress slice (if any) → resume it
- **All slices Complete (or Complete + Blocked) and no slices Not Started or In Progress** → enter Extend mode (see below)
- Otherwise: next planned slice
- Check blockers or dependencies
- Check validation requirements and rollback notes

If the docs are inconsistent, fix them first. State the inconsistency explicitly before implementing.

### Extend Mode (all slices done, user wants more work)

If `/continue-work <initiative> <new objective>` is invoked and all slices are already Complete:

**If initiative files are not found in `docs/ai/`:** check `docs/ai/archive/<initiative>/`. If found there, restore them first: `git mv docs/ai/archive/<initiative>/* docs/ai/` and commit `docs: restore <initiative> from archive for extension`. Then continue below.

1. Read the existing design doc and decisions
2. Treat the `<new objective>` as a request to extend the initiative
3. Ask brief clarifying questions about the new scope (this is NOT a full brainstorm-design — the design already exists)
4. Propose new slices (numbered continuing from the last slice)
5. Get user approval on the new slices
6. Add them to slices.md and status.md (as Not Started)
7. Continue with the first new slice using the normal execution loop

If no new objective was provided (`/continue-work <initiative>` with no additional text), emit the End of Plan block as usual.

**Triage gate:** If the new objective is materially different from the original design (new domain, different architecture, unrelated feature), recommend `/bootstrap-existing` for a fresh initiative instead of extending. Extend mode is for follow-up work within the same design, not for starting something new.

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

## Step 6: Use Bounded Plugin Delegation

Check which plugins are available before delegating:

```bash
ls .claude/agents/ 2>/dev/null || echo "No agents available"
```

### ECC Agents (if everything-claude-code is installed)

| Agent | Invoke when |
|---|---|
| `tdd-guide` | Any slice that adds or changes behavior (the default for most slices) |
| `code-reviewer` | Always after implementation — every slice gets a review |
| `security-reviewer` | Slice touches auth, input validation, data persistence, or external calls |
| `e2e-runner` | Slice completes a navigable route or user-visible UI journey |
| `planner` | Slice has more than 3 unknowns or cross-cutting dependencies |
| Language-specific (`golang-patterns`, `python-patterns`, `frontend-patterns`, `springboot-patterns`, etc.) | Slice implements new code in that stack — use for idiomatic guidance during implementation |

### Built-in Skills (from bootstrap-commands)

| Skill | Invoke when |
|---|---|
| `security-audit` | Slice touches auth, input validation, data persistence, secrets, or external calls — use for deeper tool-assisted scanning when ECC `security-reviewer` is not installed, or as a complement to it |

### code-foundations Skills (if code-foundations plugin is installed)

| Skill | Invoke when |
|---|---|
| `code-foundations:cc-quality-practices` | After implementation alongside code-reviewer — checklist-based quality review (115 checks) |
| `code-foundations:cc-defensive-programming` | Slice touches error handling, input validation, or resource management |
| `code-foundations:aposd-verifying-correctness` | After implementation — 6-dimension correctness check (requirements, concurrency, errors, resources, boundaries, security) |
| `code-foundations:cc-pseudocode-programming` | Large slices with complex logic — design via pseudocode-as-contract before implementation |
| `code-foundations:cc-debugging` | When systematic-debugging is invoked — supplement with scientific method checklist |
| `code-foundations:cc-refactoring-guidance` | Slice involves refactoring existing code — safe refactoring patterns and regression strategy |

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

If **no plugins** are installed: apply the discipline directly (write tests first, review your own code, check security manually). Do not skip the discipline — skip only the agent/skill invocation.

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
│      ALL PASS ──► Step 9 (note: Step 8 skipped)     │
│      TEST FAIL ──► diagnose, fix, loop to 7a        │
│                                                     │
│  After 3 total attempts (build+test cycles):        │
│  STOP. Mark slice as Blocked. Report to user.       │
└─────────────────────────────────────────────────────┘
```

- Check `docs/ai/<initiative>-scope-map.md` for a `## Verification Commands` table. If it exists, use those exact commands. If not, infer from the stack.
- **After each build attempt, state your position:** `"Build FAILED — diagnosing [error]"` or `"Build PASSED — Step 7c: running tests now."` This self-prompt keeps your sub-step position in recent context even after long retry sequences.
- Record failures honestly — do not retry blindly
- Each attempt must change something (fix, different approach) — never re-run the exact same code expecting a different result

---

## Step 8: Systematic Debugging (if verification failed)

If Step 7 verification passes, note "Step 8 (debugging) — skipped, verification passed" and proceed to Step 9.

If verification **fails**, invoke the `systematic-debugging` skill before attempting any fix. The skill enforces a mandatory 4-phase process:

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

Supporting techniques available in `.claude/skills/systematic-debugging/`:
- `root-cause-tracing.md` — backward tracing through call stacks
- `defense-in-depth.md` — multi-layer validation after fix
- `condition-based-waiting.md` — replace arbitrary timeouts with condition polling
- `find-polluter.sh` — bisection script for test pollution

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

After updating docs, check if this slice revealed a reusable pattern:

1. **Did you discover something that applies beyond this slice?** Examples:
   - A retry pattern that other suites/modules will need
   - An API quirk or schema change
   - A tool/library behavior that wasn't obvious
   - A failure mode category (infra vs product vs test code)

2. **If yes:** save it in the right place:
   - **Execution-loop failure patterns** → add to `gotchas/` in this skill directory (one file per pattern)
   - **Cross-project patterns** → global (`~/.claude/skills/learned/`)
   - **Project-specific patterns** → project (`.claude/skills/learned/`)
   - Use the `learn-eval` skill if available, or write directly

3. **Consolidation check:** If the learning relates to an existing skill (not just execution-loop), add it to that skill's gotchas or references — don't leave it orphaned in `~/.claude/skills/learned/` if it has a natural parent.

4. **If no:** move on — not every slice produces a learning. Don't force it.

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
