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
- Test runner verification: confirm you can run a single test in isolation (needed for TDD cycle)
- Lint/format tooling

**CI/CD**
- `.github/workflows/`, `.gitlab-ci.yml`, `Jenkinsfile`, `.circleci/`

**Existing Patterns** (read 2-3 representative files, not the whole codebase)
- How is auth applied? (middleware, decorator, guard, manual check)
- How are errors handled? (exceptions, Result type, error codes)
- How is config loaded? (env vars, config files, secrets manager)
- What does the API response shape look like?

**Verification commands:** Record the concrete commands discovered above into the scope-map so the execution loop knows exactly what to run during verification. Use this format in `docs/ai/<initiative>-scope-map.md`:

```
## Verification Commands
| Phase | Command |
|---|---|
| Build | <exact build command> |
| Test (single) | <command to run one test file in isolation> |
| Test (full) | <command to run the full test suite> |
| Type check | <type checker command, or "N/A"> |
| Lint | <linter command, or "N/A"> |
```

Only include phases that have tooling. Do not invent commands — record what actually exists.

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

**Definition of Done:** Derive 2-4 concrete, verifiable exit criteria from the user's stated objective. These answer "how does the user know this initiative succeeded?" — not generic quality gates.

Infer what "done" means from the objective's nature:
- **Migration** (e.g., ".NET views to React") → target stack works end-to-end, old code removed, no user-facing regression
- **Feature** (e.g., "add RBAC to the API") → feature is accessible and enforced on all relevant routes, covered by tests
- **Infrastructure** (e.g., "split Terraform into modules") → `terraform plan` shows no drift, all environments apply cleanly
- **Refactor** (e.g., "extract shared auth library") → consumers use the new library, old duplication removed, behavior unchanged

Do not include criteria enforced by the execution loop on every slice (tests pass, code reviewed). Focus on what is specific to *this* objective.

Write the Definition of Done into `docs/ai/<initiative>-scope-map.md` under a `## Definition of Done` heading.

**For Large changes only:** Before completing this step, invoke the `architecture-discovery` agent. Feed its output into the docs/ai/ files. Cross-check its findings against what you read directly.

---

## Step 3: Design Exploration

For **medium** and **large** changes, invoke the `brainstorm-design` skill before creating docs/ai/ files.

The skill will:
- Load any existing docs/ai/ context (scope-map from Step 2, if written early)
- Load CLAUDE.md and project context
- Ask clarifying questions one at a time
- Propose 2-3 approaches with trade-offs
- Present a design for user approval
- Write the validated design to `docs/ai/<initiative>-design.md`
- Run a spec review loop
- Return control here after user approves the spec

**Do not proceed to Step 4 until brainstorm-design completes and the user has approved the design.**

The design doc informs the slice definitions in Step 4 — slices should implement the approved design, not invent new approaches.

---

## Step 4: Create Initiative Docs Under `docs/ai/`

Scale the document set to change size:

### Medium — create:
- `docs/ai/<initiative>-scope-map.md`
- `docs/ai/<initiative>-design.md` (already written in Step 3)
- `docs/ai/<initiative>-slices.md`
- `docs/ai/<initiative>-status.md`

### Large — create all eight:
- `docs/ai/<initiative>-scope-map.md`
- `docs/ai/<initiative>-design.md` (already written in Step 3)
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

After creating docs/ai/ files, check if `CLAUDE.md` exists in the project root:
- **Does not exist:** create it with stable project facts discovered in Steps 1–2.
- **Already exists:** read it. Add only missing sections — do not overwrite or reformat existing content.

Minimal `CLAUDE.md` template:

```markdown
# <project-name>

## Stack
<language, framework, key libraries — one line>

## Build & test
<build command> | <test command>

## Structure
<entry point and key directories — 5–8 lines max>

## Key patterns
- Auth: <how auth is applied, e.g., "JWT middleware on all /api routes">
- Errors: <how errors are handled, e.g., "Result<T, AppError> throughout">
- Config: <how config is loaded, e.g., "dotenv via config/settings.py">

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
- Stable facts only — stack, structure, build/test commands, observed patterns.
- No rules that duplicate the global `~/.claude/CLAUDE.md` (no testing %, security rules, git workflow, code style).
- 40 lines maximum.
- Patterns section: only include what you actually observed in Step 1 — do not invent or speculate.

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

## Step 5: Wire ECC Skills Where Relevant

ECC agents are available only if ECC is installed in the target repo. Check before referencing:

```bash
ls .claude/agents/ 2>/dev/null || echo "ECC not installed"
```

If installed, invoke according to these criteria:

| Agent | Invoke when |
|---|---|
| `tdd-guide` | Any slice that adds or changes behavior (the default for most slices) |
| `code-reviewer` | Always after implementation — every slice gets a review |
| `security-reviewer` | Slice touches auth, input validation, data persistence, or external calls |
| `e2e-runner` | Slice completes a navigable route or user-visible UI journey |
| `planner` | Slice has more than 3 unknowns or cross-cutting dependencies |

**Language-specific:** if the codebase uses Go → `golang-patterns` + `golang-testing`; Python/Django → `python-patterns` + `django-patterns`; React/Next.js → `frontend-patterns`; Java/Spring → `springboot-patterns`; Postgres → `postgres-patterns`.

If ECC is **not** installed: apply the discipline directly (write tests first, review your own code, check security manually). Do not skip the discipline — skip only the agent invocation.

---

## Step 6: Define the First Safe Slice

Must:
- Prove the chosen approach is viable (not just "easy")
- Have limited blast radius (reversible)
- Have a clear, runnable validation command
- Not depend on unfinished work elsewhere

State the first slice using the full slice format from Step 3.

---

## Step 7: Stop in a Controlled State

Bootstrap is complete when:
- Tech stack is documented
- Scope is explicit
- docs/ai/ files exist and reflect reality
- First slice is defined with done-criteria and validation command
- No broad implementation has started

**Do not start implementing during bootstrap.**

**Always end with this exact structured output — do not end conversationally or with a question:**
```
Initiative: <name>
Size: <medium/large>
Stack: <one-line summary>
Scope boundary: <in-scope vs out-of-scope in one sentence>
Test runner: <command to run a single test, or "needs setup — first slice should configure test framework">
First slice: <slice name and goal>
Validation command: <exact command>
TDD: mandatory from Slice 1 — all behavioral changes require tests first
Next: /continue-work <initiative>
```

Do not replace this with a conversational summary. Do not end with "let me know if..." or any question. The structured output is mandatory.

---

## Do Not

- End with a conversational message — always use the structured stop output above.
- Implement during bootstrap.
- Modify unrelated code without explicit justification in decisions.md.
- Store temporary findings in CLAUDE.md.
