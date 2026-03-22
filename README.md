# claude-code-bootstrap-commands

A disciplined workflow for Claude Code that stores all project state in `docs/ai/` files — not chat memory, not a bloated CLAUDE.md.

## How It Works

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER ENTRY POINTS                                 │
├──────────────────┬──────────────────┬──────────────────┬────────────────────┤
│  /quick-change   │ /bootstrap-      │ /bootstrap-new   │ /continue-work     │
│  <description>   │ existing <init>  │ <project>        │ <initiative>       │
│                  │                  │                  │                    │
│  1-3 files       │  Medium / Large  │  Greenfield      │  Resume after      │
│  Follows pattern │  existing repo   │  from scratch    │  any bootstrap     │
└────────┬─────────┴────────┬─────────┴────────┬─────────┴──────────┬─────────┘
         │                  │                  │                    │
         ▼                  ▼                  ▼                    ▼
┌─────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────┐
│ Inline workflow │ │ workflow-        │ │ workflow-        │ │ execution-   │
│ (no skill)      │ │ existing-repo    │ │ new-repo         │ │ loop         │
│                 │ │                  │ │                  │ │              │
│ • Find pattern  │ │ • Triage size    │ │ • Requirements   │ │ • Stale check│
│ • Apply change  │ │ • Detect stack   │ │ • brainstorm-    │ │ • Load state │
│ • TDD if behav. │ │ • Map boundaries │ │   design skill   │ │ • Pick slice │
│ • Self-review   │ │ • brainstorm-    │ │ • stack-advisor  │ │ • TDD        │
│ • Log to        │ │   design skill   │ │   agent          │ │ • Implement  │
│   quick-changes │ │ • Create docs/ai │ │ • Scaffold       │ │ • Verify     │
│                 │ │ • First slice    │ │ • Create docs/ai │ │ • Re-assess  │
│                 │ │ • STOP           │ │ • STOP           │ │ • Update docs│
│                 │ │                  │ │                  │ │ • Learn      │
│                 │ │  agents:         │ │  agents:         │ │ • STOP       │
│                 │ │  architecture-   │ │  stack-advisor   │ │              │
│                 │ │  discovery       │ │                  │ │  delegates:  │
│                 │ │  (large only)    │ │                  │ │  plugin      │
│                 │ │                  │ │                  │ │  agents      │
└─────────────────┘ └───────┬──────────┘ └────────┬─────────┘ └──────┬───────┘
                            │                     │                  │
                            └──────────┬──────────┘                  │
                                       ▼                             │
                              ┌─────────────────┐                    │
                              │   docs/ai/      │◄───────────────────┘
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

### Automatic (via hooks)

| Hook | Trigger | What it does |
|---|---|---|
| `session-skill-health-check.sh` | First `Read` call per session | Reminds you to run `/skill-health` if last run was >7 days ago |
| `post-learn-eval-consolidate.sh` | After any `learn-eval` skill | Reminds you to run `/consolidate-learnings` |

ECC plugin hooks (when installed) additionally:
- Capture tool use observations for pattern extraction (async, every tool call)
- Evaluate sessions for extractable patterns on session end (async)
- Track token/cost metrics per session (async)

### Manual (you invoke these)

| Command | When to run | What it does |
|---|---|---|
| `/everything-claude-code:learn-eval` | End of a meaningful session | Extracts reusable patterns from the session into `~/.claude/skills/learned/` |
| `/consolidate-learnings` | After learn-eval, or weekly | Merges orphaned learned patterns into parent skill gotchas/references |
| `/retro <initiative>` | After completing all slices | Extracts initiative-level metrics, patterns, and learnings |
| `/skill-health` | Monthly, or after adding/modifying skills | Scores all skills against 8 structural criteria |
| `/skill-improve <skill>` | After skill-health identifies gaps | Eval-driven improvement cycle for one specific skill |

### The full loop

```
Work happens (execution-loop runs slices)
    │
    ├─ ECC hooks silently capture observations (automatic)
    │
    ▼
End of session
    │
    ├─ Run /everything-claude-code:learn-eval (manual)
    │   └─ Extracts patterns → ~/.claude/skills/learned/
    │
    ├─ Hook fires → reminds you to consolidate (automatic)
    │
    ├─ Run /consolidate-learnings (manual, but prompted)
    │   └─ Merges patterns into parent skill gotchas
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
    ├─ Hook fires → reminds you if /skill-health is overdue (automatic)
    │
    ├─ Run /skill-health (manual, but prompted)
    │   └─ Scores skills → recommends improvements
    │
    └─ Run /skill-improve <skill> (manual)
        └─ Targeted improvement for one skill
```

### Activating hooks

The installer links hook scripts to `~/.claude/hooks/` but does **not** modify your `settings.json`. To activate them, merge these entries into your `~/.claude/settings.json` under the `hooks` key:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Read",
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/.claude/hooks/session-skill-health-check.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Skill",
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/.claude/hooks/post-learn-eval-consolidate.sh"
          }
        ]
      }
    ]
  }
}
```

If you already have entries in these arrays (e.g., from ECC plugin), add these alongside the existing ones — don't replace them.

## Prerequisites

- [Claude Code](https://claude.ai/code)

## Installation

### Linux / macOS / WSL

```bash
git clone https://github.com/YOUR_USERNAME/claude-code-bootstrap-commands ~/claude-bootstrap
cd ~/claude-bootstrap && ./install.sh
```

### Windows (PowerShell 7+, Developer Mode or Admin)

```powershell
git clone https://github.com/YOUR_USERNAME/claude-code-bootstrap-commands C:\claude-bootstrap
cd C:\claude-bootstrap; .\install.ps1
```

Both installers create symlinks from `~/.claude/` into this repo. `git pull` picks up updates — no re-install needed.

### Codex variant

```bash
./install-codex.sh    # or .\install-codex.ps1 on Windows
```

See [codex/README.md](codex/README.md) for Codex-specific details.

### Both CLIs

```bash
./install-all.sh      # or .\install-all.ps1
```

## What Gets Installed

**Commands:** `/quick-change`, `/bootstrap-existing`, `/bootstrap-new`, `/continue-work`, `/consolidate-learnings`, `/skill-health`, `/skill-improve`, `/retro`

**Skills:** `workflow-existing-repo`, `workflow-new-repo`, `execution-loop`, `brainstorm-design`, `systematic-debugging` (each a folder with templates, gotchas, and/or scripts)

**Agents:** `architecture-discovery`, `stack-advisor`

What it **never** touches: your `CLAUDE.md`, `rules/`, custom skills, plugin configs, or any file it didn't install. Conflicts are skipped with a warning — use `--force` to override.

**Hooks:** The installer links hook scripts to `~/.claude/hooks/`. See [Activating hooks](#activating-hooks) above to wire them into your `settings.json`.

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
