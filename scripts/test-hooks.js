#!/usr/bin/env node
/**
 * Mock scenario runner for arc hooks.
 * Tests hooks by piping JSON payloads to them and checking exit codes.
 */
'use strict';

const { spawnSync } = require('child_process');
const path = require('path');

const HOOKS_DIR = path.resolve(__dirname, '..', 'hooks');
let passed = 0;
let failed = 0;

function test(name, hookPath, payload, expectExit, expectStderr) {
  const result = spawnSync('node', [hookPath], {
    input: typeof payload === 'string' ? payload : JSON.stringify(payload),
    encoding: 'utf8',
    timeout: 5000,
  });
  const ok = result.status === expectExit;
  const stderrOk = !expectStderr || (result.stderr || '').includes(expectStderr);

  if (ok && stderrOk) {
    console.log(`  PASS: ${name}`);
    passed++;
  } else {
    console.log(`  FAIL: ${name} (expected exit ${expectExit}, got ${result.status})`);
    if (!stderrOk) console.log(`    Expected stderr to contain: "${expectStderr}"`);
    if (result.stderr) console.log(`    Stderr: ${result.stderr.trim().slice(0, 120)}`);
    failed++;
  }
}

console.log('\n=== SAFETY HOOKS ===\n');

// block-no-verify
const bnv = path.join(HOOKS_DIR, 'safety', 'block-no-verify.js');
test('blocks --no-verify', bnv,
  {tool_name:'Bash',tool_input:{command:'git commit --no-verify -m test'}}, 2, 'BLOCKED');
test('blocks core.hooksPath', bnv,
  {tool_name:'Bash',tool_input:{command:'git -c core.hooksPath=/dev/null commit'}}, 2, 'BLOCKED');
test('allows normal commit', bnv,
  {tool_name:'Bash',tool_input:{command:'git commit -m "feat: add thing"'}}, 0);
test('allows empty stdin', bnv, '', 0);
test('allows malformed JSON', bnv, 'not json at all', 0);

// destructive-guard
const dg = path.join(HOOKS_DIR, 'safety', 'destructive-guard.js');
test('blocks git push --force', dg,
  {tool_name:'Bash',tool_input:{command:'git push --force origin main'}}, 2, 'BLOCKED');
test('blocks git reset --hard', dg,
  {tool_name:'Bash',tool_input:{command:'git reset --hard HEAD~3'}}, 2, 'BLOCKED');
test('blocks kubectl delete namespace', dg,
  {tool_name:'Bash',tool_input:{command:'kubectl delete namespace production'}}, 2, 'BLOCKED');
test('blocks force-with-lease', dg,
  {tool_name:'Bash',tool_input:{command:'git push --force-with-lease origin main'}}, 2);
test('allows safe rm (node_modules)', dg,
  {tool_name:'Bash',tool_input:{command:'rm -r node_modules'}}, 0);
test('allows git push (no force)', dg,
  {tool_name:'Bash',tool_input:{command:'git push origin feature/my-branch'}}, 0);
test('allows normal commands', dg,
  {tool_name:'Bash',tool_input:{command:'ls -la src/'}}, 0);

// config-protection
const cp = path.join(HOOKS_DIR, 'safety', 'config-protection.js');
test('blocks .eslintrc.json edit', cp,
  {tool_name:'Edit',tool_input:{file_path:'/project/.eslintrc.json',old_string:'a',new_string:'b'}}, 2, 'BLOCKED');
test('blocks prettier.config.js write', cp,
  {tool_name:'Write',tool_input:{file_path:'/project/prettier.config.js',content:'{}'}}, 2, 'BLOCKED');
test('blocks biome.json edit', cp,
  {tool_name:'Edit',tool_input:{file_path:'/project/biome.json',old_string:'a',new_string:'b'}}, 2, 'BLOCKED');
test('allows normal file edit', cp,
  {tool_name:'Edit',tool_input:{file_path:'/project/src/app.js',old_string:'a',new_string:'b'}}, 0);

// broad-git-add-warn (advisory — always exit 0)
const bga = path.join(HOOKS_DIR, 'safety', 'broad-git-add-warn.js');
test('warns on git add .', bga,
  {tool_name:'Bash',tool_input:{command:'git add .'}}, 0, 'WARNING');
test('warns on git add -A', bga,
  {tool_name:'Bash',tool_input:{command:'git add -A'}}, 0, 'WARNING');
test('no warn on git add specific', bga,
  {tool_name:'Bash',tool_input:{command:'git add src/file.js'}}, 0);

console.log('\n=== LEARNING HOOKS ===\n');

// observation-capture (async — should always exit 0)
const oc = path.join(HOOKS_DIR, 'learning', 'observation-capture.js');
test('captures tool event gracefully', oc,
  {tool_name:'Read',tool_input:{file_path:'/some/file.js'}}, 0);
test('handles empty stdin', oc, '', 0);

// ambient-learning-nudge (session-once — always exit 0)
const aln = path.join(HOOKS_DIR, 'learning', 'ambient-learning-nudge.js');
test('runs without crash', aln,
  {tool_name:'Read',tool_input:{file_path:'/some/file.js'}}, 0);

// session-end-observer (always exit 0)
const seo = path.join(HOOKS_DIR, 'learning', 'session-end-observer.js');
test('runs without crash on empty observations', seo, '', 0);

console.log('\n=== SHARED LIBS ===\n');

// instinct-parser
const parser = require(path.join(HOOKS_DIR, 'lib', 'instinct-parser.js'));

// Test escapeYaml
const escaped = parser.escapeYaml('hello "world"\nnewline\\backslash');
if (escaped === 'hello \\"world\\"\\nnewline\\\\backslash') {
  console.log('  PASS: escapeYaml handles quotes, newlines, backslashes');
  passed++;
} else {
  console.log(`  FAIL: escapeYaml got: ${escaped}`);
  failed++;
}

// Test parseInstinctFrontmatter
const yaml = `---
id: "test-id-abc123"
trigger: "When Bash fails with permission"
action: "Use sudo or check file permissions"
confidence: 0.7
domain: "debugging"
scope: "project"
observations: 4
---

# Test
`;
const parsed = parser.parseInstinctFrontmatter(yaml);
if (parsed && parsed.id === 'test-id-abc123' && parsed.trigger === 'When Bash fails with permission' &&
    parsed.confidence === 0.7 && parsed.observations === 4) {
  console.log('  PASS: parseInstinctFrontmatter extracts all fields correctly');
  passed++;
} else {
  console.log(`  FAIL: parseInstinctFrontmatter got: ${JSON.stringify(parsed)}`);
  failed++;
}

// Test with escaped quotes in YAML
const yamlEscaped = `---
trigger: "When Bash fails with \\"echo test\\""
confidence: 0.3
---
`;
const parsedEscaped = parser.parseInstinctFrontmatter(yamlEscaped);
if (parsedEscaped && parsedEscaped.trigger && parsedEscaped.confidence === 0.3) {
  console.log('  PASS: parseInstinctFrontmatter handles escaped quotes');
  passed++;
} else {
  console.log(`  FAIL: parseInstinctFrontmatter with escaped quotes got: ${JSON.stringify(parsedEscaped)}`);
  failed++;
}

// Test with malformed YAML (no frontmatter)
const noFrontmatter = 'just some text without yaml';
const parsedBad = parser.parseInstinctFrontmatter(noFrontmatter);
if (parsedBad === null) {
  console.log('  PASS: parseInstinctFrontmatter returns null for non-YAML');
  passed++;
} else {
  console.log(`  FAIL: parseInstinctFrontmatter should return null, got: ${JSON.stringify(parsedBad)}`);
  failed++;
}

// project-id
const pid = require(path.join(HOOKS_DIR, 'lib', 'project-id.js'));
const id = pid.getProjectId();
if (id && id.length === 12 && /^[0-9a-f]+$/.test(id)) {
  console.log(`  PASS: getProjectId returns 12-char hex (${id})`);
  passed++;
} else {
  console.log(`  FAIL: getProjectId got: ${id}`);
  failed++;
}

// secret-patterns
const sp = require(path.join(HOOKS_DIR, 'lib', 'secret-patterns.js'));
if (sp.SECRET_PATTERNS && sp.SECRET_PATTERNS.length >= 10) {
  console.log(`  PASS: SECRET_PATTERNS has ${sp.SECRET_PATTERNS.length} patterns`);
  passed++;
} else {
  console.log(`  FAIL: SECRET_PATTERNS has ${sp.SECRET_PATTERNS ? sp.SECRET_PATTERNS.length : 0} patterns`);
  failed++;
}

// Test secret detection
const testSecrets = [
  { input: 'AKIAIOSFODNN7EXAMPLE', label: 'AWS key', shouldMatch: true },
  { input: 'ghp_1234567890abcdef1234567890abcdef12345678', label: 'GitHub PAT', shouldMatch: true },
  { input: 'sk-ant-abcdefghij1234567890', label: 'Anthropic key', shouldMatch: true },
  { input: 'just normal code here', label: 'normal code', shouldMatch: false },
];
for (const { input, label, shouldMatch } of testSecrets) {
  const matched = sp.SECRET_PATTERNS.some(({ pattern }) => pattern.test(input));
  if (matched === shouldMatch) {
    console.log(`  PASS: "${label}" ${shouldMatch ? 'detected' : 'not flagged'}`);
    passed++;
  } else {
    console.log(`  FAIL: "${label}" expected ${shouldMatch ? 'match' : 'no match'}, got opposite`);
    failed++;
  }
}

console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
