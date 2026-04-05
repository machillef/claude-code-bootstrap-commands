---
description: "Delete stale low-confidence instincts older than 30 days."
---

**Scope:** $ARGUMENTS

Your first output line must be:
```
Scanning for stale instincts...
```

## Procedure

### 1. Load All Instincts

Read all `.yaml` files from:
- `~/.claude/arc/projects/<hash>/instincts/` (current project)
- `~/.claude/arc/instincts/global/`

### 2. Identify Stale Instincts

An instinct is stale when:
- `last_seen` is older than 30 days
- `confidence < 0.5`
- Not marked as `evolved_into` (evolved instincts are kept for reference)

### 3. Present Candidates

```
STALE INSTINCTS
===============

| # | Age (days) | Confidence | Trigger                          | Scope   | Delete? |
|---|-----------|------------|----------------------------------|---------|---------|
| 1 | 45        | 0.3        | When working with Edit operations | project | [y/n]   |
| 2 | 32        | 0.4        | Switch to Bash for file listing   | global  | [y/n]   |

<count> stale instincts found.
```

If no stale instincts: "No stale instincts found. All instincts are either recent or high-confidence."

### 4. Execute Deletions

For each approved deletion:
- Delete the YAML file
- Report the file path removed

### 5. Report

```
PRUNE COMPLETE
==============
Deleted: <count> instincts
Remaining: <project-count> project + <global-count> global
```

## Rules

- Always present candidates for user approval — never auto-delete
- Evolved instincts (with `evolved_into` field) are never prunable
- If `$ARGUMENTS` contains "all" — show all instincts regardless of age/confidence for manual selection
