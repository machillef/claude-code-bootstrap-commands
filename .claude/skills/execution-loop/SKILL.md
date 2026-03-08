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
- If commits exist since the last docs/ai/ update that could affect scope, contracts, or plan: flag this explicitly before proceeding
- If significant drift is detected, update the affected docs first, then continue

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

## Step 5: Use Bounded ECC Delegation When Useful

Optionally delegate to ECC agents (already installed):
- Planning refinement → ECC `planner` agent
- Test design/TDD flow → ECC `tdd-guide` agent
- Final review → ECC `code-reviewer` agent
- Security concerns → ECC `security-reviewer` agent

Do not invoke agents unless they materially help the current slice.

---

## Step 6: Verify

- Run targeted tests for the changed area first
- Broader build/test only as needed
- Record failures honestly — do not retry blindly

---

## Step 7: Update Docs

After a completed or partially completed slice:
- `docs/ai/<initiative>-status.md` — always update
- `docs/ai/<initiative>-decisions.md` — update if a decision was made
- `docs/ai/<initiative>-slices.md` — update only if slice definitions changed
- `docs/ai/<initiative>-plan.md` — update only if the plan materially changed

---

## Step 8: Stop Cleanly

End with:
- What changed
- What was validated
- What remains
- Next recommended slice

---

## Rules

- One slice at a time.
- Prefer narrow changes over broad refactors.
- Do not silently widen scope.
- Docs must reflect reality after each step.
- If the slice reveals a bad assumption, update docs before moving on.
