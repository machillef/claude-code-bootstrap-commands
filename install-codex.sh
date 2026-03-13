#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CODEX_DIR="$HOME/.codex"
SKILL_SOURCE_DIR="$REPO_DIR/codex/skills"
SKILL_DEST_DIR="$CODEX_DIR/skills"
REFERENCE_SOURCE_DIR="$REPO_DIR/codex/reference"
REFERENCE_DEST_ROOT="$CODEX_DIR/bootstrap-reference"
REFERENCE_DEST_DIR="$REFERENCE_DEST_ROOT/claude-code-bootstrap-commands"
AGENTS_FILE="$CODEX_DIR/AGENTS.md"
FORCE=false
MANAGED_START='<!-- BEGIN claude-code-bootstrap-commands -->'
MANAGED_END='<!-- END claude-code-bootstrap-commands -->'
MANAGED_BODY="$(cat "$REPO_DIR/codex/templates/global-agents-block.md")"
MANAGED_BLOCK="$MANAGED_START
$MANAGED_BODY
$MANAGED_END"

for arg in "$@"; do
  [ "$arg" = "--force" ] && FORCE=true
done

backup_file() {
  local path="$1"
  if [ -f "$path" ]; then
    cp "$path" "$path.bootstrap-backup.$(date +%Y%m%d%H%M%S)"
  fi
}

install_directory_link() {
  local src="$1"
  local dst="$2"
  local label="$3"

  if [ -L "$dst" ]; then
    local current_target
    current_target="$(readlink "$dst")"
    if [ "$current_target" = "$src" ]; then
      echo "  ok       $label  (already linked)"
    elif [ "$FORCE" = true ]; then
      rm "$dst"
      ln -s "$src" "$dst"
      echo "  updated  $label  (relinked from: $current_target)"
    else
      echo "  SKIPPED  $label  (symlink exists pointing to: $current_target -- use --force to relink)"
    fi
  elif [ -e "$dst" ]; then
    if [ "$FORCE" = true ]; then
      rm -rf "$dst"
      ln -s "$src" "$dst"
      echo "  updated  $label  (replaced directory with symlink)"
    else
      echo "  SKIPPED  $label  (directory exists from another source; use --force to override)"
    fi
  else
    ln -s "$src" "$dst"
    echo "  linked   $label"
  fi
}

merge_agents_block() {
  local path="$1"

  if [ ! -f "$path" ]; then
    printf '%s\n' "$MANAGED_BLOCK" > "$path"
    echo "  created  AGENTS.md  (managed bootstrap block only)"
    return
  fi

  local tmp
  tmp="$(mktemp)"

  if grep -Fq "$MANAGED_START" "$path" && grep -Fq "$MANAGED_END" "$path"; then
    backup_file "$path"
    awk -v start="$MANAGED_START" -v end="$MANAGED_END" -v block="$MANAGED_BLOCK" '
      BEGIN { in_block = 0; replaced = 0 }
      $0 == start {
        if (!replaced) {
          print block
          replaced = 1
        }
        in_block = 1
        next
      }
      $0 == end {
        in_block = 0
        next
      }
      !in_block { print }
    ' "$path" > "$tmp"
    mv "$tmp" "$path"
    echo "  updated  AGENTS.md  (refreshed managed bootstrap block)"
    return
  fi

  backup_file "$path"
  printf '\n%s\n' "$MANAGED_BLOCK" >> "$path"
  echo "  updated  AGENTS.md  (appended managed bootstrap block)"
}

echo "Installing Codex bootstrap workflow from: $REPO_DIR"
echo "Destination: $CODEX_DIR"
echo "(skills are linked; AGENTS.md is merged conservatively)"
echo ""

mkdir -p "$SKILL_DEST_DIR"
mkdir -p "$REFERENCE_DEST_ROOT"
for skill_dir in "$SKILL_SOURCE_DIR"/*; do
  [ -d "$skill_dir" ] || continue
  skill_name="$(basename "$skill_dir")"
  install_directory_link "$skill_dir" "$SKILL_DEST_DIR/$skill_name" "skill:   $skill_name"
done

install_directory_link "$REFERENCE_SOURCE_DIR" "$REFERENCE_DEST_DIR" "reference bundle"

mkdir -p "$CODEX_DIR"
merge_agents_block "$AGENTS_FILE"

echo ""
echo "Done. Restart Codex if it is already running."
echo "No changes were made to config.toml."
echo "Reference bundle: $REFERENCE_DEST_DIR"
