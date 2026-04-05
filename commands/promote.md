---
description: "Promote high-confidence project instincts to global scope (available in all projects)."
---

**Scope:** $ARGUMENTS

Your first output line must be:
```
Checking for promotable instincts...
```

## Procedure

### 1. Load Project Instincts

Read all `.yaml` files from `~/.claude/arc/projects/<hash>/instincts/`.

### 2. Filter Promotable

An instinct is promotable when:
- `confidence >= 0.8`
- `scope` is "project" (not already global)
- Not already present in global instincts (check by trigger similarity)

### 3. Present Candidates

```
PROMOTION CANDIDATES
====================
Project: <name> (<hash>)

| # | Confidence | Trigger                          | Observations | Promote? |
|---|------------|----------------------------------|-------------|----------|
| 1 | 0.9        | Always use specific file paths    | 12          | [y/n]    |
| 2 | 0.8        | Check branch before committing    | 5           | [y/n]    |

<count> instincts eligible for promotion.
```

If no candidates: "No instincts eligible for promotion. Instincts need confidence >= 0.8 to be promoted."

### 4. Execute Promotions

For each approved promotion:
1. Copy the instinct YAML file to `~/.claude/arc/instincts/global/`
2. Update the copy: change `scope` from "project" to "global"
3. Keep the project-scoped original (it continues to track project-specific confidence)

### 5. Report

```
PROMOTION COMPLETE
==================
Promoted: <count> instincts from <project> to global
Global instincts total: <count>
```

## Rules

- Always present candidates for user approval — never auto-promote
- Keep the project-scoped original after promoting (dual tracking)
- If a similar instinct already exists in global, report it and skip
