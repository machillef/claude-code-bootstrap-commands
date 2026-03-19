---
name: skill-evolve
description: "Audit and improve Claude Code skills using Thariq + Karpathy patterns. Single skill or all skills. Sub-agents for parallel audits."
---

# Skill Evolve

Audit and iteratively improve Claude Code skills against proven design patterns. Supports two modes:

- **Single skill:** `/skill-evolve code-review` — deep audit + improvement of one skill
- **All skills:** `/skill-evolve` — parallel audit of all installed skills, ranked improvement plan

## Skill Contents

- `references/thariq-skill-patterns.md` — structural best practices from Anthropic's internal skill usage
- `references/karpathy-loop-patterns.md` — autoresearch principles adapted for skill improvement
- `references/scoring-rubric.md` — the 8-point structural rubric + content quality assessment
- `templates/audit-report.md` — per-skill audit output format
- `templates/improvement-plan.md` — consolidated plan format for all-skills mode

## State (persistent across invocations)

State is stored in `~/.claude/skill-evolve-state/` (not in the skill directory — survives upgrades):
- `pending-improvements.md` — what remains from the last run
- `improvement-log.jsonl` — append-only history of all improvements made

On first run, create the state directory if it doesn't exist.

---

## Mode Detection

Parse the input:
- **No arguments** → All-skills mode
- **Skill name provided** (e.g., `code-review`, `execution-loop`) → Single-skill mode
- **Path provided** (e.g., `~/.claude/skills/code-review/`) → Single-skill mode, use path directly

---

## Single-Skill Mode

### Step 1: Load Context

1. Read `references/scoring-rubric.md` — scoring criteria
2. Read `references/thariq-skill-patterns.md` — what good looks like
3. Read `~/.claude/skill-evolve-state/pending-improvements.md` — what was deferred last time for this skill
4. Locate the skill: check `~/.claude/skills/<name>/`, then `.claude/skills/<name>/`
5. Read the skill's entire directory: SKILL.md + all subdirectories and files

### Step 2: Audit

Score the skill against the 8 structural criteria from `references/scoring-rubric.md`.

Then assess content quality:
- **Category fit:** which of the 9 Thariq categories does this skill fit? Does it straddle multiple?
- **Red flags:** stating the obvious, railroading, inline templates, orphaned knowledge, stale content, verbose description
- **Green flags:** real gotchas, scripts, progressive disclosure, clean category fit

Check for orphaned learned skills that belong here:
```bash
ls ~/.claude/skills/learned/ 2>/dev/null
ls .claude/skills/learned/ 2>/dev/null
```
Read each and determine if any relate to the skill being audited.

### Step 3: Produce Audit Report

Output using `templates/audit-report.md` format. Include pending items from previous runs.

### Step 4: Propose Improvements

Rank the top 3 improvements by impact (using the priority matrix from `references/scoring-rubric.md`).

For each improvement, describe:
- What to change
- Why (which Thariq principle it addresses)
- Expected score impact

**Present the plan and wait for user approval.** Do not implement without confirmation.

### Step 5: Implement Approved Changes

For each approved improvement:
1. Make the change
2. Show the diff
3. Re-score to verify improvement

### Step 6: Update State

Append to `~/.claude/skill-evolve-state/improvement-log.jsonl`:
```jsonl
{"date":"<today>","skill":"<name>","change":"<description>","score_before":<N>,"score_after":<N>,"status":"applied|rejected|deferred"}
```

Update `~/.claude/skill-evolve-state/pending-improvements.md`:
- Remove items that were addressed
- Add any new items discovered during the audit but not prioritized
- Keep items that were deferred

### Step 7: Self-Check

After completing improvements, re-read the skill and ask:
- Did the changes actually improve it, or just add complexity?
- Is there a remaining gap that should be noted for next time?
- Does this skill now follow Thariq's simplicity principle?

If the skill still has gaps after this run, log them in `pending-improvements.md` with the skill name and specific gap.

---

## All-Skills Mode

### Step 1: Discover Skills

Scan these locations:
```bash
ls -d ~/.claude/skills/*/ 2>/dev/null | grep -v learned
ls -d .claude/skills/*/ 2>/dev/null | grep -v learned
```

Exclude: `learned/` directories, plugin skills (check if symlinked to a plugin path).

### Step 2: Load Context

1. Read `references/scoring-rubric.md`
2. Read `references/thariq-skill-patterns.md`
3. Read `~/.claude/skill-evolve-state/pending-improvements.md`

### Step 3: Parallel Audit via Sub-Agents

Dispatch sub-agents to audit skills in parallel. Each sub-agent:
- Receives the scoring rubric and Thariq patterns as context
- Audits 3-5 skills
- Returns audit reports in `templates/audit-report.md` format

**Sub-agent prompt template:**

```
You are auditing Claude Code skills for structural quality and content.

Read the scoring rubric and Thariq patterns provided, then audit each of these skills:
<list of skill paths>

For each skill:
1. Read the entire skill directory (SKILL.md + all files)
2. Score against the 8 structural criteria
3. Assess content quality (red flags, green flags)
4. Check ~/.claude/skills/learned/ for orphaned patterns belonging to this skill
5. Identify top 3 improvements ranked by impact

Output one audit report per skill using this format:
<paste templates/audit-report.md>

Reference material:
<paste references/scoring-rubric.md>
<paste references/thariq-skill-patterns.md>
```

**Batching strategy:**
- ≤ 5 skills total: no sub-agents, audit directly
- 6-15 skills: 3 sub-agents, ~5 skills each
- 16+ skills: 5 sub-agents, split evenly

### Step 4: Consolidate Results

Collect all audit reports. Produce a consolidated improvement plan using `templates/improvement-plan.md`:
- Rank ALL improvements across ALL skills by impact
- Present the top 5-10 as the priority list
- Defer the rest to `pending-improvements.md`

### Step 5: Present Plan

Show the consolidated plan. Wait for user to approve which improvements to implement.

### Step 6: Implement + Log

Same as single-skill Steps 5-7, but for each approved improvement across skills.

### Step 7: Update State

Same as single-skill Step 6, but for all skills audited.

Append summary to improvement-log:
```jsonl
{"date":"<today>","mode":"all","skills_audited":<N>,"avg_score_before":<N.N>,"avg_score_after":<N.N>,"improvements_applied":<N>,"improvements_deferred":<N>}
```

---

## Self-Improvement

This skill audits itself. When running in all-skills mode, `skill-evolve` is included in the scan. If it identifies improvements to its own references, templates, or rubric, it logs them in `pending-improvements.md` like any other skill.

The meta-loop:
```
skill-evolve audits all skills (including itself)
    → finds gap in its own scoring rubric
    → logs to pending-improvements.md
    → next run picks it up
    → improves its own rubric
    → future audits are more accurate
```

## Gotchas

- **Don't over-score structure at the expense of content.** A skill with 8/8 structure but bad instructions is worse than 5/8 with excellent gotchas. Structure enables; content delivers.
- **Don't add folders for the sake of scoring.** An empty `gotchas/` directory with a README that says "none yet" is worse than no gotchas directory. Only create structure when there's content to put in it.
- **Check before recommending script additions.** Not every skill benefits from scripts. A skill that's pure instructions (like brainstorm-design) doesn't need a .sh file.
- **Respect the simplicity criterion.** Per Karpathy: "removing code for same results = always a win." The same applies to skill content. If you can remove instructions without degrading quality, that's an improvement even if it lowers the word count.
- **Pending improvements decay.** An item in pending-improvements.md that's survived 3+ runs without being prioritized should be re-evaluated — it might no longer be relevant, or it might need to be rephrased as a higher priority.

## Rules

- Do not implement changes without user approval.
- Do not modify skills from plugins (symlinked to plugin directories) — flag them as read-only in the audit.
- Do not count learned/ skills in the audit — they're inputs to consolidation, not skills to improve.
- Do not force-create structure (empty gotchas/, templates/) just to increase the score.
- Always show the diff before and after for each change.
