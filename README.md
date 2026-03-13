# claude-code-bootstrap-commands

A disciplined workflow for Claude Code, with an in-progress Codex-native variant, covering every project scenario: opening an existing codebase, starting from scratch, or making a small targeted fix — without a bloated global instruction file that drifts over time.

## What it does

Instead of generating a massive instruction file that gets stale, this workflow keeps the global agent guidance minimal and stores all project-specific state in `docs/ai/` files alongside your code. The active CLI reads those files on each session — they stay current because they live in the repo.

Claude currently exposes four command entrypoints:

| Command | When to use |
|---|---|
| `/quick-change <description>` | Small change: 1-3 files, follows an existing pattern (add auth to a page, fix a bug, add a field). No planning overhead. |
| `/bootstrap-existing <initiative>` | Existing codebase, medium or large change. Discovers the stack, maps scope, creates scaled `docs/ai/` planning docs, defines the first safe slice. Does not implement. |
| `/bootstrap-new <what you're building>` | Greenfield project. Gathers requirements, picks an opinionated stack, scaffolds the project, creates `docs/ai/` planning docs. Does not implement. |
| `/continue-work <initiative>` | Resume after either bootstrap. Reads `docs/ai/` state, picks the next slice, implements narrowly, verifies, updates docs. |

Claude also uses two specialist agents:

| Agent | When | What it does |
|---|---|---|
| `architecture-discovery` | Invoked by `bootstrap-existing` for large changes | Deep structural analysis: stack, entry points, data models, auth patterns, integration contracts, migration risk map |
| `stack-advisor` | Invoked by `bootstrap-new` | Opinionated stack recommendation based on requirements. One confident pick with rationale, not a menu of options. |

## Design principles

- **Durable repo state beats chat memory.** `docs/ai/` covers initiative state across sessions and now acts as the shared state layer between the Claude and Codex variants.
- **Scale to change size.** Small change → no docs overhead. Medium → scope-map, design, slices, status. Large → those files plus contracts, risks, plan, decisions, and architecture discovery. New project → requirements, design, decisions, plan, slices, status.
- **ECC-native.** References [everything-claude-code](https://github.com/affaan-m/everything-claude-code) agents and language-specific skills instead of duplicating them locally.
- **Codex-native additive install.** The Codex variant installs namespaced skills and merges a managed block into `~/.codex/AGENTS.md` without overwriting user-owned config.
- **Stale check on resume.** Before trusting `docs/ai/`, the execution loop checks recent git commits against doc dates and flags drift.

## Installation

### Prerequisites

- For the Claude variant: [Claude Code](https://claude.ai/code) plus the [everything-claude-code](https://github.com/affaan-m/everything-claude-code) plugin
- For the Codex variant: Codex CLI

### Claude variant on a new workstation (Linux / macOS / WSL)

```bash
# 1. Clone this repo to a permanent location
git clone https://github.com/YOUR_USERNAME/claude-code-bootstrap-commands ~/path/to/claude-bootstrap

# 2. Run the installer
cd ~/path/to/claude-bootstrap
./install.sh
```

### Claude variant on Windows (PowerShell)

Requires PowerShell 7+ and either **Developer Mode** enabled or an **Administrator** shell.

```powershell
# 1. Clone this repo to a permanent location
git clone https://github.com/YOUR_USERNAME/claude-code-bootstrap-commands C:\path\to\claude-bootstrap

# 2. Run the installer
cd C:\path\to\claude-bootstrap
.\install.ps1
```

Both installers create symlinks from `~/.claude/` into this repo. It is safe to re-run after pulling updates.

### Codex variant

The Codex installer is additive:

- links namespaced skills from this repo into `~/.codex/skills/`
- merges a managed block into `~/.codex/AGENTS.md`
- does **not** modify `~/.codex/config.toml`

```bash
# Linux / macOS / WSL
cd ~/path/to/claude-bootstrap
./install-codex.sh
```

```powershell
# Windows (PowerShell)
cd C:\path\to\claude-bootstrap
.\install-codex.ps1
```

### Both CLIs from one clone

```bash
./install-all.sh
```

```powershell
.\install-all.ps1
```

**Claude installer writes:**
```
~/.claude/commands/bootstrap-existing.md
~/.claude/commands/continue-work.md
~/.claude/commands/quick-change.md
~/.claude/agents/architecture-discovery.md
~/.claude/skills/workflow-existing-repo/SKILL.md
~/.claude/skills/execution-loop/SKILL.md
```

**Codex installer writes:**
```
~/.codex/skills/codex-quick-change
~/.codex/skills/codex-bootstrap-existing
~/.codex/skills/codex-bootstrap-new
~/.codex/skills/codex-continue-work
~/.codex/skills/codex-brainstorm-design
~/.codex/skills/codex-systematic-debugging
~/.codex/AGENTS.md   (managed block merge only)
```

**What it never touches by default:** your existing `CLAUDE.md`, `rules/`, custom skills, plugin configs, `~/.codex/config.toml`, or any file it did not install or merge via the managed AGENTS block.

If a file with the same name already exists and was not installed by this script, it is **skipped with a warning** rather than overwritten. Use `--force` only if you are sure the conflict is safe to override.

### Updating

```bash
# Linux / macOS / WSL
cd ~/path/to/claude-bootstrap
git pull
./install.sh         # updates Claude-owned links
./install-codex.sh   # updates Codex-owned links and refreshes the AGENTS block
```

```powershell
# Windows (PowerShell)
cd C:\path\to\claude-bootstrap
git pull
.\install.ps1         # updates Claude-owned links
.\install-codex.ps1   # updates Codex-owned links and refreshes the AGENTS block
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

### Claude: small change

```
/quick-change add Google OAuth to the settings page
```

Finds the existing auth pattern, applies it minimally, verifies, logs one line to `docs/ai/quick-changes-log.md`.

### Claude: medium or large change in an existing repo

```
/bootstrap-existing migrate-to-react
```

Triages the request, detects the tech stack, maps scope boundaries, creates `docs/ai/` planning files scaled to the change size, defines the first safe slice. Stops before implementing.

```
/continue-work migrate-to-react
```

Reads `docs/ai/` state, checks for drift since last session, picks the next slice, implements narrowly with TDD, verifies, updates docs, stops cleanly with the next recommended slice.

### Claude: new project from scratch

```
/bootstrap-new task management API
```

Asks up to 4 questions (type of app, scale, constraints, team ecosystem), invokes the `stack-advisor` agent for an opinionated stack recommendation, scaffolds the project, creates `docs/ai/` planning files, defines the first slice. Stops before implementing features.

```
/continue-work task-management-api
```

Same execution loop as the existing-repo path — `docs/ai/` is the source of truth regardless of how the project started.

### After all slices complete

When `/continue-work` detects there are no slices left, it emits an **End of Plan** summary instead of a normal next-step line. The summary contains:

- A concrete checklist of everything built but not yet verified in a real environment (copied verbatim from the "What remains unverified" entries the execution loop has been maintaining in `docs/ai/`)
- Any exit criteria from `docs/ai/<initiative>-slices.md` that were never confirmed

Take that checklist, run manual validation in your target environment, note what works and what breaks, then start a new initiative for the fix cycle:

```
/bootstrap-existing <initiative>-fixes
```

This starts a new disciplined initiative on the same codebase — depth-first now (make things work well, fix breakage found in validation) rather than the breadth-first feature delivery of the first plan. Repeat as needed until the software is stable.

### Codex: invoking the workflow

Codex does not use the Claude-style slash command model. Instead, ask for the
skill directly:

```text
Use the codex-bootstrap-existing skill for initiative migrate-to-react.
```

```text
Use codex-continue-work for initiative migrate-to-react.
```

```text
Use codex-quick-change to add Google OAuth to the settings page.
```

See [codex/README.md](codex/README.md) for the Codex-specific workflow details.

## docs/ai/ structure

Created inside your target repo by the workflow. Scale depends on scenario:

```
docs/ai/
  quick-changes-log.md                   ← small changes, append-only log

  ← existing repo, medium change:
  <initiative>-scope-map.md
  <initiative>-design.md
  <initiative>-slices.md
  <initiative>-status.md

  ← existing repo, large change (all of the above plus):
  <initiative>-contracts.md
  <initiative>-risks.md
  <initiative>-plan.md
  <initiative>-decisions.md
  <initiative>-architecture-discovery.md

  ← new project:
  <initiative>-requirements.md
  <initiative>-design.md
  <initiative>-decisions.md
  <initiative>-plan.md
  <initiative>-slices.md
  <initiative>-status.md
```

These files are committed alongside your code. They are the source of truth for resuming work across sessions — not conversation context, not CLAUDE.md.

## License

MIT
