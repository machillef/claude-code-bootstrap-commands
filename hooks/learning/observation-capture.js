#!/usr/bin/env node
/**
 * observation-capture.js — PreToolUse/PostToolUse ASYNC hook
 *
 * Captures tool use events for pattern analysis. Rewrites the
 * observation capture pattern in Node.js with:
 * - Project detection via git remote → SHA-256 hash
 * - Secret scrubbing before persistence
 * - JSONL file rotation at 10MB
 * - Subagent skip guard
 *
 * Exit codes:
 *   0 = always (async, best-effort)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { getProjectId, getProjectDir } = require('../lib/project-id');
const { SECRET_PATTERNS } = require('../lib/secret-patterns');

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_SUMMARY_LEN = 200;

// Build a combined RegExp from the shared secret patterns for scrubbing
const SECRET_RE = new RegExp(
  SECRET_PATTERNS.map((s) => s.pattern.source).join('|'),
  'gi'
);

function scrub(text) {
  if (!text) return text;
  return text.replace(SECRET_RE, '[REDACTED]');
}

function summarize(input) {
  const toolName = input.tool_name || 'unknown';
  const toolInput = input.tool_input || {};

  if (toolName === 'Bash') {
    const cmd = (toolInput.command || '').slice(0, MAX_SUMMARY_LEN);
    return `bash: ${cmd}`;
  }
  if (toolName === 'Edit' || toolName === 'Write') {
    const fp = toolInput.file_path || toolInput.file || '';
    return `${toolName.toLowerCase()}: ${path.basename(fp)}`;
  }
  if (toolName === 'Read') {
    const fp = toolInput.file_path || '';
    return `read: ${path.basename(fp)}`;
  }
  return `${toolName.toLowerCase()}`;
}

function rotateIfNeeded(filePath) {
  try {
    if (!fs.existsSync(filePath)) return;
    const stat = fs.statSync(filePath);
    if (stat.size >= MAX_FILE_SIZE_BYTES) {
      const date = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const bakPath = filePath.replace('.jsonl', `-${date}.jsonl.bak`);
      fs.renameSync(filePath, bakPath);
    }
  } catch {
    // Best-effort rotation
  }
}

let raw = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  raw += chunk;
});

process.stdin.on('end', () => {
  // Skip subagent sessions
  if (process.env.CLAUDE_AGENT_ID) {
    process.exit(0);
  }

  try {
    if (!raw.trim()) {
      process.exit(0);
    }
    const input = JSON.parse(raw);

    const projectId = getProjectId();
    const projectDir = getProjectDir(projectId);

    // Ensure directory exists with restrictive permissions
    fs.mkdirSync(projectDir, { recursive: true, mode: 0o700 });

    const obsFile = path.join(projectDir, 'observations.jsonl');

    // Rotate if needed
    rotateIfNeeded(obsFile);

    // Determine hook phase from env or default to post
    const hookEvent = process.env.CLAUDE_HOOK_EVENT_NAME || '';
    const event = hookEvent.startsWith('Pre') ? 'pre' : 'post';

    const observation = {
      ts: new Date().toISOString(),
      event,
      tool: input.tool_name || 'unknown',
      session: String(process.ppid),
      project_id: projectId,
      summary: scrub(summarize(input)),
    };

    fs.appendFileSync(obsFile, JSON.stringify(observation) + '\n');
    try { fs.chmodSync(obsFile, 0o600); } catch {}
  } catch {
    // Silent failure — never block the tool pipeline
  }
  process.exit(0);
});
