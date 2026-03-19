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

### Self-Improvement Commands

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

## License

MIT
