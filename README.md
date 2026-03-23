# claude-code-bootstrap-commands

A disciplined workflow for Claude Code that stores all project state in `docs/ai/` files — not chat memory, not a bloated CLAUDE.md.

## How It Works

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                  USER ENTRY POINTS                                       │
├──────────────┬──────────────┬──────────────┬──────────────────┬──────────────────────────┤
│/quick-change │ /bootstrap-  │ /bootstrap-  │ /continue-work   │ /detour                  │
│<description> │ existing     │ new          │ <initiative>     │ <initiative> <desc>      │
│              │ <initiative> │ <project>    │                  │                          │
│ 1-3 files    │ Medium/Large │ Greenfield   │ Resume after     │ Temporary diversion from │
│ Follows pat. │ existing repo│ from scratch │ any bootstrap    │ current slice plan       │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬─────────┴────────────┬─────────────┘
       │              │              │                │                      │
       ▼              ▼              ▼                ▼                      ▼
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────┐ ┌───────────────────────────┐
│ Inline     │ │ workflow-  │ │ workflow-  │ │ execution-   │ │ Worktree isolation        │
│ workflow   │ │ existing-  │ │ new-repo   │ │ loop         │ │                           │  
│            │ │ repo       │ │            │ │              │ │ • Pause current slice     │
│ • Find pat.│ │            │ │ • Require- │ │ • Stale check│ │ • Create worktree         │
│ • Apply    │ │ • Triage   │ │   ments    │ │ • Load state │ │ • Do the work (TDD)       │
│ • TDD      │ │ • Detect   │ │ • brain-   │ │ • Pick slice │ │ • Merge back to branch    │
│ • Self-    │ │ • Map scope│ │   storm    │ │ • TDD        │ │ • Clean up worktree       │
│   review   │ │ • brain-   │ │ • stack-   │ │ • Implement  │ │ • Restore paused slice    │
│ • Log      │ │   storm    │ │   advisor  │ │ • Verify     │ │ • Log in status.md        │
│            │ │ • docs/ai  │ │ • Scaffold │ │ • Re-assess  │ │                           │
│            │ │ • STOP     │ │ • docs/ai  │ │ • Update docs│ │ Modes: small (inline)     │
│            │ │            │ │ • STOP     │ │ • Learn      │ │         big (mini-plan)   │
│            │ │            │ │            │ │ • STOP       │ │                           │
└────────────┘ └──────┬─────┘ └─────┬──────┘ └──────┬───────┘ └────────────┬──────────────┘
                      │             │               │                      │
                      └──────┬──────┘               │                      │
                             ▼                      │                      │
                    ┌─────────────────┐             │                      │
                    │   docs/ai/      │◄────────────┴──────────────────────┘
                    │   (repo state)  │
                    │                 │
                    │ • status.md     │
                    │ • slices.md     │
                    │ • decisions.md  │
                    │ • scope-map.md  │
                    │ • design.md     │
                    │ • ...           │
                    └─────────────────┘
```

## Usage Examples

### Starting a new project from scratch

```
> /bootstrap-new file-explorer

Bootstrap reads your requirements, runs brainstorm-design for collaborative
design exploration (2-3 approaches with trade-offs), invokes stack-advisor
to recommend a stack, scaffolds the project, and creates all docs/ai/ files.

Output: docs/ai/ with requirements, design, decisions, plan, slices, status
Next step: /continue-work file-explorer
```

### Adding a feature to an existing repo

```
> /bootstrap-existing add-batch-rename

Bootstrap triages the change as Medium or Large, detects the tech stack,
maps scope boundaries, runs brainstorm-design for design exploration,
and creates docs/ai/ with slices ready to implement.

For Large changes, the architecture-discovery agent maps API contracts,
data models, auth patterns, and integration points first.

Output: docs/ai/ with scope-map, design, slices, status
Next step: /continue-work add-batch-rename
```

### Continuing work on an initiative

```
> /continue-work add-batch-rename

The execution-loop loads docs/ai/ state, runs a stale check against
recent git history, picks the next slice, implements with TDD
(write failing test → implement → verify), dispatches review
subagents, updates docs, and stops with a clear next step.

> /continue-work add-batch-rename focus on error handling for network paths

You can add a constraint or priority — the loop honors it when
selecting and implementing the next slice.
```

### Quick one-off change

```
> /quick-change add dark mode toggle to settings panel

For changes that touch 1-3 files and follow an existing pattern.
No bootstrap, no docs/ai/ setup. Finds the pattern in the codebase,
applies TDD if behavioral, self-reviews, and logs to
docs/ai/quick-changes-log.md.

If it needs >3 files or no pattern exists, it stops and redirects
you to /bootstrap-existing.
```

### Temporary diversion from the slice plan

```
> /detour file-explorer improve click sequence performance

You're on slice 14, but want to do something outside the plan.
Detour pauses slice 14 in status.md, creates a git worktree
branched from your current working branch, and does the work
in isolation.

Small detours (< half day): inline TDD, self-review, done.
Big detours (multi-session): creates a mini-plan, commits per step.

> /detour file-explorer finish

Merges the worktree branch back into your working branch,
cleans up the worktree, logs the detour in status.md,
and restores the paused slice as In Progress.

> /detour file-explorer continue

For big detours spanning multiple sessions — resumes work
in the existing worktree.
```

### Running a retrospective after completing an initiative

```
> /retro add-batch-rename

Reads all docs/ai/ files and git history. Outputs metrics (slices
planned/completed/blocked, completion rate, debugging escalations)
and key learnings. Triggers /consolidate-learnings to merge patterns
into parent skill gotchas.
```

### Checking skill health

```
> /skill-health

Scores every installed skill against 8 structural criteria (has SKILL.md,
concise description, folder structure, gotchas, templates, etc.).
Outputs a scorecard table and top 3 recommendations.

> /skill-improve execution-loop

Analyzes one skill, proposes targeted improvements (ranked by impact),
implements changes, and reports baseline vs new score.
```

## Recommended Plugins

This workflow is designed as an orchestration layer. It delegates to plugin agents and skills when available, and falls back to direct implementation when they're not installed.

### Required plugins

Install at user scope so they're available across all projects:

```
claude plugin add everything-claude-code --scope user
claude plugin add superpowers --scope user
```

### What each plugin provides

| Plugin | What this workflow uses from it |
|---|---|
| **everything-claude-code** | Language-specific reviewers (C++, Python, Go, TypeScript), build resolvers, security-reviewer, tdd-guide, continuous learning (`/everything-claude-code:learn-eval`), session management |
| **superpowers** | Verification-before-completion discipline, receiving-code-review skill, subagent-driven development patterns, writing-skills meta-skill |

### How they coexist

- **No context bloat.** Skills are lazy-loaded — Claude reads only the one-line description until a skill is invoked. Having both plugins installed does not load their full content.
- **No command clashes.** Plugin commands are namespaced: `/superpowers:brainstorming`, `/everything-claude-code:learn-eval`. Your bootstrap commands (`/quick-change`, `/continue-work`, etc.) are unnamespaced and take precedence.
- **Hooks are additive.** ECC's hooks (quality gates, continuous learning capture) and Superpowers' hook (skill context injection at session start) run independently.
- **Your commands are the entry points.** Always start with `/quick-change`, `/bootstrap-existing`, `/bootstrap-new`, or `/continue-work`. These orchestrate the plugins — you don't need to invoke plugin internals directly.

### Without plugins

Everything still works. The execution-loop checks for available agents before delegating and falls back to direct implementation (write tests first, review your own code, check security manually). The discipline is preserved; only the specialized reviewers are missing.

## Learning Lifecycle

The workflow includes a continuous improvement loop with both automatic and manual steps.

### Automatic (via hooks — all auto-loaded when installed as plugin)

| Hook | Trigger | What it does |
|---|---|---|
| `session-skill-health-check.sh` | First `Read` call per session | Reminds to run `/skill-health` if last run was >7 days ago |
| `session-detour-check.sh` | First `Read` call per session | Warns about active detour worktrees that need finishing |
| `session-stale-docs-check.sh` | First `Read` call per session | Warns about stale `docs/ai/` status files (>3 days, active repo) |
| `post-learn-eval-consolidate.sh` | After any `learn-eval` skill | Reminds to run `/consolidate-learnings` |
| `stop-learn-eval-suggest.sh` | Session end | Suggests `/everything-claude-code:learn-eval` after meaningful sessions |
| `stop-detour-reminder.sh` | Session end | Reminds about active detour worktrees before closing |

ECC plugin hooks (when installed) additionally:
- Capture tool use observations for pattern extraction (async, every tool call)
- Evaluate sessions for extractable patterns on session end (async)
- Track token/cost metrics per session (async)

### Manual (you invoke these — hooks remind you when it's time)

| Command | When to run | Hook that reminds you |
|---|---|---|
| `/everything-claude-code:learn-eval` | End of a meaningful session | `stop-learn-eval-suggest.sh` |
| `/consolidate-learnings` | After learn-eval, or weekly | `post-learn-eval-consolidate.sh` |
| `/retro <initiative>` | After completing all slices | execution-loop Step 12 |
| `/skill-health` | Monthly, or after adding/modifying skills | `session-skill-health-check.sh` |
| `/skill-improve <skill>` | After skill-health identifies gaps | (manual — run after reviewing scorecard) |
| `/detour <init> finish` | When detour work is done | `session-detour-check.sh`, `stop-detour-reminder.sh` |

### The full loop

```
Session starts
    │
    ├─ Hook: active detour? remind to continue/finish (automatic)
    ├─ Hook: stale docs/ai/? remind to update (automatic)
    ├─ Hook: /skill-health overdue? remind to run (automatic)
    │
    ▼
Work happens (execution-loop runs slices)
    │
    ├─ ECC hooks silently capture observations (automatic)
    │
    ▼
End of session
    │
    ├─ Hook: suggest /everything-claude-code:learn-eval (automatic)
    │
    ├─ Run /everything-claude-code:learn-eval (manual, but prompted)
    │   └─ Extracts patterns → ~/.claude/skills/learned/
    │
    ├─ Hook: remind to consolidate (automatic)
    │
    ├─ Run /consolidate-learnings (manual, but prompted)
    │   └─ Merges patterns into parent skill gotchas
    │
    ├─ Hook: remind about active detours (automatic)
    │
    ▼
End of initiative (all slices complete)
    │
    ├─ execution-loop Step 12 suggests /retro (automatic)
    │
    ├─ Run /retro <initiative> (manual)
    │   └─ Extracts metrics + learnings → retro-log.md
    │
    ▼
Periodic maintenance
    │
    ├─ Hook: /skill-health overdue reminder (automatic)
    │
    ├─ Run /skill-health (manual, but prompted)
    │   └─ Scores skills → recommends improvements
    │
    └─ Run /skill-improve <skill> (manual)
        └─ Targeted improvement for one skill
```

## Prerequisites

- [Claude Code](https://claude.ai/code)

## Installation

### As a plugin (recommended)

Two commands. All commands, skills, agents, and hooks are auto-loaded — no manual settings.json editing:

```
/plugin marketplace add machillef/claude-code-bootstrap-commands
/plugin install bootstrap-commands@claude-code-bootstrap-commands --scope user
```

Updates are automatic when the repo is pushed to GitHub.

### From source (symlink-based)

For development or when you want to modify the workflows locally:

**Linux / macOS / WSL:**
```bash
git clone https://github.com/machillef/claude-code-bootstrap-commands ~/claude-bootstrap
cd ~/claude-bootstrap && ./install.sh
```

**Windows (PowerShell 7+, Developer Mode or Admin):**
```powershell
git clone https://github.com/machillef/claude-code-bootstrap-commands C:\claude-bootstrap
cd C:\claude-bootstrap; .\install.ps1
```

Both installers create symlinks from `~/.claude/` into this repo. `git pull` picks up updates — no re-install needed.

> **Note:** Symlink installs require manual hook wiring in `settings.json`. Plugin installs do this automatically. See `hooks/hooks.json` for the hook definitions if you need to wire them manually.

### Codex variant

Codex does not use the Claude Code plugin system. Installation is via cloning the repo and running the installer, which symlinks skills into `~/.codex/` and conservatively merges a managed block into your `~/.codex/AGENTS.md` (your existing content is preserved).

**First-time install:**

```bash
# Linux / macOS / WSL
git clone https://github.com/machillef/claude-code-bootstrap-commands ~/claude-bootstrap
cd ~/claude-bootstrap && ./install-codex.sh

# Windows (PowerShell 7+, Developer Mode or Admin)
git clone https://github.com/machillef/claude-code-bootstrap-commands C:\claude-bootstrap
cd C:\claude-bootstrap; .\install-codex.ps1
```

**Updating (after new features are merged):**

Skills are symlinked, so `git pull` picks up skill changes automatically. However, if the managed AGENTS.md block changed (new session-start/end behaviors, new skills listed), re-run the installer to refresh it:

```bash
cd ~/claude-bootstrap && git pull && ./install-codex.sh
# or on Windows:
cd C:\claude-bootstrap; git pull; .\install-codex.ps1
```

**What it does:**
- Symlinks 8 skills into `~/.codex/skills/` (auto-discovered, no manual registration)
- Merges a managed block into `~/.codex/AGENTS.md` with session-start/end behavioral rules
- Links a reference bundle to `~/.codex/bootstrap-reference/claude-code-bootstrap-commands/`

**What it never touches:** Your `~/.codex/config.toml`, any content outside the managed `<!-- BEGIN/END -->` markers in AGENTS.md, or any files it didn't install. Conflicts are skipped with a warning — use `--force` to override.

**Invoking skills:**

```text
# Explicit invocation with $ prefix
$codex-continue-work migrate-to-react
$codex-fix-bugs migrate-to-react — the sidebar doesn't scroll on mobile

# Or natural language
Use codex-continue-work for initiative migrate-to-react.
Use codex-fix-bugs for initiative migrate-to-react — the sidebar doesn't scroll on mobile.
```

**Cross-tool compatibility:** If you use both Claude Code and Codex, add this to your `~/.codex/config.toml` so Codex reads `CLAUDE.md` when no `AGENTS.md` exists:

```toml
project_doc_fallback_filenames = ["CLAUDE.md"]
```

See [codex/README.md](codex/README.md) for Codex-specific details and the full skill list.

### Both CLIs

```bash
./install-all.sh      # or .\install-all.ps1
```

## What Gets Installed

**Commands:** `/quick-change`, `/bootstrap-existing`, `/bootstrap-new`, `/continue-work`, `/fix-bugs`, `/detour`, `/consolidate-learnings`, `/skill-health`, `/skill-improve`, `/retro`

**Skills:** `workflow-existing-repo`, `workflow-new-repo`, `execution-loop`, `brainstorm-design`, `systematic-debugging` (each a folder with templates, gotchas, and/or scripts)

**Agents:** `architecture-discovery`, `stack-advisor`

What it **never** touches: your `CLAUDE.md`, `rules/`, custom skills, plugin configs, or any file it didn't install. Conflicts are skipped with a warning — use `--force` to override.

**Hooks:** 6 hooks that remind you when to run manual commands (see [Learning Lifecycle](#learning-lifecycle)). Auto-loaded when installed as a plugin. Symlink installs require manual wiring — see `hooks/hooks.json`.

## Self-Improvement Examples

### `/retro migrate-to-react`

Run after an initiative completes. Reads all `docs/ai/` files and git history, then outputs:

```
## Initiative Metrics

| Metric | Value |
|---|---|
| Slices planned | 8 |
| Slices completed | 7 |
| Slices blocked | 1 |
| Completion rate | 87% |
| Debugging escalations | 2 |
| Learnings extracted | 3 |

## Key Learnings
- Tailwind dark: classes in JS objects escape CSS audits → gotcha added to ux-craft
- Backend escapes backslashes for JS string literals → gotcha added to execution-loop
- JSDOM can't verify CSS rendering → gotcha added to execution-loop
```

### `/skill-health`

Scores every installed skill against 8 structural criteria:

```
## Skill Health Scorecard — 2026-03-19

| Skill | Score | Missing |
|---|---|---|
| execution-loop | 8/8 | — |
| systematic-debugging | 7/8 | scripts (has one, could use more) |
| code-review | 5/8 | gotchas, scripts, progressive disclosure |
| session-handoff | 3/8 | folder structure, templates, gotchas, scripts |

### Top 3 Recommendations
1. Add gotchas/ to code-review (highest usage, no failure patterns captured)
2. Convert session-handoff to folder-as-skill with a handoff template file
3. Trim ux-craft description from 42 words to ≤25
```

### `/skill-improve code-review`

Analyzes one skill and proposes targeted improvements:

```
## Skill Improvement Report — code-review — 2026-03-19

### Baseline Score
5/8

### Changes Proposed
1. Extract security checklist gotchas from learned skills → references/common-false-positives.md
2. Move inline .NET-specific patterns to references/dotnet-patterns.md (progressive disclosure)
3. Trim description from 52 words to 22 words

### New Score
7/8
```

### `/consolidate-learnings`

Scans `~/.claude/skills/learned/` and merges patterns into parent skills:

```
## Consolidation Report — 2026-03-19

### Consolidated
- tailwind-v4-no-dynamic-classes → ux-craft/references/tailwind-gotchas.md
- execution-loop-step9-never-skip → execution-loop/gotchas/step9-never-skip.md
- backend-contract-verification → execution-loop/gotchas/backend-contract-verification.md

### Flagged for Promotion
- argocd-applicationset-migration — standalone runbook, should be its own skill

### Left Orphaned
- postgres-identity-seed-data — no clear parent skill
```

## License

MIT
