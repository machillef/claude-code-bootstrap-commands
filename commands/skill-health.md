---
description: Audit the structural health of all installed skills against best practices (folder structure, gotchas, templates, description quality). Outputs a scorecard.
---

# Skill Health Check

Audit all installed skills for structural quality. This is NOT a content review — it checks whether skills follow the folder-as-skill pattern and best practices from Thariq's skill design principles.

## Procedure

### Step 1: Discover Skills

Scan these locations for skills:
- `~/.claude/skills/` (user-level, excluding `learned/`)
- `.claude/skills/` (project-level, if exists)

For each skill directory, read `SKILL.md` and list the directory contents.

### Step 2: Score Each Skill

For each skill, evaluate these criteria (1 point each, max 8):

| # | Criterion | How to check |
|---|---|---|
| 1 | **Has SKILL.md** | File exists in skill directory |
| 2 | **Description is concise** | `description` field in frontmatter is ≤ 25 words |
| 3 | **Description is trigger-focused** | Description says WHEN to use, not WHAT it does |
| 4 | **Uses folder structure** | Skill directory contains at least one subdirectory or non-SKILL.md file |
| 5 | **Has templates/examples** | Contains `templates/`, `examples/`, `assets/`, or `references/` directory |
| 6 | **Has gotchas or known issues** | Contains `gotchas/` directory, or a "Gotchas" / "Known Issues" section in SKILL.md |
| 7 | **Has scripts or code** | Contains `.sh`, `.js`, `.py`, or `.ps1` files that Claude can compose with |
| 8 | **Progressive disclosure** | SKILL.md references other files in the skill directory for details (not everything inline) |

### Step 3: Output Scorecard

```
## Skill Health Scorecard — <date>

| Skill | Score | Missing |
|---|---|---|
| execution-loop | 7/8 | scripts |
| code-review | 5/8 | gotchas, scripts, progressive disclosure |
| quick | 3/8 | folder structure, templates, gotchas, scripts, progressive disclosure |
| ... | ... | ... |

### Summary
- Total skills scanned: N
- Average score: X.X/8
- Skills scoring ≤ 3: <list> (need structural improvement)
- Skills scoring ≥ 7: <list> (exemplary)

### Top 3 Recommendations
1. <most impactful improvement across all skills>
2. <second most impactful>
3. <third most impactful>
```

### Step 4: Compare Against Previous Run (if exists)

Check if `.claude/skill-health-history.jsonl` exists. If so, compare current scores against the last entry to show trend.

Append current results:
```jsonl
{"date":"<today>","skills":{"execution-loop":7,"code-review":5,...},"average":5.2}
```

## When to Run

- After adding or modifying skills
- After the arc learning system evolves instincts into skills
- Monthly as a hygiene check
