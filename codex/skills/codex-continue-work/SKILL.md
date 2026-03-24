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
   - If not found: check `docs/ai/archive/<initiative>/`. If there, the initiative was archived — see Extend Mode in step 2. If not found anywhere, stop: "No initiative found. Use `codex-bootstrap-existing` or `codex-bootstrap-new` first."
3. Read `docs/ai/<initiative>-slices.md`.
4. Read `docs/ai/<initiative>-plan.md` if it exists.
5. Read `docs/ai/<initiative>-decisions.md` if it exists.
6. Run `git log --oneline -10`.

## Execution Loop

1. Run a stale check against recent commits.
2. Determine the in-progress or next planned slice.
   - If any slice is in "Needs Fix" state → **STOP.** Tell the user: "Slice <N> has reported bugs. Use `codex-fix-bugs` to address them before advancing." Do not proceed.
   - If all slices are Complete (or Complete + Blocked) and the user provided a new objective → enter **Extend Mode**: read existing design/decisions, ask brief clarifying questions, propose new slices (numbered from last), get approval, add to slices.md and status.md, then continue. This is lighter than re-bootstrapping. **But:** if the new objective is materially different from the original design (new domain, different architecture), recommend `codex-bootstrap-existing` for a fresh initiative instead. **If files are archived** (in `docs/ai/archive/<initiative>/`), restore them first with `git mv docs/ai/archive/<initiative>/* docs/ai/`.
   - If all slices are Complete and no new objective → emit End of Plan block. Suggest archiving completed files: `git mv docs/ai/<initiative>-* docs/ai/archive/<initiative>/`.
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
8. If verification fails, invoke `codex-systematic-debugging`. If verification passes, note "step 8 skipped — debugging not needed."
9. Verify with the narrowest relevant command first. Verification means **build AND tests pass** — a build that compiles but whose tests haven't run is not verification. Do not stop after a successful build. Run build then tests back-to-back — do not stop or summarize between them. If no test command exists, note "build-only verification" and compensate in the review step.
10. Review the diff critically for correctness, security, regressions, and missing tests. Check that the changes satisfy the user stories referenced by this slice — verify each story's "I want" and "so that" against actual behavior.
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
Status: <Not Started | In Progress | Complete | Needs Fix | Blocked>
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
Slice <N>: <name> — <Complete|In Progress|Needs Fix|Blocked>
Changed: <file list>
Validated: <commands and pass/fail>
Remains: <what is left or "nothing">
Manual check: <1-2 things to verify manually that automated tests cannot cover>
Next: use codex-continue-work for <initiative> -> <next slice>
      use codex-fix-bugs for <initiative> — if manual testing reveals bugs in this slice
```

## Rules

- One slice at a time.
- Do not silently widen scope.
- Update docs after every slice attempt.
- Keep durable state in repo files, not in chat.
