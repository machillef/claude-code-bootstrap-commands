---
name: execution-loop
description: Resume substantial work from repo state by reading docs/ai, selecting the next slice, applying TDD/verification, implementing narrowly, and updating status and decisions.
---

# Execution Loop

Use this workflow to continue an existing initiative after bootstrap.

Intentionally conservative: one slice at a time, narrow implementation, clear verification, doc update, stop cleanly.

## Inputs

- Initiative name
- Optional current priority or constraint

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
- Current in-progress slice (if any) → resume it
- Otherwise: next planned slice
- Check blockers or dependencies
- Check validation requirements and rollback notes

If the docs are inconsistent, fix them first. State the inconsistency explicitly before implementing.

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

## Step 6: Use Bounded ECC Delegation

ECC agents are available only if ECC is installed. Check first:

```bash
ls .claude/agents/ 2>/dev/null || echo "ECC not installed"
```

If installed, invoke according to these criteria:

| Agent | Invoke when |
|---|---|
| `tdd-guide` | Any slice that adds or changes behavior (the default for most slices) |
| `code-reviewer` | Always after implementation — every slice gets a review |
| `security-reviewer` | Slice touches auth, input validation, data persistence, or external calls |
| `planner` | Slice has more than 3 unknowns or cross-cutting dependencies |

If ECC is **not** installed: apply the discipline directly (write tests first, review your own code, check security manually). Do not skip the discipline — skip only the agent invocation.

---

## Step 7: Verify

- Run targeted tests for the changed area first
- Broader build/test only as needed
- Record failures honestly — do not retry blindly

---

## Step 9: Update Docs

After a completed or partially completed slice, update all relevant docs:

- `docs/ai/<initiative>-decisions.md` — update if a decision was made
- `docs/ai/<initiative>-slices.md` — update only if slice definitions changed
- `docs/ai/<initiative>-plan.md` — update only if the plan materially changed

**`docs/ai/<initiative>-status.md` — MANDATORY after every slice attempt, using this exact format:**

```
## Slice <N>: <name>
Status: <Not Started | In Progress | Complete | Blocked>
Last updated: <date>

### What was implemented
<concrete list of files changed and what each does>

### What was validated
<exact commands run and their pass/fail result>

### What remains unverified
<anything not tested or confirmed — be honest>

### Blockers
<any issues blocking completion, or "None">

### Next recommended step
<exact action: "Run /continue-work <initiative> to start Slice N+1" or specific blocker resolution>
```

Do not summarize vaguely. A fresh session reading only this file must be able to determine the true state without inspecting the codebase.

---

## Step 10: Stop Cleanly

**Always** end with this exact structured output — do not end conversationally:

```
Slice <N>: <name> — <Complete|In Progress|Blocked>
Changed: <file list>
Validated: <commands run and pass/fail>
Remains: <what's left, or "nothing">
Next: /continue-work <initiative> → Slice <N+1>: <name>
```

Do not replace this with a conversational summary. Do not end with a question. The structured output is mandatory.

---

## Rules

- One slice at a time.
- Prefer narrow changes over broad refactors.
- Do not silently widen scope.
- Docs must reflect reality after each step.
- If the slice reveals a bad assumption, update docs before moving on.
