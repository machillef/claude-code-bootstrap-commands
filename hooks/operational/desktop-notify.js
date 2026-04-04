#!/usr/bin/env node
/**
 * desktop-notify.js — Stop ASYNC hook
 *
 * Sends a desktop notification when a Claude Code session ends.
 * Supports macOS (osascript), Linux (notify-send), and
 * WSL/Windows (powershell.exe) with graceful fallback.
 *
 * Exit codes:
 *   0 = always (async, best-effort)
 */

'use strict';

const { spawnSync } = require('child_process');
const os = require('os');

function notify(title, message) {
  const platform = os.platform();

  if (platform === 'darwin') {
    // macOS
    spawnSync('osascript', [
      '-e',
      `display notification "${message}" with title "${title}"`,
    ], {
      stdio: 'ignore',
      timeout: 5000,
    });
    return;
  }

  if (platform === 'linux') {
    // Check for WSL
    const isWSL = (() => {
      try {
        const release = os.release().toLowerCase();
        return release.includes('microsoft') || release.includes('wsl');
      } catch {
        return false;
      }
    })();

    if (isWSL) {
      // Try BurntToast via PowerShell
      spawnSync('powershell.exe', [
        '-Command',
        `New-BurntToastNotification -Text '${title}', '${message}'`,
      ], {
        stdio: 'ignore',
        timeout: 5000,
      });
      return;
    }

    // Native Linux — notify-send
    const result = spawnSync('which', ['notify-send'], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    if (result.status === 0) {
      spawnSync('notify-send', [title, message], {
        stdio: 'ignore',
        timeout: 5000,
      });
    }
    return;
  }

  // Unsupported platform — no-op
}

let raw = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  raw += chunk;
});

process.stdin.on('end', () => {
  notify('arc', 'Claude Code session ended.');
  process.exit(0);
});
