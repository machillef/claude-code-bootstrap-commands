---
name: codex-bootstrap-new
description: Bootstrap a greenfield project in Codex. Captures requirements, chooses a stack, scaffolds the project, and creates durable `docs/ai/` state without implementing features.
---

# Codex Bootstrap New Repo

Use this skill for a truly greenfield project.

## Workflow

1. Confirm the project is actually new. If there is already code, stop and use `codex-bootstrap-existing`.
2. Capture missing requirements:
   - what is being built
   - expected scale and lifetime
   - hard constraints
   - strongest language or ecosystem
3. Research existing scaffolds, starter repos, and primary framework docs before choosing a stack.
4. If you have a `docs-researcher` role, use it to verify framework and starter-template claims against primary sources.
5. Invoke `codex-brainstorm-design` and wait for user approval of the design doc.
6. Spawn a sub-agent using `prompts/stack-advisor.md` to recommend one stack.
7. Present the recommendation and wait for explicit user confirmation.
8. Scaffold using an official CLI or maintained starter.
9. Verify the scaffold builds and the test runner can execute at least one isolated test.
10. Create:
   - `docs/ai/<initiative>-requirements.md`
   - `docs/ai/<initiative>-design.md`
   - `docs/ai/<initiative>-decisions.md`
   - `docs/ai/<initiative>-plan.md`
   - `docs/ai/<initiative>-slices.md`
   - `docs/ai/<initiative>-status.md`
11. Create or extend repo `AGENTS.md` with stable project facts only.
12. Verify user story traceability: every story from the design doc must be covered by at least one slice. If any are uncovered, add a slice or mark the story as out of scope.
13. Stop before implementing features.

## Output

```text
Initiative: <name>
Stack: <one-line summary>
Scaffold: <source>
docs/ai/ files created: <list>
Test runner: <single-test command or "needs setup">
First slice: <name and goal>
Validation command: <exact command>
TDD: mandatory from Slice 1 for behavioral changes
Next: use codex-continue-work for <initiative>
```

## Rules

- Do not pick a stack without documenting rationale.
- Do not scaffold before explicit user confirmation.
- Do not implement features during bootstrap.
