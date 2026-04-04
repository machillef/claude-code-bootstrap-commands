#!/usr/bin/env node
/**
 * retro-reminder.js — PreToolUse (Read) ASYNC hook (session-once)
 *
 * On first invocation per session, checks docs/ai/ for completed
 * initiatives (all slices marked Done) without a corresponding retro.
 * Warns if found.
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
const MARKER = path.join(MARKER_DIR, `.arc-retro-reminder-${process.ppid}`);

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
    const rootResult = spawnSync('git', ['rev-parse', '--show-toplevel'], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    if (rootResult.status !== 0) {
      process.exit(0);
    }
    const repoRoot = rootResult.stdout.trim();
    const docsDir = path.join(repoRoot, 'docs', 'ai');

    if (!fs.existsSync(docsDir)) {
      process.exit(0);
    }

    const files = fs.readdirSync(docsDir);
    const statusFiles = files.filter((f) => f.endsWith('-status.md'));
    const retroFiles = new Set(files.filter((f) => f.endsWith('-retro.md')));

    const needsRetro = [];

    for (const statusFile of statusFiles) {
      const prefix = statusFile.replace('-status.md', '');
      const retroFile = `${prefix}-retro.md`;

      // Skip if retro already exists
      if (retroFiles.has(retroFile)) continue;

      // Check if all slices are marked Done
      const content = fs.readFileSync(path.join(docsDir, statusFile), 'utf8');

      // Look for a slices/phases section with status markers
      // Common patterns: "- [x]" (all checked) or "Done" / "Complete"
      const hasIncomplete =
        /- \[ \]/.test(content) ||
        /status:\s*(?:in.?progress|pending|blocked|todo)/i.test(content) ||
        /\|\s*(?:In Progress|Pending|Blocked|TODO)\s*\|/i.test(content);

      const hasComplete =
        /- \[x\]/i.test(content) ||
        /status:\s*(?:done|complete)/i.test(content) ||
        /\|\s*(?:Done|Complete)\s*\|/i.test(content);

      if (hasComplete && !hasIncomplete) {
        needsRetro.push(prefix);
      }
    }

    if (needsRetro.length > 0) {
      process.stderr.write(
        `REMINDER: ${needsRetro.length} completed initiative(s) without a retrospective:\n` +
        needsRetro.map((n) => `  - ${n}`).join('\n') +
        '\nConsider running /retro to capture learnings.\n'
      );
    }
  } catch {
    // Silent failure — advisory only
  }
  process.exit(0);
});
