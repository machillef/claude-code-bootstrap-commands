---
description: Temporary diversion from the current slice plan. Creates an isolated worktree, does the work, merges back. Use when you want to do something outside the current slice without disrupting the initiative flow.
---

**Request:** $ARGUMENTS

Temporary diversion from the active slice plan. Works in an isolated git worktree, merges back to the working branch when done.

## Parse Arguments

Extract from the request:
- **Initiative name** (required) — which initiative this detour belongs to
- **Detour description** — what the diversion is about
- **Phase hint** — is the user starting a new detour, continuing one, or finishing one?

If the user says "finish detour" or "merge detour" or "complete detour", skip to **Phase: Finish**.
If the user says "continue detour" or "resume detour", skip to **Phase: Continue**.
Otherwise, proceed with **Phase: Start**.

---

## Phase: Start

### 1. Load Initiative State

Read:
- `docs/ai/<initiative>-status.md` — current slice state
- `docs/ai/<initiative>-slices.md` — slice plan

Identify the current in-progress slice (if any). If no initiative docs exist, stop and tell the user to run `/bootstrap-existing` or `/bootstrap-new` first.

### 2. Triage Detour Size

Ask yourself (do not ask the user unless genuinely ambiguous):

- **Small** (< half day): 1-5 files, clear scope, no design needed. A button, a fix, a config tweak, a UI adjustment.
- **Big** (multi-session, days): Touches many files, needs a mini-plan, may span multiple sessions.

State the triage result explicitly before proceeding.

### 3. Pause Current Slice

If a slice is in progress, update `docs/ai/<initiative>-status.md`:

```markdown
### Slice <N>: <name>
**Status:** Paused (detour: <detour-description>)
**Paused at:** <date>
**Resume after:** detour completes
```

Commit this change on the current branch before creating the worktree.

### 4. Safety Check: .worktrees in .gitignore

```bash
git check-ignore -q .worktrees 2>/dev/null
```

If NOT ignored:
1. Add `.worktrees/` to `.gitignore`
2. Commit: `chore: add .worktrees/ to .gitignore`

### 5. Create Worktree

Detect the current branch name:
```bash
CURRENT_BRANCH=$(git branch --show-current)
```

Create worktree branched from the current branch:
```bash
DETOUR_NAME=$(echo "<detour-description>" | tr ' ' '-' | tr '[:upper:]' '[:lower:]' | head -c 50)
git worktree add .worktrees/detour-${DETOUR_NAME} -b detour/${DETOUR_NAME}
```

Report:
```
Worktree created: .worktrees/detour-<name>
Branch: detour/<name> (based on <current-branch>)
Merges back to: <current-branch>
```

### 6. Switch to Worktree

```bash
cd .worktrees/detour-${DETOUR_NAME}
```

Run dependency install if needed (auto-detect: npm install, pip install, dotnet restore, cargo build, go mod download).

Run existing tests to verify clean baseline:
- If tests pass: report ready
- If tests fail: report failures, ask whether to proceed

### 7. Execute the Detour

**Small detour:**
- Find existing patterns (Grep/Glob)
- Apply TDD if behavioral change (write failing test → implement → verify)
- Self-review the diff
- Commit with message: `detour: <description>`

**Big detour:**
- Write a mini-plan: numbered steps with file paths and expected changes. Not full docs/ai/ — just a markdown checklist in a commit message or a `DETOUR-PLAN.md` in the worktree root.
- Execute each step with TDD
- Commit after each logical unit: `detour: <step description>`
- If this spans multiple sessions: leave the worktree in place. The user can resume with `/detour <initiative> continue` or by cd-ing into the worktree directory.

### 8. Self-Review Before Finishing

Review the full diff from the worktree branch:
```bash
git diff $(git merge-base HEAD <current-branch>)..HEAD
```

Check:
- Does it do only what the detour described?
- Security concerns?
- Does it conflict with the paused slice's scope?
- Are tests passing?

---

## Phase: Continue

For multi-session big detours. The worktree and branch already exist.

### 1. Find the Active Detour

```bash
git worktree list
```

Look for worktrees under `.worktrees/detour-*`. If multiple exist, ask the user which one.

### 2. Switch to Worktree

```bash
cd .worktrees/detour-<name>
```

### 3. Load Context

- Read the git log on this branch to see what was done so far
- Read `DETOUR-PLAN.md` if it exists (big detours)
- Read `docs/ai/<initiative>-status.md` to confirm which slice is paused

### 4. Resume Work

Continue executing the mini-plan or the remaining work. Follow the same TDD discipline as Phase: Start, Step 7.

---

## Phase: Finish

### 1. Verify Everything Passes

From the worktree directory, run the full test suite:
```bash
# Auto-detect: npm test, pytest, dotnet test, cargo test, go test ./...
```

If tests fail, fix before proceeding. Do not merge broken code.

### 2. Switch Back to Working Branch

```bash
cd <original-repo-root>
git checkout <working-branch>
```

The working branch name is stored in `docs/ai/<initiative>-status.md` under the paused slice entry, or can be determined from the worktree's base branch:
```bash
git merge-base --fork-point <working-branch> detour/<name>
```

### 3. Merge Detour Branch

```bash
git merge detour/<detour-name> --no-ff -m "merge detour: <description>"
```

Use `--no-ff` to preserve the detour as a visible merge in history.

If merge conflicts occur:
- Resolve them
- Pay special attention to files in the paused slice's scope — the detour should not break the slice's work
- Run tests after resolution

### 4. Clean Up

```bash
git worktree remove .worktrees/detour-<name>
git branch -d detour/<name>
```

Remove `DETOUR-PLAN.md` if it exists in the worktree (it won't be in the main tree since it was in the worktree directory).

### 5. Log Detour in Status

Append to `docs/ai/<initiative>-status.md` using the detour entry format:

```markdown
### Detour: <description>
**Date:** <date>
**Size:** Small | Big
**Branch:** detour/<name> → merged into <working-branch>
**Changes:** <1-3 bullet summary of what was done>
**Tests:** All passing
**Triggered by:** <why the detour was needed>
```

### 6. Restore Paused Slice

Update the paused slice entry in `docs/ai/<initiative>-status.md`:

```markdown
### Slice <N>: <name>
**Status:** In Progress (resumed after detour)
**Resumed at:** <date>
```

Commit: `docs: log detour completion, restore slice <N>`

### 7. Report

```
Detour complete: <description>
Merged into: <working-branch>
Restored: Slice <N> (<slice-name>) is now In Progress
Next: /continue-work <initiative>
```

---

## Rules

- Do not modify docs/ai/ slice definitions. Detours are outside the plan — they don't become slices.
- Do not expand the detour scope. If it grows beyond the original description, stop and discuss with the user.
- Always merge back to the branch you started from, not to main.
- Always run tests before merging. Do not merge broken code.
- For big detours spanning multiple sessions, leave the worktree in place until explicitly finished.
- If the detour reveals something that affects the initiative plan (e.g., "slice 18 is now unnecessary because this detour handled it"), note it in the finish log but do not modify slices.md — let the user decide during `/continue-work`.

## Gotchas

- **Worktree path must be outside the repo's tracked tree.** `.worktrees/` is gitignored, so this is safe. Never create worktrees inside tracked directories.
- **Dependency state.** The worktree shares the git repo but has its own working directory. Node modules, venv, build artifacts need to be installed fresh in the worktree.
- **Merge direction matters.** Always merge `detour/<name>` INTO `<working-branch>`, not the other way around. The working branch is the source of truth.
- **Multiple detours.** Avoid having more than one active detour at a time. If the user tries to start a second detour while one is active, warn them and ask if they want to finish the first one.
- **Detour from main.** If there's no working branch (user is on main), the detour still works — it branches from main and merges back to main. But warn the user that this merges directly to main.
