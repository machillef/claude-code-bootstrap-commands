---
name: codex-quick-change
description: Lightweight path for small, bounded changes in an existing repo. Use when the task should touch only a few files and follow an existing pattern.
---

# Codex Quick Change

Use this skill for a small existing-repo change that should stay narrow.

## Intent

- Find the existing pattern first
- Change as little as possible
- Verify with the narrowest useful command
- Append a lightweight audit entry to `docs/ai/quick-changes-log.md`

## Workflow

1. Parse the request and identify the likely touched area.
2. Search for 2-3 representative files that already implement the same pattern.
3. Confirm the task is actually small.
4. If it needs more than 3 files or introduces a new pattern, stop and recommend `codex-bootstrap-existing`.
5. If behavior changes, follow test-first discipline.
6. Implement the minimal change.
7. Verify with the smallest relevant command.
8. Append a concise entry to `docs/ai/quick-changes-log.md`.

## Required Log Format

```markdown
## <date> — <one-line description>
- Changed: <file(s)>
- Pattern followed: <where the pattern was found>
- Tests: <test added/updated and command run, or "no test framework">
- Reviewed: <yes — self-review of diff>
```

## Rules

- Do not bootstrap for a genuinely small change.
- Do not widen scope.
- Do not refactor adjacent code.
- Prefer existing project patterns over invention.
