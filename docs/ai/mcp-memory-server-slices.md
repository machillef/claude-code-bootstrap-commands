# MCP Memory Server — Slices

## Slice 1: Core MCP server with dual-store read/write

**Goal:** A working MCP server that responds to `arc_memory_add` and `arc_memory_read` via stdio.

**Files:** `mcp-server/server.js`, `mcp-server/memory-store.js`, `mcp-server/package.json`

**Done when:**
- Server starts, registers 4 tools via MCP protocol
- `arc_memory_add("notes", "test entry")` appends to `~/.claude/arc/memory/NOTES.md`
- `arc_memory_read("notes")` returns content with usage stats (chars used / budget)
- Entries delimited by `§` separator
- File permissions: 0o700 dirs, 0o600 files

## Slice 2: Character budgets + replace/remove

**Goal:** Budget enforcement and entry mutation.

**Files:** `mcp-server/memory-store.js`

**Done when:**
- `arc_memory_add` rejects when budget would be exceeded (returns usage + suggestion)
- `arc_memory_replace` finds entry by substring, replaces it
- `arc_memory_remove` finds entry by substring, deletes it
- Ambiguous matches (multiple entries) return error with matches listed

## Slice 3: Content security scanning

**Goal:** Block injection, exfiltration, and invisible unicode.

**Files:** `mcp-server/memory-store.js`, reuse `hooks/lib/secret-patterns.js`

**Done when:**
- Injection patterns blocked: "ignore previous", "you are now", etc.
- Exfiltration patterns blocked: curl+env, cat+credentials
- Invisible unicode blocked: zero-width, directional overrides
- Secrets blocked: all 25 patterns from secret-patterns.js
- Rejection returns explicit error naming the threat

## Slice 4: Integration with arc plugin

**Goal:** Wire the MCP server into the plugin and update the nudge hook.

**Files:** Plugin MCP config, `hooks/learning/ambient-learning-nudge.js`, README

**Done when:**
- MCP server registered in plugin config
- ambient-learning-nudge reads NOTES.md and USER.md at session start
- README documents the memory tools
- install.js creates `~/.claude/arc/memory/` directory
