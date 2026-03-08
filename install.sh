#!/usr/bin/env bash
# Bootstrap workflow installer
# Copies commands, agents, and skills into ~/.claude/ so they're available in every repo.
#
# SAFE BY DESIGN:
#   - Never touches ~/.claude/CLAUDE.md
#   - Never touches ~/.claude/rules/
#   - Only writes files that come from this repo
#   - If a file already exists from a PREVIOUS install of this repo, it updates it
#   - If a file exists from somewhere else (same name, different source), it warns and skips
#
# Re-run anytime you update this repo to pick up changes.

set -e

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
MARKER="# installed-by: claude-bootstrap"  # written into each file so we know it's ours
FORCE=false

for arg in "$@"; do
  [ "$arg" = "--force" ] && FORCE=true
done

install_file() {
  local src="$1"
  local dst="$2"
  local label="$3"

  if [ -f "$dst" ]; then
    if grep -q "$MARKER" "$dst" 2>/dev/null || [ "$FORCE" = true ]; then
      # File is ours (or force flag set) — update it
      cp "$src" "$dst"
      echo "" >> "$dst"
      echo "$MARKER" >> "$dst"
      echo "  updated  $label"
    else
      # File exists but wasn't installed by us — skip, don't clobber
      echo "  SKIPPED  $label  (exists from another source; use --force to override)"
    fi
  else
    # New file — install it
    cp "$src" "$dst"
    echo "" >> "$dst"
    echo "$MARKER" >> "$dst"
    echo "  added    $label"
  fi
}

echo "Installing bootstrap workflow from: $REPO_DIR"
echo "Destination: $CLAUDE_DIR"
echo ""

# --- Commands ---
mkdir -p "$CLAUDE_DIR/commands"
for f in "$REPO_DIR/.claude/commands/"*.md; do
  name="$(basename "$f")"
  install_file "$f" "$CLAUDE_DIR/commands/$name" "command: $name"
done

# --- Agents ---
mkdir -p "$CLAUDE_DIR/agents"
for f in "$REPO_DIR/.claude/agents/"*.md; do
  name="$(basename "$f")"
  install_file "$f" "$CLAUDE_DIR/agents/$name" "agent:   $name"
done

# --- Skills ---
mkdir -p "$CLAUDE_DIR/skills"
for skill_dir in "$REPO_DIR/.claude/skills/"/*/; do
  skill_name="$(basename "$skill_dir")"
  mkdir -p "$CLAUDE_DIR/skills/$skill_name"
  install_file "$skill_dir/SKILL.md" "$CLAUDE_DIR/skills/$skill_name/SKILL.md" "skill:   $skill_name"
done

echo ""
echo "Done. Restart Claude Code for changes to take effect."
echo ""
echo "Available in every repo after restart:"
echo "  /quick-change <description>        small change, 1-3 files, no bootstrap overhead"
echo "  /bootstrap-existing <initiative>   medium or large change, creates docs/ai/"
echo "  /continue-work <initiative>        resume after bootstrap"
