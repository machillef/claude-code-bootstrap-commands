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
- Present the recommendation to the user using this exact format and **wait for explicit confirmation before continuing**:

```
Recommended stack: <stack summary>
Rationale: <1-2 sentences>
Scaffold source: <CLI command or URL>

Reply YES to proceed with scaffolding, or tell me what to change.
```

Do not proceed to Step 3 until the user confirms. If the user overrides, update decisions.md with the new rationale and continue.

---

## Step 3: Scaffold

Set up the project structure using the scaffold identified by the stack-advisor.

Prefer in this order:
1. Official framework CLI (e.g., `create-next-app`, `cargo new`, `django-admin startproject`)
2. Official starter template from the framework's repo
3. Well-maintained community template (check last commit date — skip anything stale)

After scaffolding:
- Verify the project builds and tests run (even if there are no real tests yet)
- Verify the test framework supports running a single test in isolation (needed for TDD cycle in subsequent slices)
- If no test framework is included in the scaffold, note it — the first slice should configure one
- Record the scaffold source in decisions.md:

```markdown
## Decision: Scaffold
Date: <today>
Status: Accepted

**Source:** <URL or CLI command used>
**Boilerplate removed:** <list what was removed and why, or "none — applied as-is">
**Verified:** build passes / test runner runs
```

**On boilerplate removal:** Only remove files that the stack-advisor explicitly recommended removing. If stack-advisor made no specific recommendation, apply the scaffold as-is and document "none — applied as-is". Do not guess at what to strip.

After verifying the scaffold, create a minimal `CLAUDE.md` in the project root:

```markdown
# <project-name>

## Stack
<one-line: language, framework, key libraries — e.g., "Rust CLI, clap 4, tokio async">

## Build & test
<build command> | <test command>

## Structure
<entry point and key directories — 5–8 lines max>

## Source of truth
- `docs/ai/` — initiative planning, status, and decisions
- `~/.claude/CLAUDE.md` — global coding rules and workflow

Do not store session state or evolving task notes here.

## Start here
1. Read `docs/ai/<initiative>-status.md` for current slice
2. Read `docs/ai/<initiative>-slices.md` for scope
3. Read the touched code paths
```

**Rules for this file:**
- Stable facts only — stack, structure, build/test commands. Nothing time-sensitive.
- No rules that duplicate the global `~/.claude/CLAUDE.md` (no testing %, security rules, git workflow, code style).
- 30 lines maximum.
- Do not create if `CLAUDE.md` already exists — append missing sections instead.

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

Write the completed bootstrap as Slice 0, then the first real slice as Not Started.
Use the execution-loop format so `/continue-work` can read it without ambiguity:

```markdown
# Status: <initiative>

## Slice 0: Bootstrap
Status: Complete
Last updated: <today>

### What was implemented
- Requirements captured in docs/ai/<initiative>-requirements.md
- Stack decided: <stack summary>
- Scaffold created via: <CLI command or source>
- docs/ai/ files created: requirements, decisions, plan, slices, status

### What was validated
- <build command run>: pass
- <test runner command>: pass (or "no tests yet — runner confirmed working")

### What remains unverified
<anything not confirmed, or "None">

### Blockers
None

### Next recommended step
Run /continue-work <initiative> to start Slice 1: <name>

---

## Slice 1: <name>
Status: Not Started
Last updated: <today>

### What was implemented
N/A — not started

### What was validated
N/A

### What remains unverified
Everything — slice not started

### Blockers
None

### Next recommended step
Run /continue-work <initiative> to begin this slice
```

---

## Step 5: Wire ECC Skills Where Relevant

ECC agents are available only if ECC is installed in the current project. Check before referencing:

```bash
ls .claude/agents/ 2>/dev/null || echo "ECC not installed"
```

If ECC is installed, invoke its agents according to these criteria:

| Agent | Invoke when |
|---|---|
| `tdd-guide` | Any slice that adds or changes behavior (the default for most slices) |
| `code-reviewer` | Always after implementation — every slice gets a review |
| `security-reviewer` | Slice touches auth, input validation, data persistence, or external calls |
| `planner` | Slice has more than 3 unknowns or cross-cutting dependencies |

Language-specific: Go → `golang-patterns` + `golang-testing`; Python → `python-patterns`; React/Next.js → `frontend-patterns`; Java/Spring → `springboot-patterns`; Postgres → `postgres-patterns`.

If ECC is **not** installed: apply the discipline directly (write tests first, review your own code critically, check security manually). Do not skip the discipline — skip the agent invocation.

---

## Step 6: Stop in a Controlled State

Bootstrap is complete when:
- Requirements documented
- Stack decided and confirmed by user
- Scaffold exists and builds
- docs/ai/ files created and status.md uses execution-loop format
- First slice defined with done-criteria and validation command

**Always end with this exact structured output — do not end conversationally or with a question:**
```
Initiative: <name>
Stack: <one-line summary>
Scaffold: <source>
Test runner: <command to run a single test, or "needs setup — first slice should configure test framework">
First slice: <name and goal>
Validation command: <exact command>
TDD: mandatory from Slice 1 — all behavioral changes require tests first
Next: /continue-work <initiative>
```

Do not replace this with a conversational summary. Do not end with "let me know if..." or any question. The structured output is mandatory.

---

## Do Not

- End with a conversational message — always use the structured stop output above.
- Start implementing features during bootstrap.
- Pick a stack without documenting the rationale in decisions.md.
- Skip the scaffold verification step — a scaffold that doesn't build is not a foundation.
- Add rules or session state to CLAUDE.md. It must contain only stable project facts (stack, structure, build commands).
- Proceed to scaffolding without explicit user confirmation of the stack decision.
- Remove boilerplate that was not explicitly recommended for removal.
