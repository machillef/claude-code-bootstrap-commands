Continue an existing initiative using the `execution-loop` skill.

User input: $ARGUMENTS

Interpret the argument as the initiative name, optionally with a specific constraint or priority.

Required behavior:
- read `CLAUDE.md`
- read the initiative docs in `docs/ai/`
- determine the next in-progress or next planned slice
- reconfirm scope before editing
- apply TDD or test-first discipline where practical
- implement narrowly
- verify with the smallest relevant validation commands
- update initiative docs after the step
- stop cleanly with next recommended slice

Use bounded delegation only when the criteria apply (check ECC is installed first):
- planner → slice has more than 3 unknowns or cross-cutting dependencies
- tdd-guide → slice adds new testable behavior
- code-reviewer → slice touches more than one file and is non-trivial
- security-reviewer → slice touches auth, input validation, data persistence, or external calls

Do not widen scope casually.
Do not skip doc updates after a completed slice.
