#!/usr/bin/env node
/**
 * ambient-learning-nudge.js — PreToolUse (Read) ASYNC hook (session-once)
 *
 * On first invocation (SessionStart), loads instinct YAML files from
 * ~/.claude/arc/projects/<hash>/instincts/ and ~/.claude/arc/instincts/global/.
 * Emits high-confidence instincts (confidence > 0.5) as context on stderr.
 * Also injects guidance about saving corrections and learnings.
 *
 * Exit codes:
 *   0 = always (async advisory)
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { getProjectId } = require('../lib/project-id');
const { parseInstinctFrontmatter } = require('../lib/instinct-parser');

const MARKER_DIR = path.join(os.homedir(), '.claude', 'arc', '.markers');
const MARKER = path.join(MARKER_DIR, `.arc-learning-nudge-${process.ppid}`);
const CONFIDENCE_THRESHOLD = 0.5;

/**
 * Load instincts from a directory of YAML files.
 */
function loadInstincts(dir) {
  const instincts = [];
  if (!fs.existsSync(dir)) return instincts;

  try {
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(dir, file), 'utf8');
        const instinct = parseInstinctFrontmatter(content);
        if (instinct && typeof instinct.confidence === 'number') {
          instincts.push(instinct);
        }
      } catch {
        // Skip malformed instinct files
      }
    }
  } catch {
    // Directory not readable
  }
  return instincts;
}

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
    try { fs.chmodSync(MARKER, 0o600); } catch {}
  } catch {
    // Continue anyway
  }

  try {
    const home = process.env.HOME || process.env.USERPROFILE || '/tmp';
    const projectId = getProjectId();

    const projectInstinctsDir = path.join(home, '.claude', 'arc', 'projects', projectId, 'instincts');
    const globalInstinctsDir = path.join(home, '.claude', 'arc', 'instincts', 'global');
    const evolvedDir = path.join(home, '.claude', 'arc', 'evolved');

    const projectInstincts = loadInstincts(projectInstinctsDir);
    const globalInstincts = loadInstincts(globalInstinctsDir);
    // Also load evolved gotchas/skills (created by /evolve and /retro)
    const evolvedInstincts = loadInstincts(path.join(evolvedDir, 'gotchas'));

    const allInstincts = [...projectInstincts, ...globalInstincts, ...evolvedInstincts];
    const highConfidence = allInstincts.filter((i) => i.confidence > CONFIDENCE_THRESHOLD);

    if (highConfidence.length > 0) {
      process.stderr.write('[arc] Learned instincts for this project:\n');
      for (const instinct of highConfidence.slice(0, 10)) {
        const conf = (instinct.confidence * 100).toFixed(0);
        const trigger = instinct.trigger || 'unknown trigger';
        const action = instinct.action || '';
        process.stderr.write(`  - [${conf}%] ${trigger} → ${action}\n`);
      }
      process.stderr.write('\n');
    }

    // Check for evolved gotchas (markdown files from /evolve and /retro)
    const gotchaDir = path.join(evolvedDir, 'gotchas');
    if (fs.existsSync(gotchaDir)) {
      try {
        const gotchaFiles = fs.readdirSync(gotchaDir).filter(f => f.endsWith('.md'));
        if (gotchaFiles.length > 0) {
          process.stderr.write(`[arc] ${gotchaFiles.length} evolved gotcha(s) available at ~/.claude/arc/evolved/gotchas/\n`);
        }
      } catch { /* best-effort */ }
    }

    // Always inject learning guidance
    process.stderr.write(
      '[arc] Learning guidance: When the user corrects you or shares a preference, ' +
        'save it to memory immediately. When a complex task succeeds (5+ tool calls), ' +
        'consider what was learned.\n'
    );
  } catch {
    // Silent failure — advisory only
  }
  process.exit(0);
});
