Continue an existing initiative using the `execution-loop` skill.

User input: $ARGUMENTS

Interpret the argument as the initiative name, optionally with a specific constraint or priority.

## Session Start Checklist

Before doing anything else, execute these reads in order:

1. Read `CLAUDE.md` — project rules and structure
2. Read `docs/ai/<initiative>-status.md` — where are we?
3. Read `docs/ai/<initiative>-slices.md` — what's the plan?
4. Read `docs/ai/<initiative>-plan.md` (if it exists) — strategy and constraints
5. Read any learned skills relevant to this initiative (`~/.claude/skills/learned/`)
6. Read memory files relevant to this initiative (`~/.claude/projects/*/memory/`)
7. Run `git log --oneline -10` — what changed since last session?

Only then proceed to the execution loop. Do not skip this checklist.

## Required behavior:

- determine the next in-progress or next planned slice
- reconfirm scope before editing
- research before implementing: search codebase for existing patterns, check package registries for libraries
- apply TDD discipline (mandatory for any slice that adds or changes behavior — see execution-loop Step 5)
- implement narrowly
- review: use code-reviewer agent (or self-review if ECC not installed) after every slice
- verify with the smallest relevant validation commands
- update initiative docs after the step
- stop cleanly with the mandatory structured output format (see execution-loop Step 10)

Use bounded delegation (check ECC is installed first):
- tdd-guide → any slice that adds or changes behavior (default for most slices)
- code-reviewer → always after implementation
- security-reviewer → slice touches auth, input validation, data persistence, or external calls
- planner → slice has more than 3 unknowns or cross-cutting dependencies

Do not widen scope casually.
Do not skip doc updates after a completed slice.
Do not end with a conversational message — always use the structured stop output.
