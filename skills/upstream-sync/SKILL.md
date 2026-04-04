---
name: upstream-sync
description: "Check tracked upstream repos for relevant changes and propose sync actions. Use when running /upstream command."
---

## Skill Contents

- `prompts/upstream-inspection-prompt.md` — subagent prompt template for deep change inspection

## Purpose

Compare tracked upstream repositories against their last-checked state, identify changes relevant to arc, and propose sync actions.

> **Platform:** This skill works on Claude Code and Codex. See `references/platform-map.md` for tool mapping.

## Process

### Step 1: Load tracking manifest

Read `manifests/upstream-tracking.json`. This contains:
- Tracked repos with local paths
- Watch paths (files/directories we care about)
- Ignore paths (files/directories to skip)
- Last checked SHA per repo

### Step 2: Fetch and diff each repo

For each tracked repo:

**First-run detection:** If `last_checked_sha` is `"HEAD"` (initial value), this is the first sync. Instead of `git log HEAD..HEAD` (which returns nothing), use `git log --oneline -20` to show recent history and let the user establish a baseline. After the user reviews, set `last_checked_sha` to the current `HEAD` SHA.

```bash
cd <repo_path>
git fetch origin
git log <last_checked_sha>..HEAD --oneline -- <watch_paths>
```

**Error handling:** Process each repo independently.
- If the local path does not exist: report "Repo <name> not found at <path> — skip" and continue
- If `git fetch` fails (network error): report the error and continue with local state
- If `last_checked_sha` is invalid: treat as first-run (use `git log --oneline -20`)
- Expand `~` in paths to the full home directory before using them

Include failed repos in the final report with the error reason.

If no new commits in watched paths, report "No relevant changes" and skip.

### Step 3: Deep inspection

For repos with changes, spawn a sub-agent per repo (Sonnet by default; escalate to Opus for architecturally complex changes). Use the prompt template at `prompts/upstream-inspection-prompt.md`. Fill in the template variables with the repo name, type, path, commit log, and changed files from Step 2.

Each sub-agent will:
1. Read the changed files
2. Summarize what changed and why (commit messages + code)
3. Categorize relevance based on the manifest's `watch_paths` and `ignore_paths` for each repo. Changes matching `watch_paths` are HIGH or MEDIUM. Changes matching `ignore_paths` are LOW. Changes to other paths require judgment based on the repo type.

### Step 4: Present recommendations

Output a structured report:

```
## Upstream Sync Report — <date>

### superpowers (v<current> → v<new>)
- [HIGH] brainstorming skill updated: <summary>
- [INFO] Version bump only

### everything-claude-code (absorbed at v2.0.0)
- [HIGH] cpp-reviewer.md updated: <summary> → consider updating agents/cpp-reviewer.md
- [MEDIUM] New csharp-testing skill: <summary> → could adapt for our csharp-reviewer
- [LOW] New laravel-tdd skill: skip (not in our stack)

### hermes-agent
- [MEDIUM] Memory system refactored: <summary> → review for learning system improvements
```

### Step 5: User decides

Present the report and wait for user input. The user decides:
- Which HIGH items to sync immediately
- Which MEDIUM items to investigate later
- Acknowledge LOW/INFO items

### Step 6: Update manifest

After user review, update `last_checked_sha` in `manifests/upstream-tracking.json` to the current HEAD of each checked repo.

## Important

- This skill is token-heavy by design (spawns sub-agents for deep inspection)
- Only run when the user explicitly invokes `/upstream`
- Never run automatically or suggest running automatically
