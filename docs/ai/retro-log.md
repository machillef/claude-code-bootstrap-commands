# Retro Log

## learning-system-completion — 2026-04-05

### Metrics

| Metric | Value |
|---|---|
| Slices planned | 4 |
| Slices completed | 4 |
| Completion rate | 100% |
| Total commits | 15 |
| Decisions made | 2 |
| Post-acceptance fixes | 3 |

### Key Learnings

- Dogfooding catches bugs that reviews miss — the .json/.yaml mismatch was invisible to 3 code review passes but immediately visible when actually using the pipeline
- Multi-hook pipelines need round-trip testing: if hook A writes and hook B reads, verify B can parse A's output with adversarial inputs
- DRY violations compound fast in hooks — duplicated YAML parsing in 2 files diverged silently. Extract shared modules early.
- Command names matter more than expected — `/new-feature` felt wrong for 50% of real work (improvements, refactors, audits). Renamed to `/initiative`.
- Plugin marketplace has no URL shortcut — always 2-step: `marketplace add` then `plugin install`
- ECC uninstall leaves hooks in settings.json — manual cleanup required

### Skill Improvements Made

- Gotcha added: `execution-loop/gotchas/pipeline-round-trip-testing.md`
- Shared module extracted: `hooks/lib/instinct-parser.js` (escapeYaml + parseInstinctFrontmatter)
- Shared module extracted: `hooks/lib/project-id.js` (was duplicated in 3 hooks)

### Recommendations for Next Initiative

- Add a "round-trip test" step to the execution-loop for slices that implement pipeline components
- Consider adding a "DRY checkpoint" after each slice: "Does this duplicate logic from earlier slices?"
- For plugin development, always test the install flow on a clean machine before releasing
