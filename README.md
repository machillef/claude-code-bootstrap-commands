# claude-code-bootstrap-commands

Disciplined workflows for Claude Code. All project state lives in `docs/ai/` files — not chat memory, not a bloated CLAUDE.md.

## Core Principles

- **Plan before code** — stress-test every decision branch, enumerate user stories, approve requirements before designing solutions
- **One slice at a time** — narrow, reversible, verified changes with TDD
- **docs/ai/ is the source of truth** — survives across sessions, readable by fresh agents
- **Self-improving** — gotchas accumulate, retros extract learnings, skills evolve

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
│ • TDD      │ │ • Detect   │ │ • Stress-  │ │ • Pick slice │ │ • Merge back to branch    │
│ • Self-    │ │ • Map scope│ │   test     │ │ • TDD        │ │ • Clean up worktree       │
│   review   │ │ • Stress-  │ │ • User     │ │ • Implement  │ │ • Restore paused slice    │
│ • Log      │ │   test     │ │   stories  │ │ • Verify     │ │ • Log in status.md        │
│            │ │ • User     │ │ • stack-   │ │ • Re-assess  │ │                           │
│            │ │   stories  │ │   advisor  │ │ • Update docs│ │ Modes: small (inline)     │
│            │ │ • Design   │ │ • Scaffold │ │ • Learn      │ │         big (mini-plan)   │
│            │ │ • docs/ai  │ │ • docs/ai  │ │ • STOP       │ │                           │
│            │ │ • STOP     │ │ • STOP     │ │              │ │                           │
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
                    │ • design.md     │
                    │ • decisions.md  │
                    │ • scope-map.md  │
                    │ • ...           │
                    └─────────────────┘
```

## Commands

| Command | What it does |
|---|---|
| `/bootstrap-new <name>` | Greenfield project — requirements, design, stack decision, scaffold, docs/ai/ |
| `/bootstrap-existing <name>` | Existing repo — triage, detect stack, stress-test requirements, user stories, design, slices |
| `/continue-work <name>` | Pick next slice, TDD, verify, update docs. Add a constraint: `/continue-work foo focus on auth` |
| `/quick-change <desc>` | Small change (1-3 files) following existing patterns. Escalates if scope grows. |
| `/fix-bugs <name> — <desc>` | Fix bugs found after a slice passed verification. Systematic debugging + TDD. |
| `/detour <name> <desc>` | Temporary diversion in an isolated git worktree. Also: `finish`, `continue` |
| `/ubiquitous-language` | Extract DDD-style domain glossary from conversation → `UBIQUITOUS_LANGUAGE.md` |
| `/retro <name>` | Post-initiative retrospective — metrics, learnings, gotchas |
| `/skill-health` | Audit installed skills against 8 structural criteria |
| `/skill-improve <skill>` | Iteratively improve one skill using eval-driven feedback |
| `/consolidate-learnings` | Merge orphaned learned patterns into parent skill gotchas |

## Typical Flows

**Feature in an existing repo:**
```
/bootstrap-existing add-batch-rename     → creates docs/ai/, defines slices
/ubiquitous-language                     → formalize domain terms (if any emerged)
/continue-work add-batch-rename          → implements slice 1
/continue-work add-batch-rename          → implements slice 2 (repeat)
/fix-bugs add-batch-rename — rename fails on network paths
/retro add-batch-rename                  → extract metrics + learnings
```

**Greenfield project:**
```
/bootstrap-new file-explorer             → requirements, stack, scaffold, docs/ai/
/ubiquitous-language                     → formalize domain terms (if any emerged)
/continue-work file-explorer             → slice by slice until done
```

**Quick one-off:**
```
/quick-change add dark mode toggle to settings panel
```

**Mid-initiative detour:**
```
/detour file-explorer improve click performance    → isolated worktree
/detour file-explorer finish                       → merge back, restore slice
```

## Installation

### As a plugin (recommended)

```
/plugin marketplace add machillef/claude-code-bootstrap-commands
/plugin install bootstrap-commands@claude-code-bootstrap-commands --scope user
```

Updates are automatic when the repo is pushed to GitHub.

### From source (symlink-based)

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

Both create symlinks from `~/.claude/` into this repo. `git pull` picks up updates.

> Symlink installs require manual hook wiring. See `hooks/hooks.json` for definitions.

### Codex variant

Codex doesn't use the Claude Code plugin system. Clone + run the installer:

```bash
# Linux / macOS / WSL
git clone https://github.com/machillef/claude-code-bootstrap-commands ~/claude-bootstrap
cd ~/claude-bootstrap && ./install-codex.sh

# Windows (PowerShell 7+)
git clone https://github.com/machillef/claude-code-bootstrap-commands C:\claude-bootstrap
cd C:\claude-bootstrap; .\install-codex.ps1
```

**What it does:** Symlinks skills into `~/.codex/skills/`, merges a managed block into `~/.codex/AGENTS.md`, links a reference bundle.

**What it never touches:** Your `config.toml`, content outside `<!-- BEGIN/END -->` markers, or files it didn't install.

**Updating:** `git pull` picks up skill changes. Re-run the installer if the AGENTS.md block changed.

**Invoking skills:**
```
$codex-continue-work migrate-to-react
$codex-fix-bugs migrate-to-react — sidebar doesn't scroll
$codex-ubiquitous-language
```

**Cross-tool compatibility:** Add to `~/.codex/config.toml`:
```toml
project_doc_fallback_filenames = ["CLAUDE.md"]
```

See [codex/README.md](codex/README.md) for details.

### Both CLIs

```bash
./install-all.sh      # or .\install-all.ps1
```

## What Gets Installed

**Commands (11):** `/quick-change`, `/bootstrap-existing`, `/bootstrap-new`, `/continue-work`, `/fix-bugs`, `/detour`, `/ubiquitous-language`, `/consolidate-learnings`, `/skill-health`, `/skill-improve`, `/retro`

**Skills (6):** `workflow-existing-repo`, `workflow-new-repo`, `execution-loop`, `brainstorm-design`, `systematic-debugging`, `ubiquitous-language`

**Agents (2):** `architecture-discovery`, `stack-advisor`

**Hooks (6):** Session-start reminders (skill health, detour check, stale docs), post-tool suggestions, session-end nudges. Auto-loaded as a plugin; symlink installs need manual wiring.

Never touches your `CLAUDE.md`, `rules/`, custom skills, or plugin configs. Conflicts are skipped with a warning — use `--force` to override.

## Recommended Plugins

Orchestration layer — delegates to plugin agents when available, falls back to direct implementation when not.

```
claude plugin add everything-claude-code --scope user
claude plugin add superpowers --scope user
```

| Plugin | What this workflow uses |
|---|---|
| **everything-claude-code** | Language reviewers, build resolvers, security-reviewer, tdd-guide, learn-eval, session management |
| **superpowers** | Verification-before-completion, code-review skill, subagent-driven development, writing-skills |

Skills are lazy-loaded (no context bloat), commands are namespaced (no clashes), and bootstrap commands always take precedence as entry points. Without plugins, everything still works — you just lose the specialized reviewers.

## Learning Lifecycle

```
Session starts
    │
    ├─ Hook: active detour? remind to continue/finish
    ├─ Hook: stale docs/ai/? remind to update
    ├─ Hook: /skill-health overdue? remind to run
    │
    ▼
Work happens (execution-loop runs slices)
    │
    ▼
End of session
    │
    ├─ Hook: suggest /everything-claude-code:learn-eval
    ├─ Run learn-eval → extracts patterns → ~/.claude/skills/learned/
    ├─ Hook: remind to /consolidate-learnings
    ├─ Run /consolidate-learnings → merges into parent skill gotchas
    │
    ▼
End of initiative (all slices complete)
    │
    ├─ Run /retro <initiative> → metrics + learnings + archive docs
    │
    ▼
Periodic maintenance
    │
    ├─ /skill-health → scores skills → recommends improvements
    └─ /skill-improve <skill> → targeted improvement
```

## Knowledge Handling

LLMs discover codebase structure, tech stack, and function behavior on their own — don't duplicate that in documentation files. The `docs/ai/` system stores only what agents **cannot discover from code**: current slice progress, the plan, decisions and their rationale, what's been verified, what's blocked.

**Initiative lifecycle:**
```
Bootstrap → Active → Complete → Archived (via /retro)
```

- **Extending a completed initiative:** `/continue-work foo add loading states` — adds new slices without re-bootstrapping
- **Archiving:** `/retro` moves completed initiative files to `docs/ai/archive/` (only if all slices are done). Stale-docs hooks ignore archived files.
- **Long-running projects:** archives grow slowly (few KB per initiative). Pruning is a human decision — everything is in git history.

See `docs/ai/README.md` for the full file set and lifecycle details.

## License

MIT
