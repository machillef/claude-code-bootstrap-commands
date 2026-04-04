#!/usr/bin/env node
/**
 * stale-docs-check.js — PreToolUse (Read) ASYNC hook (session-once)
 *
 * On first invocation per session, checks if any docs/ai/*-status.md
 * files exist and are older than 3 days relative to the most recent
 * git commit. Warns on stderr if stale.
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
const MARKER = path.join(MARKER_DIR, `.arc-stale-docs-${process.ppid}`);

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
    // If we can't create marker, run anyway (but only this once matters)
  }

  try {
    // Find the repo root
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

    // Find *-status.md files
    const files = fs.readdirSync(docsDir).filter((f) => f.endsWith('-status.md'));
    if (files.length === 0) {
      process.exit(0);
    }

    // Get latest git commit timestamp
    const logResult = spawnSync('git', ['log', '-1', '--format=%ct'], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    if (logResult.status !== 0) {
      process.exit(0);
    }
    const latestCommitTs = parseInt(logResult.stdout.trim(), 10) * 1000;

    const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
    const staleFiles = [];

    for (const file of files) {
      const filePath = path.join(docsDir, file);
      const stat = fs.statSync(filePath);
      const ageFromCommit = latestCommitTs - stat.mtimeMs;
      if (ageFromCommit > THREE_DAYS_MS) {
        staleFiles.push(file);
      }
    }

    if (staleFiles.length > 0) {
      process.stderr.write(
        `WARNING: ${staleFiles.length} docs/ai/ status file(s) are stale (>3 days behind latest commit):\n` +
        staleFiles.map((f) => `  - ${f}`).join('\n') +
        '\nConsider updating initiative status before continuing.\n'
      );
    }
  } catch {
    // Silent failure — advisory only
  }
  process.exit(0);
});
