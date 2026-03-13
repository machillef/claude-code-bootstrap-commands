---
name: codex-orchestrate
description: ECC-inspired multi-agent orchestration pattern for Codex. Chains planner, implementation, review, and security handoffs for complex work.
---

# Codex Orchestrate

Use this skill for complex tasks where a single straight-line session is too
opaque or risky.

This is the Codex-native answer to ECC's orchestration command. It does not rely
on Claude slash commands or plugin hooks. It relies on:

- Codex sub-agents
- explicit handoff documents
- durable repo-state updates

## Workflow Types

### feature

`planner -> implementation -> reviewer -> security review`

### bugfix

`planner -> implementation -> reviewer`

### refactor

`planner -> implementation -> reviewer`

### security

`security review -> reviewer -> implementation`

## Handoff Format

Between phases, use this exact structure:

```markdown
## HANDOFF: <previous> -> <next>

### Context
<what was done>

### Findings
<key discoveries or decisions>

### Files Modified
<list of files touched, or "none">

### Open Questions
<items the next phase must resolve>

### Recommendations
<suggested next action>
```

## Recommended Roles

- planner: parent agent or a read-only explorer focused on planning
- implementation: parent agent or a worker agent with a narrow file scope
- reviewer: findings-first review agent
- security review: dedicated security-focused pass for trust-boundary changes
- docs researcher: API/framework verification when the task depends on external behavior

## Rules

- Keep each phase narrow and explicit.
- Do not pass raw chat context when a compact handoff will do.
- Prefer parallel review phases when they are independent.
- Update `docs/ai/` and status artifacts after the implementation phase.
- Stop if review finds blocking issues; do not paper over them.
