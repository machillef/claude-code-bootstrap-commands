# Learning System Completion — Slices

## Slice 1: Enhance session-end-observer to create instincts

**Goal:** The observer detects patterns in observations and creates instinct YAML files.

**Files:** `hooks/learning/session-end-observer.js`, `learning/templates/instinct.yaml`

**What "done" means:**
- Observer reads observations.jsonl
- Detects repeated tool patterns (same tool sequence appearing 3+ times)
- Detects error-recovery patterns (failed tool call followed by successful alternative)
- Creates instinct YAML files at `~/.claude/arc/projects/<hash>/instincts/`
- Existing instincts with matching triggers get confidence bumped (not duplicated)
- New instincts start at confidence 0.3

**Validation:** `node -c hooks/learning/session-end-observer.js` passes. Manual inspection: after a session with 20+ observations, instinct files appear in the project's instincts/ directory.

## Slice 2: Create /instinct-status command

**Goal:** Users can see what the system has learned.

**Files:** `commands/instinct-status.md`

**What "done" means:**
- Command reads instincts from project scope and global scope
- Displays table: id, trigger, confidence, domain, scope, last_seen
- Sorts by confidence descending
- Shows count of project vs global instincts

**Validation:** Command file exists with valid frontmatter.

## Slice 3: Create /evolve, /promote, /prune commands

**Goal:** Users can manage the instinct lifecycle.

**Files:** `commands/evolve.md`, `commands/promote.md`, `commands/prune.md`

**What "done" means:**
- `/evolve` reads instincts, clusters by domain, proposes skill creation
- `/promote` finds project instincts with confidence >= 0.8, copies to global
- `/prune` deletes instincts older than 30 days with confidence < 0.5
- All three produce structured output

**Validation:** Command files exist with valid frontmatter. README updated from "planned" to available.

## Slice 4: Update README and cleanup

**Goal:** Documentation reflects reality. Cleanup loose ends.

**Files:** `README.md`, delete `feature/v2` branch, remove empty `tests/`

**What "done" means:**
- README "Planned maintenance commands" section updated to show commands as available
- feature/v2 branch deleted (local + remote)
- Empty tests/ directory removed or repurposed
