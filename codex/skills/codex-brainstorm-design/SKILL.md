---
name: codex-brainstorm-design
description: Collaborative design exploration before implementation. Produces a validated design doc in `docs/ai/` and stops before code changes.
---

# Codex Brainstorm Design

Use this skill before bootstrapping substantial work.

## Hard Gate

Do not scaffold, implement, or modify production code until the design has been
presented, written down, and approved by the user.

## Workflow

1. Read existing initiative context from `docs/ai/` and repo `AGENTS.md`.
2. Ask clarifying questions one at a time.
3. Propose 2-3 approaches with trade-offs and a recommendation.
4. Present the design in sections sized to the problem.
5. Write `docs/ai/<initiative>-design.md`.
6. Run a sub-agent spec review using `prompts/spec-reviewer.md`.
7. Ask the user to approve the written spec before returning control.

## Design Requirements

Cover:

- architecture
- responsibilities and boundaries
- data flow
- error handling
- testing strategy
- explicit non-goals

## Rules

- One question per message.
- Prefer YAGNI over feature creep.
- Keep the spec focused enough to drive a slice plan.
