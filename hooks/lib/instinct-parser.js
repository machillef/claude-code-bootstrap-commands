'use strict';

/**
 * Shared instinct YAML frontmatter parser.
 * Used by session-end-observer (to load existing instincts for deduplication)
 * and ambient-learning-nudge (to load instincts for context injection).
 *
 * Parses the YAML frontmatter between --- delimiters using regex extraction.
 * No full YAML parser dependency needed.
 */

/**
 * Escape a string for safe interpolation inside YAML double-quoted values.
 */
function escapeYaml(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

/**
 * Parse YAML frontmatter from an instinct file content string.
 * Returns null if no valid frontmatter found.
 */
function parseInstinctFrontmatter(content) {
  const frontmatter = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatter) return null;

  const yaml = frontmatter[1];

  const extractStr = (key) => {
    // Handle escaped quotes inside double-quoted YAML values
    const match = yaml.match(new RegExp(`^${key}:\\s*"((?:[^"\\\\]|\\\\.)*)"`, 'm'));
    if (match) {
      return match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\').trim();
    }
    // Fallback: unquoted value
    const unquoted = yaml.match(new RegExp(`^${key}:\\s*([^\\n]+)`, 'm'));
    return unquoted ? unquoted[1].trim() : null;
  };

  const extractNum = (key) => {
    const match = yaml.match(new RegExp(`^${key}:\\s*([\\d.]+)`, 'm'));
    return match ? parseFloat(match[1]) : null;
  };

  const extractInt = (key) => {
    const match = yaml.match(new RegExp(`^${key}:\\s*(\\d+)`, 'm'));
    return match ? parseInt(match[1], 10) : null;
  };

  return {
    id: extractStr('id'),
    trigger: extractStr('trigger'),
    action: extractStr('action'),
    confidence: extractNum('confidence'),
    domain: extractStr('domain'),
    source: extractStr('source'),
    scope: extractStr('scope'),
    project_id: extractStr('project_id'),
    project_name: extractStr('project_name'),
    created: extractStr('created'),
    last_seen: extractStr('last_seen'),
    observations: extractInt('observations'),
  };
}

module.exports = { escapeYaml, parseInstinctFrontmatter };
