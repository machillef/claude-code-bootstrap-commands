---
description: Continue an existing initiative. Loads repo state, picks next slice, implements with TDD, verifies, updates docs.
---

**Initiative:** $ARGUMENTS

Your first output line must be the message below. Print it before any file reads or analysis. Use the exact text — do not customize it. Users experience minutes of silence otherwise.

```
Continuing initiative. Loading state...
```

If no initiative name is provided in $ARGUMENTS, print: `No initiative specified. Usage: /continue <initiative-name>` and stop.

Then use the `execution-loop` skill. Follow it exactly — all steps, all gates, all output formats.

The skill handles: session start checklist → stale check → load state → select slice → scope → research → TDD → arc agent delegation → verify → debug if needed → re-assess → update docs → learning → stop.

Interpret the argument as the initiative name, optionally with a specific constraint or priority.
