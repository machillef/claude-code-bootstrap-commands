#!/usr/bin/env bash
# Bootstrap workflow installer
# Creates symlinks from ~/.claude/ into this repo so that `git pull` is all
# you need to pick up updates — no re-install required.
#
# SAFE BY DESIGN:
#   - Never touches ~/.claude/CLAUDE.md
#   - Never touches ~/.claude/rules/
#   - Only creates symlinks for files that come from this repo
#   - If a file exists and is already a symlink to this repo, updates it
#   - If a file exists from another source (not a symlink to us), warns and skips
#
# Run once after cloning. Re-run only if you move the repo to a new path.

set -e

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
FORCE=false

for arg in "$@"; do
  [ "$arg" = "--force" ] && FORCE=true
done

install_link() {
  local src="$1"
  local dst="$2"
  local label="$3"

  if [ -L "$dst" ]; then
    local current_target
    current_target="$(readlink "$dst")"
    if [ "$current_target" = "$src" ]; then
      echo "  ok       $label  (already linked)"
    else
      # Symlink exists but points elsewhere (different repo path or different source)
      if [ "$FORCE" = true ]; then
        ln -sf "$src" "$dst"
        echo "  updated  $label  (relinked from: $current_target)"
      else
        echo "  SKIPPED  $label  (symlink exists pointing to: $current_target — use --force to relink)"
      fi
    fi
  elif [ -f "$dst" ]; then
    # Regular file — from another source, don't clobber
    if [ "$FORCE" = true ]; then
      ln -sf "$src" "$dst"
      echo "  updated  $label  (replaced file with symlink)"
    else
      echo "  SKIPPED  $label  (regular file exists from another source; use --force to override)"
    fi
  elif [ -e "$dst" ]; then
    # Directory or other item from another source
    if [ "$FORCE" = true ]; then
      rm -rf "$dst"
      ln -s "$src" "$dst"
      echo "  updated  $label  (replaced existing item with symlink)"
    else
      echo "  SKIPPED  $label  (existing item exists from another source; use --force to override)"
    fi
  else
    # Nothing there — create the symlink
    ln -s "$src" "$dst"
    echo "  linked   $label"
  fi
}

echo "Installing bootstrap workflow from: $REPO_DIR"
echo "Destination: $CLAUDE_DIR"
echo "(using symlinks — git pull will sync updates automatically)"
echo ""

# --- Commands ---
mkdir -p "$CLAUDE_DIR/commands"
for f in "$REPO_DIR/.claude/commands/"*.md; do
  name="$(basename "$f")"
  install_link "$f" "$CLAUDE_DIR/commands/$name" "command: $name"
done

# --- Agents ---
mkdir -p "$CLAUDE_DIR/agents"
for f in "$REPO_DIR/.claude/agents/"*.md; do
  name="$(basename "$f")"
  install_link "$f" "$CLAUDE_DIR/agents/$name" "agent:   $name"
done

# --- Skills ---
mkdir -p "$CLAUDE_DIR/skills"
for skill_dir in "$REPO_DIR/.claude/skills"/*/; do
  skill_name="$(basename "$skill_dir")"
  install_link "${skill_dir%/}" "$CLAUDE_DIR/skills/$skill_name" "skill:   $skill_name"
done

# --- Hooks ---
mkdir -p "$CLAUDE_DIR/hooks"
for f in "$REPO_DIR/.claude/hooks/"*.sh; do
  [ -f "$f" ] || continue
  name="$(basename "$f")"
  install_link "$f" "$CLAUDE_DIR/hooks/$name" "hook:    $name"
done

echo ""
echo "Done. Restart Claude Code for changes to take effect."
echo ""
echo "HOOKS: Hook scripts have been linked to ~/.claude/hooks/."
echo "To activate them, add the entries from .claude/hooks/README.md to ~/.claude/settings.json."
echo "Future updates: git pull  (symlinks stay live — no re-install needed)"
echo ""
echo "Available in every repo after restart:"
echo "  /quick-change <description>        small change, 1-3 files, no bootstrap overhead"
echo "  /bootstrap-existing <initiative>   medium or large change, creates docs/ai/"
echo "  /bootstrap-new <project>           greenfield project, creates docs/ai/"
echo "  /continue-work <initiative>        resume after bootstrap"
echo "  /detour <initiative> <description> temporary diversion from current slice plan"
echo "  /consolidate-learnings             merge learned skills into parent skill gotchas"
echo "  /skill-health                      audit skill structure against best practices"
echo "  /skill-improve <skill>             iteratively improve a specific skill"
echo "  /retro <initiative>                retrospective with metrics and learnings"
