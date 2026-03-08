# docs/ai

This folder stores durable working state for substantial initiatives. It is the source of truth for active work — not CLAUDE.md, not conversation context.

## Scale to change size

| Size | Files to create |
|---|---|
| Small change | None — use `quick-changes-log.md` only |
| Medium (feature, 1-3 days) | scope-map + slices + status |
| Large (migration, multi-week) | All seven files below + architecture-discovery |

## File roles

### `<initiative>-scope-map.md`
What parts of the repo are relevant, adjacent, or out of scope. Use concrete file paths.

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

## Rules

- Every entry must be backed by a file path or concrete repo evidence.
- Keep entries concise and factual. No speculative brainstorming.
- Prefer updating existing docs over creating duplicates.
- Status must reflect current reality, not aspirations.
- Do not store temporary chat findings here — only things that survive between sessions.
