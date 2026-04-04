#!/usr/bin/env node
/**
 * config-protection.js — PreToolUse (Edit, Write) BLOCKING hook
 *
 * Blocks modifications to linter/formatter config files.
 * Agents frequently weaken these configs to make checks pass instead
 * of fixing the actual code. This hook steers back to source fixes.
 *
 * Exit codes:
 *   0 = allow (not a protected config file)
 *   2 = block (config file modification attempted)
 */

'use strict';

const fs = require('fs');
const path = require('path');

const PROTECTED_BASENAMES = new Set([
  // ESLint (legacy + v9 flat config)
  '.eslintrc',
  '.eslintrc.js',
  '.eslintrc.cjs',
  '.eslintrc.json',
  '.eslintrc.yml',
  '.eslintrc.yaml',
  'eslint.config.js',
  'eslint.config.mjs',
  'eslint.config.cjs',
  'eslint.config.ts',
  'eslint.config.mts',
  'eslint.config.cts',
  // Prettier
  '.prettierrc',
  '.prettierrc.js',
  '.prettierrc.cjs',
  '.prettierrc.json',
  '.prettierrc.yml',
  '.prettierrc.yaml',
  'prettier.config.js',
  'prettier.config.cjs',
  'prettier.config.mjs',
  // Biome
  'biome.json',
  '.biome.json',
  'biome.jsonc',
  // Ruff (Python)
  'ruff.toml',
  '.ruff.toml',
  // Python linters
  '.flake8',
  '.pylintrc',
  // Ruby
  '.rubocop.yml',
  // Stylelint
  '.stylelintrc',
  '.stylelintrc.json',
  '.stylelintrc.yml',
  '.stylelintrc.yaml',
  // TSLint (legacy)
  'tslint.json',
  // Editor config
  '.editorconfig',
]);

/**
 * Pattern match for pyproject.toml — only block if the edit touches
 * the [tool.ruff] section. For simplicity in a PreToolUse hook, we
 * block all pyproject.toml edits that contain "ruff" in the content.
 */
function isPyprojectRuffEdit(basename, input) {
  if (basename !== 'pyproject.toml') return false;
  const oldStr = (input.tool_input && input.tool_input.old_string) || '';
  const newStr = (input.tool_input && input.tool_input.new_string) || '';
  const content = (input.tool_input && input.tool_input.content) || '';
  return /\bruff\b/i.test(oldStr + newStr + content);
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

    const resolved = (() => { try { return fs.realpathSync(filePath); } catch { return filePath; } })();
    const basename = path.basename(resolved);

    if (PROTECTED_BASENAMES.has(basename) || isPyprojectRuffEdit(basename, input)) {
      process.stderr.write(
        `BLOCKED: Modifying ${basename} is not allowed. ` +
        'Fix the source code to satisfy linter/formatter rules instead of ' +
        'weakening the config.\n'
      );
      process.exit(2);
    }
  } catch (err) {
    process.stderr.write(`[arc] WARNING: Safety hook received malformed input: ${err.message}\n`);
  }
  process.exit(0);
});
