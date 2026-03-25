# claude-code-bootstrap-commands

Disciplined workflows for Claude Code (and Codex). All project state lives in `docs/ai/` files — not chat memory, not a bloated CLAUDE.md.

## Quick Start

```
/bootstrap-existing my-feature           # plan the work → creates docs/ai/
/loop-work my-feature --passes 2         # do ALL the work + review
/retro my-feature                        # extract learnings + archive
```

That's it. Three commands cover 90% of use cases. Everything below is for when you need more control.

## Which Command Do I Use?

```
What are you trying to do?
│
├─ Start new work
│   ├─ Small change (1-3 files, follows existing pattern)
│   │   └─► /quick-change <description>
│   │
│   ├─ Feature/change in an existing repo
│   │   └─► /bootstrap-existing <initiative-name>
│   │
│   └─ Brand new project (no code yet)
│       └─► /bootstrap-new <project-name>
│
├─ Continue existing work
│   ├─ One slice at a time (careful, session-by-session)
│   │   └─► /continue-work <initiative>
│   │
│   ├─ All remaining slices in one session
│   │   └─► /loop-work <initiative> [--passes N] [--converge]
│   │
│   └─ Fix bugs found after testing
│       └─► /fix-bugs <initiative> — <bug description>
│
├─ Review code
│   ├─ Review initiative changes
│   │   └─► /review-loop <initiative> --passes 3
│   │
│   ├─ Review with convergence (re-verify fixes)
│   │   └─► /review-loop <initiative> --passes 3 --converge
│   │
│   └─ Review recent ad-hoc changes (no initiative)
│       └─► /review-loop --passes 2
│
├─ Do something outside the current plan
│   └─► /detour <initiative> <description>
│
└─ Reflect and improve
    ├─ After initiative completes
    │   └─► /retro <initiative>
    ├─ Audit skill quality
    │   └─► /skill-health
    └─ Improve a specific skill
        └─► /skill-improve <skill-name>
```

## Commands Reference

### Planning & Bootstrap

| Command | Description | Example |
|---|---|---|
| `/bootstrap-existing <name>` | Triage, detect stack, stress-test requirements, user stories, design, define slices. Does NOT implement. | `/bootstrap-existing add-auth` |
| `/bootstrap-new <name>` | Greenfield: gather requirements, decide stack, scaffold, create docs/ai/. Does NOT implement. | `/bootstrap-new todo-app` |

Both invoke `brainstorm-design` automatically — includes visual companion for UI/UX mockups, optional evaluation criteria for subjective quality scoring.

### Execution

| Command | Description | Example |
|---|---|---|
| `/continue-work <name> [constraint]` | Pick next slice, TDD, verify, update docs. One slice per invocation. | `/continue-work add-auth focus on JWT` |
| `/loop-work <name> [flags]` | Chain all remaining slices. Accumulates QA checklist. | `/loop-work add-auth --passes 2` |
| `/quick-change <desc>` | Small change (1-3 files). Escalates if scope grows. | `/quick-change fix typo in header` |
| `/detour <name> <desc>` | Temporary diversion in isolated git worktree. | `/detour add-auth fix CI pipeline` |

**`/loop-work` flags:**
- `--passes N` — review passes after all slices complete (default: 0)
- `--max-slices N` — safety limit on slices to process
- `--converge` — passed to review-loop: re-verify fixes with fresh reviewers

### Review

| Command | Description | Example |
|---|---|---|
| `/review-loop [<name>] [flags]` | Multi-pass code review. Each pass = fresh subagent (never wrote the code). | `/review-loop add-auth --passes 3` |
| `/fix-bugs <name> — <desc>` | Fix post-verification bugs. Systematic debugging + TDD. | `/fix-bugs add-auth — login fails on Safari` |

**`/review-loop` flags:**
- `--passes N` — number of review passes (default: 2)
- `--converge` — after fixing issues, re-dispatch a fresh reviewer to verify the fix. Loop until APPROVED or max 3 iterations per pass.

**Pass types (sequential — `--passes 4` runs all four):**

| Pass | Focus | What it does |
|---|---|---|
| 1 | Code Quality | Dead code, redundant checks, test quality, patterns, naming, DRY |
| 2 | Spec Compliance | Matches design doc, all user stories covered, no scope creep |
| 3 | Risk + Security | Error paths, concurrency, contracts, security surface |
| 4 | Interactive QA | Starts the app, interacts as a user would, files bugs against broken behavior |

Pass 4 requires QA Commands in scope-map.md (auto-created by `/bootstrap-existing`).

### Reflection & Learning

| Command | Description | Example |
|---|---|---|
| `/retro <name>` | Metrics, learnings, harness audit, archive initiative. | `/retro add-auth` |
| `/consolidate-learnings` | Merge orphaned learned patterns into parent skill gotchas. | `/consolidate-learnings` |
| `/ubiquitous-language` | Extract DDD-style domain glossary from conversation. | `/ubiquitous-language` |
| `/skill-health` | Audit installed skills against 8 structural criteria. | `/skill-health` |
| `/skill-improve <skill>` | Iteratively improve one skill using eval-driven feedback. | `/skill-improve review-loop` |

## Examples

### Existing repo — one slice at a time
```
/bootstrap-existing add-batch-rename     # brainstorm-design runs → creates docs/ai/
/continue-work add-batch-rename          # implements slice 1, stops
/continue-work add-batch-rename          # implements slice 2, stops
/fix-bugs add-batch-rename — rename fails on network paths
/retro add-batch-rename                  # metrics + harness audit + archive
```

### Existing repo — accelerated loop with review
```
/bootstrap-existing add-batch-rename     # brainstorm-design runs → creates docs/ai/
/loop-work add-batch-rename --passes 2   # chains ALL slices + 2 review passes at end
                                         # auto: harness check every 5 slices
                                         # auto: presents consolidated QA checklist
/fix-bugs add-batch-rename — rename fails on network paths
/retro add-batch-rename                  # metrics + harness audit + archive
```

### High-stakes feature with convergence and Interactive QA
```
/bootstrap-existing redesign-dashboard   # brainstorm-design offers eval-criteria
                                         #   (detects UI/UX quality dimensions)
/loop-work redesign-dashboard --passes 4 --converge
    # Pass 1: Code Quality → fix → re-verify (converge)
    # Pass 2: Spec Compliance → fix → re-verify (converge)
    # Pass 3: Risk + Security → fix → re-verify (converge)
    # Pass 4: Interactive QA → starts app, clicks through UI, files bugs
    # auto: harness check at slice 5, 10, 15...
    # auto: scored evaluation if eval-criteria.md exists
```

### Greenfield project
```
/bootstrap-new file-explorer             # requirements → stack decision → scaffold
/loop-work file-explorer --passes 1      # chain all slices + 1 review pass
/retro file-explorer                     # metrics + learnings + archive
```

### Quick one-off
```
/quick-change add dark mode toggle to settings panel
/review-loop --passes 1                  # review the changes (no initiative needed)
```

### Ad-hoc review of recent work
```
(make changes directly, no initiative)
/review-loop --passes 2                  # reviews git diff, 2 passes
/review-loop --passes 3 --converge      # 3 passes, re-verifies every fix
```

### Mid-initiative detour
```
/detour file-explorer fix CI pipeline    # pauses current slice, creates worktree
/detour file-explorer finish             # merges back, restores paused slice
```

### Extend a completed initiative
```
/continue-work add-auth add rate limiting
    # detects all slices complete → enters Extend Mode
    # proposes new slices, appends to existing docs/ai/
    # no re-bootstrap needed
```

## What Happens Automatically

You don't need to remember these — they fire on their own.

### During every session (hooks)

| When | What | Why |
|---|---|---|
| Session starts | Checks for active detour worktrees | Reminds you to finish or continue |
| Session starts | Checks for stale docs/ai/ files | Warns if status.md is >3 days old with recent commits |
| Session starts | Checks for completed initiatives without retro | Reminds you to run `/retro` |
| Session starts | Checks skill-health freshness | Reminds if last audit was >7 days ago |

| Session ends | Suggests `learn-eval` | If session had 2+ commits, suggests extracting patterns |
| Session ends | Reminds about active detours | Don't forget your worktrees |
| After `learn-eval` runs | Suggests `/consolidate-learnings` | Merge new learnings into parent skills |

### During loop-work

| When | What | Why |
|---|---|---|
| Every 5 slices | Lightweight harness check | Reports which execution-loop steps were no-op or consistently load-bearing. Informational — loop continues automatically. Interrupt to adjust. |

### During review-loop

| When | What | Why |
|---|---|---|
| `eval-criteria.md` exists | Switches to scored mode | Criteria scored 1-5 with hard fail thresholds |
| QA Commands in scope-map + user-facing slice | Auto-escalates to Pass 4 | Only when `--passes` wasn't explicitly set |

### During retro

| When | What | Why |
|---|---|---|
| Always | Harness audit via ECC `harness-optimizer` | Evaluates which execution-loop steps were load-bearing vs overhead. Skips silently if ECC not installed. |
| Always | Runs `/consolidate-learnings` | Merges orphaned learnings into parent skills |
| All slices complete | Archives initiative to `docs/ai/archive/` | Keeps active docs/ai/ clean |

### During brainstorm-design (inside bootstrap)

| When | What | Why |
|---|---|---|
| UI/UX or subjective quality detected | Offers visual companion (browser mockups) | Show layouts, comparisons, wireframes in a local browser |
| Subjective quality dimensions detected | Offers to create eval-criteria.md | Enables scored review mode with weighted criteria |

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

**Invoking skills:**
```
$codex-continue-work migrate-to-react
$codex-fix-bugs migrate-to-react — sidebar doesn't scroll
$codex-ubiquitous-language
```

See [codex/README.md](codex/README.md) for details.

### Both CLIs

```bash
./install-all.sh      # or .\install-all.ps1
```

## What Gets Installed

**Commands (13):** `/quick-change`, `/bootstrap-existing`, `/bootstrap-new`, `/continue-work`, `/loop-work`, `/review-loop`, `/fix-bugs`, `/detour`, `/ubiquitous-language`, `/consolidate-learnings`, `/skill-health`, `/skill-improve`, `/retro`

**Skills (7):** `workflow-existing-repo`, `workflow-new-repo`, `execution-loop`, `review-loop`, `brainstorm-design`, `systematic-debugging`, `ubiquitous-language`

**Agents (2):** `architecture-discovery` (deep codebase analysis for large changes), `stack-advisor` (tech stack recommendation for greenfield)

**Hooks ([see hooks.json](hooks/hooks.json)):** Session-start reminders (skill health, detour check, stale docs, retro reminder), post-tool suggestions, session-end nudges. Auto-loaded as a plugin; symlink installs need manual wiring.

Never touches your `CLAUDE.md`, `rules/`, custom skills, or plugin configs.

## Recommended Plugins

Bootstrap-commands orchestrates — it delegates to plugin agents when available, falls back to direct implementation when not.

```
claude plugin add everything-claude-code --scope user
claude plugin add superpowers --scope user
```

| Plugin | What bootstrap-commands uses from it |
|---|---|
| **everything-claude-code** | Language reviewers (`go-reviewer`, `python-reviewer`, etc.), build resolvers, `security-reviewer`, `tdd-guide`, `learn-eval`, `harness-optimizer` (auto-invoked by `/retro`), session management |
| **superpowers** | Verification-before-completion, code-review, subagent-driven development, writing-skills |

Without plugins, everything still works — you just lose specialized reviewers and the harness audit.

## docs/ai/ — The State Model

LLMs discover codebase structure on their own — `docs/ai/` stores only what agents **cannot discover from code**: progress, plans, decisions, what's verified, what's blocked.

| File | Purpose | Created by |
|---|---|---|
| `*-status.md` | Slice progress, what's done, what's blocked | Bootstrap, updated every slice |
| `*-slices.md` | Execution units with goals, tests, done-when | Bootstrap |
| `*-design.md` | Validated design doc (requirements + architecture) | brainstorm-design |
| `*-decisions.md` | Decision log with rationale | Bootstrap, updated as needed |
| `*-scope-map.md` | In/out of scope, verification + QA commands | Bootstrap (existing-repo) |
| `*-eval-criteria.md` | Scoring criteria for review-loop (optional) | brainstorm-design (if offered) |
| `*-plan.md` | Phases, assumptions, rollback posture | Bootstrap (medium/large) |
| `quick-changes-log.md` | Append-only log for `/quick-change` | `/quick-change` |
| `retro-log.md` | Retro results across initiatives | `/retro` |

**Lifecycle:** Bootstrap → Active → Complete → Archived (via `/retro`)

**Extending:** `/continue-work foo add loading states` — adds new slices without re-bootstrapping.

See `docs/ai/README.md` for the full file set and scaling rules.

## Learning Lifecycle

```
Session starts
    │ auto: hooks check for stale docs, detours, overdue retros, skill health
    ▼
Work happens
    │ execution-loop: Load → TDD → Verify → Re-assess → Update docs
    │ auto: harness check every 5 slices (in loop-work)
    │ auto: scored evaluation (if eval-criteria.md exists)
    ▼
Session ends
    │ auto: hook suggests learn-eval (if 2+ commits)
    │ learn-eval → extracts patterns → ~/.claude/skills/learned/
    │ auto: hook suggests /consolidate-learnings
    ▼
Initiative complete
    │ /retro → metrics + harness audit + archive
    │ auto: /consolidate-learnings merges into parent skills
    │ auto: harness-optimizer evaluates which steps were load-bearing
    ▼
Periodic
    │ /skill-health → audit all skills
    └─ /skill-improve <skill> → iterative improvement
```

## License

MIT
