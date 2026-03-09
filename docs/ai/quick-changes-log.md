# Quick Changes Log

## 2026-03-09 — Add PowerShell install script for Windows users
- Changed: `install.ps1` (new), `README.md` (updated installation sections)
- Pattern followed: `install.sh` — same symlink-based approach, same safety checks, same output format
- Verified: syntax review only (no `pwsh` in WSL); mirrors `install.sh` logic 1:1
