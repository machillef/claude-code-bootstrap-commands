---
name: codex-loop-work
description: "Chain all remaining initiative slices in one session, accumulating QA items and optionally running review passes."
---

# Codex Loop Work

Accelerated execution mode: processes multiple slices continuously within a single session instead of stopping after each one. Accumulates a QA checklist across all slices and optionally runs multi-pass review at the end.

## Inputs

- **Initiative name** (required)
- **Passes** (optional) — review passes after all slices complete (default: 0)
- **Max slices** (optional) — safety limit (default: all remaining)

## Prerequisites

If `docs/ai/<initiative>-status.md` does not exist: "No initiative found. Use `codex-bootstrap-existing` or `codex-bootstrap-new` first."

If any slice is in "Needs Fix" state: "Slice <N> has reported bugs. Use `codex-fix-bugs` first."

---

## Phase 1: Load Initiative (once)

1. Read `AGENTS.md` if present
2. Read all `docs/ai/<initiative>-*` files
3. Run `git log --oneline -10`
4. Run stale check against recent commits
5. Count remaining slices (Not Started + In Progress). Apply max-slices limit.

Create QA accumulator at `.codex/loop-qa.local.md`:

```markdown
# Loop QA Checklist

Initiative: <initiative>
Started: <date>
Slices planned: <N>

## Manual Test Items
```

Report: "Loop starting: <N> slices remaining (<names>). Review passes: <N or none>."

---

## Phase 2: Slice Loop

For each remaining slice, execute the `codex-continue-work` execution loop:

1. Determine next slice (skip re-reading all docs — already loaded)
2. Reconfirm scope
3. Research first (existing patterns, packages, docs)
4. Apply test-first discipline
5. Implement one slice
6. Verify in sub-steps: build → tests → evaluate (max 3 attempts)
7. Review the diff critically
8. Update `docs/ai/` to match reality

### After each slice completes

**1. Accumulate QA items.** Append manual testing items to `.codex/loop-qa.local.md`:

```markdown
### Slice <N>: <name>
- [ ] <manual check item>
```

**2. Announce and continue:**
```
✅ Slice <N>: <name> — Complete. Proceeding to Slice <N+1>.
```

**3. Context management.** After 3+ slices, consider whether context is heavy. All state is in docs/ai/ files, which survive fresh context. If restarting context, re-read only status.md and the next slice definition.

### Stop conditions

1. All slices complete → Phase 3
2. Max-slices reached → Phase 3
3. 2 consecutive slice failures → STOP with partial results
4. Slice in Needs Fix → STOP
5. Blocked slice → skip it, continue to next (does not count as failure)

---

## Phase 3: Review Passes (if requested)

After all slices, invoke `codex-review-loop`:
- Initiative: `<initiative>`
- Passes: requested count
- Scope: all files changed across completed slices

Follow `codex-review-loop` exactly.

---

## Phase 4: Consolidated Output

```
LOOP COMPLETE
=============
Initiative: <initiative>
Slices completed: <N> of <total> (<names>)
Slices skipped/blocked: <list or "none">

📋 QA CHECKLIST (manual testing required):

Slice <N>: <name>
  [ ] <manual check>

Review passes: <N> (<X issues found, Y fixed, Z flagged>)
Review findings:
  [ ] <flagged item>

Next:
  - Manual QA using the checklist above
  - codex-fix-bugs — if QA reveals bugs
  - codex-review-loop — for additional review passes
```

---

## Anti-Stalling Rules

1. **Do NOT stop between slices** unless a stop condition is met.
2. **Do NOT ask "shall I continue?"** — the user authorized the full loop.
3. **Do NOT summarize and wait** after a successful slice. Update docs and proceed immediately.
4. **Do NOT re-read all docs/ai/ files** between slices unless context was reset.
5. Each transition: "✅ Slice N complete. Proceeding to Slice N+1." — then start next slice.

## Rules

- Follow full execution discipline for every slice (TDD, verify, review).
- One slice at a time within the loop — do not parallelize.
- Do not silently widen scope.
- Keep QA accumulator accurate.
- Keep durable state in repo files, not in chat.
