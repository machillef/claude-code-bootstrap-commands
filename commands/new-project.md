---
description: Bootstrap a brand new project with no existing code. Gathers requirements, decides stack, scaffolds, creates docs/ai/, prepares first slice. Does not implement.
---

**Request:** $ARGUMENTS

**Derive initiative slug:** From the user's description, create a short kebab-case slug for the initiative name (used in `docs/ai/<slug>-status.md` filenames). Rules:
- Lowercase, hyphens only (e.g., `recipe-app`, `portfolio-site`, `cli-tool`)
- 2-4 words max, capturing the essence of the project
- If the user provides an explicit name like "project: my-name", use it verbatim
- State the derived name to the user before proceeding: "Initiative name: `<slug>`. Proceeding..."

Use the `workflow-new-repo` skill. Follow it exactly — all steps, all gates, all output formats.

The skill handles: confirm greenfield → requirements → design exploration → stack decision (wait for user confirmation) → scaffold → docs/ai/ → arc agent wiring → stop.

If the user already has code, redirect to `/initiative` instead.
