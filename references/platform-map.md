# Platform Tool Mapping

Arc skills use Claude Code tool names. This reference maps them to Codex equivalents.

## Tool Mapping

| Action | Claude Code | Codex |
|--------|------------|-------|
| **Dispatch subagent** | `Agent` tool with `subagent_type` | Read prompt from `agent-prompts/`, spawn via `/agent worker` with prompt as message |
| **Invoke skill** | `Skill` tool with skill name | Skills auto-discovered from `~/.agents/skills/` — reference by name, model activates automatically |
| **Read file** | `Read` tool | Platform-native file read |
| **Edit file** | `Edit` tool | Platform-native file edit |
| **Write file** | `Write` tool | Platform-native file write |
| **Run command** | `Bash` tool | Platform-native shell execution |
| **Track tasks** | `TodoWrite` tool | `update_plan` |
| **Search files** | `Glob` / `Grep` tools | Platform-native search or `fd` / `rg` via shell |

## Agent Dispatch on Codex

When a skill says "dispatch the `cpp-reviewer` agent":

1. Read `agent-prompts/cpp-review-prompt.md`
2. Fill any template placeholders (file paths, diff content, etc.)
3. Spawn a `worker` agent: `/agent worker` with the filled prompt as the message
4. Wait for the result
5. Close the agent slot when done

## Hook Equivalents on Codex

Codex has no native hook system. Arc's safety hooks are approximated via:

- **`persistent_instructions`** in `.codex/config.toml` — safety rules the model follows as guidance
- **`sandbox_mode`** — `workspace-write` or `read-only` for permission boundaries
- **`approval_policy`** — `on-request` gates risky operations

These are best-effort, not enforcement. The model follows them as strong guidance but they are not system-level gates like Claude Code's PreToolUse hooks.

## Platform Detection

Skills can detect the platform via:
- **Claude Code:** `CLAUDE_PLUGIN_ROOT` environment variable is set
- **Codex:** Running inside Codex agent context (check for Codex-specific env vars or absence of Claude Code vars)

When in doubt, skills should work with either platform's tool names — the model can adapt.
