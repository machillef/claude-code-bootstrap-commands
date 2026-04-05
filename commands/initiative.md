---
description: Bootstrap an existing-repository initiative. Triages size, discovers stack, maps scope, creates docs/ai/, prepares first slice. Does not implement.
---

**Request:** $ARGUMENTS

**Derive initiative slug:** From the user's description, create a short kebab-case slug for the initiative name (used in `docs/ai/<slug>-status.md` filenames). Rules:
- Lowercase, hyphens only (e.g., `dark-mode`, `auth-refactor`, `k8s-migration`)
- 2-4 words max, capturing the essence of the change
- If the user provides an explicit name like "initiative: my-name", use it verbatim
- State the derived name to the user before proceeding: "Initiative name: `<slug>`. Proceeding..."

Use the `workflow-existing-repo` skill. Follow it exactly — all steps, all gates, all output formats.

The skill handles: triage → tech stack → boundaries → design exploration → docs/ai/ → arc agent wiring → first slice → stop.

If triage classifies this as Small, redirect to `/quick` instead.
