# <project-name>

## Stack
<language, framework, key libraries — one line>

## Build & test
<build command> | <test command>

## Structure
<entry point and key directories — 5–8 lines max>

## Key patterns
- Auth: <how auth is applied, e.g., "JWT middleware on all /api routes">
- Errors: <how errors are handled, e.g., "Result<T, AppError> throughout">
- Config: <how config is loaded, e.g., "dotenv via config/settings.py">

## Source of truth
- `docs/ai/` — initiative planning, status, and decisions
- `~/.claude/CLAUDE.md` — global coding rules and workflow

Do not store session state or evolving task notes here.

## Start here
1. Read `docs/ai/<initiative>-status.md` for current slice
2. Read `docs/ai/<initiative>-slices.md` for scope
3. Read the touched code paths
