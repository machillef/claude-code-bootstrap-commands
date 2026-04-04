# Upstream Change Inspection

You are inspecting changes in an upstream repository to determine relevance for the arc plugin.

## Repository
- Name: {{REPO_NAME}}
- Type: {{REPO_TYPE}} (plugin-dependency | source-fork | inspiration)
- Local path: {{REPO_PATH}}

## Changes Since Last Check
{{COMMIT_LOG}}

## Changed Files
{{CHANGED_FILES}}

## Your Task

1. Read each changed file listed above
2. For each change, determine:
   - **What changed:** Summarize in 1-2 sentences
   - **Why it changed:** Infer from commit messages and code context
   - **Relevance to arc:** Categorize as:
     - **HIGH** — Changes to skills/agents/hooks we've absorbed or directly depend on
     - **MEDIUM** — New features in our language set or workflow patterns we use
     - **LOW** — Changes outside our technology scope
     - **INFO** — Version bumps, documentation, CI, cosmetic changes

3. For HIGH relevance items, provide a specific action recommendation:
   - "Update agents/cpp-reviewer.md with these changes: ..."
   - "Review new pattern for possible adoption: ..."
   - "Breaking change — our hooks/safety/X.js needs updating: ..."

## Output Format

```
## {{REPO_NAME}} — Changes Summary

### HIGH Relevance
- [file] <summary> → ACTION: <recommendation>

### MEDIUM Relevance
- [file] <summary> → CONSIDER: <recommendation>

### LOW Relevance
- [file] <summary> (skipped — outside our scope)

### INFO
- <summary of version bumps, docs changes, etc.>
```

If no changes are found in watched paths, report: "No relevant changes since last check."
