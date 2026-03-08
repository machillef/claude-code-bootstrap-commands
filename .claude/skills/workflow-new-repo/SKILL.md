---
name: workflow-new-repo
description: Bootstrap a brand new project with no existing code. Gathers requirements, makes an opinionated stack decision, scaffolds the project, creates docs/ai/ planning docs, and prepares the first slice. Hands off to the same execution-loop as the existing-repo workflow.
---

# Workflow: Bootstrap New Repo

Use this when starting from scratch — no existing code, no existing constraints to discover.

The key difference from `workflow-existing-repo`: there is nothing to inspect. The challenge here is **decisions**, not discovery. Stack, structure, and conventions are chosen upfront and documented so they survive across sessions.

The execution phase after bootstrap is identical — `/continue-work` uses the same execution-loop regardless of whether the project was new or existing.

---

## Step 0: Triage

Confirm this is actually a greenfield project. If the user already has code (even a scaffold, a fork, or a half-started project), use `workflow-existing-repo` instead.

If greenfield: continue.

---

## Step 1: Requirements Capture

Before any stack decision, understand what's being built. If the user's brief already answers these, skip straight to Step 2.

Gather:
- **What type of thing** is being built (API, web app, CLI, background service, data pipeline, mobile app)
- **Scale and lifetime** (personal/throwaway, small team, production SaaS)
- **Hard constraints** (must use X, deploy to Y, integrate with Z)
- **Team's strongest ecosystem** (drives stack language choice)

If the brief is too vague to infer these, ask all missing questions at once — not one at a time.

Write findings to `docs/ai/<initiative>-requirements.md`:

```markdown
# Requirements: <initiative>

## What we're building
<type + brief description>

## Scale and lifetime
<personal / small team / production SaaS>

## Constraints
<hard constraints, or "none stated">

## Team ecosystem
<language preference, or "no preference">

## Non-goals
<explicitly out of scope, if stated>
```

---

## Step 2: Stack Decision

Invoke the `stack-advisor` agent with the requirements from Step 1.

The agent will:
- Ask any remaining clarifying questions
- Recommend a specific stack with rationale
- Identify a scaffold starting point
- Output a decision record

Take the agent's output and:
- Write the decision record to `docs/ai/<initiative>-decisions.md`
- Confirm the recommendation with the user before scaffolding
- If the user overrides, update the decisions.md rationale and continue

Do not proceed to Step 3 until the stack decision is confirmed.

---

## Step 3: Scaffold

Set up the project structure using the scaffold identified by the stack-advisor.

Prefer in this order:
1. Official framework CLI (e.g., `create-next-app`, `cargo new`, `django-admin startproject`)
2. Official starter template from the framework's repo
3. Well-maintained community template (check last commit date — skip anything stale)

After scaffolding:
- Remove boilerplate the stack-advisor flagged
- Verify the project builds and tests run (even if there are no real tests yet)
- Record the scaffold source in decisions.md

```markdown
## Decision: Scaffold
Date: <today>
Status: Accepted

**Source:** <URL or CLI command used>
**Stripped:** <what was removed and why>
**Verified:** build passes / test runner runs
```

---

## Step 4: Create docs/ai/ Initiative Files

Create these five files (scaled for a new project — no scope-map or contracts yet, nothing exists to map):

### `docs/ai/<initiative>-requirements.md`
Already written in Step 1.

### `docs/ai/<initiative>-decisions.md`
Already populated in Steps 2 and 3. Will grow as more decisions are made during execution.

### `docs/ai/<initiative>-plan.md`
```markdown
# Plan: <initiative>

## Phases
1. Foundation — scaffold, CI, basic structure
2. Core — <main feature set>
3. Production-readiness — auth, error handling, observability, deployment

## Assumptions
<list key assumptions that could invalidate the plan>

## Validation strategy
<how we know each phase is done>

## Rollback posture
<for a new project, rollback is usually "revert the commit" — note any exceptions>
```

### `docs/ai/<initiative>-slices.md`
Define the first 3-5 slices. Each in the standard format:

```
## Slice N: <name>
Goal: <what this slice proves or delivers>
Touched area: <file paths or modules>
Tests: <what tests validate this slice>
Risk: <what could go wrong>
Rollback: <how to undo>
Done when: <concrete observable criterion>
```

First slice for a new project is almost always: **"Verify scaffold builds, tests run, CI passes"** — proving the foundation before building anything.

### `docs/ai/<initiative>-status.md`
```markdown
# Status: <initiative>

## Completed
- Bootstrap: requirements captured, stack decided, scaffold created

## In progress
- Slice 1: <name>

## Blocked
None

## Next
- Slice 1: <name and goal>

## Last validation
- Command: <build/test command>
- Result: <pass/fail>
- Date: <today>
```

---

## Step 5: Wire ECC Skills Where Relevant

Same as the existing-repo workflow — reference ECC's tools, don't duplicate them:

- TDD discipline → ECC `tdd-guide` agent
- Code review → ECC `code-reviewer` agent
- Security → ECC `security-reviewer` agent
- Language-specific patterns → ECC's language skills (golang-patterns, python-patterns, etc.)

---

## Step 6: Stop in a Controlled State

Bootstrap is complete when:
- Requirements documented
- Stack decided and confirmed
- Scaffold exists and builds
- docs/ai/ files created
- First slice defined with done-criteria and validation command

**Output to user:**
```
Initiative: <name>
Stack: <one-line summary>
Scaffold: <source>
First slice: <name and goal>
Validation command: <exact command>
Next: /continue-work <initiative>
```

---

## Do Not

- Start implementing features during bootstrap.
- Pick a stack without documenting the rationale in decisions.md.
- Skip the scaffold verification step — a scaffold that doesn't build is not a foundation.
- Create a CLAUDE.md in the project repo. Use docs/ai/ for all project state.
