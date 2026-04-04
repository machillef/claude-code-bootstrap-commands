#!/usr/bin/env node
/**
 * broad-git-add-warn.js — PreToolUse (Bash) ADVISORY hook
 *
 * Warns when a bash command uses "git add ." or "git add -A" which
 * can accidentally stage sensitive files. Always exits 0.
 *
 * Exit codes:
 *   0 = always (advisory only)
 */

'use strict';

let raw = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  raw += chunk;
});

process.stdin.on('end', () => {
  try {
    if (!raw.trim()) {
      process.exit(0);
    }
    const input = JSON.parse(raw);
    const command = (input.tool_input && input.tool_input.command) || '';

    if (/\bgit\s+add\s+\.\s*(?:$|[;&|])/.test(command) || /\bgit\s+add\s+-A\b/.test(command)) {
      process.stderr.write(
        'WARNING: Broad "git add" detected. ' +
        'Prefer adding specific files by name to avoid accidentally staging ' +
        'sensitive files (.env, credentials, large binaries).\n'
      );
    }
  } catch {
    // Malformed input — allow silently
  }
  process.exit(0);
});
