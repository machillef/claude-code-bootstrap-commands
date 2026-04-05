#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const CLAUDE_HOME = path.join(os.homedir(), '.claude');
const IS_WINDOWS = os.platform() === 'win32';

function log(msg) { console.log(`[ecc-check] ${msg}`); }
function found(msg) { console.log(`[ecc-check] FOUND: ${msg}`); }
function clean(msg) { console.log(`[ecc-check] CLEAN: ${msg}`); }

function rmCommand(target) {
  if (IS_WINDOWS) {
    return `Remove-Item -Recurse -Force "${target}"`;
  }
  return `rm -r "${target}"`;
}

function checkPlugins() {
  const pluginsDir = path.join(CLAUDE_HOME, 'plugins');
  if (!fs.existsSync(pluginsDir)) { clean('No plugins directory'); return; }
  try {
    const installed = path.join(pluginsDir, 'installed_plugins.json');
    if (!fs.existsSync(installed)) { clean('No installed plugins file'); return; }
    const data = JSON.parse(fs.readFileSync(installed, 'utf8'));
    const eccKeys = Object.keys(data.plugins || {}).filter(k =>
      k.includes('everything-claude-code') || k.includes('ecc')
    );
    if (eccKeys.length > 0) {
      found(`ECC plugin(s): ${eccKeys.join(', ')}`);
      console.log(`  \u2192 Run in Claude Code: /plugin uninstall ${eccKeys[0]}`);
    } else {
      clean('No ECC plugins found');
    }
  } catch {
    clean('Could not read plugins directory');
  }
}

function checkSettings() {
  const settingsFiles = [
    path.join(CLAUDE_HOME, 'settings.json'),
    path.join(CLAUDE_HOME, 'settings.local.json'),
  ];
  for (const f of settingsFiles) {
    if (!fs.existsSync(f)) continue;
    const content = fs.readFileSync(f, 'utf8');
    if (content.includes('everything-claude-code') || content.includes('ecc-')) {
      found(`ECC references in ${path.basename(f)}`);
      console.log(`  \u2192 Edit ${f} and remove ECC-related entries`);
    }
  }
}

function checkMcpServers() {
  const mcpFiles = ['.mcp.json', path.join(CLAUDE_HOME, '.mcp.json')];
  for (const f of mcpFiles) {
    const fullPath = path.isAbsolute(f) ? f : path.join(process.cwd(), f);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, 'utf8');
    if (/"exa"\s*:/.test(content) || content.includes('sequential-thinking') || content.includes('"memory"')) {
      found(`Potentially ECC-installed MCP servers in ${f}`);
      console.log('  \u2192 Review and remove servers you don\'t need (arc uses: GitHub, Context7, Playwright)');
    }
  }
}

function checkHomunculus() {
  const homunculus = path.join(CLAUDE_HOME, 'homunculus');
  if (fs.existsSync(homunculus)) {
    found('ECC homunculus directory (instinct system v2)');
    console.log(`  \u2192 Arc uses its own learning system at ~/.claude/arc/`);
    console.log(`  \u2192 To remove: ${rmCommand(homunculus)}`);
  } else {
    clean('No homunculus directory');
  }
}

function main() {
  console.log('\n  ECC Removal Diagnostic\n');
  console.log('  This script checks for ECC remnants and recommends removal commands.');
  console.log('  It does NOT execute any changes.\n');

  checkPlugins();
  checkSettings();
  checkMcpServers();
  checkHomunculus();

  console.log('\n  Done. Review the FOUND items above and run the suggested commands.');
}

main();
