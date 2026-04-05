# Learning System Completion — Decisions

## Decision 1: Pattern detection heuristics (2026-04-05)

**Context:** The session-end-observer needs to detect "patterns" in observations. What counts as a pattern?

**Decision:** Two heuristic types:
1. **Repeated tool sequences** — if the same tool is used 5+ times in a session on similar targets, that's a tooling pattern
2. **Error-recovery pairs** — if a tool call fails and is followed by a different approach that succeeds, that's a learned workaround

**Rationale:** These are the simplest heuristics that produce useful instincts. More sophisticated pattern detection (e.g., multi-step workflows, conditional logic) can be added later.

## Decision 2: Instinct deduplication by trigger match (2026-04-05)

**Context:** When the observer detects a pattern that matches an existing instinct, should it create a new one or update the existing?

**Decision:** Update existing — bump confidence, update last_seen, increment observations count. Match by substring of the trigger field.

**Rationale:** Duplicate instincts with slightly different wording for the same pattern would be noise. Better to strengthen existing knowledge.
