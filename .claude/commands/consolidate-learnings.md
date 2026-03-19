---
description: Consolidate orphaned learned skills into parent skill gotchas/references. Closes the learning loop between learn-eval and skill improvement.
---

# Consolidate Learnings

Scan learned skills and merge them into their parent skills' `gotchas/` or `references/` directories.

## Why This Exists

`/everything-claude-code:learn-eval` extracts patterns into `~/.claude/skills/learned/` (global) or `.claude/skills/learned/` (project). These files are useful but orphaned — they don't get read when the parent skill is invoked. This command closes that loop.

## Procedure

### Step 1: Scan

Read all files in:
- `~/.claude/skills/learned/` (global learned skills)
- `.claude/skills/learned/` (project learned skills, if exists)

For each file, note its `name`, `description`, and content.

### Step 2: Classify

For each learned skill, determine the best parent:

| If the learned skill is about... | Parent skill | Target directory |
|---|---|---|
| Execution loop failure, step skipping, re-assessment | `execution-loop` | `gotchas/` |
| Code review pattern, security issue, review blind spot | `code-review` | `references/` |
| Debugging technique, root cause pattern | `systematic-debugging` | (add as supporting technique) |
| UI/CSS/Tailwind/dark mode issue | `ux-craft` | `references/` |
| Frontend parser, data contract issue | `code-review` | `references/` |
| Build/deployment/CI pattern | (no parent yet) | Leave in `learned/` |
| Portal-specific issue | `portal-qa` or `portal-ui` | `references/` |
| Standalone runbook (multi-step procedure) | (promote to own skill) | Flag for promotion |
| No clear parent | — | Leave in `learned/` |

### Step 3: Consolidate

For each classified learned skill:

1. **Create a gotcha/reference file** in the parent skill directory:
   - File name: kebab-case of the core topic (e.g., `tailwind-dynamic-classes.md`)
   - Content: distill the key rule, why it matters, and when it applies (keep it shorter than the learned skill — gotchas should be scannable)

2. **Mark the learned skill as consolidated** by adding to its frontmatter:
   ```yaml
   consolidated-into: <parent-skill>/<directory>/<filename>
   consolidated-date: <today>
   ```

3. **Do NOT delete the learned skill file** — it may be referenced by other systems or useful for full context.

### Step 4: Report

Output a structured report:

```
## Consolidation Report — <date>

### Consolidated
- <learned-skill-name> → <parent-skill>/gotchas/<filename>
- <learned-skill-name> → <parent-skill>/references/<filename>

### Flagged for Promotion
- <learned-skill-name> — reason: <why it should be its own skill>

### Left Orphaned
- <learned-skill-name> — reason: <no clear parent>

### Already Consolidated
- <learned-skill-name> — previously consolidated on <date>
```

## When to Run

- After `/everything-claude-code:learn-eval` (ideally as a follow-up in the same session)
- Periodically (weekly or after a burst of initiative work)
- When you notice `~/.claude/skills/learned/` has grown past 15-20 files
