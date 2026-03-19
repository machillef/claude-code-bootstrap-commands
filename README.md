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
/skill-evolve [skill]       Full audit+improve cycle (all skills or target one)
        │                   Uses parallel sub-agents for batch audits
        │                   Scores against Thariq + Karpathy patterns
        │                   Persists pending improvements across runs
        │
        ├── /skill-health           Score structure (8 criteria)
        ├── /skill-improve <skill>  Single-skill improvement cycle
        ├── /consolidate-learnings  Merge learned skills → parent gotchas
        └── /retro <initiative>     Post-initiative metrics + learnings
```

**Automated triggers** (via hooks — see `.claude/hooks/README.md`):
- `/skill-health` reminder fires on session start if last run was >7 days ago
- `/consolidate-learnings` reminder fires after every `/everything-claude-code:learn-eval`
- `/retro` suggested by execution-loop when all slices complete (End of Plan)
- `/skill-evolve` carries forward pending improvements across invocations (self-learning)

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

**Commands:** `/quick-change`, `/bootstrap-existing`, `/bootstrap-new`, `/continue-work`, `/consolidate-learnings`, `/skill-health`, `/skill-improve`, `/skill-evolve`, `/retro`

**Skills:** `workflow-existing-repo`, `workflow-new-repo`, `execution-loop`, `brainstorm-design`, `systematic-debugging`, `skill-evolve` (each a folder with templates, gotchas, references, and/or scripts)

**Agents:** `architecture-discovery`, `stack-advisor`

What it **never** touches: your `CLAUDE.md`, `rules/`, custom skills, plugin configs, or any file it didn't install. Conflicts are skipped with a warning — use `--force` to override.

**Hooks:** The installer links hook scripts to `~/.claude/hooks/`. To activate them, add the entries from `.claude/hooks/README.md` to your `~/.claude/settings.json`.

## Self-Improvement Examples

### `/skill-evolve code-review` (single skill)

Deep audit of one skill with improvement proposals:

```
## Audit: code-review

Location: ~/.claude/skills/code-review/
Category: Code Quality & Review
Structural score: 5/8

| Criterion | Status |
|---|---|
| SKILL.md exists | pass |
| Description ≤ 25 words | fail (52 words) |
| Trigger-focused description | pass |
| Folder structure | pass |
| Templates/references | pass (references/security-checklist.md) |
| Gotchas section | fail |
| Scripts/code | fail |
| Progressive disclosure | fail (.NET patterns inline, not in references/) |

Top Improvements:
1. Extract inline .NET patterns → references/dotnet-patterns.md — Impact: High
2. Add gotchas/ with common false positives from real reviews — Impact: High
3. Trim description from 52 → 22 words — Impact: Medium
```

### `/skill-evolve` (all skills)

Parallel audit of all installed skills, dispatches sub-agents:

```
## Skill Evolution Plan — 2026-03-19

Skills Audited: 12
Average Score: 5.3/8

| # | Skill | Improvement | Impact | Score Change |
|---|---|---|---|---|
| 1 | code-review | Add gotchas/ from learned skills | High | 5/8 → 7/8 |
| 2 | session-handoff | Convert to folder-as-skill with template | High | 3/8 → 6/8 |
| 3 | ux-craft | Consolidate Tailwind gotchas from learned/ | Medium | 7/8 → 8/8 |
| 4 | portal-qa | Add version stamp to route-map.md | Medium | 6/8 → 6/8 |

Deferred (for next run):
- git-commit-craft: description is 50+ words but low impact to fix now
- fluentui-blazor-ref: no gotchas yet, but low usage — wait for failures

Pending from previous run (2 items resolved, 1 carried forward):
- [RESOLVED] execution-loop: inline templates → extracted in last PR
- [RESOLVED] quick-change: missing gotchas → added in last PR
- [CARRIED] portal-ui: straddles two categories — needs split decision
```

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
