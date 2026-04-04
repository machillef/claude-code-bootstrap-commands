'use strict';

const crypto = require('crypto');
const path = require('path');
const { spawnSync } = require('child_process');

/**
 * Derive a short project identifier from the git remote URL (or cwd fallback).
 * Returns the first 12 hex chars of a SHA-256 hash.
 */
function getProjectId() {
  const result = spawnSync('git', ['remote', 'get-url', 'origin'], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  const url = (result.status === 0 && result.stdout) ? result.stdout.trim() : process.cwd();
  return crypto.createHash('sha256').update(url).digest('hex').slice(0, 12);
}

/**
 * Return the per-project data directory under ~/.claude/arc/projects/<hash>.
 */
function getProjectDir(projectId) {
  const home = process.env.HOME || process.env.USERPROFILE || '/tmp';
  return path.join(home, '.claude', 'arc', 'projects', projectId || getProjectId());
}

module.exports = { getProjectId, getProjectDir };
