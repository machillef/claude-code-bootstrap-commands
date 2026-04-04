#!/usr/bin/env node
/**
 * block-no-verify.js — PreToolUse (Bash) BLOCKING hook
 *
 * Blocks any bash command that contains --no-verify, which bypasses
 * git commit hooks and should never be used by agents.
 *
 * Exit codes:
 *   0 = allow
 *   2 = block (--no-verify detected)
 */

'use strict';

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

    if (/--no-verify/.test(command) || /-c\s+core\.hooksPath/.test(command)) {
      process.stderr.write(
        'BLOCKED: --no-verify and -c core.hooksPath are not allowed. ' +
        'Git hooks exist to enforce quality standards. ' +
        'Fix the underlying issue instead of bypassing hooks.\n'
      );
      process.exit(2);
    }
  } catch (err) {
    process.stderr.write(`[arc] WARNING: Safety hook received malformed input: ${err.message}\n`);
  }
  process.exit(0);
});
