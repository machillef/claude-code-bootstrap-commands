# Skill Scoring Rubric

## Structural Score (8 points)

| # | Criterion | 1 point if... | How to check |
|---|---|---|---|
| 1 | Has SKILL.md | SKILL.md exists in skill directory | File exists |
| 2 | Description is concise | `description` frontmatter ≤ 25 words | Count words |
| 3 | Description is trigger-focused | Describes WHEN to use, not WHAT it does | Read and assess |
| 4 | Uses folder structure | Directory has at least 1 subdirectory or non-SKILL.md file | List contents |
| 5 | Has templates/examples | Contains `templates/`, `examples/`, `assets/`, or `references/` | Directory exists |
| 6 | Has gotchas/known issues | Has `gotchas/` directory OR "Gotchas"/"Known Issues" section in SKILL.md | Search for section or directory |
| 7 | Has scripts or code | Contains `.sh`, `.js`, `.py`, or `.ps1` files | File extension search |
| 8 | Progressive disclosure | SKILL.md references other files in the skill directory | Grep for file references |

## Content Quality Assessment (qualitative, not scored)

### Red Flags (things to fix)

- **Stating the obvious** — instructions that Claude would follow anyway without the skill
- **Railroading** — overly rigid step sequences that prevent adaptation to context
- **Inline templates** — markdown blocks that should be files Claude copies
- **Orphaned knowledge** — failure patterns in `~/.claude/skills/learned/` that belong in this skill's gotchas
- **Stale content** — references to files/tools/patterns that no longer exist
- **Verbose description** — description is a summary, not a trigger. Should say WHEN, not WHAT

### Green Flags (things to preserve)

- **Real gotchas from failures** — not hypothetical, but from actual usage
- **Scripts Claude composes with** — reduces reconstruction work per invocation
- **Progressive disclosure** — SKILL.md is a map; details are in reference files
- **Clean category fit** — skill fits one Thariq category cleanly
- **Setup/config pattern** — skill handles its own setup needs (config.json, AskUserQuestion)

### Improvement Priority Matrix

| Impact | Type | Examples |
|---|---|---|
| **High** | Missing gotchas | Failure patterns exist in learned/ but not in skill |
| **High** | Inline → template | 10+ line blocks Claude reconstructs each time |
| **Medium** | Description optimization | Trimming for trigger accuracy |
| **Medium** | Adding scripts | Giving Claude code to compose with |
| **Medium** | Orphan consolidation | Learned skills that belong in this skill |
| **Low** | Folder restructure | Moving from flat SKILL.md to folder-as-skill |
| **Low** | Content trimming | Removing obvious/redundant instructions |
