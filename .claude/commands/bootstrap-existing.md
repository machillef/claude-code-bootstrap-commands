---
description: Bootstrap an existing-repository initiative using the workflow-existing-repo skill. Triages the request size, discovers the tech stack, maps scope boundaries, creates scaled docs/ai/ control docs, and prepares a safe execution path. Does not implement.
---

# Bootstrap Existing Repo

**Request:** $ARGUMENTS

You are bootstrapping an existing repository for a new initiative. Use the `workflow-existing-repo` skill.

## Before doing anything else: classify the request

Read the request and infer the change size:

- **Small** (1-3 files, follows existing pattern, < 1 day) → Do NOT continue with bootstrap. Tell the user: "This looks like a small change. Run `/quick-change <objective>` instead — it's faster and has less overhead."
- **Medium** (feature-scale, new behavior, 1-3 days) → Continue with bootstrap, create partial docs/ai/
- **Large** (architectural, migration, multi-week) → Continue with bootstrap, create full docs/ai/ and invoke architecture-discovery agent

State your classification and give the user a chance to correct it before proceeding.

## Then follow the workflow-existing-repo skill

Steps in order:
1. Triage (done above)
2. Tech stack detection
3. Map boundaries and contracts
4. Create scaled docs/ai/ initiative files
5. Wire ECC skills where relevant
6. Define the first safe slice
7. Stop in a controlled state

## Output

```
Initiative: <name>
Size: <medium/large>
Stack: <one-line summary>
Scope boundary: <in-scope vs out-of-scope>
docs/ai/ files created: <list>
First slice: <name and goal>
Validation command: <exact command>
Next: /continue-work <initiative>
```

## Rules

- Do not create or modify CLAUDE.md in the target repo.
- Do not implement during bootstrap.
- Do not widen scope beyond what was stated.
