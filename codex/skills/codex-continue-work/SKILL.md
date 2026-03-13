---
name: codex-continue-work
description: Resume an initiative from durable repo state in `docs/ai/`, implement one slice narrowly, verify, and update docs before stopping cleanly.
---

# Codex Continue Work

Use this skill to resume a previously bootstrapped initiative.

## Session Start Checklist

Before editing:

1. Read repo `AGENTS.md` if present.
2. Read `docs/ai/<initiative>-status.md`.
3. Read `docs/ai/<initiative>-slices.md`.
4. Read `docs/ai/<initiative>-plan.md` if it exists.
5. Read `docs/ai/<initiative>-decisions.md` if it exists.
6. Run `git log --oneline -10`.

## Execution Loop

1. Run a stale check against recent commits.
2. Determine the in-progress or next planned slice.
3. Reconfirm the exact touched area and adjacent non-target areas.
4. Research first:
   - search for existing repo patterns
   - check package registries before inventing utilities
   - verify external APIs or framework behavior against primary docs when relevant
5. If you have Codex role configs, use:
   - `explorer` for read-only evidence gathering
   - `docs-researcher` for external behavior verification
   - `reviewer` after implementation
6. Apply test-first discipline for behavioral changes.
7. Implement one slice only.
8. If verification fails, invoke `codex-systematic-debugging`.
9. Verify with the narrowest relevant command first.
10. Review the diff critically for correctness, security, regressions, and missing tests.
11. Update `docs/ai/` docs to match reality.
12. Stop with a clear next step.

## Preferred Codex Helpers

- `verification-loop` for broader pre-PR validation
- `security-review` when the slice crosses trust boundaries
- `session-handoff` when ending a long session
- `codex-orchestrate` when the slice needs explicit multi-agent handoffs

## Required Status Format

```markdown
## Slice <N>: <name>
Status: <Not Started | In Progress | Complete | Blocked>
Last updated: <date>

### What was implemented
<concrete list of file-level changes>

### What was validated
<exact commands and pass/fail>

### What remains unverified
<anything still unverified>

### Blockers
<issues or "None">

### Next recommended step
<exact next action>
```

## Output

```text
Slice <N>: <name> — <Complete|In Progress|Blocked>
Changed: <file list>
Validated: <commands and pass/fail>
Remains: <what is left or "nothing">
Next: use codex-continue-work for <initiative> -> <next slice>
```

## Rules

- One slice at a time.
- Do not silently widen scope.
- Update docs after every slice attempt.
- Keep durable state in repo files, not in chat.
