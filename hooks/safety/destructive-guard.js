#!/usr/bin/env node
/**
 * destructive-guard.js — PreToolUse (Bash) BLOCKING hook
 *
 * Blocks destructive commands across git, filesystem, Kubernetes,
 * Docker, SQL, Terraform, and detects leaked secrets in commands.
 *
 * Exit codes:
 *   0 = allow
 *   2 = block (destructive command detected)
 */

'use strict';

const { SECRET_PATTERNS } = require('../lib/secret-patterns');

// Safe rm targets that should not be blocked
const SAFE_RM_TARGETS = [
  'node_modules', 'dist', 'build', '.next', '__pycache__',
  '.cache', 'coverage', '.nyc_output', 'tmp', '.tmp',
  '.parcel-cache', '.turbo', 'target', '.tox', '.pytest_cache',
  '.mypy_cache', 'vendor', '.gradle', '.build',
];

const DESTRUCTIVE_PATTERNS = [
  // Git destructive
  { pattern: /\bgit\s+push\s+.*--force\b/, msg: 'git push --force can overwrite remote history' },
  { pattern: /\bgit\s+push\s+.*-f\b/, msg: 'git push -f can overwrite remote history' },
  { pattern: /\bgit\s+reset\s+--hard\b/, msg: 'git reset --hard discards all uncommitted changes' },
  { pattern: /\bgit\s+checkout\s+\.\s*(?:$|[;&|])/, msg: 'git checkout . discards all unstaged changes' },
  { pattern: /\bgit\s+clean\s+-f/, msg: 'git clean -f permanently removes untracked files' },
  { pattern: /\bgit\s+branch\s+-D\b/, msg: 'git branch -D force-deletes a branch without merge check' },
  { pattern: /\bgit\s+stash\s+drop\b/, msg: 'git stash drop permanently removes a stash entry' },
  { pattern: /\bgit\s+push\s+.*--force-with-lease\b/, msg: 'git push --force-with-lease can overwrite remote history' },
  { pattern: /\bgit\s+push\s+.*--force-if-includes\b/, msg: 'git push --force-if-includes can overwrite remote history' },
  { pattern: /\bgit\s+restore\s+--worktree\s+\./, msg: 'git restore --worktree . discards working tree changes' },
  { pattern: /\bgit\s+rebase\s+(?!--abort|--continue|--skip)/, msg: 'git rebase rewrites commit history — use with caution' },

  // Kubernetes / Docker
  { pattern: /\bkubectl\s+delete\s+namespace\b/, msg: 'kubectl delete namespace removes all resources in the namespace' },
  { pattern: /\bkubectl\s+delete\s+-f\b/, msg: 'kubectl delete -f removes resources defined in a file' },
  { pattern: /\bhelm\s+uninstall\b/, msg: 'helm uninstall removes a deployed release' },
  { pattern: /\bhelm\s+delete\b/, msg: 'helm delete removes a deployed release' },
  { pattern: /\bdocker\s+system\s+prune\b/, msg: 'docker system prune removes unused data' },
  { pattern: /\bdocker\s+rm\s+-f\b/, msg: 'docker rm -f force-removes a running container' },

  // SQL
  { pattern: /\bDROP\s+TABLE\b/i, msg: 'DROP TABLE permanently removes a database table' },
  { pattern: /\bDROP\s+DATABASE\b/i, msg: 'DROP DATABASE permanently removes an entire database' },
  { pattern: /\bTRUNCATE\b/i, msg: 'TRUNCATE removes all rows from a table' },

  // Other
  { pattern: /\bterraform\s+destroy\b/, msg: 'terraform destroy tears down all managed infrastructure' },
  { pattern: /\bchmod\s+777\b/, msg: 'chmod 777 opens files to all users — use more restrictive permissions' },
  { pattern: /\bnpm\s+publish\b/, msg: 'npm publish pushes a package to the registry — ensure this is intentional' },
];

// DELETE FROM without WHERE clause
const DELETE_WITHOUT_WHERE = /\bDELETE\s+FROM\s+\S+\s*(?:;|$|\||&&)/i;

// Secret patterns imported from shared module (see require at top)

/**
 * Check if an rm command targets only safe directories.
 * Returns true if the rm should be allowed.
 */
function isRmSafe(command) {
  // Extract the part after rm flags
  const rmMatch = command.match(/\brm\s+((?:-\w+\s+)*)(.+)/);
  if (!rmMatch) return false;

  const targets = rmMatch[2].trim().split(/\s+/);
  const dangerousPaths = ['/', '~', '$HOME', '..'];

  for (const target of targets) {
    // Block dangerous root paths
    for (const dp of dangerousPaths) {
      if (target === dp || target.startsWith(dp + '/') || target === dp + '/*') {
        return false;
      }
    }

    // Allow if the basename of the target is in the safe list
    const basename = target.split('/').filter(Boolean).pop() || '';
    if (!SAFE_RM_TARGETS.some((safe) => basename === safe)) {
      return false;
    }
  }
  return true;
}

/**
 * Check if an rm command uses both recursive and force flags.
 */
function isRmRecursiveForce(command) {
  // Matches rm with -rf, -fr, or separate -r -f flags
  return /\brm\s+.*-r.*-f|\brm\s+.*-f.*-r|\brm\s+-rf|\brm\s+-fr/.test(command);
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
    if (!command) {
      process.exit(0);
    }

    // Check named destructive patterns
    for (const { pattern, msg } of DESTRUCTIVE_PATTERNS) {
      if (pattern.test(command)) {
        process.stderr.write(`BLOCKED: ${msg}. Review and run manually if intentional.\n`);
        process.exit(2);
      }
    }

    // DELETE FROM without WHERE
    if (DELETE_WITHOUT_WHERE.test(command)) {
      process.stderr.write(
        'BLOCKED: DELETE FROM without a WHERE clause deletes all rows. ' +
        'Add a WHERE clause or use TRUNCATE intentionally.\n'
      );
      process.exit(2);
    }

    // Recursive+force rm on dangerous paths
    if (isRmRecursiveForce(command) && !isRmSafe(command)) {
      process.stderr.write(
        'BLOCKED: rm with recursive + force flags on a non-safe path. ' +
        'Verify the target path and run manually if intentional.\n'
      );
      process.exit(2);
    }

    // Secret detection
    for (const { pattern, label } of SECRET_PATTERNS) {
      if (pattern.test(command)) {
        process.stderr.write(
          `BLOCKED: Possible ${label} in command. ` +
          'Use environment variables or a secrets manager instead.\n'
        );
        process.exit(2);
      }
    }
  } catch (err) {
    process.stderr.write(`[arc] WARNING: Safety hook received malformed input: ${err.message}\n`);
  }
  process.exit(0);
});
