#!/bin/bash
# PreToolUse hook for Bash: warn before destructive commands
# Returns permissionDecision: "ask" so the user can confirm or cancel.
#
# Complements hard denies in settings.json (rm -rf, git push --force, git reset --hard)
# by warning about commands that are destructive but sometimes intentional.
#
# Note: set -euo pipefail is intentionally omitted. grep returns exit 1 on no match,
# which would abort the hook and potentially block the tool invocation.
# Fail-open: if jq is missing or stdin is malformed, the hook allows the operation.

# Read tool input from stdin
INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)

if [ -z "$CMD" ]; then
  exit 0
fi

# Collect all warnings (a command can trigger multiple)
WARNINGS=""
add_warn() {
  if [ -z "$WARNINGS" ]; then
    WARNINGS="$1"
  else
    WARNINGS="${WARNINGS}; $1"
  fi
}

# Git: discard uncommitted work
# Matches git checkout/restore with . as argument regardless of intervening flags or --
if echo "$CMD" | grep -qE 'git\s+(checkout|restore)\b.*(\s|^)\.\s*($|;|&&|\|)'; then
  add_warn "discards all uncommitted changes"
fi
if echo "$CMD" | grep -qE 'git\s+clean\s+-[a-zA-Z]*[fF]'; then
  add_warn "removes untracked files permanently"
fi
if echo "$CMD" | grep -qE 'git\s+stash\s+drop'; then
  add_warn "permanently removes a stash entry"
fi
if echo "$CMD" | grep -qE 'git\s+branch\s+-[a-zA-Z]*D'; then
  add_warn "force-deletes branch without merge check"
fi

# Kubernetes: resource deletion
if echo "$CMD" | grep -qiE 'kubectl\s+delete\s+(namespace|ns|deployment|statefulset|daemonset|pvc|pv|secret|configmap|service|ingress|clusterrole|clusterrolebinding)\b'; then
  add_warn "deletes a Kubernetes resource"
fi
if echo "$CMD" | grep -qiE 'kubectl\s+delete\s+-f\b'; then
  add_warn "deletes resources from manifest file"
fi

# Terraform
if echo "$CMD" | grep -qiE 'terraform\s+destroy'; then
  add_warn "tears down infrastructure"
fi
if echo "$CMD" | grep -qiE 'terraform\s+apply\s+.*-auto-approve'; then
  add_warn "applies infrastructure changes without confirmation"
fi

# Helm
if echo "$CMD" | grep -qiE 'helm\s+uninstall\b'; then
  add_warn "removes a Helm release"
fi

# Docker: bulk cleanup
if echo "$CMD" | grep -qiE 'docker\s+(system|volume|container|image)\s+prune'; then
  add_warn "prunes Docker resources"
fi
if echo "$CMD" | grep -qiE 'docker\s+rm\s+-[a-zA-Z]*f'; then
  add_warn "force-removes running container"
fi

# SQL: destructive DDL
if echo "$CMD" | grep -qiE '\b(DROP\s+(TABLE|DATABASE|SCHEMA|INDEX)|TRUNCATE\s+TABLE)\b'; then
  add_warn "destructive SQL command"
fi

# Recursive delete (not already caught by settings.json hard deny)
if echo "$CMD" | grep -qE '\brm\b' && echo "$CMD" | grep -qE '(-[a-zA-Z]*[rR]|--recursive)'; then
  add_warn "recursive delete"
fi

# If warnings were collected, check safe exceptions before emitting.
# Safe exceptions only apply when the ENTIRE command is a known-safe cleanup pattern.
# This prevents bypass via comments or appended artifact names.
if [ -n "$WARNINGS" ]; then
  SAFE=false
  # Match only simple single-command cleanup of build artifacts
  if echo "$CMD" | grep -qE '^\s*rm\s+(-[a-zA-Z]*\s+)*(node_modules|\.next|__pycache__|\.pytest_cache|\.mypy_cache|\.tox|bin/Debug|bin/Release|obj/Debug|obj/Release|target/debug|target/release|dist|build)\s*$'; then
    SAFE=true
  fi

  if [ "$SAFE" = false ]; then
    SHORT_CMD=$(echo "$CMD" | cut -c1-120)
    echo "{\"permissionDecision\":\"ask\",\"message\":\"[careful] ${WARNINGS}: ${SHORT_CMD}\"}"
  fi
fi

exit 0
