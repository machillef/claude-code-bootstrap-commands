# docs/ai

This folder stores durable working state for substantial initiatives. It is the source of truth for active work across the Claude and Codex variants — not a global instruction file, not conversation context.

## Scale to change size

| Size | Files to create |
|---|---|
| Small change | None — use `quick-changes-log.md` only |
| Medium (feature, 1-3 days) | scope-map + design + slices + status |
| Large (migration, multi-week) | Medium set plus contracts + risks + plan + decisions + architecture-discovery |
| New project | requirements + design + decisions + plan + slices + status |

## File roles

### `<initiative>-scope-map.md`
What parts of the repo are relevant, adjacent, or out of scope. Use concrete file paths.

### `<initiative>-requirements.md`
Used for greenfield projects. Captures what is being built, constraints, scale, and non-goals.

### `<initiative>-design.md`
Validated design doc for the current initiative. Captures architecture, boundaries, data flow, error handling, and testing approach.

### `<initiative>-contracts.md`
Routes, APIs, auth/session behavior, events, shared dependencies, integration contracts. What must not break.

### `<initiative>-risks.md`
Parity risks, migration hazards, coupling concerns, rollout concerns, test gaps.

### `<initiative>-plan.md`
Phased approach, assumptions, validation strategy, rollback posture.

### `<initiative>-slices.md`
Execution units. Each slice must have:
- Goal
- Touched area (file paths)
- Tests
- Risk
- Rollback note
- Done criteria (concrete and observable)

### `<initiative>-status.md`
Current state:
- Completed slices
- In-progress slice
- Blocked (if any, with reason)
- Next slice
- Last validation (command + result + timestamp)

### `<initiative>-decisions.md`
Decision log. Each entry: decision made, why, impact, alternatives rejected.

### `<initiative>-architecture-discovery.md`
Output from the `architecture-discovery` agent. Large changes only. Covers: stack, entry points, data layer, auth contract, integrations, patterns, migration risk map.

### `quick-changes-log.md`
Lightweight audit trail for small changes that don't warrant a full initiative. Append-only.

## Initiative Lifecycle

```
Bootstrap → Active (slices in progress) → Complete (all slices done) → Archived
```

- **Active:** initiative files live in `docs/ai/` at the top level
- **Complete:** all slices are Complete (or Blocked). Execution-loop emits End of Plan.
- **Archived:** after `/retro`, completed initiative files are moved to `docs/ai/archive/<initiative>/` via `git mv`. They remain in git history.
- **Extending:** if you want more work on a completed initiative, run `/continue-work <initiative> <new objective>` — it adds new slices without re-bootstrapping

Files that are **never archived** (they span initiatives): `retro-log.md`, `quick-changes-log.md`

The archive folder grows slowly (a few KB per initiative). Pruning is a human decision — `git rm` when no longer needed. Everything is in git history regardless.

## What to Store vs. What LLMs Discover

LLMs can rapidly discover codebase structure, tech stack, function behavior, and file organization from code alone. Don't duplicate that here.

**Store in docs/ai/:** dynamic state that can't be discovered from code — current slice progress, the plan, decisions and their rationale, what's been verified, what's blocked.

**Don't store:** codebase structure descriptions, tech stack summaries, module explanations, or anything a fresh `git log` + code read would reveal.

## Rules

- Every entry must be backed by a file path or concrete repo evidence.
- Keep entries concise and factual. No speculative brainstorming.
- Prefer updating existing docs over creating duplicates.
- Status must reflect current reality, not aspirations.
- Do not store temporary chat findings here — only things that survive between sessions.
