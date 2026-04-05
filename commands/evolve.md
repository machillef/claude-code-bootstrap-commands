---
description: "Cluster related instincts by domain and propose evolved skills, commands, or agents."
---

**Scope:** $ARGUMENTS

Your first output line must be:
```
Analyzing instincts for evolution opportunities...
```

## Procedure

### 1. Load All Instincts

Read all `.yaml` files from:
- `~/.claude/arc/projects/<hash>/instincts/` (current project)
- `~/.claude/arc/instincts/global/`

### 2. Cluster by Domain

Group instincts by their `domain` field (code-style, testing, git, debugging, workflow, security, tooling). For each cluster with 3+ instincts:

- Identify the common theme
- Propose what the cluster could become:
  - A **gotcha** file in an existing skill's `gotchas/` directory
  - A **reference** file in an existing skill's `references/` directory
  - A new **skill** if the cluster represents a complete workflow
  - A new **command** if the cluster represents a user-invokable action

### 3. Present Proposals

```
EVOLUTION PROPOSALS
==================

Cluster: debugging (5 instincts, avg confidence: 0.6)
  Instincts:
    - "When Bash fails with permission" (0.7)
    - "When build errors mention missing header" (0.5)
    - "Switch to Edit when Write fails on existing file" (0.6)
  Proposal: Add gotcha file to ~/.claude/arc/evolved/gotchas/common-tool-failures.md
  Action: [approve / skip / modify]

Cluster: git (3 instincts, avg confidence: 0.8)
  Instincts:
    - "Always use specific file paths with git add" (0.9)
    - "Check branch before committing" (0.8)
    - "Pull before push on shared branches" (0.7)
  Proposal: These are already covered by safety hooks. Mark as consolidated.
  Action: [approve / skip / modify]
```

### 4. Execute Approved Proposals

**Privacy rule:** All evolved content is written to `~/.claude/arc/evolved/`, NEVER inside the repo. This prevents learned data from being committed to public repositories. The structure mirrors the skill layout:
```
~/.claude/arc/evolved/
  gotchas/
  references/
  skills/
```

For each approved proposal:
- Create the gotcha/reference/skill file under `~/.claude/arc/evolved/`
- Mark the source instincts with `evolved_into: <file-path>` in their YAML
- Do NOT delete the instincts — they continue to track confidence

### 5. Report

```
EVOLUTION COMPLETE
==================
Proposals: <N> presented, <M> approved, <K> skipped
Files created: <list>
Instincts evolved: <count> (still active for confidence tracking)
```

## Rules

- Only propose evolution for clusters with 3+ instincts
- Never auto-approve — always present to the user
- Instincts are never deleted during evolution, only annotated
