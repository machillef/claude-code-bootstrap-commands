# Gotcha Consolidation Prompt

Run this periodically to consolidate orphaned learned skills into parent skill gotchas.

## What to do

1. **Scan learned skills:**
   - Read all files in `~/.claude/skills/learned/`
   - Read all files in `.claude/skills/learned/` (project-level)

2. **For each learned skill, determine its parent:**
   - Does it describe an execution-loop failure? → `execution-loop/gotchas/`
   - Does it describe a code-review pattern? → `code-review/references/`
   - Does it describe a debugging technique? → `execution-loop/gotchas/` (debugging patterns are used by `superpowers:systematic-debugging`)
   - Does it describe a UI/CSS/Tailwind issue? → `ux-craft/references/`
   - Does it describe a portal-specific issue? → `portal-qa/` or `portal-ui/`
   - Does it describe a standalone runbook? → Promote to its own skill
   - No clear parent? → Leave in learned/

3. **Consolidate:**
   - Create a gotcha file in the parent skill with the key information
   - Keep the learned skill file as-is (don't delete — it may be symlinked or referenced)
   - Add a note to the learned skill: `Consolidated into: <parent-skill>/gotchas/<filename>`

4. **Report what was consolidated and what was left orphaned.**

## Integration with Learning System

The arc learning system captures patterns automatically via observation hooks. Run this consolidation step periodically to ensure patterns are placed in the right parent skill location rather than left orphaned in `learned/`.
