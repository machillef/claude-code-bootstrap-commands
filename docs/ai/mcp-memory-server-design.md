# MCP Memory Server — Design

## Objective

Give Claude Code an agent-callable memory tool (inspired by Hermes) that stores observations and user preferences at `~/.claude/arc/memory/`, with character budgets, injection scanning, and dual-store separation.

## Why

Claude Code's native `/memory` works but lacks:
- User/agent note separation
- Character budget (curation pressure)
- Injection/exfiltration scanning before accepting entries
- Usage stats

Arc's instinct system captures automatic patterns but can't store explicit knowledge like "user prefers pnpm" or "this project uses tabs".

## Architecture

```
mcp-server/
├── server.js          ← stdio MCP server (~150 lines)
├── memory-store.js    ← read/write/scrub logic
└── package.json       ← minimal, @modelcontextprotocol/sdk dependency

~/.claude/arc/memory/
├── NOTES.md           ← agent's observations (env facts, tool quirks, conventions)
└── USER.md            ← user preferences (style, workflow habits, pet peeves)
```

## Tools Exposed

| Tool | Args | Description |
|------|------|-------------|
| `arc_memory_add` | `target: "notes"\|"user"`, `content: string` | Append an entry |
| `arc_memory_replace` | `target`, `old_text: string`, `new_text: string` | Replace by substring match |
| `arc_memory_remove` | `target`, `text: string` | Remove by substring match |
| `arc_memory_read` | `target` | Read full store with usage stats |

## Character Budgets (Hermes-inspired)

| Store | Budget | Entry delimiter |
|-------|--------|----------------|
| NOTES.md | 2,200 chars | `\n§\n` (section sign) |
| USER.md | 1,375 chars | `\n§\n` |

When budget would be exceeded: return error with current usage, suggest replace/remove first.

## Content Security

Before accepting any `add` or `replace`, scan for:
- Prompt injection: "ignore previous instructions", "you are now", "system prompt override"
- Data exfiltration: curl/wget with env vars, cat on credential files
- Invisible unicode: zero-width spaces, directional overrides (U+200B-U+200F, U+202A-U+202E, U+2060, U+FEFF)
- Reuse `hooks/lib/secret-patterns.js` for secret detection

Reject with explicit error naming the threat pattern.

## Integration

Register in plugin config or `.mcp.json`:
```json
{
  "mcpServers": {
    "arc-memory": {
      "command": "node",
      "args": ["<plugin-root>/mcp-server/server.js"]
    }
  }
}
```

The ambient-learning-nudge hook already reads from `~/.claude/arc/` — add `memory/NOTES.md` and `memory/USER.md` to its scan.

## What This Does NOT Replace

- Claude Code's native `/memory` — continues to work alongside
- Arc instincts — automatic pattern detection continues independently
- docs/ai/ — initiative management is separate from memory

The agent chooses: use `/memory` for Claude Code-native storage, or `arc_memory_add` for the structured dual-store with budgets and scanning.
