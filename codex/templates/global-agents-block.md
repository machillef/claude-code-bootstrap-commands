## Bootstrap Workflow

### Available Skills
- `codex-bootstrap-existing`, `codex-bootstrap-new` — initialize initiatives
- `codex-continue-work` — resume and implement next slice
- `codex-loop-work` — chain all remaining slices + optional review passes + QA checklist
- `codex-review-loop` — multi-pass code review with isolated contexts per pass
- `codex-fix-bugs` — fix bugs found during manual testing of a completed slice
- `codex-quick-change` — small bounded changes (1-3 files)
- `codex-brainstorm-design` — collaborative design before implementation
- `codex-systematic-debugging` — structured debugging when verification fails
- `codex-orchestrate` — multi-agent orchestration for complex work
- `codex-ubiquitous-language` — extract DDD-style domain glossary to UBIQUITOUS_LANGUAGE.md

### Session Start (do these before any implementation)
- If `docs/ai/*-status.md` files exist (top-level, NOT in `docs/ai/archive/`): check their last modified date vs `git log --oneline -5`. If status is >3 days stale while repo has recent commits, warn and suggest using `codex-continue-work` to update docs first.
- Run `git worktree list`. If any `detour-*` worktrees exist, warn about them before proceeding.
- Treat `docs/ai/` as the durable source of truth for active initiative state. Ignore `docs/ai/archive/` — those are completed initiatives.
- If any top-level `docs/ai/*-status.md` has all slices Complete/Blocked and no entry exists in `docs/ai/retro-log.md` for that initiative, remind the user to run retro and archive.

### Session End (do these before stopping)
- If you made 2+ commits this session, suggest extracting reusable patterns as learned skills.
- If active detour worktrees exist, remind about them.

### Workflow Rules
- Research and reuse existing patterns before writing net-new code.
- Keep stable project facts in repo `AGENTS.md`; keep initiative state in `docs/ai/`.
- Prefer explorer/reviewer/docs-researcher role configs if available.
- Reference bundle: `~/.codex/bootstrap-reference/claude-code-bootstrap-commands/`
- Prefer additive updates to user-owned Codex config; do not overwrite unrelated setup.
