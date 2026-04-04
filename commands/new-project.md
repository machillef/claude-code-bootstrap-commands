---
description: Bootstrap a brand new project with no existing code. Gathers requirements, decides stack, scaffolds, creates docs/ai/, prepares first slice. Does not implement.
---

**Request:** $ARGUMENTS

Use the `workflow-new-repo` skill. Follow it exactly — all steps, all gates, all output formats.

The skill handles: confirm greenfield → requirements → design exploration → stack decision (wait for user confirmation) → scaffold → docs/ai/ → arc agent wiring → stop.

If the user already has code, redirect to `/new-feature` instead.
