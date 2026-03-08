---
description: Bootstrap a brand new project with no existing code. Gathers requirements, makes an opinionated stack decision via the stack-advisor agent, scaffolds the project, creates docs/ai/ planning files, and prepares the first slice. Does not implement features.
---

# Bootstrap New Project

**Request:** $ARGUMENTS

You are bootstrapping a greenfield project — no existing code. Use the `workflow-new-repo` skill.

## Before doing anything: confirm this is actually new

If the user already has code (even a partial scaffold, a fork, or a half-started project), stop and say:
> "It looks like you already have code. Use `/bootstrap-existing <initiative>` instead."

If truly greenfield: continue.

## Then follow the workflow-new-repo skill

Steps in order:
1. Requirements capture (ask all missing questions at once — max 4 questions, skip what's already answered)
2. Stack decision via `stack-advisor` agent — present recommendation and **wait for explicit user confirmation** before proceeding
3. Scaffold the project and verify it builds
3a. Create minimal `CLAUDE.md` (stack, build/test commands, structure, pointer to docs/ai/) — stable facts only, 30 lines max
4. Create docs/ai/ files (requirements, decisions, plan, slices, status) — status.md must use execution-loop format
5. Wire ECC skills where relevant (check if ECC is installed first)
6. Stop — hand off to `/continue-work`

## Output

```
Initiative: <name>
Stack: <one-line summary>
Scaffold: <source used>
docs/ai/ files created: <list>
First slice: <name and goal>
Validation command: <exact command>
Next: /continue-work <initiative>
```

## Rules

- Do not implement features during bootstrap.
- Do not pick a stack without documenting rationale in decisions.md.
- Do not add rules or session state to CLAUDE.md — only stable facts (stack, structure, build commands).
- Confirm the stack decision with the user before scaffolding — wait for their reply.
- Do not remove scaffold boilerplate unless stack-advisor explicitly recommended it.
