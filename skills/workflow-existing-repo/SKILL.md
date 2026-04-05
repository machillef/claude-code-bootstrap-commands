---
name: workflow-existing-repo
description: "Bootstrap existing repo: triage size, detect stack, map scope, create docs/ai/, define first slice. Does not implement."
---

> **Platform:** This skill works on Claude Code and Codex. See `references/platform-map.md` for tool mapping.

# Workflow: Bootstrap Existing Repo

## Skill Contents

- `templates/claude-md.md` — copy this when creating CLAUDE.md in target repos
- `templates/slice-format.md` — copy this for each slice definition
- `templates/verification-commands.md` — copy this into scope-map.md

## Inputs

- Initiative name
- Objective (what needs to change and why)
- Key constraints (scope limits, must-not-touch areas)

If any input is missing, infer conservatively from the repo. Do not invent requirements.

**Critical boundary:** This workflow creates documentation only. Do NOT run any execution-loop steps (Steps 0-12). Specifically:
- Do NOT run builds, tests, or validation commands to verify implementation correctness
- Do NOT dispatch arc agents (cpp-reviewer, security-audit, etc.) for code review
- Do NOT apply TDD, debugging, or re-assessment steps
- Running a command to *discover* the stack (e.g., checking versions, reading manifests) is allowed. Running commands to *verify* implementation correctness is not.

Even if the code already exists in the repo, your job is to document the initiative — verification happens when the user runs `/continue`.

**Name collision check:** If `docs/ai/<initiative>-status.md` already exists and contains active slices (Not Started, In Progress, or Needs Fix), warn the user: "An active initiative named `<initiative>` already exists. Use `/continue <initiative>` to resume it, or choose a different name." Do not overwrite active initiative docs.

---

## Step 0: Triage

Classify the change before doing anything else.

| Size | Signals | Path |
|---|---|---|
| **Small** | 1-3 files, follows existing pattern, < 1 day | Stop — tell user to run `/quick` instead |
| **Medium** | Feature-scale, new behavior, 1-3 days | Continue here, create partial docs/ai/ |
| **Large** | Architectural, migration, multi-week, cross-stack | Continue here, create full docs/ai/ |

State your classification to the user before proceeding. If uncertain, present two options — do not guess silently.

If **Small**: stop here. Tell the user to run `/quick <objective>` instead.

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
- Test runner: identify the command to run a single test in isolation (needed for TDD cycle in `/continue`)
- Lint/format tooling

**CI/CD**
- `.github/workflows/`, `.gitlab-ci.yml`, `Jenkinsfile`, `.circleci/`

**Existing Patterns** (read 2-3 representative files, not the whole codebase)
- How is auth applied? (middleware, decorator, guard, manual check)
- How are errors handled? (exceptions, Result type, error codes)
- How is config loaded? (env vars, config files, secrets manager)
- What does the API response shape look like?

**Verification commands:** Copy `templates/verification-commands.md` into `docs/ai/<initiative>-scope-map.md` and fill in with the concrete commands discovered above. Only include phases that have tooling. Do not invent commands — record what actually exists.

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

For **medium** and **large** changes, invoke the `superpowers:brainstorming` skill before creating docs/ai/ files.

The skill will:
- Load any existing docs/ai/ context (scope-map from Step 2, if written early)
- Load CLAUDE.md and project context
- Ask clarifying questions one at a time
- Propose 2-3 approaches with trade-offs
- Present a design for user approval
- Write the validated design to `docs/ai/<initiative>-design.md`
- Run a spec review loop
- Return control here after user approves the spec

**Do not proceed to Step 4 until superpowers:brainstorming completes and the user has approved the design.**

If superpowers is not installed, conduct the design exploration directly: propose 2-3 approaches with trade-offs, discuss with the user, write the design doc to `docs/ai/<initiative>-design.md`, and wait for user approval before proceeding.

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
- **Does not exist:** copy `templates/claude-md.md` from this skill directory and fill in the discovered values.
- **Already exists:** read it. Add only missing sections — do not overwrite or reformat existing content.

**Rules for CLAUDE.md:**
- Stable facts only — stack, structure, build/test commands, observed patterns.
- No rules that duplicate the global `~/.claude/CLAUDE.md` (no testing %, security rules, git workflow, code style).
- 40 lines maximum.
- Patterns section: only include what you actually observed in Step 1 — do not invent or speculate.

**Slice format:** Use `templates/slice-format.md` from this skill directory for each slice in slices.md.

---

## Step 5: Wire Arc Agents

Reference bundled agents in `agents/` for language-specific review and build resolution:

| Agent | Invoke when |
|---|---|
| `cpp-reviewer` | Slice implements C or C++ code |
| `rust-reviewer` | Slice implements Rust code |
| `python-reviewer` | Slice implements Python code |
| `csharp-reviewer` | Slice implements C#/.NET code |
| `typescript-reviewer` | Slice implements TypeScript/JavaScript code |
| `powershell-reviewer` | Slice implements PowerShell scripts |
| `kubernetes-reviewer` | Slice modifies Kubernetes manifests, Helm charts, or YAML configs |
| `cpp-build-resolver` | C++ build fails (CMake, compilation, linker errors) |
| `rust-build-resolver` | Rust build fails (cargo, borrow checker, dependency errors) |
| `security-audit` skill | Slice touches auth, input validation, data persistence, secrets, or external calls |

For languages without a bundled reviewer (e.g., Go, Java), defer to `superpowers:requesting-code-review` for a language-agnostic review. If superpowers is not installed, review your own code using the standard review rubric (correctness, security, testing, maintainability).

---

## Step 6: Define the First Safe Slice

Must:
- Prove the chosen approach is viable (not just "easy")
- Have limited blast radius (reversible)
- Have a clear, runnable validation command
- Not depend on unfinished work elsewhere

State the first slice using `templates/slice-format.md` from this skill directory.

---

## Step 6b: Verify User Story Traceability

Before stopping, verify traceability: every user story from the design doc must be covered by at least one slice. If any stories are uncovered, present the gaps to the user and either add a slice or mark the story as out of scope in the design doc.

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
Next: /continue <initiative>
```

Do not replace this with a conversational summary. Do not end with "let me know if..." or any question. The structured output is mandatory.

---

## Do Not

- End with a conversational message — always use the structured stop output above.
- Implement during bootstrap.
- Modify unrelated code without explicit justification in decisions.md.
- Store temporary findings in CLAUDE.md.
