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
function error(msg) { console.error(`[arc] \u2717 ${msg}`); }

function detectPlatform() {
  const platform = os.platform();
  if (platform === 'darwin') return 'macos';
  if (platform === 'win32') return 'windows';
  // Check WSL
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
  const entries = fs.readdirSync(pluginsDir);
  return entries.some(e => e.includes('everything-claude-code'));
}

function checkV1() {
  const pluginsDir = path.join(CLAUDE_HOME, 'plugins');
  if (!fs.existsSync(pluginsDir)) return false;
  const entries = fs.readdirSync(pluginsDir);
  return entries.some(e => e.includes('bootstrap-commands'));
}

function initLearningDirs() {
  const arcDir = path.join(CLAUDE_HOME, 'arc');
  const dirs = [
    arcDir,
    path.join(arcDir, 'instincts', 'global'),
    path.join(arcDir, 'projects'),
  ];
  for (const dir of dirs) {
    fs.mkdirSync(dir, { recursive: true });
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
  console.log('  Starting something?  ->  /new-feature or /new-project');
  console.log('  Working on it?       ->  /continue or /loop');
  console.log('  Something broke?     ->  /fix');
  console.log('  Need a review?       ->  /review-loop');
  console.log('  Security concern?    ->  /security');
  console.log('  Need a sidebar?      ->  /detour');
  console.log('  Done with it?        ->  /retro');
  console.log('  Small tweak?         ->  /quick');
  console.log('  Domain modeling?     ->  /glossary');
  console.log('  Meta-maintenance?    ->  /skill-health, /skill-improve');
  console.log('  Check upstream?      ->  /upstream');
  console.log('');

  if (tools.claudeCode) {
    log('To install as Claude Code plugin:');
    console.log('  /plugin install arc@' + ARC_ROOT);
    console.log('');
  }

  if (tools.codex) {
    log('To install for Codex:');
    console.log('  codex plugin install ' + ARC_ROOT);
    console.log('');
  }

  log('Installation helper complete.');
}

main();
