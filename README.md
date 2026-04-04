# arc v2.0.0

Disciplined development workflows for Claude Code and Codex. One plugin for the full lifecycle: bootstrap, plan, build (TDD), review, ship, learn.

Arc solves the problem of multi-session software work losing context. Instead of re-explaining your project every time, arc stores initiative state in `docs/ai/` files that survive across sessions, enforces TDD discipline per slice, and learns from your patterns automatically.

## Quick Reference

```
Starting something?  →  /new-feature (existing code) or /new-project (from scratch)
Working on it?       →  /continue (one slice) or /loop (chain all slices)
Something broke?     →  /fix
Need a review?       →  /review-loop
Security concern?    →  /security
Need a sidebar?      →  /detour
Done with it?        →  /retro
Small tweak?         →  /quick
Domain modeling?     →  /glossary
Meta-maintenance?    →  /skill-health, /skill-improve
Check upstream?      →  /upstream
```

## Getting Started

```bash
# 1. Install
/plugin marketplace add machillef/arc
/plugin install arc

# 2. Start a feature in your repo
/new-feature Add user authentication

# 3. Follow the guided design, then execute slice-by-slice:
/continue auth-feature

# 4. When all slices are done:
/retro auth-feature
```

## How It Works

```
/new-feature or /new-project
    ↓
Design exploration → docs/ai/ created
    ↓
/continue ── TDD → Build → Verify → Review ──┐
    ↓                                          │
  (next slice)          /fix for bugs ─────────┘
    ↓                   /detour for sidebars
/retro → metrics, learnings, archive
    ↓
Learning system captures patterns automatically
```

## Commands

| Command | What it does |
|---------|-------------|
| `/new-feature` | Bootstrap existing repo: triage, design, docs/ai/, first slice |
| `/new-project` | Greenfield: requirements, stack, scaffold, docs/ai/ |
| `/continue` | Execute next slice with TDD, verification, doc updates |
| `/loop` | Chain all remaining slices in one session |
| `/quick` | Small 1-3 file change, no docs/ai/ overhead |
| `/fix` | Diagnose and fix bugs with systematic debugging + TDD |
| `/review-loop` | Multi-pass review: quality → spec → security → QA |
| `/detour` | Worktree-isolated temporary diversion |
| `/retro` | Retrospective: metrics, learnings, archive |
| `/security` | 4-phase security audit (secrets, deps, CI/CD, OWASP) |
| `/glossary` | Extract DDD ubiquitous language |
| `/skill-health` | Audit installed skills for structural quality |
| `/skill-improve` | Iteratively improve a specific skill |
| `/upstream` | Check tracked upstream repos for changes |

## docs/ai/ — Persistent State

File set scales with scope:

| Scope | Trigger | Files |
|-------|---------|-------|
| **Quick** | `/quick` | Log entry in `quick-changes-log.md` |
| **Standard** | `/new-feature` (medium) | 4 files: status, slices, design, decisions |
| **Full** | `/new-feature` (large), `/new-project` | 10 files: standard + scope-map, contracts, risks, plan, requirements, architecture-discovery |

## Bundled Agents

11 agents dispatched automatically during slice execution:

**Reviewers:** `cpp-reviewer`, `rust-reviewer`, `python-reviewer`, `csharp-reviewer`, `typescript-reviewer`, `powershell-reviewer`, `kubernetes-reviewer`

**Build resolvers:** `cpp-build-resolver`, `rust-build-resolver`

**Specialists:** `architecture-discovery` (deep codebase analysis), `stack-advisor` (greenfield stack decisions)

## Safety Hooks

13 Node.js hooks, cross-platform (macOS + Windows/WSL):

| Hook | Type | What it does |
|------|------|-------------|
| `block-no-verify` | Blocking | Prevents `--no-verify` and `core.hooksPath` bypass |
| `config-protection` | Blocking | Prevents weakening linter/formatter configs |
| `destructive-guard` | Blocking | Blocks force-push, `rm -rf`, `kubectl delete`, secrets in commands |
| `commit-quality` | Blocking | Detects secrets and debug statements in staged files |
| `outside-project-warn` | Advisory | Warns on edits outside the git repo |
| `broad-git-add-warn` | Advisory | Warns on `git add .` / `git add -A` |
| `stale-docs-check` | Session | Warns if docs/ai/ is stale vs recent commits |
| `detour-check` | Session | Warns about active detour worktrees |
| `retro-reminder` | Session | Nudges for completed initiatives without retro |
| `desktop-notify` | Stop | Desktop notification on task complete |
| `observation-capture` | Learning | Records tool calls to project-scoped JSONL |
| `session-end-observer` | Learning | Extracts instincts from observations at session end |
| `ambient-learning-nudge` | Learning | Injects high-confidence instincts into context |

## Self-Learning

Runs automatically every session — no manual commands needed:

1. **Observe** — Hooks capture tool calls with secret scrubbing
2. **Analyze** — Session-end observer detects patterns
3. **Create** — Atomic instincts with confidence scores (0.3–0.9)
4. **Nudge** — High-confidence instincts injected into next session

Data: `~/.claude/arc/projects/<hash>/` (per-project), `~/.claude/arc/instincts/global/` (cross-project).

Planned maintenance commands: `evolve` (cluster instincts into skills), `promote` (project → global), `prune` (remove stale). These will be added in a future release.

## Architecture

```
skills/          7 workflow skills (shared across platforms)
agents/          11 reviewers, resolvers, and specialists
agent-prompts/   9 shared review rubrics
commands/        14 slash commands
hooks/           13 hooks (safety + operational + learning) + 2 shared libs
learning/        Instinct config and templates
manifests/       Upstream repo tracking
references/      Claude Code ↔ Codex tool mapping
scripts/         install.js, uninstall.js, ecc-removal-check.js
```

**Three layers:** Skills (both platforms), Hooks (Claude Code — hard enforcement), Codex config (instruction-based — best-effort).

## Companion: Superpowers

Arc orchestrates *what* to do; [superpowers](https://github.com/obra/superpowers) enforces *how* to do it (TDD iron law, brainstorming rigor, debugging phases, verification evidence). Install both for the full workflow. Arc works standalone with built-in fallbacks.

## Installation

**Prerequisite:** Node.js v18+

```bash
# Claude Code
/plugin marketplace add machillef/arc
/plugin install arc

# Codex
git clone https://github.com/machillef/claude-code-bootstrap-commands && cd claude-code-bootstrap-commands
codex plugin install ./

# Manual (both)
node scripts/install.js

# Uninstall
node scripts/uninstall.js
```

## Migration from v1

```bash
node scripts/ecc-removal-check.js   # Diagnose ECC remnants
node scripts/uninstall.js            # Remove v1
node scripts/install.js              # Install v2
```

| v1 | v2 |
|----|-----|
| `/bootstrap-existing` | `/new-feature` |
| `/bootstrap-new` | `/new-project` |
| `/continue-work` | `/continue` |
| `/loop-work` | `/loop` |
| `/quick-change` | `/quick` |
| `/fix-bugs` | `/fix` |
| `/security-audit` | `/security` |
| `/ubiquitous-language` | `/glossary` |
| `/consolidate-learnings` | Automatic |
| `/freeze` / `/unfreeze` | Removed |

## Acknowledgments

Inspired by [superpowers](https://github.com/obra/superpowers) (Jesse Vincent), [everything-claude-code](https://github.com/affaan-m/everything-claude-code) (Affaan Mustafa), and [hermes-agent](https://github.com/NousResearch/hermes-agent) (Nous Research).

## License

MIT
