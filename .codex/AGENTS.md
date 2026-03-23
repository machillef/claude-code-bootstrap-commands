# Repo Codex Guidance

This file supplements the root `AGENTS.md` for contributors using Codex in this
repository.

## Purpose

This repo ships a Codex-native workflow pack inspired by portable pieces of
everything-claude-code. When changing the Codex variant here, prefer Codex
primitives over Claude-plugin assumptions.

## Priorities

- Keep the Codex installer additive; never assume ownership of user global config
- Prefer reference bundles and repo-local `.codex/` files over silent global rewrites
- Treat `docs/ai/` as the shared initiative ledger between Claude and Codex
- Port workflow mechanics, not Claude-only wrappers
- Use `codex-fix-bugs` when manual testing reveals bugs in a completed slice

## Preferred Codex Roles

If using repo-local role configs:

- `explorer` for read-only evidence gathering
- `reviewer` for findings-first review
- `docs_researcher` for primary-doc verification

## Workflow

For substantial Codex changes in this repo:

1. Research and reuse first
2. Plan before implementation
3. Use TDD for behavioral changes
4. Review for correctness/security regressions
5. Verify with narrow checks first, broad checks second
