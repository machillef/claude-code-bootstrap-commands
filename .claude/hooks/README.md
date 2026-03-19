# Bootstrap Workflow Hooks

These hooks automate the self-learning loop. Add them to your `~/.claude/settings.json`.

## Installation

Add these entries to your `~/.claude/settings.json` under the `hooks` key:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Read",
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/.claude/hooks/session-skill-health-check.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Skill",
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/.claude/hooks/post-learn-eval-consolidate.sh"
          }
        ]
      }
    ]
  }
}
```

If you already have `PreToolUse` or `PostToolUse` entries, merge these into the existing arrays.

## What Each Hook Does

### `session-skill-health-check.sh` (PreToolUse → Read)
Fires once per session on the first `Read` tool call. Checks `~/.claude/skill-health-history.jsonl` for the last `/skill-health` run date. If >7 days ago, outputs a reminder. Uses a stamp file to avoid firing on every Read call.

### `post-learn-eval-consolidate.sh` (PostToolUse → Skill)
Fires after any Skill tool call. Checks if the skill invoked was `learn-eval`. If so, outputs a reminder to run `/consolidate-learnings` to merge new patterns into parent skill gotchas.

## The Automated Loop

```
Session starts
    → PreToolUse:Read fires → skill-health reminder (if overdue)

Work happens → execution-loop runs slices

End of Plan detected
    → execution-loop Step 12 auto-invokes /retro
    → /retro extracts learnings → invokes /consolidate-learnings

Anytime learn-eval runs
    → PostToolUse:Skill fires → consolidation reminder
```
