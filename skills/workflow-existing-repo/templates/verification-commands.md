## Verification Commands
| Phase | Command |
|---|---|
| Build | <exact build command> |
| Test (single) | <command to run one test file in isolation> |
| Test (full) | <command to run the full test suite> |
| Type check | <type checker command, or "N/A"> |
| Lint | <linter command, or "N/A"> |

## QA Commands

Optional. If populated, `review-loop` will auto-escalate to include Interactive QA (Pass 4) for user-facing slices.

| Step | Command | Notes |
|---|---|---|
| Start application | <command to start the app, e.g., `npm run dev`, `dotnet run`, `python manage.py runserver`> | <port, URL, or how to access> |
| Seed data (if needed) | <command to populate test data, or "N/A"> | <what data is created> |
| Stop application | <command to stop, or "Ctrl+C"> | |

If this project does not produce a runnable artifact (library, CLI tool without server, pure backend), leave this section empty or remove it.
