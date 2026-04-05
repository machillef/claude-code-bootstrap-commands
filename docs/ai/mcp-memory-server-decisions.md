# MCP Memory Server — Decisions

## Decision 1: MCP server over custom tool (2026-04-05)

**Context:** How to give the agent a callable memory tool within Claude Code?

**Decision:** Build a small MCP server (stdio, Node.js) rather than a custom tool or hook-based approach.

**Rationale:** MCP servers are Claude Code's official extension mechanism for custom tools. They appear as native tools to the agent. A hook-based approach would require the agent to "know" about the memory system through instructions only — an MCP tool is discoverable and callable.

## Decision 2: Complement, don't replace Claude Code /memory (2026-04-05)

**Context:** Should this replace Claude Code's native memory?

**Decision:** No. The MCP memory server runs alongside `/memory`. The agent can use either.

**Rationale:** Claude Code's `/memory` is always available and deeply integrated. Our MCP server adds value through dual-store separation, budgets, and injection scanning — but shouldn't fight the platform.

## Decision 3: Defer until real-world need confirmed (2026-04-05)

**Context:** Should we build this now?

**Decision:** Branch created with full planning docs. Implementation deferred until the user confirms Claude Code's native `/memory` is insufficient after a few weeks of daily arc usage.

**Rationale:** Building it now risks over-engineering. The combination of `/memory` (explicit preferences) + instincts (automatic patterns) may be sufficient.
