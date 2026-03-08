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

## Step 4: Apply TDD or Test-First Discipline

Where practical:
- Add or update tests first
- Run the smallest relevant failing test
- Implement narrowly to pass it
- Rerun tests

If test-first is not practical, explain why briefly and apply immediate verification after implementation.

---

## Step 5: Use Bounded ECC Delegation When Relevant

ECC agents are available only if ECC is installed. Check first:

```bash
ls .claude/agents/ 2>/dev/null || echo "ECC not installed"
```

If installed, invoke according to these criteria — not ceremonially:

| Agent | Invoke when |
|---|---|
| `tdd-guide` | Slice adds new testable behavior (functions, endpoints, components) |
| `code-reviewer` | Slice touches more than one file and is non-trivial |
| `security-reviewer` | Slice touches auth, input validation, data persistence, or external calls |
| `planner` | Slice has more than 3 unknowns or cross-cutting dependencies |

If ECC is **not** installed: apply the discipline directly (write tests first, review your own code, check security manually). Do not skip the discipline — skip only the agent invocation.

---

## Step 6: Verify

- Run targeted tests for the changed area first
- Broader build/test only as needed
- Record failures honestly — do not retry blindly

---

## Step 7: Update Docs

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

## Step 8: Stop Cleanly

Output a brief stop summary to the user matching the status.md content:
- What changed
- What was validated
- What remains
- Next recommended slice and command

---

## Rules

- One slice at a time.
- Prefer narrow changes over broad refactors.
- Do not silently widen scope.
- Docs must reflect reality after each step.
- If the slice reveals a bad assumption, update docs before moving on.
