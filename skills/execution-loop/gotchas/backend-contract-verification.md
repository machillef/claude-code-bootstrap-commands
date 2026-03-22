# Gotcha: Verify Frontend Parser Fixtures Against Backend

**Source:** Extracted from real session failure (2026-03-13)

When writing frontend parsers for backend data, hand-crafted test fixtures create false-confidence TDD loops. Tests pass, TypeScript compiles, but the parser silently produces wrong results against real data.

## The Pattern

1. Skim backend model classes
2. Assume the data shape
3. Write fixtures matching assumptions
4. Parser passes tests but fails on real data

## Rule

Before committing any frontend parser, do 3 things:
1. **Read the controller method** (not just the model) — it reveals how data is actually constructed
2. **Trace one field end-to-end** through every serialization layer (C# → JSON → JS)
3. **Derive fixtures from backend output**, not assumptions
