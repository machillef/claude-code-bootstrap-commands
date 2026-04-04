#!/usr/bin/env node
/**
 * commit-quality.js — PreToolUse (Bash) BLOCKING hook
 *
 * Runs quality checks before git commit commands:
 * - Scans staged files for debug statements, TODOs without issue refs
 * - Detects secrets in staged content (blocks on secrets)
 * - Validates conventional commit message format
 *
 * Only activates for commands containing "git commit".
 *
 * Exit codes:
 *   0 = allow (with optional warnings on stderr)
 *   2 = block (secrets found in staged content)
 */

'use strict';

const { spawnSync } = require('child_process');
const { SECRET_PATTERNS } = require('../lib/secret-patterns');

/**
 * Get list of staged file names.
 */
function getStagedFiles() {
  const result = spawnSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR'], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  if (result.status !== 0) return [];
  return result.stdout.trim().split('\n').filter((f) => f.length > 0);
}

/**
 * Get the full staged diff content for secret scanning.
 */
function getStagedDiff() {
  const result = spawnSync('git', ['diff', '--cached'], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  if (result.status !== 0) return '';
  return result.stdout || '';
}

/**
 * Get staged content for a specific file.
 */
function getStagedFileContent(filePath) {
  const result = spawnSync('git', ['show', `:${filePath}`], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  if (result.status !== 0) return null;
  return result.stdout;
}

const CHECKABLE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.rs', '.rb', '.java'];

// Secret patterns imported from shared module (see require at top)

/**
 * Validate conventional commit message format.
 */
function validateCommitMessage(command) {
  // Extract -m "message" from the command
  const messageMatch = command.match(/(?:-m|--message)\s+["']([^"']+)["']/);
  if (!messageMatch) {
    // Try HEREDOC style: -m "$(cat <<'EOF'\n...\nEOF\n)"
    const heredocMatch = command.match(/-m\s+"?\$\(cat\s+<<'?EOF'?\n([\s\S]*?)\nEOF/);
    if (heredocMatch) {
      return checkMessage(heredocMatch[1].split('\n')[0].trim());
    }
    return [];
  }
  return checkMessage(messageMatch[1]);
}

function checkMessage(message) {
  const issues = [];
  if (!message) return issues;

  const conventionalFormat = /^(feat|fix|docs|style|refactor|test|chore|build|ci|perf|revert)(\(.+\))?(!)?:\s*.+/;
  if (!conventionalFormat.test(message)) {
    issues.push('Commit message does not follow conventional format: type(scope): description');
  }

  if (message.length > 72) {
    issues.push(`First line is ${message.length} chars (max 72)`);
  }

  if (message.endsWith('.')) {
    issues.push('Commit message should not end with a period');
  }

  return issues;
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
    const command = (input.tool_input && input.tool_input.command) || '';

    // Only trigger for git commit commands (exclude git commit-graph etc.)
    if (!/\bgit\s+commit\b/.test(command) || /\bgit\s+commit-graph\b/.test(command)) {
      process.exit(0);
    }

    // Skip amends to avoid double-checking
    if (command.includes('--amend')) {
      process.exit(0);
    }

    const stagedFiles = getStagedFiles();
    if (stagedFiles.length === 0) {
      process.exit(0);
    }

    let warningCount = 0;
    let secretsFound = false;

    // Scan staged diff for secrets
    const diff = getStagedDiff();
    for (const { pattern, label } of SECRET_PATTERNS) {
      if (pattern.test(diff)) {
        process.stderr.write(`ERROR: ${label} detected in staged changes.\n`);
        secretsFound = true;
      }
    }

    if (secretsFound) {
      process.stderr.write(
        '\nBLOCKED: Secrets detected in staged content. ' +
        'Remove secrets and use environment variables or a secrets manager.\n'
      );
      process.exit(2);
    }

    // Scan staged files for debug statements and TODOs
    const checkable = stagedFiles.filter((f) =>
      CHECKABLE_EXTENSIONS.some((ext) => f.endsWith(ext))
    );

    for (const filePath of checkable) {
      const content = getStagedFileContent(filePath);
      if (!content) continue;

      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;

        // console.log detection (skip comments)
        if (line.includes('console.log') && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
          process.stderr.write(`WARNING: ${filePath}:${lineNum} — console.log found\n`);
          warningCount++;
        }

        // debugger statement
        if (/\bdebugger\b/.test(line) && !line.trim().startsWith('//')) {
          process.stderr.write(`WARNING: ${filePath}:${lineNum} — debugger statement found\n`);
          warningCount++;
        }

        // TODO without issue reference
        const todoMatch = line.match(/\/\/\s*(TODO|FIXME):?\s*(.+)/);
        if (todoMatch && !todoMatch[2].match(/#\d+|issue/i)) {
          process.stderr.write(`INFO: ${filePath}:${lineNum} — TODO without issue reference\n`);
        }
      }
    }

    // Validate commit message
    const msgIssues = validateCommitMessage(command);
    for (const issue of msgIssues) {
      process.stderr.write(`WARNING: ${issue}\n`);
      warningCount++;
    }

    if (warningCount > 0) {
      process.stderr.write(`\n${warningCount} warning(s) found. Commit is allowed but consider fixing these.\n`);
    }
  } catch (err) {
    process.stderr.write(`[arc] WARNING: Safety hook received malformed input: ${err.message}\n`);
  }
  process.exit(0);
});
