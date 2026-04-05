---
description: "Show learned instincts (project + global) with confidence scores and metadata."
---

**Scope:** $ARGUMENTS

Your first output line must be:
```
Loading instincts...
```

## Procedure

### 1. Detect Project

```bash
git remote get-url origin 2>/dev/null || echo "no-remote"
```

Derive the project hash (first 12 hex chars of SHA-256 of the URL or cwd).

### 2. Locate Instinct Directories

- **Project instincts:** `~/.claude/arc/projects/<hash>/instincts/`
- **Global instincts:** `~/.claude/arc/instincts/global/`

If neither directory exists, report: "No instincts found. The learning system creates instincts automatically after sessions with 20+ tool calls."

### 3. Read All Instinct Files

For each `.yaml` file in both directories, extract from the YAML frontmatter:
- `id`
- `trigger`
- `confidence`
- `domain`
- `scope` (project or global)
- `last_seen`
- `observations` (count)

### 4. Display

Sort by confidence descending. Output as a structured table:

```
INSTINCT STATUS
===============
Project: <project-name> (<hash>)

Project Instincts (<count>):
| Confidence | Domain    | Trigger                          | Observations | Last Seen  |
|------------|-----------|----------------------------------|-------------|------------|
| 0.7        | debugging | When Bash fails with permission   | 4           | 2026-04-05 |
| 0.3        | tooling   | When working with Edit operations | 1           | 2026-04-05 |

Global Instincts (<count>):
| Confidence | Domain    | Trigger                          | Observations | Last Seen  |
|------------|-----------|----------------------------------|-------------|------------|
| 0.9        | git       | Always use specific file paths    | 12          | 2026-04-04 |

Summary:
- Project instincts: <count> (avg confidence: <X.X>)
- Global instincts: <count> (avg confidence: <X.X>)
- Ready to promote (confidence >= 0.8): <count>
- Stale (>30 days, confidence < 0.5): <count>
```

If `$ARGUMENTS` contains "project" — show project instincts only.
If `$ARGUMENTS` contains "global" — show global instincts only.
Otherwise show both.

## Rules

- Read-only — do not modify any instinct files
- If an instinct file has invalid YAML, skip it and note "1 unreadable instinct skipped"
