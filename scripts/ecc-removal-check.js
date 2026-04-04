#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const CLAUDE_HOME = path.join(os.homedir(), '.claude');

function log(msg) { console.log(`[ecc-check] ${msg}`); }
function found(msg) { console.log(`[ecc-check] FOUND: ${msg}`); }
function clean(msg) { console.log(`[ecc-check] CLEAN: ${msg}`); }

function checkPlugins() {
  const pluginsDir = path.join(CLAUDE_HOME, 'plugins');
  if (!fs.existsSync(pluginsDir)) { clean('No plugins directory'); return; }
  const entries = fs.readdirSync(pluginsDir);
  const eccEntries = entries.filter(e => e.includes('everything-claude-code') || e.includes('ecc'));
  if (eccEntries.length > 0) {
    found(`ECC plugin(s): ${eccEntries.join(', ')}`);
    console.log(`  -> Run: /plugin uninstall ${eccEntries[0]}`);
  } else {
    clean('No ECC plugins found');
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
      console.log(`  -> Edit ${f} and remove ECC-related entries`);
    }
  }
}

function checkMcpServers() {
  const mcpFiles = ['.mcp.json', path.join(CLAUDE_HOME, '.mcp.json')];
  for (const f of mcpFiles) {
    const fullPath = path.isAbsolute(f) ? f : path.join(process.cwd(), f);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, 'utf8');
    if (/"exa"\s*:/.test(content) || content.includes('sequential-thinking') || content.includes('memory')) {
      found(`Potentially ECC-installed MCP servers in ${f}`);
      console.log('  -> Review and remove servers you don\'t need (arc uses: GitHub, Context7, Playwright)');
    }
  }
}

function checkHomunculus() {
  const homunculus = path.join(CLAUDE_HOME, 'homunculus');
  if (fs.existsSync(homunculus)) {
    found('ECC homunculus directory (instinct system v2)');
    console.log(`  -> Arc uses its own learning system at ~/.claude/arc/`);
    console.log(`  -> To remove: rm -r ${homunculus}`);
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
