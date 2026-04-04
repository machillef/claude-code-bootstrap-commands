---
description: Lightweight path for small, well-defined changes (1-3 files, follows existing pattern). Skips full bootstrap. Creates minimal status trace.
---

**Request:** $ARGUMENTS

Small, bounded change in an existing codebase. No bootstrap. No full docs/ai/. Move fast and precisely.

## Procedure

### 1. Understand → Find Pattern → Identify Target
- Parse the request: what changes, where it lives, what pattern to follow
- Find how the codebase already does this (Grep/Glob, read 2-3 representative files)
- Locate exact file(s) to change

**Escalation gate:** If the change requires >3 files or the pattern doesn't exist yet, stop and tell the user to run `/new-feature` instead.

### 2. Apply Minimal Change (with TDD)
- Replicate existing pattern. Do not improve surrounding code.
- If behavior changes: write failing test first → implement → confirm pass
- If fixing a bug: write reproducing test first → fix → confirm pass
- If purely structural: run existing tests to confirm no regression
- If no test framework: state this explicitly

### 3. Self-Review
Before finishing, review the diff:
- Does it do only what was asked?
- Security concerns? (input validation, auth, data exposure)
- Follows existing patterns?

### 4. Log
Create or append to `docs/ai/quick-changes-log.md` using `templates/quick-change-log-entry.md` format.

## Gotchas

- **"Just one more file"** — if you need a 4th file, STOP. This is no longer a quick change.
- **Missing test framework** — don't silently skip testing. State it. If the change is behavioral, recommend the user sets up testing before proceeding.
- **Pattern doesn't exist** — if you can't find an existing pattern to replicate, this is a design decision, not a quick change. Escalate.
- **Config changes cascade** — changing config files (appsettings.json, .env, k8s manifests) often has blast radius beyond the immediate file. Check dependents.

## Rules

- Do not create CLAUDE.md in the target repo.
- Do not create full docs/ai/ set.
- Do not expand scope. Note adjacent issues but don't fix them.
- Prefer Edit over rewrite.
