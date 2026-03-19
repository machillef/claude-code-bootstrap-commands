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
│                 │ │ • Wire ECC       │ │ • Create docs/ai │ │ • Re-assess  │
│                 │ │ • First slice    │ │ • Wire ECC       │ │ • Update docs│
│                 │ │ • STOP           │ │ • STOP           │ │ • Learn      │
│                 │ │                  │ │                  │ │ • STOP       │
│                 │ │  agents:         │ │  agents:         │ │              │
│                 │ │  architecture-   │ │  stack-advisor   │ │  delegates:  │
│                 │ │  discovery       │ │                  │ │  ECC agents  │
│                 │ │  (large only)    │ │                  │ │(if installed)│
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

### Self-Improvement Loop

```
/retro <initiative>         Extract metrics + learnings from completed work
        │
        ▼
/consolidate-learnings      Merge orphaned learned skills into parent skill gotchas
        │
        ▼
/skill-health               Score all skills against 8 structural criteria
        │
        ▼
/skill-improve <skill>      Eval-driven improvement cycle for one skill
```

**Automated triggers** (via hooks — see `.claude/hooks/README.md`):
- `/skill-health` reminder fires on session start if last run was >7 days ago
- `/consolidate-learnings` reminder fires after every `/everything-claude-code:learn-eval`
- `/retro` auto-invoked by the execution-loop when all slices complete (End of Plan)

## Prerequisites

- [Claude Code](https://claude.ai/code)
- [everything-claude-code](https://github.com/affaan-m/everything-claude-code) plugin (recommended — the workflow delegates to ECC agents when installed)

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

### Installing ECC

```
/plugin add everything-claude-code --scope user
```

## What Gets Installed

**Commands:** `/quick-change`, `/bootstrap-existing`, `/bootstrap-new`, `/continue-work`, `/consolidate-learnings`, `/skill-health`, `/skill-improve`, `/retro`

**Skills:** `workflow-existing-repo`, `workflow-new-repo`, `execution-loop`, `brainstorm-design`, `systematic-debugging` (each a folder with templates, gotchas, and/or scripts)

**Agents:** `architecture-discovery`, `stack-advisor`

What it **never** touches: your `CLAUDE.md`, `rules/`, custom skills, plugin configs, or any file it didn't install. Conflicts are skipped with a warning — use `--force` to override.

**Hooks:** The installer links hook scripts to `~/.claude/hooks/`. To activate them, add the entries from `.claude/hooks/README.md` to your `~/.claude/settings.json`.

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
