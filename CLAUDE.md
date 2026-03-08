# CLAUDE.md

## Purpose

This repository uses a disciplined, repo-state-driven workflow for substantial work.

Claude should prefer:
- explicit scope control
- test-first or test-driven changes where practical
- smallest safe validating steps
- repo files under `docs/ai/` as the source of truth for active initiative state
- narrow, reversible changes over broad speculative refactors

## Working rules

- For non-trivial work, read relevant files in `docs/ai/` before planning or implementing.
- Treat initiative files under `docs/ai/` as the durable source of truth for plan, status, slices, risks, and decisions.
- Keep changes within documented scope. Do not modify unrelated systems without explicit justification recorded in the relevant `docs/ai/*-decisions.md`.
- Prefer tests before implementation where practical. If test-first is not practical, explain why and add verification immediately after the change.
- Validate with the smallest relevant build/test command before broadening changes.
- After each completed slice, update the relevant `docs/ai/*-status.md` and `docs/ai/*-decisions.md`.
- Keep this file concise and stable. Do not store temporary architecture findings, detailed migration notes, or session-specific plans here.

## Documentation conventions

Scale docs/ai/ to change size. See `docs/ai/README.md` for the full file set and scaling rules.

Bootstrap commands create a minimal `CLAUDE.md` in target repos containing only stable project facts: stack, build/test commands, file structure, and a pointer to `docs/ai/`. Do not add rules, session state, or anything that duplicates the global `~/.claude/CLAUDE.md`. Keep it under 40 lines. If one already exists, add only missing sections — do not overwrite.

## Default execution behavior

When resuming substantial work:

1. Read `CLAUDE.md`
2. Run stale check (compare docs/ai/ dates against recent git log)
3. Read the relevant `docs/ai/*`
4. Confirm the next slice from status and slices docs
5. Implement narrowly
6. Verify with relevant tests/builds
7. Update initiative docs
8. Stop with a clear next step
