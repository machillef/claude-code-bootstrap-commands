## Bootstrap Workflow

- For medium or large work in an existing repo, use `codex-bootstrap-existing`.
- For greenfield work, use `codex-bootstrap-new`.
- For small bounded changes, use `codex-quick-change`.
- To resume an initiative, use `codex-continue-work`.
- For multi-phase or multi-agent execution, use `codex-orchestrate`.
- Treat `docs/ai/` as the durable source of truth for active initiative state.
- Keep stable project facts in repo `AGENTS.md`; keep initiative state in `docs/ai/`.
- Research and reuse existing patterns before writing net-new code.
- Prefer explorer/reviewer/docs-researcher role configs if you have added them to your Codex setup.
- Reference bundle: `~/.codex/bootstrap-reference/claude-code-bootstrap-commands/`
- Prefer additive updates to user-owned Codex config; do not overwrite unrelated setup.
