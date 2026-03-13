/**
 * Minimal regression tests for the Codex reference config shipped in this repo.
 *
 * Run with:
 *   node tests/codex-config.test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${err.message}`);
    return false;
  }
}

const repoRoot = path.join(__dirname, '..');
const repoConfigPath = path.join(repoRoot, '.codex', 'config.toml');
const referenceConfigPath = path.join(repoRoot, 'codex', 'reference', 'config.reference.toml');
const repoAgentsDir = path.join(repoRoot, '.codex', 'agents');
const referenceAgentsDir = path.join(repoRoot, 'codex', 'reference', 'agents');

const repoConfig = fs.readFileSync(repoConfigPath, 'utf8');
const referenceConfig = fs.readFileSync(referenceConfigPath, 'utf8');

let passed = 0;
let failed = 0;

if (
  test('repo-local .codex/config.toml does not pin a top-level model', () => {
    assert.ok(!/^model\s*=/m.test(repoConfig), 'Expected repo-local .codex/config.toml to inherit the CLI default model');
  })
)
  passed++;
else failed++;

if (
  test('repo-local .codex/config.toml does not pin a top-level model provider', () => {
    assert.ok(
      !/^model_provider\s*=/m.test(repoConfig),
      'Expected repo-local .codex/config.toml to inherit the CLI default provider',
    );
  })
)
  passed++;
else failed++;

if (
  test('reference config does not pin a top-level model', () => {
    assert.ok(
      !/^model\s*=/m.test(referenceConfig),
      'Expected codex/reference/config.reference.toml to inherit the CLI default model',
    );
  })
)
  passed++;
else failed++;

if (
  test('reference config does not pin a top-level model provider', () => {
    assert.ok(
      !/^model_provider\s*=/m.test(referenceConfig),
      'Expected codex/reference/config.reference.toml to inherit the CLI default provider',
    );
  })
)
  passed++;
else failed++;

if (
  test('reference config points role entries at the installed bootstrap-reference bundle', () => {
    const expectedPaths = [
      'bootstrap-reference/claude-code-bootstrap-commands/agents/explorer.toml',
      'bootstrap-reference/claude-code-bootstrap-commands/agents/reviewer.toml',
      'bootstrap-reference/claude-code-bootstrap-commands/agents/docs-researcher.toml',
    ];

    for (const expectedPath of expectedPaths) {
      assert.ok(
        referenceConfig.includes(`config_file = "${expectedPath}"`),
        `Expected reference config to include ${expectedPath}`,
      );
    }
  })
)
  passed++;
else failed++;

if (
  test('sample role configs do not use o4-mini', () => {
    const roleFiles = [
      ...fs.readdirSync(repoAgentsDir).map(file => path.join(repoAgentsDir, file)),
      ...fs.readdirSync(referenceAgentsDir).map(file => path.join(referenceAgentsDir, file)),
    ].filter(file => file.endsWith('.toml'));

    assert.ok(roleFiles.length > 0, 'Expected sample role config files');

    for (const rolePath of roleFiles) {
      const roleConfig = fs.readFileSync(rolePath, 'utf8');
      assert.ok(
        !/^model\s*=\s*"o4-mini"$/m.test(roleConfig),
        `Expected sample role config to avoid o4-mini: ${path.basename(rolePath)}`,
      );
    }
  })
)
  passed++;
else failed++;

console.log(`\nPassed: ${passed}`);
console.log(`Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
