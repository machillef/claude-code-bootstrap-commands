# Learning System Completion — Design

## Objective

Complete the instinct-based learning pipeline so it actually creates, manages, and surfaces learned patterns. Currently observations are captured but instincts are never created.

## Architecture (from grill-me design session)

```
Session tool calls
    ↓
observation-capture.js (PreToolUse/PostToolUse)
    ↓  writes JSONL
observations.jsonl (per-project)
    ↓
session-end-observer.js (Stop hook)
    ↓  detects patterns → creates instincts
instincts/*.yaml (per-project and global)
    ↓
ambient-learning-nudge.js (SessionStart)
    ↓  reads high-confidence instincts → injects into context
Next session has learned knowledge
```

## Instinct Lifecycle

1. **Created** at confidence 0.3 (tentative) when a pattern is first observed
2. **Strengthened** when the same pattern recurs — confidence increases toward 0.9
3. **Promoted** from project-scope to global when seen in 2+ projects with avg confidence >= 0.8
4. **Pruned** when older than 30 days with confidence still below 0.5

## Instinct Format

Uses `learning/templates/instinct.yaml`:
- id, trigger, action, confidence, domain, scope, project metadata
- Stored at `~/.claude/arc/projects/<hash>/instincts/` (project) or `~/.claude/arc/instincts/global/` (global)

## Commands

- `/instinct-status` — display all instincts (project + global) with confidence scores
- `/evolve` — cluster related instincts into proper skills/commands
- `/promote` — elevate high-confidence project instincts to global
- `/prune` — delete stale low-confidence instincts older than 30 days
