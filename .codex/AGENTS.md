# Repo Codex Guidance

This file supplements the root `AGENTS.md` for contributors using Codex in this
repository.

## Purpose

This repo ships **Arc**, a Codex-native workflow pack for disciplined development.
When changing the Codex variant here, prefer Codex primitives over Claude-plugin
assumptions.

## Priorities

- Keep the Codex installer additive; never assume ownership of user global config
- Prefer reference bundles and repo-local `.codex/` files over silent global rewrites
- Treat `docs/ai/` as the shared initiative ledger between Claude and Codex
- Port workflow mechanics, not Claude-only wrappers
- Use `/fix` when manual testing reveals bugs in a completed slice

## Arc Commands (v2)

| Command | Purpose |
|---------|---------|
| `/new-project` | Bootstrap a greenfield project |
| `/initiative` | Bootstrap an existing-repo initiative |
| `/continue` | Continue an existing initiative (pick next slice) |
| `/loop` | Chain all remaining slices in one session |
| `/fix` | Fix bugs found during manual or acceptance testing |
| `/quick` | Lightweight path for small, well-defined changes |
| `/detour` | Temporary diversion from the current slice plan |
| `/review-loop` | Multi-pass code review with fresh subagent isolation |
| `/retro` | Run a retrospective on a completed initiative |
| `/upstream` | Sync with upstream changes |
| `/glossary` | Extract a DDD-style ubiquitous language glossary |
| `/security` | Security audit of the codebase |
| `/skill-health` | Audit structural health of installed skills |
| `/skill-improve` | Iteratively improve a specific skill |
| `/instinct-status` | Show learned instincts with confidence scores |
| `/evolve` | Cluster related instincts into skills/gotchas |
| `/promote` | Promote high-confidence project instincts to global |
| `/prune` | Delete stale low-confidence instincts |

## Preferred Codex Roles

If using repo-local role configs:

- `explorer` for read-only evidence gathering
- `reviewer` for findings-first review
- `docs_researcher` for primary-doc verification

## Platform Reference

See `references/platform-map.md` for the full tool mapping between Claude Code
and Codex, including agent dispatch and hook equivalents.

## Workflow

For substantial Codex changes in this repo:

1. Research and reuse first
2. Plan before implementation
3. Use TDD for behavioral changes
4. Review for correctness/security regressions
5. Verify with narrow checks first, broad checks second
