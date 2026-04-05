---
description: "Check tracked upstream repos for relevant changes and propose sync actions."
---

**Check:** $ARGUMENTS

Invoke the `arc:upstream-sync` skill (use the Skill tool with this exact name). Follow it exactly.

The skill handles: load tracking manifest → fetch each repo → compare versions → spawn agents to inspect changes → categorize relevance → present recommendations → update manifest.
