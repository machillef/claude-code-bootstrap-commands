# Karpathy's Autoresearch Patterns (Applied to Skills)

Distilled from karpathy/autoresearch (March 2026). The repo gives an AI agent a training setup and lets it experiment autonomously: modify code → train → measure → keep/discard → repeat.

## Core Principles (Adapted for Skill Improvement)

### 1. Single Metric, Fixed Budget
Autoresearch has ONE metric (val_bpb) and a fixed 5-minute time budget. This makes experiments directly comparable.

**For skills:** The "metric" is the 8-point structural score + a qualitative content assessment. The "budget" is the audit scope — one skill at a time, or batch with sub-agents.

### 2. Keep/Discard Discipline
Every experiment either improves the metric or gets reverted. No "maybe it helped" — binary decision.

**For skills:** Every proposed improvement must either increase the health score or address a specific qualitative gap. If it doesn't, discard it.

### 3. Results Log (Audit Trail)
`results.tsv` tracks every experiment: commit hash, metric, status (keep/discard/crash), description.

**For skills:** `improvement-log.jsonl` tracks every improvement: date, skill name, change description, score before/after, status (applied/rejected/deferred).

### 4. Simplicity Criterion
"A 0.001 improvement that adds 20 lines of hacky code? Not worth it. Removing code for same results? Keep."

**For skills:** Don't add complexity for marginal structural improvement. Removing unnecessary content from a skill while maintaining quality = always a win.

### 5. NEVER STOP (Persistent State)
The agent runs indefinitely because state persists in git. It doesn't need to finish in one session.

**For skills:** `pending-improvements.md` carries forward what wasn't addressed. Each invocation picks up where the last left off. The improvement loop never truly stops — it just pauses between invocations.

### 6. Crash Recovery
If an experiment crashes, attempt a fix. If it's fundamentally broken, log it and move on.

**For skills:** If an improvement breaks a skill (e.g., template reference points to nonexistent file), fix it. If the improvement concept is flawed, log as "rejected" and move on.

## The Feedback Loop

```
Audit skill → Score it → Identify weakness → Propose fix
    → User approves → Implement → Re-score → Keep if improved
    → Log result → Note remaining gaps → Next invocation picks them up
```

This is the autoresearch loop adapted for a domain without a numeric loss function. The "loss" is the combination of structural score + qualitative gaps. The "training run" is the improvement implementation.
