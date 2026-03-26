# Bootstrap Workflow Hooks

These hooks provide automatic reminders for manual workflow steps. When installed as a plugin, all hooks are auto-loaded via `hooks.json` — no manual configuration needed.

## Hook Summary

### Session reminders (async, once per day)

| Hook | Type | Trigger | What it does |
|---|---|---|---|
| `session-skill-health-check.sh` | PreToolUse (Read) | Once per day | Reminds about `/skill-health` if last run was >7 days ago |
| `session-detour-check.sh` | PreToolUse (Read) | Once per day | Warns about active detour worktrees |
| `session-stale-docs-check.sh` | PreToolUse (Read) | Once per day | Warns about stale `docs/ai/` status files |
| `session-retro-reminder.sh` | PreToolUse (Read) | Once per day | Reminds about completed initiatives that need `/retro` |

### Safety guardrails (synchronous, every invocation)

| Hook | Type | Trigger | What it does |
|---|---|---|---|
| `check-careful.sh` | PreToolUse (Bash) | Every Bash call | Warns before destructive commands (`kubectl delete`, `terraform destroy`, `git checkout .`, etc.). Returns `permissionDecision: "ask"` so the user can confirm or cancel. Complements hard denies in `settings.json`. |
| `check-freeze.sh` | PreToolUse (Edit, Write) | Every Edit/Write | Blocks edits outside the freeze boundary set by `/freeze`. Returns `permissionDecision: "deny"` for files outside the boundary. No-op when no freeze is active. |

### Post-action reminders (async)

| Hook | Type | Trigger | What it does |
|---|---|---|---|
| `post-learn-eval-consolidate.sh` | PostToolUse (Skill) | After learn-eval | Reminds to run `/consolidate-learnings` |
| `stop-learn-eval-suggest.sh` | Stop | Session end | Suggests `/everything-claude-code:learn-eval` after meaningful work |
| `stop-detour-reminder.sh` | Stop | Session end | Reminds about active detour worktrees |
| `stop-freeze-reminder.sh` | Stop | Session end | Reminds about active freeze boundary |

Session reminders are async with short timeouts — they never block your workflow. Safety guardrails are synchronous — they must complete before the tool executes.

## For symlink installs (non-plugin)

If you installed via `install.sh` / `install.ps1` instead of as a plugin, hooks need manual wiring. Add these entries to your `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Read",
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/.claude/hooks/session-skill-health-check.sh",
            "async": true, "timeout": 5
          },
          {
            "type": "command",
            "command": "bash ~/.claude/hooks/session-detour-check.sh",
            "async": true, "timeout": 5
          },
          {
            "type": "command",
            "command": "bash ~/.claude/hooks/session-stale-docs-check.sh",
            "async": true, "timeout": 5
          },
          {
            "type": "command",
            "command": "bash ~/.claude/hooks/session-retro-reminder.sh",
            "async": true, "timeout": 5
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/.claude/hooks/check-careful.sh",
            "timeout": 3
          }
        ]
      },
      {
        "matcher": "Edit",
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/.claude/hooks/check-freeze.sh",
            "timeout": 3
          }
        ]
      },
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/.claude/hooks/check-freeze.sh",
            "timeout": 3
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
            "command": "bash ~/.claude/hooks/post-learn-eval-consolidate.sh",
            "async": true, "timeout": 5
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/.claude/hooks/stop-learn-eval-suggest.sh",
            "async": true, "timeout": 5
          },
          {
            "type": "command",
            "command": "bash ~/.claude/hooks/stop-detour-reminder.sh",
            "async": true, "timeout": 5
          },
          {
            "type": "command",
            "command": "bash ~/.claude/hooks/stop-freeze-reminder.sh",
            "async": true, "timeout": 5
          }
        ]
      }
    ]
  }
}
```

Merge these into existing arrays — don't replace them.
