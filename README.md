# claude-code-bootstrap-commands

A disciplined workflow for Claude Code covering every project scenario: opening an existing codebase, starting from scratch, or making a small targeted fix — without a bloated CLAUDE.md that drifts over time.

## What it does

Instead of generating a massive `CLAUDE.md` that gets stale, this workflow keeps `CLAUDE.md` minimal and stores all project-specific state in `docs/ai/` files alongside your code. Claude reads those files on each session — they stay current because they live in the repo.

Four commands cover every scenario:

| Command | When to use |
|---|---|
| `/quick-change <description>` | Small change: 1-3 files, follows an existing pattern (add auth to a page, fix a bug, add a field). No planning overhead. |
| `/bootstrap-existing <initiative>` | Existing codebase, medium or large change. Discovers the stack, maps scope, creates scaled `docs/ai/` planning docs, defines the first safe slice. Does not implement. |
| `/bootstrap-new <what you're building>` | Greenfield project. Gathers requirements, picks an opinionated stack, scaffolds the project, creates `docs/ai/` planning docs. Does not implement. |
| `/continue-work <initiative>` | Resume after either bootstrap. Reads `docs/ai/` state, picks the next slice, implements narrowly, verifies, updates docs. |

Two agents:

| Agent | When | What it does |
|---|---|---|
| `architecture-discovery` | Invoked by `bootstrap-existing` for large changes | Deep structural analysis: stack, entry points, data models, auth patterns, integration contracts, migration risk map |
| `stack-advisor` | Invoked by `bootstrap-new` | Opinionated stack recommendation based on requirements. One confident pick with rationale, not a menu of options. |

## Design principles

- **No CLAUDE.md in target repos.** Your global `~/.claude/CLAUDE.md` covers universal principles. `docs/ai/` covers initiative state. A repo-level CLAUDE.md loads context every session and drifts — so this workflow never writes one.
- **Scale to change size.** Small change → no docs overhead. Medium → 3 docs/ai files. Large → 7 docs/ai files + architecture discovery. New project → 5 docs/ai files starting from requirements.
- **ECC-native.** References [everything-claude-code](https://github.com/affaan-m/everything-claude-code) agents and language-specific skills instead of duplicating them locally.
- **Stale check on resume.** Before trusting `docs/ai/`, the execution loop checks recent git commits against doc dates and flags drift.

## Installation

### Prerequisites

- [Claude Code](https://claude.ai/code) installed
- [everything-claude-code](https://github.com/affaan-m/everything-claude-code) plugin (install at user scope for global availability)

### On a new workstation

```bash
# 1. Clone this repo to a permanent location
git clone https://github.com/YOUR_USERNAME/claude-code-bootstrap-commands ~/path/to/claude-bootstrap

# 2. Run the installer
cd ~/path/to/claude-bootstrap
./install.sh
```

The installer copies commands, agents, and skills into `~/.claude/`. It is safe to re-run after pulling updates.

**What it writes:**
```
~/.claude/commands/bootstrap-existing.md
~/.claude/commands/continue-work.md
~/.claude/commands/quick-change.md
~/.claude/agents/architecture-discovery.md
~/.claude/skills/workflow-existing-repo/SKILL.md
~/.claude/skills/execution-loop/SKILL.md
```

**What it never touches:** your existing `CLAUDE.md`, `rules/`, custom skills, plugin configs, MCP settings, or any file it did not install.

If a file with the same name already exists and was not installed by this script, it is **skipped with a warning** rather than overwritten. Use `--force` only if you are sure the conflict is safe to override.

### Updating

```bash
cd ~/path/to/claude-bootstrap
git pull
./install.sh   # updates only the files it owns
```

### Installing ECC

Install [everything-claude-code](https://github.com/affaan-m/everything-claude-code) at user scope so its agents are available in every repo:

```
/plugin add everything-claude-code --scope user
```

Or at project scope to try it in one repo first:

```
/plugin add everything-claude-code
```

## Usage

### Small change

```
/quick-change add Google OAuth to the settings page
```

Finds the existing auth pattern, applies it minimally, verifies, logs one line to `docs/ai/quick-changes-log.md`.

### Medium or large change

```
/bootstrap-existing migrate-to-react
```

Triages the request, detects the tech stack, maps scope boundaries, creates `docs/ai/` planning files scaled to the change size, defines the first safe slice. Stops before implementing.

```
/continue-work migrate-to-react
```

Reads `docs/ai/` state, checks for drift since last session, picks the next slice, implements narrowly with TDD, verifies, updates docs, stops cleanly with the next recommended slice.

## docs/ai/ structure

Created inside your target repo by the commands. Scale depends on change size:

```
docs/ai/
  quick-changes-log.md              ← small changes only, append-only log
  <initiative>-scope-map.md         ← medium+
  <initiative>-slices.md            ← medium+
  <initiative>-status.md            ← medium+
  <initiative>-contracts.md         ← large only
  <initiative>-risks.md             ← large only
  <initiative>-plan.md              ← large only
  <initiative>-decisions.md         ← large only
  <initiative>-architecture-discovery.md  ← large only
```

These files are committed alongside your code. They are the source of truth for resuming work across sessions — not conversation context, not CLAUDE.md.

## License

MIT
