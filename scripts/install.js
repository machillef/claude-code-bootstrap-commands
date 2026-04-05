#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const ARC_ROOT = path.resolve(__dirname, '..');
const CLAUDE_HOME = path.join(os.homedir(), '.claude');

function log(msg) { console.log(`[arc] ${msg}`); }
function warn(msg) { console.warn(`[arc] \u26A0 ${msg}`); }

function detectPlatform() {
  const platform = os.platform();
  if (platform === 'darwin') return 'macos';
  if (platform === 'win32') return 'windows';
  try {
    const release = fs.readFileSync('/proc/version', 'utf8');
    if (release.toLowerCase().includes('microsoft')) return 'wsl';
  } catch {}
  return 'linux';
}

function detectTools() {
  const tools = {};
  try { execSync('claude --version', { stdio: 'pipe' }); tools.claudeCode = true; } catch { tools.claudeCode = false; }
  try { execSync('codex --version', { stdio: 'pipe' }); tools.codex = true; } catch { tools.codex = false; }
  return tools;
}

function checkECC() {
  const pluginsDir = path.join(CLAUDE_HOME, 'plugins');
  if (!fs.existsSync(pluginsDir)) return false;
  try {
    const entries = fs.readdirSync(pluginsDir);
    return entries.some(e => e.includes('everything-claude-code'));
  } catch { return false; }
}

function checkV1() {
  const pluginsDir = path.join(CLAUDE_HOME, 'plugins');
  if (!fs.existsSync(pluginsDir)) return false;
  try {
    const entries = fs.readdirSync(pluginsDir);
    return entries.some(e => e.includes('bootstrap-commands'));
  } catch { return false; }
}

function checkSuperpowers() {
  const pluginsDir = path.join(CLAUDE_HOME, 'plugins');
  if (!fs.existsSync(pluginsDir)) return false;
  try {
    const installed = path.join(pluginsDir, 'installed_plugins.json');
    if (!fs.existsSync(installed)) return false;
    const data = JSON.parse(fs.readFileSync(installed, 'utf8'));
    return Object.keys(data.plugins || {}).some(k => k.includes('superpowers'));
  } catch { return false; }
}

function initLearningDirs() {
  const arcDir = path.join(CLAUDE_HOME, 'arc');
  const dirs = [
    arcDir,
    path.join(arcDir, 'instincts', 'global'),
    path.join(arcDir, 'projects'),
    path.join(arcDir, '.markers'),
  ];
  for (const dir of dirs) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  }
  log('Learning system directories initialized');
}

function main() {
  console.log('\n  arc v2.0.0 \u2014 Disciplined Development Workflows\n');

  const platform = detectPlatform();
  log(`Platform: ${platform}`);

  const tools = detectTools();
  if (tools.claudeCode) log('Claude Code: detected');
  else warn('Claude Code: not found on PATH');
  if (tools.codex) log('Codex: detected');
  else log('Codex: not found (optional)');

  // Pre-flight checks
  if (checkECC()) {
    warn('Everything Claude Code (ECC) detected.');
    warn('Arc v2 replaces ECC functionality. Run `node scripts/ecc-removal-check.js` for guidance.');
    console.log('');
  }

  if (checkV1()) {
    warn('Bootstrap-commands v1 detected.');
    warn('Run `node scripts/uninstall.js` first to remove v1, then re-run this installer.');
    process.exit(1);
  }

  // Initialize learning directories
  initLearningDirs();

  // Print quick reference
  console.log('\n  Quick Reference:');
  console.log('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');
  console.log('  Starting something?  \u2192  /new-feature or /new-project');
  console.log('  Working on it?       \u2192  /continue or /loop');
  console.log('  Something broke?     \u2192  /fix');
  console.log('  Need a review?       \u2192  /review-loop');
  console.log('  Security concern?    \u2192  /security');
  console.log('  Need a sidebar?      \u2192  /detour');
  console.log('  Done with it?        \u2192  /retro');
  console.log('  Small tweak?         \u2192  /quick');
  console.log('  Domain modeling?     \u2192  /glossary');
  console.log('  Meta-maintenance?    \u2192  /skill-health, /skill-improve');
  console.log('  Check upstream?      \u2192  /upstream');
  console.log('');

  // Install instructions — local path, no @ prefix
  if (tools.claudeCode) {
    log('To install as Claude Code plugin:');
    console.log(`  /plugin install ${ARC_ROOT}`);
    console.log('');
    console.log('  Or from the marketplace:');
    console.log('  /plugin marketplace add machillef/claude-code-bootstrap-commands');
    console.log('  /plugin install arc@claude-code-bootstrap-commands');
    console.log('');
  }

  if (tools.codex) {
    log('To install for Codex:');
    console.log(`  codex plugin install ${ARC_ROOT}`);
    console.log('');
  }

  // Superpowers companion check
  if (!checkSuperpowers()) {
    console.log('');
    warn('Superpowers plugin not detected.');
    log('Arc works standalone, but the full workflow benefits from superpowers');
    log('(brainstorming rigor, TDD iron law, systematic debugging phases).');
    log('Install it with:');
    console.log('  /plugin install superpowers@claude-plugins-official');
    console.log('');
  } else {
    log('Superpowers: detected (companion plugin)');
  }

  log('Installation helper complete.');
}

main();
