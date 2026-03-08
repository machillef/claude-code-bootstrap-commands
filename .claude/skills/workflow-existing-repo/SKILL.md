---
name: workflow-existing-repo
description: Bootstrap disciplined work in an existing repository. Discovers scope, maps boundaries, creates scaled docs/ai/ control docs, and prepares a safe execution path. Combines Claude Code best practices with ECC-style planning, TDD discipline, reviewer handoff, and repo-state continuity.
---

# Workflow: Bootstrap Existing Repo

## Inputs

- Initiative name
- Objective (what needs to change and why)
- Key constraints (scope limits, must-not-touch areas)

If any input is missing, infer conservatively from the repo. Do not invent requirements.

---

## Step 0: Triage

Classify the change before doing anything else.

| Size | Signals | Path |
|---|---|---|
| **Small** | 1-3 files, follows existing pattern, < 1 day | Stop — tell user to run `/quick-change` instead |
| **Medium** | Feature-scale, new behavior, 1-3 days | Continue here, create partial docs/ai/ |
| **Large** | Architectural, migration, multi-week, cross-stack | Continue here, create full docs/ai/ |

State your classification to the user before proceeding. If uncertain, present two options — do not guess silently.

If **Small**: stop here. Tell the user to run `/quick-change <objective>` instead.

---

## Step 1: Tech Stack Detection

Systematically catalog before forming any opinions. Check in order:

**Language & Runtime**
- File extensions dominant in `src/`, `app/`, `lib/`, root
- Manifests: `package.json`, `go.mod`, `Cargo.toml`, `pom.xml`, `build.gradle`, `requirements.txt`, `pyproject.toml`, `.csproj`, `Gemfile`, `mix.exs`
- Toolchain files: `.nvmrc`, `.node-version`, `.python-version`, `.tool-versions`, `rust-toolchain.toml`

**Build & Test**
- Build command: `package.json` scripts, `Makefile`, `justfile`, `taskfile.yml`
- Test framework: identify from deps (Jest, Vitest, pytest, go test, xunit, RSpec) and from CI config
- Lint/format tooling

**CI/CD**
- `.github/workflows/`, `.gitlab-ci.yml`, `Jenkinsfile`, `.circleci/`

**Existing Patterns** (read 2-3 representative files, not the whole codebase)
- How is auth applied? (middleware, decorator, guard, manual check)
- How are errors handled? (exceptions, Result type, error codes)
- How is config loaded? (env vars, config files, secrets manager)
- What does the API response shape look like?

**Produce a one-screen tech stack summary before moving to Step 2.** This is the foundation for all subsequent decisions.

---

## Step 2: Map Boundaries and Contracts

Identify what is in-scope, adjacent, and out-of-scope for this initiative.

- **In-scope**: specific modules, routes, services, components to change
- **Adjacent (understand, don't touch)**: what in-scope code depends on — understand the contract, don't change it
- **Out-of-scope**: name it explicitly so there's no ambiguity
- **Dependents on target area**: what calls or imports the changed area (regression risk)
- **Contracts relevant to this change**: auth/session, integration points, API shape, env vars

Use concrete file paths. No abstract descriptions.

**For Large changes only:** Before completing this step, invoke the `architecture-discovery` agent. Feed its output into the docs/ai/ files. Cross-check its findings against what you read directly.

---

## Step 3: Create Initiative Docs Under `docs/ai/`

Scale the document set to change size:

### Medium — create:
- `docs/ai/<initiative>-scope-map.md`
- `docs/ai/<initiative>-slices.md`
- `docs/ai/<initiative>-status.md`

### Large — create all seven:
- `docs/ai/<initiative>-scope-map.md`
- `docs/ai/<initiative>-contracts.md`
- `docs/ai/<initiative>-risks.md`
- `docs/ai/<initiative>-plan.md`
- `docs/ai/<initiative>-slices.md`
- `docs/ai/<initiative>-status.md`
- `docs/ai/<initiative>-decisions.md`

For large changes, also save: `docs/ai/<initiative>-architecture-discovery.md`

**Content rules:**
- Every entry backed by a file path or concrete repo evidence
- Concise and factual — no speculative brainstorming
- Status must reflect current reality, not aspirations

**Slice format** (for slices.md):
```
## Slice N: <name>
Goal: <what this slice proves or delivers>
Touched area: <file paths or modules>
Tests: <what tests validate this slice>
Risk: <what could go wrong>
Rollback: <how to undo if it goes wrong>
Done when: <concrete observable criterion>
```

---

## Step 4: Wire ECC Skills Where Relevant

Do not create local agent definitions. ECC is installed. Reference its tools:

- Planning refinement → ECC `planner` agent
- TDD discipline → ECC `tdd-guide` agent
- Code review → ECC `code-reviewer` agent
- Security concerns → ECC `security-reviewer` agent
- Research before implementing → ECC `/search-first` command

**Language-specific:** if the codebase uses Go → `golang-patterns` + `golang-testing`; Python/Django → `python-patterns` + `django-patterns`; React/Next.js → `frontend-patterns`; Java/Spring → `springboot-patterns`; Postgres → `postgres-patterns`.

Only invoke these when they materially improve quality. Do not invoke agents ceremonially.

---

## Step 5: Define the First Safe Slice

Must:
- Prove the chosen approach is viable (not just "easy")
- Have limited blast radius (reversible)
- Have a clear, runnable validation command
- Not depend on unfinished work elsewhere

State the first slice using the full slice format from Step 3.

---

## Step 6: Stop in a Controlled State

Bootstrap is complete when:
- Tech stack is documented
- Scope is explicit
- docs/ai/ files exist and reflect reality
- First slice is defined with done-criteria and validation command
- No broad implementation has started

**Do not start implementing during bootstrap.**

**Output to user:**
```
Initiative: <name>
Size: <medium/large>
Stack: <one-line summary>
Scope boundary: <in-scope vs out-of-scope in one sentence>
First slice: <slice name and goal>
Validation command: <exact command>
Next: /continue-work <initiative>
```

---

## Do Not

- Create or modify CLAUDE.md in the target repo. The global `~/.claude/CLAUDE.md` covers universal principles. `docs/ai/` covers initiative state. No repo-level CLAUDE.md is needed.
- Implement during bootstrap.
- Modify unrelated code without explicit justification in decisions.md.
- Store temporary findings in CLAUDE.md.
