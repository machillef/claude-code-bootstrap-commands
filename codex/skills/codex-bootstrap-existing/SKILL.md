---
name: codex-bootstrap-existing
description: Bootstrap a medium or large initiative in an existing repo. Creates durable `docs/ai/` control docs and prepares the first safe slice without implementing it.
---

# Codex Bootstrap Existing Repo

Use this skill to prepare substantial work in an existing repository.

Unlike the Claude variant, this skill does not depend on slash commands or the
everything-claude-code plugin. It uses Codex-native skills, sub-agents, and
repo files.

## Inputs

- Initiative name
- Objective
- Constraints or must-not-touch areas

If the user left details out, infer conservatively from the repo and ask only
when the missing detail materially changes the plan.

## Step 0: Triage

Classify before doing anything else:

- Small: 1-3 files, existing pattern, less than a day. Stop and recommend `codex-quick-change`.
- Medium: feature-scale, 1-3 days. Continue and create the medium doc set.
- Large: migration or architectural change. Continue and create the large doc set.

State the classification explicitly.

## Step 1: Discover the Repo

Before writing any plan or proposing net-new implementation, do research first:

- search the codebase for existing patterns
- check package registries before inventing local utilities
- check primary docs when the task depends on external APIs or framework behavior
- prefer adapting a proven approach over writing from scratch

If you have Codex role configs for `explorer` or `docs-researcher`, use them for
evidence gathering and docs verification.

## Step 2: Discover the Repo

Catalog:

- language and runtime
- build, test, typecheck, and lint commands
- CI/CD entry points
- auth, error handling, config, and response patterns
- candidate validation commands for one-file and full-suite testing

Record concrete commands in `docs/ai/<initiative>-scope-map.md` under:

```markdown
## Verification Commands
| Phase | Command |
|---|---|
| Build | <exact command> |
| Test (single) | <exact command> |
| Test (full) | <exact command> |
| Type check | <exact command or N/A> |
| Lint | <exact command or N/A> |
```

## Step 3: Map Scope And Done-Criteria

Write concrete in-scope, adjacent, and out-of-scope areas using file paths.

Derive 2-4 initiative-specific Definition of Done items and store them in
`docs/ai/<initiative>-scope-map.md`.

## Step 4: Design Exploration

Invoke `codex-brainstorm-design` before creating slice plans.

Do not proceed until the design is written to `docs/ai/<initiative>-design.md`
and the user has approved it.

## Step 5: Large-Change Discovery

If the initiative is large, spawn a sub-agent using
`prompts/architecture-discovery.md` and write its validated output to
`docs/ai/<initiative>-architecture-discovery.md`.

Treat the sub-agent output as input to the docs, not as ground truth. Cross-check
it against what you verified directly.

## Step 6: Create Initiative Docs

Medium change:

- `docs/ai/<initiative>-scope-map.md`
- `docs/ai/<initiative>-design.md`
- `docs/ai/<initiative>-slices.md`
- `docs/ai/<initiative>-status.md`

Large change:

- `docs/ai/<initiative>-scope-map.md`
- `docs/ai/<initiative>-design.md`
- `docs/ai/<initiative>-contracts.md`
- `docs/ai/<initiative>-risks.md`
- `docs/ai/<initiative>-plan.md`
- `docs/ai/<initiative>-slices.md`
- `docs/ai/<initiative>-status.md`
- `docs/ai/<initiative>-decisions.md`
- `docs/ai/<initiative>-architecture-discovery.md`

If the target repo lacks `AGENTS.md`, create a small repo-level file with stable
facts only:

- stack
- build/test commands
- structure
- key observed patterns
- pointer to `docs/ai/`

If it already exists, append only missing stable facts. Do not overwrite user rules.

## Step 7: Define The First Safe Slice

The first slice must:

- prove the chosen approach is viable
- have a small blast radius
- include a runnable validation command
- avoid depending on unfinished work elsewhere

Include a `User stories:` field in each slice referencing story numbers from the design doc.

## Step 7b: Verify User Story Traceability

Before stopping, verify that every user story from the design doc is covered by at least one slice. If any stories are uncovered, present the gaps to the user and either add a slice or mark the story as out of scope in the design doc.

## Step 8: Stop Cleanly

End with a compact structured summary:

```text
Initiative: <name>
Size: <medium/large>
Stack: <one-line summary>
Scope boundary: <in-scope vs out-of-scope>
docs/ai/ files created: <list>
Test runner: <single-test command or "needs setup">
First slice: <name and goal>
Validation command: <exact command>
TDD: mandatory from Slice 1 for behavioral changes
Next: use codex-continue-work for <initiative>
```

## Rules

- Do not implement during bootstrap.
- Do not widen scope silently.
- Keep `AGENTS.md` stable and concise.
- Keep initiative state in `docs/ai/`, not chat memory.
