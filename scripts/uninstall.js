#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

const CLAUDE_HOME = path.join(os.homedir(), '.claude');
const ARC_DIR = path.join(CLAUDE_HOME, 'arc');

function log(msg) { console.log(`[arc] ${msg}`); }
function warn(msg) { console.warn(`[arc] \u26A0 ${msg}`); }

function askQuestion(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function main() {
  console.log('\n  arc \u2014 Uninstaller\n');

  // Check for learned instincts
  if (fs.existsSync(ARC_DIR)) {
    const answer = await askQuestion('[arc] Keep learned instincts? (y/n): ');
    if (answer !== 'y' && answer !== 'yes') {
      log('Removing learning data...');
      fs.rmSync(ARC_DIR, { recursive: true, force: true });
      log('Learning data removed.');
    } else {
      log('Keeping learning data at ' + ARC_DIR);
    }
  }

  log('To remove the Claude Code plugin:');
  console.log('  /plugin uninstall arc');
  console.log('');

  log('To remove for Codex:');
  console.log('  codex plugin uninstall arc');
  console.log('');

  log('Uninstall helper complete.');
}

main();
