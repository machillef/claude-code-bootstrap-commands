---
description: "Run a structured security audit on the current repository."
---

**Request:** $ARGUMENTS

Delegates to the `security-audit` skill.

## Parse Arguments

- `--comprehensive` → comprehensive mode (all phases, entire repo)
- Any path argument → scope to that directory/file
- No arguments → quick mode, repo-wide

## Procedure

1. Parse mode and scope from arguments
2. Invoke the `security-audit` skill with the parsed mode and scope
3. The skill runs Phases 0-4 and produces a structured report

## Integration

- Can complement the execution-loop's security step with deeper tool-assisted scanning
- Review-loop Pass 3 (Risk + Security) evaluates code during review; `/security` provides proactive tool-assisted scanning independent of a review cycle
