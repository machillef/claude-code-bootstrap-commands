# Thariq's Skill Design Patterns

Distilled from "Lessons from Building Claude Code: How We Use Skills" (March 2026, Anthropic internal usage).

## The 9 Skill Categories

Every skill should fit cleanly into ONE category. Skills that straddle multiple categories are confusing.

1. **Library & API Reference** — how to use a library/CLI/SDK. Include snippets + gotchas.
2. **Product Verification** — test/verify code works. Pair with tools (Playwright, tmux). Include scripts for programmatic assertions.
3. **Data Fetching & Analysis** — connect to data/monitoring. Include credentials, dashboard IDs, common workflows.
4. **Business Process & Team Automation** — automate repetitive workflows into one command. Log previous results.
5. **Code Scaffolding & Templates** — generate boilerplate for codebase patterns. Useful when scaffolding has natural-language requirements.
6. **Code Quality & Review** — enforce quality; include deterministic scripts. Can run via hooks or CI.
7. **CI/CD & Deployment** — fetch, push, deploy. May reference other skills.
8. **Runbooks** — take a symptom, walk through investigation, produce structured report.
9. **Infrastructure Operations** — routine maintenance with guardrails for destructive actions.

## The 8 Structural Principles

### 1. Don't State the Obvious
Focus on info that pushes Claude OUT of its default behavior. Claude already knows coding — tell it what's unique to YOUR context.

### 2. Build a Gotchas Section
**Highest-signal content in any skill.** Accumulated from real failures. Update over time. If a skill has no gotchas after months of use, they're being lost in learned/ files instead.

### 3. Use the File System (Folder-as-Skill)
A skill is a folder, not just a markdown file. Include:
- `references/` — detailed docs Claude reads on demand
- `templates/` — files Claude copies instead of reconstructing
- `scripts/` — code Claude composes with
- `gotchas/` — failure patterns
- `assets/` — data, config files, examples

Tell Claude what files exist in the Skill Contents section — it will read them at appropriate times (progressive disclosure).

### 4. Avoid Railroading
Give information + flexibility. Overly rigid step-by-step checklists prevent Claude from adapting to the situation. State the goal and constraints, let Claude choose the approach.

### 5. Think Through Setup
Some skills need user config. Store in `config.json` in the skill directory. Use AskUserQuestion for structured prompts.

### 6. Description Field Is for Triggering
Not a summary — a WHEN-to-use description. Claude scans ALL descriptions at session start. Shorter + more specific = better trigger accuracy. Target ≤25 words.

### 7. Store Scripts & Code
Give Claude libraries and scripts so it spends turns on composition, not reconstruction. Example: helper functions in `scripts/` that Claude imports and calls.

### 8. Memory & State
Skills can store data (log files, JSON, SQLite). Use stable paths that survive upgrades. Log execution history so the skill improves over time.

## Distribution Rules

- Small teams: check into repo under `.claude/skills/`
- At scale: plugin marketplace with organic curation
- Composing: reference other skills by name; Claude invokes if installed
- Measuring: PreToolUse hook to log usage, find undertriggering
