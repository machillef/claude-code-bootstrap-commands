# Arc v2.0.0 Migration Plan

## Context

Migrate `bootstrap-commands` (v1.6.0) to `arc` (v2.0.0) — an in-place repo transformation that:
- Removes the everything-claude-code (ECC) dependency entirely, absorbing needed agents/hooks
- Keeps superpowers as an external plugin (orchestration/discipline split)
- Adds Hermes-inspired self-learning (instinct architecture + ambient prompt nudge)
- Renames all commands to shorter, memorable names
- Adds Codex as first-class secondary platform (three-layer architecture)
- Restructures repo with Node.js hooks (cross-platform: macOS + Windows/WSL)

**Branch:** `feature/v2` from `main`

---

## Phase 1: Branch + Plugin Identity

**Goal:** Establish v2 branch and rename the plugin.

**Files to modify:**
- `.claude-plugin/plugin.json` — name: `"arc"`, version: `"2.0.0"`, update description/keywords
- `.claude-plugin/marketplace.json` — same updates, plugin name `"arc"`
- `CLAUDE.md` — replace "bootstrap-commands" references with "arc", update command names
- `.gitignore` — add `node_modules/`, `learning/observations/`

**Verify:** `jq .name .claude-plugin/plugin.json` → `"arc"`, `jq .version` → `"2.0.0"`

---

## Phase 2: Deletions

**Goal:** Remove everything that won't exist in v2.

**Delete directories:**
- `codex/` — entire directory (11 namespaced Codex skills, replaced by platform-agnostic approach)
- `skills/brainstorm-design/` — deferred to superpowers:brainstorming
- `skills/systematic-debugging/` — deferred to superpowers:systematic-debugging

**Delete legacy install scripts:**
- `install.sh`, `install.ps1`, `install-all.sh`, `install-all.ps1`
- `install-codex.sh`, `install-codex.ps1`, `uninstall.sh`, `uninstall.ps1`

**Delete all 10 bash hooks:**
- `hooks/check-careful.sh`, `hooks/check-freeze.sh`
- `hooks/post-learn-eval-consolidate.sh`
- `hooks/session-detour-check.sh`, `hooks/session-retro-reminder.sh`
- `hooks/session-skill-health-check.sh`, `hooks/session-stale-docs-check.sh`
- `hooks/stop-detour-reminder.sh`, `hooks/stop-freeze-reminder.sh`, `hooks/stop-learn-eval-suggest.sh`

**Delete deprecated commands:**
- `commands/consolidate-learnings.md` — replaced by learning system
- `commands/freeze.md`, `commands/unfreeze.md` — dropped feature

**Delete:** `TESTING.md`

**Verify:** All deleted paths return "not found". Remaining structure intact.

---

## Phase 3: Command Renames

**Goal:** Rename command files to v2 names. Content updates come later (Phase 7).

| Old | New |
|-----|-----|
| `commands/bootstrap-existing.md` | `commands/new-feature.md` |
| `commands/bootstrap-new.md` | `commands/new-project.md` |
| `commands/continue-work.md` | `commands/continue.md` |
| `commands/loop-work.md` | `commands/loop.md` |
| `commands/quick-change.md` | `commands/quick.md` |
| `commands/fix-bugs.md` | `commands/fix.md` |
| `commands/security-audit.md` | `commands/security.md` |
| `commands/ubiquitous-language.md` | `commands/glossary.md` |
| (kept) | `commands/review-loop.md` |
| (kept) | `commands/detour.md`, `commands/retro.md` |
| (kept) | `commands/skill-health.md`, `commands/skill-improve.md` |
| (new) | `commands/upstream.md` (stub) |

**Keep:** `commands/templates/quick-change-log-entry.md`

**Verify:** 14 `.md` files in `commands/`, correct names.

---

## Phase 4: Agents (parallel with Phase 5 & 6)

**Goal:** Populate agents/ with 11 agents + create agent-prompts/ directory.

### 4a. Copy 7 from ECC

Source: `/Users/amoschos/projects/everything-claude-code/agents/`

| File | Size | Modifications |
|------|------|---------------|
| `cpp-reviewer.md` | ~2.3KB | Remove ECC skill references |
| `rust-reviewer.md` | ~3.2KB | Same |
| `python-reviewer.md` | ~2.8KB | Same |
| `csharp-reviewer.md` | ~2.9KB | Same |
| `typescript-reviewer.md` | ~4.5KB | Same, remove frontend-patterns/backend-patterns refs |
| `cpp-build-resolver.md` | ~2.1KB | Remove ECC refs |
| `rust-build-resolver.md` | ~3.8KB | Same |

For all: keep review rubrics intact, keep tools/model frontmatter, remove `skill:` references to ECC skills.

### 4b. Create 2 new agents

- `agents/powershell-reviewer.md` — PSScriptAnalyzer, approved verbs, pipeline efficiency, credential exposure, try/catch/finally, -ErrorAction patterns
- `agents/kubernetes-reviewer.md` — security context, resource limits, RBAC, secrets, network policies, image pinning, probes, PDB

### 4c. Create agent-prompts/ directory

9 prompt fragment files — extracted review rubrics for use by review-loop subagent dispatch and Codex agent wrappers. One per reviewer + build resolver.

**Verify:** 11 agents in `agents/`, 9 prompts in `agent-prompts/`, no "everything-claude-code" references.

---

## Phase 5: Node.js Hooks (parallel with Phase 4 & 6)

**Goal:** Replace all bash hooks with 13 Node.js hooks. Most complex phase.

### Directory structure
```
hooks/
├── hooks.json              # New registry
├── safety/
│   ├── block-no-verify.js        # BLOCKING — check for --no-verify flag
│   ├── config-protection.js      # BLOCKING — adapted from ECC scripts/hooks/config-protection.js
│   ├── destructive-guard.js      # BLOCKING — merge check-careful.sh + ECC governance-capture.js patterns
│   ├── commit-quality.js         # BLOCKING — adapted from ECC scripts/hooks/pre-bash-commit-quality.js
│   ├── outside-project-warn.js   # ADVISORY — warn on Edit/Write outside git root
│   └── broad-git-add-warn.js     # ADVISORY — warn on git add -A / git add .
├── operational/
│   ├── stale-docs-check.js       # Rewrite of session-stale-docs-check.sh
│   ├── detour-check.js           # Rewrite of session-detour-check.sh
│   ├── retro-reminder.js         # Rewrite of session-retro-reminder.sh
│   └── desktop-notify.js         # NEW — macOS osascript / Windows BurntToast
└── learning/
    ├── observation-capture.js    # Rewrite of ECC observe.sh in Node.js (~400 lines → Node)
    ├── session-end-observer.js   # NEW — Stop hook, Haiku observer processes observations
    └── ambient-learning-nudge.js # SessionStart, injects recent instincts + "learn proactively" guidance
```

### Source material for adaptation

| Our hook | Source | Key changes |
|----------|--------|-------------|
| `block-no-verify.js` | NEW (doesn't exist in ECC) | Simple regex check on stdin command |
| `config-protection.js` | ECC `scripts/hooks/config-protection.js` | Remove `ECC_` env vars, keep PROTECTED_FILES list |
| `destructive-guard.js` | ECC `scripts/hooks/governance-capture.js` + our `check-careful.sh` | Merge secret patterns + destructive commands. Add K8s/Docker/Helm commands |
| `commit-quality.js` | ECC `scripts/hooks/pre-bash-commit-quality.js` | Remove ECC env vars, keep staged-file scanning + secret detection |
| `observation-capture.js` | ECC `skills/continuous-learning-v2/hooks/observe.sh` | Full rewrite: bash→Node.js, project hash via git remote, secret scrubbing, JSONL rotation |

### hooks.json structure

**PreToolUse matchers:** Bash (4 safety hooks), Edit (2: config-protection, outside-project-warn), Write (2: same), Read (3 operational, session-once), `*` (2 learning: observation-capture, ambient-nudge)
**PostToolUse:** `*` (observation-capture)
**Stop:** desktop-notify, session-end-observer

Note: Claude Code uses separate matcher entries for Edit and Write (not combined `Edit|Write`).

### Risks
- `observation-capture.js` is the riskiest — 400-line bash→Node rewrite. Mitigate with unit tests for each function.
- `session-end-observer.js` is speculative. Ship as graceful no-op when observations dir is empty.

**Verify:** 13 JS files, all pass `node -c`, hooks.json is valid JSON, each blocking hook exits 2 to block / 0 to allow.

---

## Phase 6: Skills Updates (parallel with Phase 4 & 5)

**Goal:** Remove ECC dependencies from all skills, add platform detection, create upstream-sync skill.

### 6a. execution-loop/SKILL.md (largest change)

**Lines 140-197 — Step 6 rewrite:**
- **Replace** "ECC Agents" table (lines 150-159) with "Arc Agents" table referencing our agents:
  - `<lang>-reviewer` → Slice implements code in that language
  - `<lang>-build-resolver` → Build fails for that language
  - `security-audit` skill → Slice touches auth/input/persistence/external calls
- **Delete** "code-foundations Skills" table (lines 167-176) entirely
- **Simplify** Fallback section (lines 194-196) — our agents are always bundled, no availability check needed. Keep fallback only for languages we don't have reviewers for → defer to superpowers:requesting-code-review
- **Remove** the `ls .claude/agents/` check (lines 142-146)

**Step 8 update:** Replace `systematic-debugging` invocation with "Invoke `superpowers:systematic-debugging` skill. If superpowers not installed, apply 4-phase debugging directly."

**Step 11 update:** Replace `learn-eval` reference with "arc learning system captures patterns automatically via hooks."

**Add platform detection preamble** after frontmatter.

### 6b-e. Other skills

- `workflow-existing-repo/SKILL.md` — Replace `brainstorm-design` → `superpowers:brainstorming`, replace "Wire ECC Skills" → "Wire Arc Agents"
- `workflow-new-repo/SKILL.md` — Same pattern
- `review-loop/SKILL.md` — Add platform detection preamble (no ECC refs to remove)
- `ubiquitous-language/SKILL.md`, `security-audit/SKILL.md` — Add platform detection preamble

### 6f. Create skills/upstream-sync/

New `SKILL.md`:
1. Load `manifests/upstream-tracking.json`
2. For each tracked repo: `git fetch`, `git log <last_sha>..HEAD -- <watch_paths>`
3. Spawn Opus agents to deeply inspect changes
4. Categorize: relevant (matches user's languages/workflows) vs irrelevant
5. Present structured recommendations
6. Update `last_checked_sha` after user review

### 6g. Create manifests/upstream-tracking.json

Track superpowers (plugin dependency), ECC (source fork — absorbed assets), hermes-agent (inspiration). Include `watch_paths`, `ignore_paths`, `last_checked_sha`.

**Verify:** `rg "everything-claude-code|ECC" skills/` → zero matches (except historical gotchas). `rg "brainstorm-design" skills/` → zero. Every skill has "Platform Detection" section.

---

## Phase 7: Command Content Updates (requires Phase 4+5+6)

**Goal:** Update all command files to use new names and remove ECC references.

### Global search-and-replace across all commands:

| Old reference | New reference |
|---------------|---------------|
| `/bootstrap-existing` | `/new-feature` |
| `/bootstrap-new` | `/new-project` |
| `/continue-work` | `/continue` |
| `/loop-work` | `/loop` |
| `/quick-change` | `/quick` |
| `/fix-bugs` | `/fix` |
| `/security-audit` | `/security` |
| `/ubiquitous-language` | `/glossary` |
| `/consolidate-learnings` | (remove reference) |
| `ECC wiring` | `Arc agent wiring` |
| `ECC delegation` | `Arc agent delegation` |
| `everything-claude-code:learn-eval` | (remove reference) |

### Write commands/upstream.md content

```markdown
---
description: Check upstream repos (superpowers, ECC, hermes) for relevant changes and propose sync actions.
---

**Check:** $ARGUMENTS

Use the `upstream-sync` skill. Follow it exactly.
```

**Verify:** `rg "bootstrap-existing|bootstrap-new|continue-work|loop-work|quick-change|fix-bugs|security-audit|ubiquitous-language|consolidate-learnings|everything-claude-code" commands/` → zero matches.

---

## Phase 8: Learning System + Codex Layer (requires Phase 7)

### 8a. Learning system structure

Create `learning/config.json`:
```json
{
  "version": "1.0",
  "observer": {
    "enabled": true,
    "min_observations_before_analysis": 20,
    "confidence_threshold_for_nudge": 0.5
  },
  "instinct": {
    "default_scope": "project",
    "promotion_threshold": 0.8,
    "promotion_min_projects": 2,
    "max_age_days_pending": 30
  }
}
```

Create `learning/templates/instinct.yaml` — template for new instincts with id, trigger, confidence, domain, scope, project_id, evidence.

### 8b. Platform reference

Create `references/platform-map.md` — Claude Code ↔ Codex tool mapping (Agent→subagent spawn, Edit→file ops, Skill→native discovery, Hooks→persistent_instructions).

### 8c. Codex layer

Update `.codex/config.toml`:
- Add `persistent_instructions` with safety rules (equivalent to blocking hooks)
- Update agent references

Update `.codex/AGENTS.md`:
- Replace "bootstrap-commands" → "arc"
- Update command references to v2 names
- Remove ECC references

Create `.codex-plugin/plugin.json`:
```json
{ "name": "arc", "version": "2.0.0", "description": "..." }
```

**Verify:** Valid JSON/TOML for all config files. `references/platform-map.md` exists.

---

## Phase 9: Documentation + Installation (final)

### 9a. Rewrite README.md

- Header: "arc — Disciplined Development Workflows for Claude Code & Codex"
- Quick-reference card:
  ```
  Starting something?  →  /new-feature or /new-project
  Working on it?       →  /continue or /loop
  Something broke?     →  /fix
  Need a review?       →  /review-loop
  Security concern?    →  /security
  Need a sidebar?      →  /detour
  Done with it?        →  /retro
  Small tweak?         →  /quick
  Domain modeling?     →  /glossary
  Meta-maintenance?    →  /skill-health, /skill-improve
  Check upstream?      →  /upstream
  ```
- Architecture overview, installation, migration from v1, platform support

### 9b. Update docs/ai/README.md

Add tiered model:
- **Quick** (`/quick`): single entry in `quick-changes-log.md`
- **Standard** (`/new-feature` medium scope): 4 files — status, slices, design, decisions
- **Full** (`/new-feature` large scope, `/new-project`): all 10 files

### 9c. Create scripts/install.js

Cross-platform Node.js installer:
1. Detect platform (macOS/Linux/WSL/Windows)
2. Pre-flight: detect ECC → warn and recommend `ecc-removal-check.js`
3. Pre-flight: detect v1 → offer uninstall first
4. Install plugin (symlinks for dev, copy for release)
5. Set up MCP servers (GitHub, Context7, Playwright)
6. Print quick-reference card

### 9d. Create scripts/uninstall.js

Remove all arc artifacts. Prompt: "Keep learned instincts? [y/n]"

### 9e. Create scripts/ecc-removal-check.js

Diagnostic only — checks for ECC in plugins, hooks, settings, MCP servers, CLAUDE.md. Outputs recommended removal commands. Does NOT execute anything.

### 9f. Final sweep

`rg "bootstrap-commands" . --type md --type json --type js --type toml` → only historical/changelog references.

**Verify full structure:**
- 7 skill directories
- 11 agents + 9 agent-prompts
- 14 commands
- 13 hooks (6 safety + 4 operational + 3 learning)
- Plugin metadata: `arc` v2.0.0

---

## Phase Dependency Graph

```
Phase 1 (Identity)
    ↓
Phase 2 (Deletions)
    ↓
Phase 3 (Renames)
    ↓
  ┌─┼─┐
  ↓ ↓ ↓    ← PARALLEL
  4 5 6    (Agents, Hooks, Skills)
  └─┼─┘
    ↓
Phase 7 (Command Content)
    ↓
Phase 8 (Learning + Codex)
    ↓
Phase 9 (Docs + Install)
```

Phases 4, 5, 6 are independent and can run in parallel.

---

## Risk Areas

| Risk | Impact | Mitigation |
|------|--------|------------|
| `observation-capture.js` rewrite (bash→Node, ~400 lines) | Learning system broken | Unit tests for each function (hash, scrub, rotate) |
| `session-end-observer.js` is speculative | No instincts generated | Graceful no-op when observations empty |
| Breaking existing v1 users | Lost commands | install.js prints old→new name mapping |
| Codex layer issues | Home workflow broken | Ship Codex as separate follow-up patch if needed |
