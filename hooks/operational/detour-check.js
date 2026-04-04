#!/usr/bin/env node
/**
 * detour-check.js — PreToolUse (Read) ASYNC hook (session-once)
 *
 * On first invocation per session, checks for active detour worktrees
 * and warns if any are found.
 *
 * Exit codes:
 *   0 = always (async advisory)
 */

'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const MARKER_DIR = path.join(os.homedir(), '.claude', 'arc', '.markers');
const MARKER = path.join(MARKER_DIR, `.arc-detour-check-${process.ppid}`);

let raw = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  raw += chunk;
});

process.stdin.on('end', () => {
  // Session-once guard
  if (fs.existsSync(MARKER)) {
    process.exit(0);
  }

  try {
    fs.mkdirSync(MARKER_DIR, { recursive: true, mode: 0o700 });
    fs.writeFileSync(MARKER, String(Date.now()));
  } catch {
    // Continue anyway
  }

  try {
    const result = spawnSync('git', ['worktree', 'list', '--porcelain'], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    if (result.status !== 0) {
      process.exit(0);
    }

    const output = result.stdout || '';
    const detours = [];
    const entries = output.split('\n\n').filter(Boolean);

    for (const entry of entries) {
      const branchMatch = entry.match(/branch\s+refs\/heads\/(.+)/);
      if (branchMatch && branchMatch[1].startsWith('detour/')) {
        const pathMatch = entry.match(/^worktree\s+(.+)/m);
        detours.push({
          branch: branchMatch[1],
          path: pathMatch ? pathMatch[1] : 'unknown',
        });
      }
    }

    if (detours.length > 0) {
      process.stderr.write(
        `WARNING: ${detours.length} active detour worktree(s) found:\n` +
        detours.map((d) => `  - ${d.branch} (${d.path})`).join('\n') +
        '\nRemember to merge or clean up detours when done.\n'
      );
    }
  } catch {
    // Silent failure — advisory only
  }
  process.exit(0);
});
