#!/usr/bin/env node
/**
 * outside-project-warn.js — PreToolUse (Edit, Write) ADVISORY hook
 *
 * Warns when an edit or write targets a file outside the current
 * git repository root. Always exits 0.
 *
 * Exit codes:
 *   0 = always (advisory only)
 */

'use strict';

const { spawnSync } = require('child_process');
const path = require('path');

function getRepoRoot() {
  const result = spawnSync('git', ['rev-parse', '--show-toplevel'], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  if (result.status !== 0) return null;
  return result.stdout.trim();
}

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
    const filePath = (input.tool_input && (input.tool_input.file_path || input.tool_input.file)) || '';
    if (!filePath) {
      process.exit(0);
    }

    const repoRoot = getRepoRoot();
    if (!repoRoot) {
      // Not in a git repo — nothing to compare against
      process.exit(0);
    }

    const resolvedFile = path.resolve(filePath);
    const resolvedRoot = path.resolve(repoRoot);

    if (!resolvedFile.startsWith(resolvedRoot + path.sep) && resolvedFile !== resolvedRoot) {
      process.stderr.write(
        `WARNING: Editing file outside project root.\n` +
        `  File: ${resolvedFile}\n` +
        `  Repo: ${resolvedRoot}\n` +
        `Ensure this is intentional.\n`
      );
    }
  } catch {
    // Malformed input — allow silently
  }
  process.exit(0);
});
