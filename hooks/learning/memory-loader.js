#!/usr/bin/env node
/**
 * memory-loader.js — PreToolUse (Read) ASYNC hook (session-once)
 *
 * Hermes-style memory preloading: reads all memory files from the
 * Claude Code project memory directory and injects their content
 * into the session context via stderr.
 *
 * Graceful degradation inspired by Hermes' hard character limits:
 * - Under CHAR_LIMIT: inject all memories (full preload)
 * - Over CHAR_LIMIT: inject only the MEMORY.md index + nudge to
 *   read specific files as needed and consolidate old entries
 *
 * Memory path: ~/.claude/projects/<slug>/memory/
 * where <slug> is the CWD with path separators replaced by dashes.
 *
 * Exit codes:
 *   0 = always (async advisory)
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const MARKER_DIR = path.join(os.homedir(), '.claude', 'arc', '.markers');
const MARKER = path.join(MARKER_DIR, `.arc-memory-load-${process.ppid}`);

// Hermes uses 3,575 chars total for smaller context windows (Discord/Telegram).
// Claude Code runs on Opus 4.6 (1M context) — 8,000 chars (~3,000 tokens) is
// ~0.4% of context. Allows ~8-10 detailed memories before degradation.
const CHAR_LIMIT = 8000;

/**
 * Derive the Claude Code project memory directory from CWD.
 * Claude Code uses CWD with path separators replaced by dashes.
 */
function getMemoryDir() {
  const home = process.env.HOME || process.env.USERPROFILE || '/tmp';
  const cwd = process.cwd();
  const slug = cwd.replace(/[/\\]/g, '-');
  return path.join(home, '.claude', 'projects', slug, 'memory');
}

/**
 * Parse MEMORY.md to extract referenced file names.
 * Matches markdown links like [Title](filename.md)
 */
function parseMemoryIndex(content) {
  const files = [];
  const linkPattern = /\[.*?\]\(([^)]+\.md)\)/g;
  let match;
  while ((match = linkPattern.exec(content)) !== null) {
    const ref = match[1];
    if (ref !== 'MEMORY.md' && !ref.startsWith('http')) {
      files.push(ref);
    }
  }
  return files;
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
    const memoryDir = getMemoryDir();
    const indexPath = path.join(memoryDir, 'MEMORY.md');

    if (!fs.existsSync(indexPath)) {
      process.exit(0);
    }

    const indexContent = fs.readFileSync(indexPath, 'utf8');
    const referencedFiles = parseMemoryIndex(indexContent);

    if (referencedFiles.length === 0) {
      process.exit(0);
    }

    // Load all memory files and measure total size
    const loaded = [];
    let totalChars = 0;
    for (const file of referencedFiles) {
      const filePath = path.join(memoryDir, file);
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8').trim();
          if (content) {
            loaded.push({ file, content });
            totalChars += content.length;
          }
        } catch {
          // Skip unreadable files
        }
      }
    }

    if (loaded.length === 0) {
      process.exit(0);
    }

    if (totalChars <= CHAR_LIMIT) {
      // Under limit: full Hermes-style preload
      process.stderr.write(`[arc] Loaded ${loaded.length} memories (${totalChars} chars):\n`);
      for (const { file, content } of loaded) {
        process.stderr.write(`\n--- ${file} ---\n${content}\n`);
      }
      process.stderr.write('\n[arc] Memories loaded. Use this context to inform your responses.\n');
    } else {
      // Over limit: inject index only + nudge to consolidate
      process.stderr.write(
        `[arc] Memory bank is large (${totalChars} chars, ${loaded.length} files, limit ${CHAR_LIMIT}). ` +
        'Loading index only — read specific files with the Read tool as needed.\n\n'
      );
      process.stderr.write(`Memory index:\n${indexContent}\n`);
      process.stderr.write(
        '\n[arc] Consider consolidating: merge related memories, remove outdated entries, ' +
        'or archive stale project state to keep the memory bank under ' + CHAR_LIMIT + ' chars.\n'
      );
    }
  } catch {
    // Silent failure — advisory only
  }
  process.exit(0);
});
