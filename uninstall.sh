#!/usr/bin/env bash
# Remove symlinks created by install.sh
# Only removes symlinks that point into THIS repo — never touches other files.

set -e

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$HOME/.claude"

remove_if_ours() {
  local dst="$1"
  local label="$2"

  if [ -L "$dst" ]; then
    local target
    target="$(readlink "$dst")"
    if echo "$target" | grep -q "$REPO_DIR"; then
      rm "$dst"
      echo "  removed  $label"
    else
      echo "  skipped  $label  (symlink points elsewhere: $target)"
    fi
  elif [ -e "$dst" ]; then
    echo "  skipped  $label  (not a symlink — not ours)"
  fi
}

echo "Removing bootstrap workflow symlinks from: $CLAUDE_DIR"
echo "(only removes symlinks pointing into: $REPO_DIR)"
echo ""

# --- Commands ---
for f in "$REPO_DIR/commands/"*.md; do
  [ -f "$f" ] || continue
  name="$(basename "$f")"
  remove_if_ours "$CLAUDE_DIR/commands/$name" "command: $name"
done

# --- Agents ---
for f in "$REPO_DIR/agents/"*.md; do
  [ -f "$f" ] || continue
  name="$(basename "$f")"
  remove_if_ours "$CLAUDE_DIR/agents/$name" "agent:   $name"
done

# --- Skills ---
for skill_dir in "$REPO_DIR/skills"/*/; do
  [ -d "$skill_dir" ] || continue
  skill_name="$(basename "$skill_dir")"
  remove_if_ours "$CLAUDE_DIR/skills/$skill_name" "skill:   $skill_name"
done

# --- Hooks ---
for f in "$REPO_DIR/hooks/"*.sh; do
  [ -f "$f" ] || continue
  name="$(basename "$f")"
  remove_if_ours "$CLAUDE_DIR/hooks/$name" "hook:    $name"
done

echo ""
echo "Done. Symlinks removed."
echo ""
echo "To install as a plugin instead:"
echo "  /plugin marketplace add machillef/claude-code-bootstrap-commands"
echo "  /plugin install bootstrap-commands@claude-code-bootstrap-commands --scope user"
